# Framework Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite the documentation layer from tutorials to directives, introduce the `data/` architecture layer, deduplicate rules, create FRAMEWORK.md, fix import conventions, and build the setup CLI.

**Architecture:** Docs become AI directives (rules + placement + external links). Code examples are removed unless project-specific. A `data/` layer replaces `lib/services/` for read operations. A setup CLI scaffolds Tier 2 integrations interactively.

**Tech Stack:** Next.js 16.2, TypeScript, Bun, @clack/prompts (new dev dep for CLI)

---

### Task 1: Create `docs/FRAMEWORK.md` — Version Truth Source

**Files:**
- Create: `docs/FRAMEWORK.md`

- [ ] **Step 1: Create FRAMEWORK.md**

```markdown
# Framework

Runtime version truths for this codebase. Check this before using any version-sensitive API.

---

## Stack Versions

| Package | Version | Docs |
|---|---|---|
| Next.js | 16.2 | https://nextjs.org/docs |
| React | 19 | https://react.dev |
| TypeScript | 6.x (strict) | https://www.typescriptlang.org/docs |
| Tailwind CSS | 4 | https://tailwindcss.com/docs |
| Bun | 1.x | https://bun.sh/docs |
| shadcn/ui | latest | https://ui.shadcn.com/docs |
| Biome | latest | https://biomejs.dev |
| Zod | 4.x | https://zod.dev |

When unsure about any API, check `node_modules/next/dist/docs/` first. Training data may be outdated.

---

## Next.js 16

| Old | New | Reference |
|---|---|---|
| `middleware.ts` with `middleware` export | `proxy.ts` with `proxy` export | https://nextjs.org/docs/app/building-your-application/routing/middleware |
| `error.tsx` `reset` prop | `unstable_retry` prop | https://nextjs.org/docs/app/api-reference/file-conventions/error |
| Manual `PageProps` / `LayoutProps` types | Auto-generated `PageProps<'/route'>` and `LayoutProps<'/route'>` from route tree | https://nextjs.org/docs/app/api-reference/file-conventions/page |
| Manual `useMemo` / `useCallback` | React Compiler handles memoization (`reactCompiler: true` in `next.config.ts`) | https://nextjs.org/docs/app/api-reference/next-config-js/reactCompiler |

---

## React 19

| Old | New | Reference |
|---|---|---|
| `useFormState` (react-dom) | `useActionState` (react) | https://react.dev/reference/react/useActionState |
| `forwardRef` wrapper | `ref` is a regular prop | https://react.dev/blog/2024/12/05/react-19#ref-as-a-prop |
| `React.cache` namespace access | `import { cache } from 'react'` — still experimental, verify before use | https://react.dev/reference/react/cache |

---

## Tailwind CSS 4

| Old | New | Reference |
|---|---|---|
| `tailwind.config.js` / `tailwind.config.ts` | CSS-based config with `@theme` in `globals.css` | https://tailwindcss.com/docs/theme |
| Plugin system via JS | `@utility` and `@variant` directives in CSS | https://tailwindcss.com/docs/adding-custom-styles |
| `@apply` (discouraged) | Direct utility classes or `@utility` for custom utilities | https://tailwindcss.com/docs/adding-custom-styles |
```

- [ ] **Step 2: Verify the file renders correctly**

Open `docs/FRAMEWORK.md` in the IDE and confirm tables render, links are correct, and content matches the locked versions in `package.json`.

- [ ] **Step 3: Commit**

```bash
git add docs/FRAMEWORK.md
git commit -m "docs: create FRAMEWORK.md with version truths and breaking changes"
```

---

### Task 2: Rewrite `AGENTS.md` — Slim to MCP + References

**Files:**
- Modify: `AGENTS.md`

- [ ] **Step 1: Replace AGENTS.md contents**

```markdown
# This is NOT the Next.js you know

This version has breaking changes. Check `docs/FRAMEWORK.md` for version truths and breaking changes before writing any code. Check `node_modules/next/dist/docs/` when unsure about any Next.js API.

---

## References

- Framework versions and breaking changes: `docs/FRAMEWORK.md`
- Architecture and file structure: `docs/ARCHITECTURE.md`
- Coding conventions: `docs/CONVENTIONS.md`
- Design and shadcn gate: `docs/DESIGN.md`
- Styling and class ordering: `docs/STYLING.md`
- AI restrictions: `docs/guides/ai-restrictions.md`

---

## MCP Servers

Available via Claude.ai integrations or project config.

| Server | Purpose | Setup |
|---|---|---|
| shadcn/ui | Browse, search, install components with accurate props | `.mcp.json` (project) |
| Supabase | Query DB, inspect schemas, manage migrations | Claude.ai integration |
| Vercel | Deploy, check logs, manage env vars | Claude.ai integration |
| Figma | Read designs, extract tokens, generate code | Claude.ai integration |

shadcn config in `.mcp.json`:

```json
{
  "mcpServers": {
    "shadcn": {
      "command": "npx",
      "args": ["shadcn@latest", "mcp"]
    }
  }
}
```
```

- [ ] **Step 2: Commit**

```bash
git add AGENTS.md
git commit -m "docs: slim AGENTS.md to MCP config and references"
```

---

### Task 3: Rewrite `CLAUDE.md` — Slim Entry Point

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Replace CLAUDE.md contents**

```markdown
@AGENTS.md

## References

- Framework: @docs/FRAMEWORK.md
- Architecture: @docs/ARCHITECTURE.md
- Conventions: @docs/CONVENTIONS.md
- Decisions: @docs/DECISIONS.md
- Design: @docs/DESIGN.md
- Styling: @docs/STYLING.md

## Stack

### Tier 1 (Pre-Installed)

Next.js 16.2, React 19, TypeScript (strict), Tailwind CSS 4, Biome, Bun, shadcn/ui, Zod 4, Sonner, Lefthook, Vitest (config only), Playwright (config only)

### Tier 2 (Install On Demand)

| Need | Install | Guide |
|---|---|---|
| State Management | `bun add zustand` | @docs/guides/state-management.md |
| Forms | `bun add react-hook-form @hookform/resolvers` | @docs/guides/forms.md |
| Auth | `bun add @supabase/ssr @supabase/supabase-js` | @docs/guides/auth.md |
| Payments | `bun add stripe` | @docs/guides/payments.md |
| Email | `bun add resend` | @docs/guides/email.md |
| File Upload | Supabase Storage (no extra dep) | @docs/guides/file-upload.md |
| Realtime | Supabase Realtime (no extra dep) | @docs/guides/realtime.md |
| Analytics | `bun add @vercel/analytics` | @docs/guides/analytics.md |
| Error Monitoring | `bun add @sentry/nextjs` | @docs/guides/sentry.md |
| Testing | Already configured | @docs/guides/testing.md |

Or run `bun run setup` for interactive Tier 2 scaffolding.

## Commits

Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`. One line. No co-author trailers.

