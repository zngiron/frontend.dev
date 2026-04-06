# Auth

Supabase authentication setup.

---

## Dependencies

```bash
bun add @supabase/ssr @supabase/supabase-js
```

## Env Variables

Add to `.env.example`, copy to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

| Variable | Browser | Required |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Yes |

Update `src/lib/env.ts` to include all three.

## File Structure

```
src/lib/supabase/
├── client.ts      → Browser client
├── server.ts      → Server client (RSC, Actions, Route Handlers)
├── middleware.ts   → Session refresh helper
└── admin.ts       → Service-role client (server-only)

src/app/(auth)/
├── login/page.tsx
├── register/page.tsx
└── layout.tsx

src/proxy.ts       → Root proxy for session refresh
```

> Next.js 16: `middleware.ts` → `proxy.ts`. Export `proxy`, not `middleware`.

## Implementation

### Browser Client

`src/lib/supabase/client.ts`:

```ts
import { createBrowserClient } from "@supabase/ssr"

import { env } from "@/lib/env"

export function createClient() {
  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}
```

### Server Client

`src/lib/supabase/server.ts`:

```ts
import type { CookieOptions } from "@supabase/ssr"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

import { env } from "@/lib/env"

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

### Proxy Helper

`src/lib/supabase/middleware.ts`:

```ts
import type { NextRequest } from "next/server"

import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"

import { env } from "@/lib/env"

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value)
          }
          response = NextResponse.next({ request })
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options)
          }
        },
      },
    }
  )

  await supabase.auth.getUser()
  return response
}
```

### Admin Client

`src/lib/supabase/admin.ts` — server-only, bypasses RLS:

```ts
import { createClient } from "@supabase/supabase-js"

import { env } from "@/lib/env"

export const supabaseAdmin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)
```

### Root Proxy

`src/proxy.ts`:

```ts
import type { NextRequest } from "next/server"

import { updateSession } from "@/lib/supabase/middleware"

export async function proxy(request: NextRequest) {
  return updateSession(request)
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
```

## Common Patterns

### Protected Routes

Extend `proxy.ts` to redirect unauthenticated users:

```ts
const protectedRoutes = ["/dashboard", "/settings", "/profile"]
const publicRoutes = ["/login", "/register", "/"]

// After session refresh:
const { data: { user } } = await supabase.auth.getUser()
const path = request.nextUrl.pathname

if (protectedRoutes.some((r) => path.startsWith(r)) && !user) {
  return NextResponse.redirect(new URL("/login", request.url))
}
if (publicRoutes.includes(path) && user && path !== "/") {
  return NextResponse.redirect(new URL("/dashboard", request.url))
}
```

> Proxy performs optimistic checks only. Always enforce auth close to your data source.

### Auth Pages

Server Actions for all mutations. `(auth)` route group with its own layout.

**Login** — `src/app/(auth)/login/page.tsx`:

```tsx
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"

async function login(formData: FormData) {
  "use server"
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  })
  if (error) redirect("/login?error=invalid-credentials")
  redirect("/dashboard")
}

export default function LoginPage() {
  return (
    <form action={login}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button type="submit">Sign In</button>
    </form>
  )
}
```

**Register** follows the same pattern with `supabase.auth.signUp`. Add Zod validation via `auth.schema.ts` for production.

### Session — Server Side

```tsx
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) redirect("/login")
```

### Session — Client Side

`src/hooks/use-auth.ts`:

```ts
"use client"

import { useEffect, useState } from "react"

import type { User } from "@supabase/supabase-js"

import { createClient } from "@/lib/supabase/client"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user ?? null)
    )
    return () => subscription.unsubscribe()
  }, [supabase])

  return { user }
}
```

### Row Level Security

Enable RLS on every table before production:

```sql
ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;
```

## Verification

1. `bun dev` → register at `/register` → confirm user in Supabase dashboard
2. Login at `/login` → verify redirect to `/dashboard`
3. Server Component: `supabase.auth.getUser()` returns authenticated user
4. Logged out: protected route redirects to `/login`
