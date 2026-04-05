# Architecture

> **Purpose:** Reference architecture and folder structure for the Front-End Development Framework.
>
> **Last Updated:** 2026-04-06
>
> **Status:** Active

---

## Overview

This framework follows a **docs-heavy, code-minimal** philosophy. The template ships the smallest runnable codebase that is still production-ready. The documentation — not the code — is the primary deliverable. When a developer or AI agent needs to scaffold a new feature, they consult these docs to understand where files belong, what patterns to follow, and what constraints apply.

This approach keeps the starter small and auditable while giving AI-assisted development a precise, authoritative guardrail. New code is generated on demand; the architecture docs define the rules that govern that generation.

---

## Minimal Template (What Ships)

The following tree represents the template as it is delivered. It is intentionally sparse — only the files necessary to run, deploy, and extend the project are included.

```
project-root/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── error.tsx
│   │   ├── not-found.tsx
│   │   ├── robots.txt
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   └── sonner.tsx
│   └── lib/
│       ├── env.ts
│       ├── utils.ts
│       ├── types.ts
│       └── constants.ts
├── public/
│   └── static/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/
├── scripts/
└── [config files]
```

---

## Full Reference Architecture

The following tree represents the complete structure a mature project grows into. Each directory is added as the corresponding feature or concern is introduced. Nothing is pre-created speculatively.

```
project-root/
├── src/
│   ├── app/
│   │   ├── (marketing)/          — Public-facing pages: landing, pricing, about
│   │   ├── (auth)/               — Authentication flows: login, register, reset
│   │   ├── (dashboard)/          — Authenticated app pages
│   │   ├── (admin)/              — Admin-only pages and tooling
│   │   ├── api/
│   │   │   └── webhooks/         — Stripe and PayMongo webhook route handlers
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── error.tsx
│   │   ├── not-found.tsx
│   │   ├── robots.txt
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                   — shadcn/ui primitives
│   │   ├── forms/                — form-field, search-input, file-upload
│   │   ├── layout/               — header, sidebar, footer, mobile-nav, breadcrumbs
│   │   └── [feature]/            — Feature-specific components, one directory per domain
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts         — Browser Supabase client
│   │   │   ├── server.ts         — Server Supabase client
│   │   │   ├── middleware.ts     — Session refresh middleware helper
│   │   │   └── admin.ts          — Service-role client for admin operations
│   │   ├── payments/
│   │   │   ├── stripe.ts
│   │   │   └── paymongo.ts
│   │   ├── email/
│   │   │   └── resend.ts
│   │   ├── validators/           — Zod schemas, one file per domain
│   │   ├── services/             — Business logic, one file per domain
│   │   ├── env.ts
│   │   ├── utils.ts
│   │   ├── constants.ts
│   │   └── types.ts
│   ├── hooks/                    — use-auth.ts, use-debounce.ts, and other custom hooks
│   └── stores/                   — ui.store.ts, [feature].store.ts (Zustand or similar)
├── supabase/
│   ├── migrations/
│   ├── seed.sql
│   └── config.toml
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/
│   ├── ARCHITECTURE.md
│   ├── CONVENTIONS.md
│   ├── DECISIONS.md
│   ├── DESIGN.md
│   └── guides/
├── scripts/
├── public/
│   └── static/
└── [config files]
```

---

## Directory Rationale

| Directory | Purpose |
|---|---|
| `src/app/` | Next.js App Router root. All routes, layouts, and API handlers live here. |
| `src/app/(marketing)/` | Public pages that share a marketing layout. No authentication required. |
| `src/app/(auth)/` | Authentication flows with their own layout. Redirects if already authenticated. |
| `src/app/(dashboard)/` | Authenticated application pages. Protected by middleware. |
| `src/app/(admin)/` | Admin-only pages. Protected by role check in addition to authentication. |
| `src/app/api/webhooks/` | Webhook receivers for payment providers. Must verify signatures before processing. |
| `src/components/ui/` | Low-level shadcn/ui primitives. Not modified directly — regenerated via the shadcn CLI. |
| `src/components/forms/` | Reusable form primitives that appear across multiple features. |
| `src/components/layout/` | Shell components: header, sidebar, footer, navigation. Shared across route groups. |
| `src/components/[feature]/` | Components scoped to a single feature domain. Created when a feature needs more than one component. |
| `src/lib/supabase/` | All Supabase client instantiation. No other file creates a Supabase client directly. |
| `src/lib/payments/` | Payment provider SDK wrappers. Keeps provider-specific logic isolated. |
| `src/lib/email/` | Email sending via Resend. Template rendering and dispatch logic. |
| `src/lib/validators/` | Zod schemas shared between Server Actions, API routes, and forms. |
| `src/lib/services/` | Business logic that is too complex for a Server Action but not a full API route. |
| `src/lib/env.ts` | Validated environment variable access via `@t3-oss/env-nextjs` or equivalent. |
| `src/lib/utils.ts` | Pure utility functions with no side effects. |
| `src/lib/constants.ts` | Application-wide constants: routes, config keys, enums. |
| `src/lib/types.ts` | Shared TypeScript types and interfaces. |
| `src/hooks/` | Custom React hooks. Client-side only. Each hook in its own file. |
| `src/stores/` | Global client state stores. Used only when server state is insufficient. |
| `supabase/` | Supabase CLI project: migrations, seed data, and local config. |
| `tests/` | All test files, separated by scope. Mirrors `src/` structure within each subfolder. |
| `docs/` | Human and AI-readable architecture, conventions, and decision records. |
| `scripts/` | One-off automation scripts for setup, seeding, or CI tasks. |
| `public/static/` | Static assets served directly. No processing. |