## Restrictions

See @docs/guides/ai-restrictions.md for the full list.
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: slim CLAUDE.md to entry point with references"
```

---

### Task 4: Rewrite `docs/ARCHITECTURE.md` — Add `data/`, Remove `lib/services/`

**Files:**
- Modify: `docs/ARCHITECTURE.md`

- [ ] **Step 1: Replace ARCHITECTURE.md contents**

```markdown
# Architecture

Docs-heavy, code-minimal. Ship the smallest runnable codebase. Docs define rules — features scaffolded on demand.

---

## Structure

Shipped directories shown. Others added as features are introduced.

```
src/
├── app/
│   ├── (marketing)/        → Public pages (landing, pricing, about)
│   ├── (auth)/             → Login, register, reset
│   ├── (dashboard)/        → Authenticated app pages
│   ├── (admin)/            → Admin-only pages
│   ├── api/webhooks/       → Payment webhook handlers
│   ├── layout.tsx, page.tsx, loading.tsx, error.tsx, not-found.tsx
│   ├── robots.txt, globals.css
├── data/
│   ├── api/                → Fetch functions + domain types (one file per domain)
│   └── static/             → Hard-coded app data (navigation, pricing, features)
├── components/
│   ├── core/               → Providers, app-wide wrappers
│   ├── ui/                 → shadcn/ui primitives (CLI-owned)
│   ├── forms/              → Shared form fields (2+ features)
│   ├── layout/             → Header, sidebar, footer, nav
│   └── [feature]/          → Feature-scoped (2+ components)
├── lib/
│   ├── supabase/           → client, server, middleware, admin
│   ├── payments/           → stripe, paymongo
│   ├── email/              → resend
│   ├── validators/         → Zod schemas per domain
│   ├── env.ts, utils.ts, constants.ts, types.ts
├── hooks/                  → Custom React hooks (one per file)
├── stores/                 → Zustand stores (one per domain)
supabase/                   → migrations/, seed.sql, config.toml
tests/                      → unit/, integration/, e2e/
public/static/              → Static assets
```

---

## Directory Rules

| Directory | Rule |
|---|---|
| `data/api/` | Fetch functions + their domain types co-located. One file per domain. Read-only operations. |
| `data/static/` | Hard-coded data constants (navigation items, pricing tiers). Importable, not fetched. |
| `components/core/` | Providers, wrappers. No business logic. |
| `components/ui/` | shadcn CLI-owned. Visual customization blocked until DESIGN.md is `Active` → see `docs/DESIGN.md`. Structural/convention fixes always allowed. |
| `components/forms/` | Add when a form field is used in 2+ unrelated features. |
| `components/[feature]/` | Create when a feature needs 2+ components. |
| `lib/supabase/` | All Supabase clients. No direct instantiation elsewhere. |
| `lib/validators/` | Zod schemas shared across actions, routes, forms. |
| `lib/types.ts` | Shared utility types only (e.g. `ActionResult`). Domain types live in `data/api/`. |

Single feature-specific components live in `components/` until a second related component warrants a directory.

---

## Data Flow

- **Reads:** `data/api/` → Server Components consume directly via `import { getX } from '@/data/api/x'`
- **Writes:** Server Actions → mutate, then `revalidatePath` / `revalidateTag`
- **Client state:** Zustand stores in `stores/` for UI-only state → see `docs/CONVENTIONS.md`
- **Validation:** Zod schemas in `lib/validators/` shared between client forms and Server Actions

---

## Route Groups

| Group | Layout | Protection | Content |
|---|---|---|---|
| `(marketing)` | Public header/footer | None | Landing, pricing, about, legal |
| `(auth)` | Minimal centered | Redirect if authenticated | Login, register, reset |
| `(dashboard)` | Sidebar + top nav | Proxy auth | App feature pages |
| `(admin)` | Admin layout | Auth + `admin` role | User management, admin tools |

Each group owns its `layout.tsx`. Root `layout.tsx` handles only global concerns: HTML shell, CSS, providers.

---

## Quality Gates

| When | What runs |
|---|---|
| Pre-commit | Biome lint (staged files only) |
| PR to main | Biome lint + TypeScript typecheck + Vitest + Playwright + Build |
| Main branch | Always stable and deployable |

---

## Security

| Concern | Reference |
|---|---|
| Next.js security | https://nextjs.org/blog/security-nextjs-server-components-actions |
| Supabase RLS | Enable on every table before production. Supabase docs. |
| Secrets | `.env.local` only. Never committed. `.env.example` maintained. |
| Server Actions | Validate all inputs server-side → see `docs/CONVENTIONS.md`. |
```

- [ ] **Step 2: Commit**

```bash
git add docs/ARCHITECTURE.md
git commit -m "docs: add data layer, remove lib/services from architecture"
```

---

### Task 5: Rewrite `docs/CONVENTIONS.md` — Single Home for All Coding Rules

**Files:**
- Modify: `docs/CONVENTIONS.md`

- [ ] **Step 1: Replace CONVENTIONS.md contents**

```markdown
# Conventions

Naming, imports, and coding patterns. This is the single source for all coding rules.

---

## File Naming

All files: **kebab-case lowercase**.

| Type | Pattern | Location |
|---|---|---|
| Component | `name.tsx` | `components/` |
| Hook | `use-name.ts` | `hooks/` |
| Store | `name.store.ts` | `stores/` |
| Validator | `name.schema.ts` | `lib/validators/` |
| Data fetch | `name.ts` | `data/api/` |
| Static data | `name.ts` | `data/static/` |
| Utility | `name.ts` | `lib/` |
| Route | `kebab-case/page.tsx` | `app/` |
| Test | `name.test.tsx` | `tests/unit/` |
| E2E Test | `name.spec.ts` | `tests/e2e/` |
| Migration | `00001-description.sql` | `supabase/migrations/` |

