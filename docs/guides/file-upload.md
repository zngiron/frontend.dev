# File Upload Setup Guide

> **Purpose:** Step-by-step guide for adding Supabase Storage file uploads to the project.
>
> **Last Updated:** 2026-04-06
>
> **Status:** Active

---

## Prerequisites

- Supabase project with Storage enabled (toggle under **Storage** in the Supabase dashboard)
- `@supabase/supabase-js` and `@supabase/ssr` already installed as part of the auth setup (see the [Auth guide](./auth.md))

## Dependencies

No additional dependencies are required. The Supabase clients installed during auth setup are sufficient for all Storage operations.

## File Structure

Upload components live in their feature directory. Shared upload utilities live in `src/lib/supabase/`:

```
src/lib/supabase/
└── storage.ts         ← Upload helpers and signed URL utilities

src/features/<feature>/
└── components/
    └── upload-button.tsx   ← Client Component for file selection and upload
```

## Step-By-Step Implementation

### 1. Create The Storage Bucket

Create a bucket in the Supabase dashboard under **Storage > New bucket**, or apply a SQL migration.

**Option A — Dashboard**

1. Open the Supabase dashboard and navigate to **Storage**.
2. Click **New bucket**.
3. Enter a name (e.g. `avatars` or `documents`).
4. Choose **Public** if files should be readable without authentication, or **Private** if access should be gated by signed URLs.
5. Click **Save**.

**Option B — SQL Migration**

`supabase/migrations/<timestamp>_create_storage_buckets.sql`:

```sql
-- Create a private bucket for user documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Create a public bucket for avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;
```

Apply the migration:

```bash
supabase db push
```

> **Note:** Enable Row Level Security policies on `storage.objects` to restrict who can upload and read files. Supabase provides policy templates in the dashboard under **Storage > [bucket] > Policies**.

### 2. Add Storage RLS Policies

Apply per-bucket policies so only the owning user can manage their files. Run these in the Supabase SQL editor or include them in your migration file.

```sql
-- Allow authenticated users to upload to their own folder in the documents bucket
CREATE POLICY "Users can upload own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to read their own documents
CREATE POLICY "Users can read own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own documents
CREATE POLICY "Users can delete own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

### 3. Create The Storage Utility Module

`src/lib/supabase/storage.ts` — upload helpers and signed URL generation. Import the browser client for use in Client Components or the server client for Server Actions.

```ts
import { createClient } from "@/lib/supabase/client"

export type UploadResult =
  | { path: string; error: null }
  | { path: null; error: Error }

/**
 * Uploads a file to a Supabase Storage bucket.
 *
 * @param bucket - The bucket name (e.g. "avatars", "documents")
 * @param path   - The storage path including file name (e.g. "<userId>/photo.png")
 * @param file   - The File object from the input element
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File
): Promise<UploadResult> {
  const supabase = createClient()

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true })

  if (error) {
    return { path: null, error: new Error(error.message) }
  }

  return { path, error: null }
}

/**
 * Returns a temporary signed URL for a private bucket object.
 * The URL expires after the given number of seconds (default: 3600).
 */
export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn = 3600
): Promise<string | null> {
  const supabase = createClient()

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn)

  if (error || !data) {
    return null
  }

  return data.signedUrl
}

/**
 * Returns the permanent public URL for a public bucket object.
 * Only use this for buckets configured as public.
 */
export function getPublicUrl(bucket: string, path: string): string {
  const supabase = createClient()

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)

  return data.publicUrl
}
```

### 4. Create The Upload Component

`src/features/<feature>/components/upload-button.tsx` — a Client Component that handles file selection, triggers the upload, and surfaces the resulting URL.

```tsx
"use client"

import { useRef, useState } from "react"

import { uploadFile, getSignedUrl } from "@/lib/supabase/storage"

interface UploadButtonProps {
  /** Supabase Storage bucket name */
  bucket: string
  /** Storage path prefix — typically the authenticated user's ID */
  pathPrefix: string
  /** Called with the signed URL after a successful upload */
  onUploadComplete?: (url: string) => void
}

