# Architecture

Reference architecture and folder structure for the project.

---

## Overview

Docs-heavy, code-minimal philosophy. The template ships the smallest runnable codebase. Documentation defines the rules — new code is generated on demand by consulting these docs.

---

## Minimal Template

```
src/
├── app/
│   ├── layout.tsx, page.tsx, error.tsx, not-found.tsx
│   ├── robots.txt, globals.css
├── components/ui/   → button, input, card, sonner
├── lib/             → env, utils, types, constants
public/static/
tests/               → unit/, integration/, e2e/
docs/
scripts/
```

---

## Full Reference Architecture

Directories added as features are introduced — nothing pre-created speculatively.

```
src/
├── app/
│   ├── (marketing)/        → Public pages: landing, pricing, about
│   ├── (auth)/             → Login, register, reset
│   ├── (dashboard)/        → Authenticated app pages
│   ├── (admin)/            → Admin-only pages
│   ├── api/webhooks/       → Stripe, PayMongo handlers
│   ├── layout.tsx, page.tsx, error.tsx, not-found.tsx
│   ├── robots.txt, globals.css
├── components/
│   ├── ui/                 → shadcn/ui primitives
│   ├── forms/              → Shared form fields
│   ├── layout/             → Header, sidebar, footer, nav
│   └── [feature]/          → Feature-scoped components
├── lib/
│   ├── supabase/           → client, server, middleware, admin
│   ├── payments/           → stripe, paymongo
│   ├── email/              → resend
│   ├── validators/         → Zod schemas per domain
│   ├── services/           → Business logic per domain
│   ├── env.ts, utils.ts, constants.ts, types.ts
├── hooks/                  → Custom React hooks
├── stores/                 → Zustand stores
supabase/                   → migrations/, seed.sql, config.toml
tests/                      → unit/, integration/, e2e/
docs/                       → Architecture, conventions, decisions, design, guides
scripts/
public/static/
```

---

## Directory Reference

| Directory | Purpose |
|---|---|
| `src/app/` | App Router root. Routes, layouts, API handlers. |
| `(marketing)/` | Public pages, marketing layout. No auth. |
| `(auth)/` | Auth flows, minimal layout. Redirects if authenticated. |
| `(dashboard)/` | Authenticated pages. Protected by middleware. |
| `(admin)/` | Admin pages. Auth + role check. |
| `api/webhooks/` | Payment webhook receivers. Verify signatures. |
| `components/ui/` | shadcn/ui primitives. Regenerate via CLI, don't modify. |
| `components/forms/` | Shared form primitives across 2+ features. |
| `components/layout/` | Shell: header, sidebar, footer, nav. |
| `components/[feature]/` | Feature-scoped. Created when 2+ components needed. |
| `lib/supabase/` | All Supabase clients. No direct instantiation elsewhere. |
| `lib/payments/` | Payment SDK wrappers. |
| `lib/email/` | Resend email dispatch. |
| `lib/validators/` | Zod schemas shared across actions, routes, forms. |
| `lib/services/` | Business logic too complex for a Server Action. |
| `lib/env.ts` | Validated env access via Zod. |
| `lib/utils.ts` | Pure utilities, no side effects. |
| `lib/constants.ts` | App-wide constants, routes, enums. |
| `lib/types.ts` | Shared TypeScript types. |
| `hooks/` | Client-side custom hooks. One per file. |
| `stores/` | Client state. Only when server state is insufficient. |
| `supabase/` | Migrations, seed data, local config. |
| `tests/` | Mirrors `src/` structure per scope. |
| `public/static/` | Static assets served directly. |

---

## Route Groups

| Group | Layout | Protection | Content |
|---|---|---|---|
| `(marketing)` | Public header/footer | None | Landing, pricing, about, legal |
| `(auth)` | Minimal centered | Redirects authenticated users | Login, register, reset |
| `(dashboard)` | Sidebar + top nav | Middleware auth | App feature pages |
| `(admin)` | Admin layout | Auth + `admin` role | User management, admin tools |

Each group has its own `layout.tsx`. Root `layout.tsx` handles only global concerns: HTML shell, CSS, top-level providers.

---

## Component Organization

| Directory | Scope | Rule |
|---|---|---|
| `ui/` | Primitives | shadcn CLI owned. No app logic. |
| `forms/` | Cross-feature | Add when used in 2+ unrelated features. |
| `layout/` | Shell | Consumed by route group layouts. No business logic. |
| `[feature]/` | Single feature | Create when feature needs 2+ components. |

Single feature-specific components live directly in `components/` until a second related component warrants a directory.

---

## Architecture Rules

1. **Server Components by default.** `"use client"` only when interactivity can't be isolated to a child.
2. **Server Actions for mutations.** No client-side API calls for writes.
3. **All DB access through `lib/supabase/`.** No direct client creation elsewhere.
4. **Never import server-only code in client components.** Use Server Actions to bridge.
5. **Follow this architecture for new folders.** Document exceptions in `DECISIONS.md`.