---

## Route Groups

Next.js route groups use parenthetical directory names to organize routes without affecting the URL path. This project uses four groups.

### `(marketing)`
Contains all public-facing pages: the landing page, pricing, about, legal, and any other pages accessible without authentication. Shares a marketing-specific layout that includes the public header and footer. No auth checks.

### `(auth)`
Contains login, registration, password reset, and email verification flows. Uses a minimal centered layout without the main navigation shell. Middleware redirects authenticated users away from these pages.

### `(dashboard)`
Contains all pages inside the authenticated application. Protected by middleware — unauthenticated requests are redirected to `/login`. Shares a dashboard layout that includes the sidebar and top navigation. The majority of application feature pages live here.

### `(admin)`
Contains admin-only pages for managing users, reviewing data, and performing privileged operations. Protected by both authentication middleware and a role check (`admin` role in Supabase). Shares an admin layout that may differ from the dashboard layout.

### Shared Layouts
Each route group defines its own `layout.tsx`. Providers, navigation components, and layout shells that apply to all pages in a group are placed in that group's layout. The root `src/app/layout.tsx` handles only global concerns: HTML shell, global CSS, and top-level providers.

---

## Component Organization

Components are organized by their reuse scope and their relationship to the application's feature domains.

### `ui/`
Low-level primitives from shadcn/ui: `Button`, `Input`, `Card`, `Dialog`, etc. These are generated and owned by the shadcn CLI. Do not add application logic here. Regenerate with `npx shadcn@latest add [component]` when new primitives are needed.

### `forms/`
Reusable form field components that are used across multiple features: `FormField`, `SearchInput`, `FileUpload`, `DatePicker`. These compose `ui/` primitives with form library integration (React Hook Form). Add a component here only when it is used in two or more unrelated features.

### `layout/`
Application shell components: `Header`, `Sidebar`, `Footer`, `MobileNav`, `Breadcrumbs`. These are consumed by route group layouts. They are not feature-specific and do not contain business logic.

### `[feature]/`
When a feature requires more than one component, create a dedicated directory: `components/billing/`, `components/profile/`, `components/team/`. Components here are only used within that feature's route group or pages. If a component from a feature directory is needed elsewhere, evaluate promoting it to `forms/` or `layout/` if it is truly generic, or accept the cross-feature import if the dependency is intentional.

### When To Create A New Component Directory
Create a new `[feature]/` directory when a feature introduces two or more components that are not reusable outside that feature. A single feature-specific component can live directly in `components/` with a descriptive name until a second related component warrants the directory.

---

## Architecture Rules

The following rules are non-negotiable. They apply to all code generated for or added to this project.

1. **Server Components by Default.** Every component is a React Server Component unless it requires browser APIs, event handlers, or React state. Only add `"use client"` when interactivity is required and cannot be isolated to a smaller child component.

2. **Server Actions for Mutations.** All write operations (create, update, delete) are performed via Next.js Server Actions. Client components do not call API routes for mutations. This keeps auth context, validation, and data access on the server.

3. **All Database Access Through `src/lib/supabase/`.** No component, hook, store, or service creates a Supabase client directly. Import `createClient` from `src/lib/supabase/client.ts` (browser) or `src/lib/supabase/server.ts` (server) as appropriate.

4. **Never Import Server-Only Code in Client Components.** Files that use `import 'server-only'`, access `process.env` secrets, or instantiate server clients must never be imported by a `"use client"` component. Use Server Actions or API routes to bridge the boundary.

5. **Follow This Reference Architecture When Adding New Folders.** Before creating a new directory, consult this document. If the new directory does not fit an existing category, document the decision in `docs/DECISIONS.md` before proceeding.
