# Auth

**Stack:** Supabase Auth + `@supabase/ssr` + `@supabase/supabase-js`

---

## When To Use

**Use for:** user authentication, session management, protected routes, role-based access.

**Don't use for:** API key auth for external services (use env vars directly), machine-to-machine auth.

## Dependencies

```bash
bun add @supabase/ssr @supabase/supabase-js
```

## Env Variables

Add to `.env.example`, set in `.env.local`:

| Variable | Browser | Required |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Yes |

Update `src/lib/env.ts` to include all three.

## File Placement

```
src/lib/supabase/
├── client.ts      → Browser client (createBrowserClient)
├── server.ts      → Server client for RSC, Actions, Route Handlers (createServerClient)
├── middleware.ts   → Session refresh helper for proxy
└── admin.ts       → Service-role client, server-only, bypasses RLS

src/app/(auth)/
├── login/page.tsx
├── register/page.tsx
└── layout.tsx

src/proxy.ts       → Root proxy for session refresh
```

## Conventions

- Browser client: `createBrowserClient` from `@supabase/ssr`. Instantiate per call, not as a singleton.
- Server client: `createServerClient` from `@supabase/ssr`. Async function that reads `cookies()`.
- Admin client: `createClient` from `@supabase/supabase-js` with service role key. Server-only. Use sparingly.
- All Supabase clients live in `lib/supabase/`. No direct instantiation elsewhere → see `docs/ARCHITECTURE.md`.
- Next.js 16 uses `proxy.ts` not `middleware.ts` → see `docs/FRAMEWORK.md`.
- Proxy performs optimistic auth checks only. Always enforce auth close to your data source.
- Auth pages use Server Actions for all mutations. `(auth)` route group with its own layout.
- Enable RLS on every table before production.

### Supabase Cookie Wiring for Next.js 16 Proxy

This is the non-obvious integration pattern. The server client needs cookie access:

```ts
// src/lib/supabase/server.ts
import type { CookieOptions } from '@supabase/ssr'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

import { env } from '@/lib/env'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options)
          }
        },
      },
    }
  )
}
```

The proxy middleware helper follows the same cookie wiring pattern but with `NextRequest`/`NextResponse` cookies instead.

## References

- Supabase SSR guide: https://supabase.com/docs/guides/auth/server-side/nextjs
- Supabase Auth API: https://supabase.com/docs/reference/javascript/auth-api
- Supabase RLS: https://supabase.com/docs/guides/database/postgres/row-level-security
- Next.js 16 proxy (replaces middleware): `docs/FRAMEWORK.md`

## Verification

1. `bun dev` → register at `/register` → confirm user in Supabase dashboard
2. Login at `/login` → verify redirect to `/dashboard`
3. Server Component: `supabase.auth.getUser()` returns authenticated user
4. Logged out: protected route redirects to `/login`