## Exports

- Components, Stores, Validators → `PascalCase`
- Hooks → `camelCase` with `use` prefix
- Data fetch functions → `camelCase` with `get` prefix (e.g. `getPosts`, `getUser`)
- Utilities → `camelCase`

## Imports

Three groups, blank line between each. Biome enforces order.

```ts
import type { ReactNode } from 'react'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
```

1. Type imports
2. Third-party packages
3. Alias imports (`@/`)

**No namespace imports for type access.** Always destructure what you use:

```ts
// Wrong — namespace import
import type * as React from 'react'
// Then: React.ComponentProps<'button'>

// Right — destructured
import type { ComponentProps } from 'react'
// Then: ComponentProps<'button'>
```

This applies to all packages, not just React.

## Markdown

- Root + `docs/` top-level → `ALL_CAPS.md`
- `docs/guides/` → `kebab-case.md`

## Assets

`public/static/` → `{namespace}-{element}-{l/d}.ext`

## Components

- Server Components by default. `'use client'` only when interactivity can't be isolated to a child.
- No barrel exports. Direct imports only.
- One component per file.
- Never import server-only code in client components. Use Server Actions to bridge.

## Server Actions

- All mutations via Server Actions. No client-side API calls for writes.
- Co-locate with consuming component, or use sibling `actions.ts`.
- Return `ActionResult` from every action (defined in `lib/types.ts`).
- Validate all inputs server-side with Zod. Never trust client data.
- `useActionState` for form submissions with pending state.
- `revalidatePath` / `revalidateTag` after successful mutations.

## Data Layer

- Read operations go in `data/api/`. One file per domain.
- Each file exports its domain types + fetch functions together.
- Consumer pattern: `import { getPosts } from '@/data/api/posts'`

## Code Style

- Self-documenting code. No comments.
- Constants over magic values.
- Blank line before `return` statements.
- Blank line between logical blocks: setup, transformation, output.
- Group related statements together. Separate unrelated ones with a blank line.
- No suppressing Biome warnings without approval.
- `.env.local` only. Never commit secrets. Maintain `.env.example`.
```

- [ ] **Step 2: Commit**

```bash
git add docs/CONVENTIONS.md
git commit -m "docs: consolidate all coding rules into CONVENTIONS.md"
```

---

### Task 6: Rewrite `docs/DESIGN.md` — Clarify Shadcn Gate Scope

**Files:**
- Modify: `docs/DESIGN.md`

- [ ] **Step 1: Replace the Gate section (lines 1-14) with clarified scope**

Replace everything from line 1 through line 14 (ending at the `---` after the Workflow line) with:

```markdown
# Design

Brand guidelines and design tokens.

**Status:** Template

---

## Prototyping Workflow

The template starts as a prototyping tool. shadcn/ui components ship with Tailwind defaults. Once brand guidelines are defined (this doc filled in, status changed to `Active`), the design cascades through CSS variables in `globals.css` — no component file edits needed for color/typography changes.

## Gate

Until status is `Active`, visual customization is blocked:
- Colors, typography, spacing beyond Tailwind defaults, border radius values

Structural and convention fixes are always allowed regardless of status:
- Import style changes, code formatting, linting fixes, adding/removing props for functionality

**Workflow:** Fill this doc → update `:root` and `.dark` in `globals.css` → verify both modes → change status to `Active`.

---
```

Leave everything from `## Brand Colors` onward unchanged.

- [ ] **Step 2: Commit**

```bash
git add docs/DESIGN.md
git commit -m "docs: clarify shadcn gate scope and add prototyping rationale"
```

---

### Task 7: Create `data/` Directory Structure

**Files:**
- Create: `src/data/api/.gitkeep`
- Create: `src/data/static/.gitkeep`

- [ ] **Step 1: Create directories**

```bash
mkdir -p src/data/api src/data/static
touch src/data/api/.gitkeep src/data/static/.gitkeep
```

- [ ] **Step 2: Commit**

```bash
git add src/data/
git commit -m "feat: add data layer directory structure"
```

---

### Task 8: Fix Imports in `src/components/ui/button.tsx`

**Files:**
- Modify: `src/components/ui/button.tsx:1-2`

- [ ] **Step 1: Identify which `React.*` types are used**

Scan the file for all `React.` references. The file uses:
- `React.ComponentProps<'button'>` on line 52

- [ ] **Step 2: Replace the namespace import with destructured import**

Replace lines 1-2:

```ts
import type { VariantProps } from 'class-variance-authority';
import type * as React from 'react';
```

With:

```ts
import type { ComponentProps } from 'react';
import type { VariantProps } from 'class-variance-authority';
```

- [ ] **Step 3: Replace `React.ComponentProps` usage with `ComponentProps`**

Replace on line 52:

```ts
}: React.ComponentProps<'button'> &
```

With:

```ts
}: ComponentProps<'button'> &
```

- [ ] **Step 4: Run lint and typecheck**

```bash
bun run lint && bun run typecheck
```

Expected: Both pass with no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/button.tsx
git commit -m "refactor: destructure React type imports in button component"
```

---

### Task 9: Fix Imports in `src/components/ui/card.tsx`

**Files:**
- Modify: `src/components/ui/card.tsx:1`

- [ ] **Step 1: Identify which `React.*` types are used**

Scan the file for all `React.` references. The file uses:
- `React.ComponentProps<'div'>` on lines 9, 23, 36, 49, 59, 72, 82

- [ ] **Step 2: Replace the namespace import with destructured import**

Replace line 1:

```ts
import type * as React from 'react';
```

With:

```ts
import type { ComponentProps } from 'react';
```

- [ ] **Step 3: Replace all `React.ComponentProps` usages with `ComponentProps`**

Replace every instance of `React.ComponentProps` with `ComponentProps` in the file. There are 7 occurrences on lines 9, 23, 36, 49, 59, 72, 82.

- [ ] **Step 4: Run lint and typecheck**

```bash
bun run lint && bun run typecheck
```

Expected: Both pass with no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/card.tsx
git commit -m "refactor: destructure React type imports in card component"
```

---

### Task 10: Fix Imports in `src/components/ui/input.tsx`

**Files:**
- Modify: `src/components/ui/input.tsx:1`

- [ ] **Step 1: Identify which `React.*` types are used**

Scan the file for all `React.` references. The file uses:
- `React.ComponentProps<'input'>` on line 5

