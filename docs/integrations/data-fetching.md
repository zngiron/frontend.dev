# Data Fetching

**Stack:** Next.js Server Components + `cache` from `react`

---

## When To Use

**Server fetching (default):** all data loading in Server Components via `data/api/` functions. No client-side fetch for initial data.

**Client fetching:** only when data must update without navigation (polling, realtime, infinite scroll). Use Supabase Realtime hooks or TanStack Query if needed.

## Dependencies

None for server fetching. For client-side fetching patterns:

```bash
bun add @tanstack/react-query
```

## File Placement

```
src/data/api/
├── posts.ts     → Post type + getPosts(), getPost()
├── users.ts     → User type + getUser(), getUsers()
└── [domain].ts  → Domain type + fetch functions
```

## Conventions

- All fetch functions live in `data/api/`, one file per domain → see `docs/ARCHITECTURE.md`.
- Each file exports its domain types alongside the fetch functions.
- Use `import { cache } from 'react'` to deduplicate requests within a single render pass. Do not use `React.cache`.
- `unstable_cache` is version-sensitive and may change → see `docs/FRAMEWORK.md`. Verify current API before using.
- Prefer `revalidatePath` / `revalidateTag` for cache invalidation after mutations.
- Server Components consume data directly: `const posts = await getPosts()`.
- Pass data from Server Components to Client Components via props. Do not refetch on the client what the server already has.

## References

- Next.js data fetching: https://nextjs.org/docs/app/building-your-application/data-fetching/fetching
- Next.js caching: https://nextjs.org/docs/app/building-your-application/caching
- React `cache`: https://react.dev/reference/react/cache
- TanStack Query (if needed): https://tanstack.com/query/latest/docs/framework/react/overview

## Verification

1. Server Component renders data without client-side loading state
2. Same data function called in `generateMetadata` and page body → single request (verify in server logs)
3. Mutation via Server Action → `revalidatePath` → data refreshes on next navigation
