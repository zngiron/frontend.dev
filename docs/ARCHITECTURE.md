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
│   ├── graphql/            → .graphql operation files + __generated__/ codegen output
│   └── static/             → Hard-coded app data (navigation, pricing, features)
├── components/
│   ├── core/               → Providers, app-wide wrappers
│   ├── ui/                 → shadcn/ui primitives (CLI-owned)
│   ├── forms/              → Shared form fields (2+ features)
│   ├── layout/             → Header, sidebar, footer, nav
│   └── [feature]/          → Feature-scoped (2+ components)
├── lib/
│   ├── graphql/            → GraphQL client (server-only)
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
| `data/graphql/` | `.graphql` operation files, one per domain. `__generated__/` contains codegen output (committed). |
| `lib/graphql/` | GraphQL client singleton. Server-only. No direct instantiation elsewhere. |

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