- [ ] **Step 2: Replace the namespace import with destructured import**

Replace line 1:

```ts
import type * as React from 'react';
```

With:

```ts
import type { ComponentProps } from 'react';
```

- [ ] **Step 3: Replace `React.ComponentProps` usage with `ComponentProps`**

Replace on line 5:

```ts
function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
```

With:

```ts
function Input({ className, type, ...props }: ComponentProps<'input'>) {
```

- [ ] **Step 4: Run lint and typecheck**

```bash
bun run lint && bun run typecheck
```

Expected: Both pass with no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/input.tsx
git commit -m "refactor: destructure React type imports in input component"
```

---

### Task 11: Rewrite `docs/guides/auth.md`

**Files:**
- Modify: `docs/guides/auth.md`

- [ ] **Step 1: Replace auth.md with directive format**

```markdown
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
```

- [ ] **Step 2: Commit**

```bash
git add docs/guides/auth.md
git commit -m "docs: rewrite auth guide to directive format"
```

---

### Task 12: Rewrite `docs/guides/forms.md`

**Files:**
- Modify: `docs/guides/forms.md`

- [ ] **Step 1: Replace forms.md with directive format**

```markdown
# Forms

**Stack:** React Hook Form + `@hookform/resolvers` + Zod

---

## When To Use

**Use for:** any form with validation, multi-field forms, multi-step wizards.

**Don't use for:** single-input forms (use native form + Server Action), search inputs (use URL search params).

## Dependencies

Zod is Tier 1 (pre-installed). Install React Hook Form:

```bash
bun add react-hook-form @hookform/resolvers
```

## File Placement

```
src/lib/validators/   → Zod schemas, one per domain (auth.schema.ts, profile.schema.ts)
src/components/forms/  → Shared form components used in 2+ features
```

## Conventions

- Zod schemas in `lib/validators/`, named `[domain].schema.ts`. Export both the schema and inferred type.
- `zodResolver` from `@hookform/resolvers/zod` connects the schema to React Hook Form.
- Double-validate: client-side via React Hook Form, server-side via `safeParse` in the Server Action.
- Return `ActionResult` from every Server Action → see `docs/CONVENTIONS.md`.
- `useActionState` for form submissions with pending state → see `docs/FRAMEWORK.md` for React 19 API.
- Field arrays: use `useFieldArray` from React Hook Form.
- Conditional validation: use `z.discriminatedUnion` or `.superRefine`. Keep logic in the schema, not the component.

## References

- React Hook Form docs: https://react-hook-form.com/get-started
- Zod docs: https://zod.dev
- @hookform/resolvers: https://github.com/react-hook-form/resolvers

## Verification

1. Submit empty form → validation errors appear
2. Invalid data → specific error messages
3. Valid data → `onSubmit` called with parsed values, no errors
```

- [ ] **Step 2: Commit**

```bash
git add docs/guides/forms.md
git commit -m "docs: rewrite forms guide to directive format"
```

---

### Task 13: Rewrite `docs/guides/state-management.md`

**Files:**
- Modify: `docs/guides/state-management.md`

- [ ] **Step 1: Replace state-management.md with directive format**

```markdown
# State Management

**Stack:** Zustand

---

## When To Use

**Use for:** shared client UI state (sidebar, modals, theme), cross-tree state where prop drilling is impractical, ephemeral state not persisted to server.

**Don't use for:** server data (use Server Components + `data/api/`), form state (use React Hook Form), URL-driven state (use search params).

## Dependencies

```bash
bun add zustand
```

## File Placement

```
src/stores/
├── ui.store.ts
└── [domain].store.ts
```

One store per domain. No monolithic stores.

## Conventions

- Export as `use[Name]Store` (e.g. `useUIStore`).
- Define the interface above the `create` call.
- Functional `set` when new value depends on previous state. Object `set` for independent updates.
- Select minimal slices to avoid unnecessary re-renders. Never subscribe to the entire store with no selector.
- Test stores with `getState()` / `setState()` — no React rendering context needed.

## References

- Zustand docs: https://zustand.docs.pmnd.rs/getting-started/introduction
- Zustand recipes: https://zustand.docs.pmnd.rs/guides/practice-with-no-store-actions

## Verification

1. Store exports correctly typed
2. Sliced selectors trigger re-renders only for subscribed state
3. `getState()` / `setState()` work in Vitest without React
```

- [ ] **Step 2: Commit**

```bash
git add docs/guides/state-management.md
git commit -m "docs: rewrite state management guide to directive format"
```

---

### Task 14: Rewrite `docs/guides/payments.md`

**Files:**
- Modify: `docs/guides/payments.md`

- [ ] **Step 1: Replace payments.md with directive format**

```markdown
# Payments

**Stack:** Stripe + PayMongo

---

## When To Use

**Use Stripe for:** international payments, subscriptions, customer portal.

**Use PayMongo for:** Philippine local payments (GCash, PayMaya, card).

## Dependencies

```bash
bun add stripe
bun add paymongo-node
```

## Env Variables

| Variable | Browser | Required |
|---|---|---|
| `STRIPE_SECRET_KEY` | No | Yes |
| `STRIPE_WEBHOOK_SECRET` | No | Yes |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Yes |
| `PAYMONGO_SECRET_KEY` | No | Yes |
| `PAYMONGO_PUBLIC_KEY` | Yes | Yes |
| `PAYMONGO_WEBHOOK_SECRET` | No | Yes |

Update `src/lib/env.ts` to include all six.

## File Placement

```
src/lib/payments/
├── stripe.ts       → Stripe client singleton (server-only)
└── paymongo.ts     → PayMongo client singleton (server-only)

src/app/api/webhooks/
├── stripe/route.ts   → Stripe webhook handler
└── paymongo/route.ts → PayMongo webhook handler
```

## Conventions

- Client singletons in `lib/payments/`, server-only. Never import in client components.
- Webhook handlers verify signatures before processing. Stripe: `stripe.webhooks.constructEvent`. PayMongo: HMAC-SHA256 with `timingSafeEqual`.
- Checkout sessions, payment intents, portal sessions → Server Actions.
- Store `subscription.id` and `customer.id` from webhooks, not from client-side responses.
- Listen to `customer.subscription.updated` and `customer.subscription.deleted` to sync DB.

## References

