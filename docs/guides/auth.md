# Auth Setup Guide

> **Purpose:** Step-by-step guide for adding Supabase authentication to the project.
>
> **Last Updated:** 2026-04-06
>
> **Status:** Active

---

## Prerequisites

- Supabase project created at [supabase.com](https://supabase.com)
- Supabase project URL and API keys available in the project dashboard

## Dependencies

```bash
bun add @supabase/ssr @supabase/supabase-js
```

## File Structure

```
src/lib/supabase/
├── client.ts      ← Browser client (Client Components)
├── server.ts      ← Server client (Server Components, Server Actions, Route Handlers)
├── middleware.ts   ← Session refresh proxy helper
└── admin.ts       ← Admin client (server-only, service role key)

src/app/
├── (auth)/
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── layout.tsx
└── proxy.ts        ← Root proxy for session refresh
```

> **Note:** In Next.js 16, `middleware.ts` is deprecated and renamed to `proxy.ts`. The exported function is `proxy`, not `middleware`. Run the codemod to migrate existing files: `npx @next/codemod@canary middleware-to-proxy .`

## Step-By-Step Implementation

### 1. Install Dependencies

```bash
bun add @supabase/ssr @supabase/supabase-js
```

### 2. Add Environment Variables

Add the following to `.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Copy to `.env.local` and replace with your actual values from the Supabase dashboard.

### 3. Update The Environment Schema

Extend `src/lib/env.ts` to include the Supabase variables:

```ts
import { z } from "zod"

const envSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_APP_NAME: z.string().min(1).default("App Name"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
})

export const env = envSchema.parse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
})
```

### 4. Create The Browser Client

`src/lib/supabase/client.ts` — used in Client Components only.

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

### 5. Create The Server Client

`src/lib/supabase/server.ts` — used in Server Components, Server Actions, and Route Handlers.

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

### 6. Create The Proxy Helper

`src/lib/supabase/middleware.ts` — refreshes the user session on every request. Called from the root `proxy.ts`.

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

### 7. Create The Admin Client

`src/lib/supabase/admin.ts` — uses the service role key to bypass Row Level Security. **Server-only. Never import in Client Components or expose to the browser.**

```ts
import { createClient } from "@supabase/supabase-js"

import { env } from "@/lib/env"

export const supabaseAdmin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)
```

### 8. Create The Root Proxy

`src/proxy.ts` (or `src/app/proxy.ts` if using the `src` directory at root) — calls the session helper on every request.

> **Note:** In Next.js 16 the file is named `proxy.ts` and exports a `proxy` function. The legacy `middleware.ts` / `middleware` export is deprecated.

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

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) | Yes |

`NEXT_PUBLIC_` variables are embedded in the browser bundle. `SUPABASE_SERVICE_ROLE_KEY` must never be exposed to the client — only import the admin client in server-side files.

## Common Patterns

### Protected Routes

Extend the root `proxy.ts` to redirect unauthenticated users away from protected routes:

```ts
import type { NextRequest } from "next/server"

import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"

import { env } from "@/lib/env"

const protectedRoutes = ["/dashboard", "/settings", "/profile"]
const publicRoutes = ["/login", "/register", "/"]

export async function proxy(request: NextRequest) {
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

  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const isProtected = protectedRoutes.some((route) => path.startsWith(route))
  const isPublic = publicRoutes.includes(path)

  if (isProtected && !user) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (isPublic && user && path !== "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
```

> **Important:** The proxy performs optimistic session checks only. Always enforce authorization close to your data source (Server Components or Server Actions) using the server client.

### Auth Pages

Auth pages use Server Actions for all mutations. The `(auth)` route group keeps auth pages visually isolated with their own layout.

#### Login Page Pattern

`src/app/(auth)/login/page.tsx`:

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

  if (error) {
    redirect("/login?error=invalid-credentials")
  }

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

#### Register Page Pattern

`src/app/(auth)/register/page.tsx`:

```tsx
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"

async function register(formData: FormData) {
  "use server"

  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  })

  if (error) {
    redirect("/register?error=signup-failed")
  }

  redirect("/login?message=check-your-email")
}

export default function RegisterPage() {
  return (
    <form action={register}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button type="submit">Create Account</button>
    </form>
  )
}
```

Add Zod validation via `src/lib/supabase/auth.schema.ts` for production use. See the [Conventions guide](../CONVENTIONS.md) for the validator naming pattern.

### Session Handling

#### Server-Side

Read the session in any Server Component using the server client:

```tsx
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return <div>Welcome, {user.email}</div>
}
```

#### Client-Side

Create `src/hooks/use-auth.ts` for Client Components that need reactive session state:

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
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  return { user }
}
```

### Row Level Security

Always enable Row Level Security on every Supabase table before going to production. Without RLS, all authenticated users can read and write all rows regardless of ownership.

Enable RLS in the Supabase dashboard under **Table Editor > [table] > RLS**, or via SQL:

```sql
ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;
```

Reference: [Supabase Row Level Security docs](https://supabase.com/docs/guides/database/postgres/row-level-security)

## Verification

1. Start the dev server: `bun dev`
2. Register a new user via `/register`
3. Confirm the user appears in the Supabase dashboard under **Authentication > Users**
4. Log in via `/login` and verify the redirect to `/dashboard`
5. In a Server Component, call `supabase.auth.getUser()` and log the result — it should return the authenticated user object
6. Log out and attempt to access a protected route — the proxy should redirect to `/login`
