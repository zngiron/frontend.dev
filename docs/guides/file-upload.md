# File Upload

Supabase Storage file uploads.

---

## Dependencies

None additional. Uses `@supabase/supabase-js` from auth setup.

## Setup

### 1. Create Storage Bucket

Dashboard: **Storage > New bucket** — choose Public or Private.

Or via migration:

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;
```

### 2. Add RLS Policies

```sql
CREATE POLICY "Users can upload own documents"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can read own documents"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own documents"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);
```

## Implementation

### Storage Utilities

`src/lib/supabase/storage.ts`:

```ts
import { createClient } from "@/lib/supabase/client"

export type UploadResult =
  | { path: string; error: null }
  | { path: null; error: Error }

export async function uploadFile(bucket: string, path: string, file: File): Promise<UploadResult> {
  const supabase = createClient()
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
  if (error) return { path: null, error: new Error(error.message) }
  return { path, error: null }
}

export async function getSignedUrl(bucket: string, path: string, expiresIn = 3600): Promise<string | null> {
  const supabase = createClient()
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn)
  if (error || !data) return null
  return data.signedUrl
}

export function getPublicUrl(bucket: string, path: string): string {
  const supabase = createClient()
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}
```

### Upload Component

```tsx
"use client"

import { useRef, useState } from "react"

import { uploadFile, getSignedUrl } from "@/lib/supabase/storage"

interface UploadButtonProps {
  bucket: string
  pathPrefix: string
  onUploadComplete?: (url: string) => void
}

export function UploadButton({ bucket, pathPrefix, onUploadComplete }: UploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)

    const path = `${pathPrefix}/${Date.now()}-${file.name}`
    const { path: storagePath, error: uploadError } = await uploadFile(bucket, path, file)

    if (uploadError || !storagePath) {
      setError(uploadError?.message ?? "Upload failed.")
      setUploading(false)
      return
    }

    const signedUrl = await getSignedUrl(bucket, storagePath)
    setUploading(false)
    if (signedUrl) onUploadComplete?.(signedUrl)
  }

  return (
    <div>
      <input ref={inputRef} type="file" className="hidden" onChange={handleChange} />
      <button type="button" disabled={uploading} onClick={() => inputRef.current?.click()}>
        {uploading ? "Uploading..." : "Upload File"}
      </button>
      {error && <p role="alert">{error}</p>}
    </div>
  )
}
```

Pass the authenticated user's ID as `pathPrefix` to match RLS policies.

## Common Patterns

### Avatars (Public Bucket)

Overwrite same path each upload. Use `getPublicUrl` — no expiry:

```ts
const path = `${user.id}/avatar.png`
await uploadFile("avatars", path, file)
const url = getPublicUrl("avatars", path)
```

### Documents (Private Bucket)

Persist the `path` in DB, not the signed URL. Regenerate signed URLs on demand:

```ts
const url = await getSignedUrl("documents", path, 3600)
```

### Image Transforms

Public buckets support on-the-fly transforms:

```ts
supabase.storage.from("avatars").getPublicUrl(path, {
  transform: { width: 128, height: 128, resize: "cover" },
})
```

## Verification

1. Upload a file → confirm "Uploading..." state → signed URL logged
2. Check Supabase dashboard **Storage > [bucket]** for the file
3. Signed URL loads the file in a browser tab