- Stripe Next.js guide: https://docs.stripe.com/payments/accept-a-payment?platform=web&ui=stripe-hosted
- Stripe webhooks: https://docs.stripe.com/webhooks
- Stripe customer portal: https://docs.stripe.com/billing/subscriptions/integrating-customer-portal
- PayMongo API: https://developers.paymongo.com/reference
- PayMongo webhooks: https://developers.paymongo.com/docs/webhooks

## Verification

### Stripe

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
stripe trigger checkout.session.completed
```

### PayMongo

Use ngrok (`ngrok http 3000`) → register webhook URL in PayMongo dashboard → use "Send Test Event".
```

- [ ] **Step 2: Commit**

```bash
git add docs/guides/payments.md
git commit -m "docs: rewrite payments guide to directive format"
```

---

### Task 15: Rewrite `docs/guides/email.md`

**Files:**
- Modify: `docs/guides/email.md`

- [ ] **Step 1: Replace email.md with directive format**

```markdown
# Email

**Stack:** Resend

---

## When To Use

**Use for:** transactional email (welcome, password reset, receipts, notifications).

**Don't use for:** marketing campaigns (use Resend's broadcast feature or a dedicated ESP).

## Dependencies

```bash
bun add resend
```

## Env Variables

| Variable | Browser | Required |
|---|---|---|
| `RESEND_API_KEY` | No | Yes |
| `RESEND_FROM_EMAIL` | No | Yes |

Update `src/lib/env.ts`.

## File Placement

```
src/lib/email/
└── resend.ts → Server-only email sender utility
```

## Conventions

- Single `sendEmail` function that wraps `resend.emails.send` with the project's `from` address.
- Return a discriminated union result type (success with ID, or failure with error message).
- Always provide both `html` and `text` for email accessibility.
- Call from Server Actions only, never from client components.

## References

- Resend docs: https://resend.com/docs/introduction
- Resend Next.js guide: https://resend.com/docs/send-with-nextjs

## Verification

1. Add env vars to `.env.local` → `bun dev`
2. Trigger a Server Action calling `sendEmail` with your address
3. Confirm `success: true` in logs and email arrives
```

- [ ] **Step 2: Commit**

```bash
git add docs/guides/email.md
git commit -m "docs: rewrite email guide to directive format"
```

---

### Task 16: Rewrite `docs/guides/file-upload.md`

**Files:**
- Modify: `docs/guides/file-upload.md`

- [ ] **Step 1: Replace file-upload.md with directive format**

```markdown
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
```

- [ ] **Step 2: Commit**

```bash
git add docs/guides/file-upload.md
git commit -m "docs: rewrite file upload guide to directive format"
```

---

### Task 17: Rewrite `docs/guides/realtime.md`

**Files:**
- Modify: `docs/guides/realtime.md`

- [ ] **Step 1: Replace realtime.md with directive format**

```markdown
# Realtime

**Stack:** Supabase Realtime (no extra dependency)

---

## When To Use

**Use for:** live data updates (chat, notifications, dashboards), presence tracking (online users, live cursors).

**Don't use for:** data that doesn't need to be live (use server fetching + revalidation).

**Prerequisite:** Enable Realtime on target tables under Database > Replication > Supabase Realtime.

## Dependencies

None additional. Uses `@supabase/supabase-js` from auth setup.

## File Placement

```
src/hooks/
├── use-channel.ts     → Generic channel subscription
├── use-db-changes.ts  → DB INSERT/UPDATE/DELETE listener
└── use-presence.ts    → Presence tracking (online users)
```

## Conventions

- One hook per concern, each in its own file in `hooks/`.
- Each hook owns its own channel. Do not share channels across components.
- Always `unsubscribe()` in the effect cleanup.
- Filter by relevant columns (e.g. `room_id=eq.${roomId}`) to reduce payload.
- Presence: use `track()` on subscribe, `untrack()` on cleanup.
- Debounce high-frequency updates (e.g. live cursors on `pointermove`).

## References

- Supabase Realtime guide: https://supabase.com/docs/guides/realtime
- Postgres Changes: https://supabase.com/docs/guides/realtime/postgres-changes
- Presence: https://supabase.com/docs/guides/realtime/presence
- Broadcast: https://supabase.com/docs/guides/realtime/broadcast

## Verification

1. Open page in two tabs
2. DB changes: insert a row in Supabase Table Editor → appears in both tabs
3. Presence: each tab shows the other in online list → close one → list updates
4. Network panel: active `wss://` connection to Supabase URL
```

- [ ] **Step 2: Commit**

```bash
git add docs/guides/realtime.md
git commit -m "docs: rewrite realtime guide to directive format"
```

---

### Task 18: Rewrite `docs/guides/analytics.md`

**Files:**
- Modify: `docs/guides/analytics.md`

- [ ] **Step 1: Replace analytics.md with directive format**

```markdown
# Analytics

**Stack:** Vercel Analytics + Google Analytics 4

---

## When To Use

**Use Vercel Analytics for:** Core Web Vitals, page views, automatic tracking on Vercel deployments.

**Use GA4 for:** custom event tracking, audience segmentation, marketing attribution.

Both can run simultaneously.

## Dependencies

```bash
bun add @vercel/analytics
```

GA4 requires no npm package — loaded via `next/script`.

## Env Variables

| Variable | Browser | Required |
|---|---|---|
| `NEXT_PUBLIC_ANALYTICS_ID` | Yes | No (omitting disables GA4 silently) |

Update `src/lib/env.ts` (optional field).

## File Placement

```
src/components/core/
└── analytics-provider.tsx → Client component, renders in production only

src/lib/
└── analytics.ts → Custom event tracking utility (gtag wrapper)

src/types/
└── gtag.d.ts → Window.gtag type declaration
```

## Conventions

- Analytics provider is a `'use client'` component in `components/core/`, added to root layout `<body>`.
- Production-only: check `process.env.NODE_ENV === 'production'` before rendering scripts.
- Custom events: use a `trackEvent` utility that no-ops when `gtag` is unavailable.
- Vercel Analytics: `<Analytics />` component from `@vercel/analytics/react`.

## References

- Vercel Analytics: https://vercel.com/docs/analytics
- GA4 setup: https://developers.google.com/analytics/devguides/collection/ga4
- next/script: https://nextjs.org/docs/app/api-reference/components/script

## Verification