export function UploadButton({
  bucket,
  pathPrefix,
  onUploadComplete,
}: UploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) return

    setUploading(true)
    setError(null)

    const path = `${pathPrefix}/${Date.now()}-${file.name}`
    const { path: storagePath, error: uploadError } = await uploadFile(
      bucket,
      path,
      file
    )

    if (uploadError || !storagePath) {
      setError(uploadError?.message ?? "Upload failed.")
      setUploading(false)
      return
    }

    const signedUrl = await getSignedUrl(bucket, storagePath)

    setUploading(false)

    if (signedUrl) {
      onUploadComplete?.(signedUrl)
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleChange}
      />
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? "Uploading…" : "Upload File"}
      </button>
      {error && <p role="alert">{error}</p>}
    </div>
  )
}
```

### 5. Use The Component

Pass the authenticated user's ID as the `pathPrefix` so files are namespaced per user and match the RLS policies created in Step 2.

```tsx
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { UploadButton } from "@/features/documents/components/upload-button"

export default async function DocumentsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <main>
      <h1>My Documents</h1>
      <UploadButton
        bucket="documents"
        pathPrefix={user.id}
        onUploadComplete={(url) => console.log("Uploaded:", url)}
      />
    </main>
  )
}
```

## Environment Variables

File upload relies on the same Supabase environment variables established in the auth guide. No additional variables are required.

| Variable | Description | Required |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key (browser-safe) | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key — server-only, bypasses RLS | Yes |

`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are embedded in the browser bundle and used by the browser Supabase client. `SUPABASE_SERVICE_ROLE_KEY` must remain server-side only and is used by the admin client when you need to manage files on behalf of a user (e.g. server-side cleanup jobs).

## Common Patterns

### Avatar Upload

For profile avatars, use a **public** bucket so images load without a signed URL. Overwrite the same path on each upload to avoid accumulating stale files:

```ts
// path: "<userId>/avatar.png" — overwriting the same key each time
const path = `${user.id}/avatar.png`

await uploadFile("avatars", path, file)

// Retrieve without expiry from a public bucket
const url = getPublicUrl("avatars", path)
```

Store the resulting public URL in the user's profile row so it can be read from the database without making a Storage API call on every render.

### Document Upload

For user-owned documents, use a **private** bucket and generate a short-lived signed URL each time the document is accessed:

```ts
// Upload once
const { path } = await uploadFile("documents", `${user.id}/${file.name}`, file)

// Generate a URL valid for 1 hour whenever the user requests access
const url = await getSignedUrl("documents", path, 3600)
```

Persist the `path` (not the signed URL) in your database. Signed URLs expire — regenerate them on demand.

### Image Optimization

Supabase Storage supports on-the-fly image transformations for public buckets via the `transform` option on `getPublicUrl`. Pass width and height to serve a resized image without a separate CDN or image processing service:

```ts
const { data } = supabase.storage.from("avatars").getPublicUrl(path, {
  transform: {
    width: 128,
    height: 128,
    resize: "cover",
  },
})
```

Image transforms are only available on public buckets. For private buckets, generate a signed URL with the same `transform` option using `createSignedUrl`.

## Verification

1. Start the dev server: `bun dev`
2. Navigate to the page that renders the `UploadButton` component.
3. Select a file and confirm the button displays "Uploading…" during the request.
4. After the upload completes, open the browser console and verify the signed URL is logged (or passed to `onUploadComplete`).
5. Open the Supabase dashboard under **Storage > [bucket]** and confirm the file appears at the expected path (`<userId>/<filename>`).
6. Paste the signed URL into a browser tab and confirm the file downloads or displays correctly.
7. Wait for the signed URL to expire (or shorten `expiresIn` to `10` seconds during testing) and confirm the URL returns a 400 response — then call `getSignedUrl` again to obtain a fresh URL.
