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
│   ├── services/           → Business logic per domain
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
| `components/core/` | Providers, wrappers. No business logic. |
| `components/ui/` | shadcn CLI-owned. Regenerate, don't modify. |
| `components/forms/` | Add when a form field is used in 2+ unrelated features. |
| `components/[feature]/` | Create when a feature needs 2+ components. |
| `lib/supabase/` | All Supabase clients. No direct instantiation elsewhere. |
| `lib/services/` | Business logic too complex for a Server Action. |
| `lib/validators/` | Zod schemas shared across actions, routes, forms. |

Single feature-specific components live in `components/` until a second related component warrants a directory.

---

## Route Groups

| Group | Layout | Protection | Content |
|---|---|---|---|
| `(marketing)` | Public header/footer | None | Landing, pricing, about, legal |
| `(auth)` | Minimal centered | Redirect if authenticated | Login, register, reset |
| `(dashboard)` | Sidebar + top nav | Middleware auth | App feature pages |
| `(admin)` | Admin layout | Auth + `admin` role | User management, admin tools |

Each group owns its `layout.tsx`. Root `layout.tsx` handles only global concerns: HTML shell, CSS, providers.

---

## Rules

1. Server Components by default. `'use client'` only when interactivity can't be isolated to a child.
2. Server Actions for mutations. No client-side API calls for writes.
3. All DB access through `lib/supabase/`. No direct client creation elsewhere.
4. Never import server-only code in client components. Use Server Actions to bridge.
5. Follow this architecture for new folders. Document exceptions in `DECISIONS.md`.

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
| Server Actions | Validate all inputs server-side. Never trust client data. |