1. `bun build && bun start`
2. DevTools Network → filter `gtag` → confirm `200`
3. Vercel Analytics: filter `/_vercel/insights`
4. GA4 dashboard → Realtime → confirm hits
```

- [ ] **Step 2: Commit**

```bash
git add docs/guides/analytics.md
git commit -m "docs: rewrite analytics guide to directive format"
```

---

### Task 19: Rewrite `docs/guides/sentry.md`

**Files:**
- Modify: `docs/guides/sentry.md`

- [ ] **Step 1: Replace sentry.md with directive format**

```markdown
# Sentry

**Stack:** `@sentry/nextjs`

> Verify SDK version supports Next.js 16 before proceeding → see `docs/FRAMEWORK.md`.

---

## When To Use

**Use for:** error monitoring, performance tracing, session replay in production.

## Dependencies

```bash
bun add @sentry/nextjs
```

## Env Variables

| Variable | Runtime | Required |
|---|---|---|
| `NEXT_PUBLIC_SENTRY_DSN` | Browser + Server | Yes |
| `SENTRY_AUTH_TOKEN` | Build only | Yes (source maps) |
| `SENTRY_ORG` | Build only | Yes (source maps) |
| `SENTRY_PROJECT` | Build only | Yes (source maps) |

Add `NEXT_PUBLIC_SENTRY_DSN` to `src/lib/env.ts`. The others are consumed by the Sentry webpack plugin at build time.

## File Placement

```
/                              → Project root
├── sentry.client.config.ts    → Browser SDK init
├── sentry.server.config.ts    → Node.js server SDK init
├── sentry.edge.config.ts      → Edge runtime SDK init
├── instrumentation.ts         → Server + edge bootstrap
└── instrumentation-client.ts  → Browser bootstrap

src/app/error.tsx              → Updated to report to Sentry
next.config.ts                 → Wrapped with withSentryConfig
```

## Conventions

- `enabled: process.env.NODE_ENV === 'production'` in all config files.
- `tracesSampleRate: 0.1` — adjust based on traffic volume.
- `replaysSessionSampleRate: 0.1`, `replaysOnErrorSampleRate: 1.0` for replay.
- Wrap `next.config.ts` with `withSentryConfig` for source maps and component annotations.
- `error.tsx` calls `Sentry.captureException` in a `useEffect`. Pass `error.digest` as extra context.
- `instrumentation.ts` exports `onRequestError = Sentry.captureRequestError` for server-side capture.
- Three capture layers: error boundary (React errors), instrumentation (server errors), global handlers (unhandled).

## References

- Sentry Next.js guide: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- Sentry source maps: https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/#configure-source-maps
- Session replay: https://docs.sentry.io/platforms/javascript/session-replay/

## Verification

1. Create a test page that throws an error
2. Visit in production mode (`bun build && bun start`)
3. Check Sentry Issues dashboard for the error with stack trace and route context
4. Delete the test page after verification
```

- [ ] **Step 2: Commit**

```bash
git add docs/guides/sentry.md
git commit -m "docs: rewrite sentry guide to directive format"
```

---

### Task 20: Rewrite `docs/guides/testing.md`

**Files:**
- Modify: `docs/guides/testing.md`

- [ ] **Step 1: Replace testing.md with directive format**

```markdown
# Testing

**Stack:** Vitest + Testing Library + Playwright

---

## When To Use

| Type | When | Tool |
|---|---|---|
| Unit | Pure functions, hooks, stores, utilities | Vitest |
| Component | UI behavior, user interactions | Vitest + Testing Library |
| Integration | API route handlers, Server Actions | Vitest |
| E2E | Full user flows, critical paths | Playwright |

## Dependencies

All pre-installed (Tier 1). No setup required.

- `vitest.config.ts` — jsdom, React plugin, `@` path alias
- `playwright.config.ts` — `http://localhost:3000`, Chromium

## File Placement

Mirror `src/` structure inside `tests/unit/`.

```
tests/
├── unit/
│   ├── components/   → mirrors src/components/
│   ├── lib/          → mirrors src/lib/
│   ├── hooks/        → mirrors src/hooks/
│   └── data/         → mirrors src/data/
├── integration/
│   └── api/          → Route handler tests
└── e2e/              → Full user flow tests
```

| Type | Naming | Location |
|---|---|---|
| Unit | `name.test.tsx` | `tests/unit/` |
| Integration | `name.test.ts` | `tests/integration/` |
| E2E | `name.spec.ts` | `tests/e2e/` |

## Conventions

- Prefer `@testing-library/user-event` over `fireEvent`. Always `await` user event calls.
- Use `waitFor` for async state updates.
- Test stores with `getState()` / `setState()` — no React rendering context needed.
- Mock external dependencies with `vi.mock()`. Never mock the module under test.
- Use `vi.fn()` for callback assertions.
- E2E: use `page.getByRole()` selectors for accessibility-first testing.

## Commands

| Command | Runs |
|---|---|
| `bun run test` | Unit + integration tests (single run) |
| `bun run test:watch` | Unit tests (watch mode) |
| `bun run test:e2e` | E2E tests (Playwright) |

## CI

Project-specific CI workflow in `.github/workflows/ci.yml`:

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bun run lint

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bun run typecheck

  unit-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bun run test

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bun run build

  e2e-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bunx playwright install --with-deps chromium
      - run: bun run test:e2e
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
```

## References

- Vitest docs: https://vitest.dev/guide/
- Testing Library: https://testing-library.com/docs/react-testing-library/intro
- Playwright docs: https://playwright.dev/docs/intro

## Verification

1. `bun run test` passes with no errors
2. `bun run test:e2e` passes with Chromium
3. CI pipeline runs all jobs on PR to main
```

- [ ] **Step 2: Commit**

```bash
git add docs/guides/testing.md
git commit -m "docs: rewrite testing guide to directive format"
```

---

### Task 21: Rewrite `docs/guides/seo.md`

**Files:**
- Modify: `docs/guides/seo.md`

- [ ] **Step 1: Replace seo.md with directive format**

