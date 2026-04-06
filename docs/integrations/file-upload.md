# File Upload

**Stack:** Supabase Storage (no extra dependency)

---

## When To Use

**Use for:** user file uploads (documents, images, avatars), signed URL access for private files.

## Dependencies

None additional. Uses `@supabase/supabase-js` from auth setup.

## File Placement

```
src/lib/supabase/
└── storage.ts → Upload, signed URL, and public URL utilities

supabase/migrations/
└── XXXXX-storage-buckets.sql → Bucket creation + RLS policies
```

## Conventions

- Create buckets via migration SQL, not manually. Include RLS policies in the same migration.
- Storage utilities live in `lib/supabase/storage.ts` alongside other Supabase modules.
- Use folder paths matching `auth.uid()` for per-user RLS policies.
- Store the `path` in the database, not the signed URL. Regenerate signed URLs on demand.
- Public buckets: use `getPublicUrl` (no expiry). Private buckets: use `createSignedUrl` with expiry.
- Avatars: overwrite same path each upload with `upsert: true`.

## References

- Supabase Storage guide: https://supabase.com/docs/guides/storage
- Supabase Storage API: https://supabase.com/docs/reference/javascript/storage-from-upload
- Image transforms: https://supabase.com/docs/guides/storage/serving/image-transformations

## Verification

1. Upload a file → confirm uploading state → signed URL returned
2. Check Supabase dashboard Storage for the file
3. Signed URL loads the file in a browser tab