```markdown
# Metadata And SEO

**Stack:** Next.js Metadata API (built-in)

---

## When To Use

**Use for:** page titles, descriptions, OG images, structured data (JSON-LD), sitemaps, canonical URLs.

## Dependencies

None. Uses built-in Next.js Metadata API.

## File Placement

```
src/app/
├── layout.tsx        → Root metadata with title template
├── sitemap.ts        → Dynamic sitemap generation
├── robots.ts         → Robots.txt generation
├── og/route.tsx      → Dynamic OG image generation (edge runtime)
└── [route]/page.tsx  → Per-page metadata export
```

## Conventions

- Static metadata: export `metadata` object from `page.tsx` or `layout.tsx`.
- Dynamic metadata: export `generateMetadata` async function with `PageProps<'/route'>` type.
- Title uses template from root layout → renders as `"Page Title | Site Title"`.
- `generateMetadata` deduplicates with `cache` from `react` — if the data function is cached, the page and metadata share the same request. Use `import { cache } from 'react'` not `React.cache`.
- OG images: `ImageResponse` from `next/og` at `src/app/og/route.tsx` with `runtime = 'edge'`.
- JSON-LD: use the `StructuredData` component from `components/core/` for site-wide schemas. Per-page schemas go inline in the page component.
- Canonical URLs: set via `alternates.canonical` in metadata.
- No-index pages: set via `robots: { index: false, follow: false }` in metadata.
- Route group layouts can set baseline metadata that child pages merge with and override.

## References

- Next.js Metadata API: https://nextjs.org/docs/app/building-your-application/optimizing/metadata
- Next.js generateMetadata: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
- Next.js OG Image Generation: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image
- Next.js sitemap: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
- Google Rich Results Test: https://search.google.com/test/rich-results

## Verification

1. View page source → `<title>`, `<meta>` tags present
2. Social preview tool → OG image, title, description render correctly
3. Google Rich Results Test → structured data validates
4. `sitemap.xml` → accessible at `/sitemap.xml`
```

- [ ] **Step 2: Commit**

```bash
git add docs/guides/seo.md
git commit -m "docs: rewrite seo guide to directive format"
```

---

### Task 22: Rewrite `docs/guides/data-fetching.md`

**Files:**
- Modify: `docs/guides/data-fetching.md`

- [ ] **Step 1: Replace data-fetching.md with directive format**

```markdown
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
```

- [ ] **Step 2: Commit**

```bash
git add docs/guides/data-fetching.md
git commit -m "docs: rewrite data fetching guide to directive format"
```

---

### Task 23: Rewrite `docs/guides/server-actions.md`

**Files:**
- Modify: `docs/guides/server-actions.md`

- [ ] **Step 1: Replace server-actions.md with directive format**

```markdown
# Server Actions

**Stack:** Next.js Server Actions + Zod

---

## When To Use

**Use for:** all data mutations (create, update, delete). Form submissions, button actions, any client-initiated write.

**Don't use for:** data reads (use `data/api/` in Server Components), scheduled jobs (use API routes or external triggers).

## Dependencies

None additional. Zod is Tier 1 (pre-installed).

## File Placement

- Co-locate with consuming component as a `'use server'` function, or
- Use a sibling `actions.ts` file when the action is shared across components

## Conventions

- Every Server Action returns `ActionResult`:

```ts
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }
```

Defined in `src/lib/types.ts`.

- Validate all inputs server-side with Zod `safeParse`. Never trust client data.
- Use `useActionState` (React 19) for form submissions with pending state → see `docs/FRAMEWORK.md`.
- Call `revalidatePath` / `revalidateTag` after successful mutations.
- Never import server-only code in client components. Server Actions are the bridge.

## References

- Next.js Server Actions: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
- React useActionState: https://react.dev/reference/react/useActionState
- Zod safeParse: https://zod.dev/?id=safeparse

## Verification

1. Action validates input → returns `{ success: false, error: '...' }` on invalid data
2. Action succeeds → returns `{ success: true, data: ... }` and page revalidates
3. `useActionState` shows pending state during submission
```

- [ ] **Step 2: Commit**

```bash
git add docs/guides/server-actions.md
git commit -m "docs: rewrite server actions guide to directive format"
```

---

### Task 24: Rewrite `docs/guides/loading-streaming.md`

**Files:**
- Modify: `docs/guides/loading-streaming.md`

- [ ] **Step 1: Replace loading-streaming.md with directive format**

```markdown
# Loading And Streaming

**Stack:** Next.js Loading UI + React Suspense

---

## When To Use

**`loading.tsx`:** route-level loading states. Automatically wraps the page in a Suspense boundary.

**`<Suspense>`:** granular loading states within a page. Wrap individual async components to stream them independently.

## Dependencies

None. Built-in Next.js and React features.

## File Placement

```
src/app/[route]/
└── loading.tsx       → Route-level loading (one per route segment)

src/components/ui/
└── skeleton.tsx      → Reusable skeleton component (install via shadcn)
```

## Conventions

- Every route with async data should have a `loading.tsx`.
- Use `<Suspense fallback={...}>` inside pages to stream independent data sections in parallel.
- Skeleton components from shadcn/ui for consistent loading appearance.
- Do not show loading states for data that's already cached or instant.
- Nest Suspense boundaries for progressive loading: shell first, then sections.

## References

- Next.js Loading UI: https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming
- React Suspense: https://react.dev/reference/react/Suspense
- Streaming with Suspense: https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming#streaming-with-suspense

## Verification

1. Navigate to a route with `loading.tsx` → loading state appears instantly
2. Async sections wrapped in Suspense stream in progressively
3. Fast-cached data renders without flashing a loading state
```

- [ ] **Step 2: Commit**

```bash
git add docs/guides/loading-streaming.md
git commit -m "docs: rewrite loading and streaming guide to directive format"
```

---

### Task 25: Install `@clack/prompts` and Create Setup CLI

**Files:**
- Create: `scripts/setup.ts`
- Modify: `package.json` (verify script exists)

- [ ] **Step 1: Install @clack/prompts**

```bash
bun add -D @clack/prompts
```

Expected: package added to `devDependencies` in `package.json`.

- [ ] **Step 2: Verify setup script entry exists in package.json**

Check that `package.json` contains `"setup": "bun run scripts/setup.ts"`. It already does — no change needed.

- [ ] **Step 3: Create scripts/setup.ts**

```bash
mkdir -p scripts
```

```ts
import { cancel, confirm, intro, multiselect, note, outro, spinner } from '@clack/prompts'
import { execSync } from 'node:child_process'
import { appendFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const SRC = join(process.cwd(), 'src')
const ENV_EXAMPLE = join(process.cwd(), '.env.example')

interface Integration {
  value: string
  label: string
  deps: string[]
  dirs: string[]
  envVars: string[]
}

const integrations: Integration[] = [
  {
    value: 'auth',
    label: 'Auth (Supabase Auth + @supabase/ssr)',
    deps: ['@supabase/ssr', '@supabase/supabase-js'],
    dirs: ['lib/supabase'],
    envVars: [
      '',
      '# Auth (Supabase)',
      'NEXT_PUBLIC_SUPABASE_URL=',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY=',
      'SUPABASE_SERVICE_ROLE_KEY=',
    ],
  },
  {
    value: 'forms',
    label: 'Forms (React Hook Form + @hookform/resolvers)',
    deps: ['react-hook-form', '@hookform/resolvers'],
    dirs: ['lib/validators', 'components/forms'],
    envVars: [],
  },
  {
    value: 'state',
    label: 'State Management (Zustand)',
    deps: ['zustand'],
    dirs: ['stores'],
    envVars: [],
  },
  {
    value: 'payments',
    label: 'Payments (Stripe + PayMongo)',
    deps: ['stripe', 'paymongo-node'],
    dirs: ['lib/payments'],
    envVars: [
      '',
      '# Payments — Stripe',
      'STRIPE_SECRET_KEY=',
      'STRIPE_WEBHOOK_SECRET=',
      'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=',
      '',
      '# Payments — PayMongo',
      'PAYMONGO_SECRET_KEY=',
      'PAYMONGO_PUBLIC_KEY=',
      'PAYMONGO_WEBHOOK_SECRET=',
    ],
  },
  {
    value: 'email',
    label: 'Email (Resend)',
    deps: ['resend'],
    dirs: ['lib/email'],
    envVars: [
      '',
      '# Email (Resend)',
      'RESEND_API_KEY=',
      'RESEND_FROM_EMAIL=',
    ],
  },
  {
    value: 'analytics',
    label: 'Analytics (Vercel Analytics)',
    deps: ['@vercel/analytics'],
    dirs: [],
    envVars: [
      '',
      '# Analytics',
      'NEXT_PUBLIC_ANALYTICS_ID=',
    ],
  },
  {
    value: 'sentry',
    label: 'Error Monitoring (Sentry)',
    deps: ['@sentry/nextjs'],
    dirs: [],
    envVars: [
      '',
      '# Sentry',
      'NEXT_PUBLIC_SENTRY_DSN=',
      'SENTRY_AUTH_TOKEN=',
      'SENTRY_ORG=',
      'SENTRY_PROJECT=',
    ],
  },
]

async function main() {
  intro('Front-End Development Framework — Project Setup')

  const selected = await multiselect({
    message: 'Select integrations to install:',
    options: integrations.map((i) => ({ value: i.value, label: i.label })),
    required: false,
  })

  if (typeof selected === 'symbol') {
    cancel('Setup cancelled.')
    process.exit(0)
  }

  if (selected.length === 0) {
    outro('No integrations selected. Run again when ready.')
    process.exit(0)
  }

  const chosen = integrations.filter((i) => selected.includes(i.value))

  const s = spinner()

  // Install dependencies
  const allDeps = chosen.flatMap((i) => i.deps)
  if (allDeps.length > 0) {
    s.start(`Installing ${allDeps.length} dependencies...`)
    execSync(`bun add ${allDeps.join(' ')}`, { stdio: 'pipe' })
    s.stop(`Installed ${allDeps.length} dependencies.`)
  }

  // Create directories
  const allDirs = chosen.flatMap((i) => i.dirs)
  for (const dir of allDirs) {
    const fullPath = join(SRC, dir)
    if (!existsSync(fullPath)) {
      mkdirSync(fullPath, { recursive: true })
      writeFileSync(join(fullPath, '.gitkeep'), '')
    }
  }

  // Append env vars
  const allEnvVars = chosen.flatMap((i) => i.envVars)
  if (allEnvVars.length > 0) {
    const existing = existsSync(ENV_EXAMPLE)
      ? await Bun.file(ENV_EXAMPLE).text()
      : ''

    const newVars = allEnvVars.filter((line) => {
      if (line === '' || line.startsWith('#')) return true
      const key = line.split('=')[0]

      return !existing.includes(key)
    })

    if (newVars.length > 0) {
      appendFileSync(ENV_EXAMPLE, `\n${newVars.join('\n')}\n`)
    }
  }

  // Summary
  const summary = chosen.map((i) => `  - ${i.label}`).join('\n')
  const dirSummary =
    allDirs.length > 0
      ? `\nDirectories created:\n${allDirs.map((d) => `  - src/${d}/`).join('\n')}`
      : ''

  note(`Installed:\n${summary}${dirSummary}`, 'Setup complete')

  outro('Run the relevant guide in docs/guides/ for implementation conventions.')
}

main()
```

- [ ] **Step 4: Test the setup script runs**

```bash
bun run setup
```

Expected: Interactive prompt appears with integration checkboxes. Press Ctrl+C to cancel without installing anything.

- [ ] **Step 5: Commit**

```bash
git add scripts/setup.ts package.json bun.lock
git commit -m "feat: add interactive setup CLI for Tier 2 integrations"
```

---

### Task 26: Final Verification

- [ ] **Step 1: Run lint**

```bash
bun run lint
```

Expected: No errors.

- [ ] **Step 2: Run typecheck**

```bash
bun run typecheck
```

Expected: No errors.

- [ ] **Step 3: Run build**

```bash
bun run build
```

Expected: Build succeeds.

- [ ] **Step 4: Verify no rule duplication**

Manually check:
- `CLAUDE.md` contains no rules — only references
- `AGENTS.md` contains no breaking changes — only MCP config and references
- `ARCHITECTURE.md` contains no coding conventions — only structure and data flow
- `CONVENTIONS.md` contains no architecture — only coding rules
- `DESIGN.md` contains shadcn gate with clarified scope
- `FRAMEWORK.md` contains all version truths and breaking changes

- [ ] **Step 5: Verify all guides follow directive format**

Check each guide (except `ai-restrictions.md`) opens with `**Stack:**` and contains:
1. When To Use section
2. File Placement section
3. Conventions section
4. References section with external links
5. Verification section
6. No code examples unless flagged in the spec

- [ ] **Step 6: Commit any fixes from verification**

```bash
git add -A
git commit -m "docs: fix issues found during final verification"
```

Only commit this if there were actual fixes needed.
