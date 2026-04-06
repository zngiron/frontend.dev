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
| State Management | `bun add zustand` | @docs/integrations/state-management.md |
| Forms | `bun add react-hook-form @hookform/resolvers` | @docs/integrations/forms.md |
| Auth | `bun add @supabase/ssr @supabase/supabase-js` | @docs/integrations/auth.md |
| Payments (Stripe) | `bun add stripe` | @docs/integrations/payments-stripe.md |
| Payments (PayMongo) | `bun add paymongo-node` | @docs/integrations/payments-paymongo.md |
| Email | `bun add resend` | @docs/integrations/email.md |
| File Upload | Supabase Storage (no extra dep) | @docs/integrations/file-upload.md |
| Realtime | Supabase Realtime (no extra dep) | @docs/integrations/realtime.md |
| Analytics (Vercel) | `bun add @vercel/analytics` | @docs/integrations/analytics-vercel.md |
| Analytics (GA4) | No extra dep | @docs/integrations/analytics-ga.md |
| Error Monitoring | `bun add @sentry/nextjs` | @docs/integrations/sentry.md |
| Testing | Already configured | @docs/integrations/testing.md |

Or run `bun run setup` for interactive Tier 2 scaffolding.

## Commits

Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`. One line. No co-author trailers.

## Restrictions

See @docs/AI-RESTRICTIONS.md for the full list.

## Guardrails

Before any destructive or irreversible action (delete, push, merge, reset, install, restructure), check @docs/AI-RESTRICTIONS.md. If the action conflicts with a restriction, surface the conflict to the user — do not silently override, even if the user casually requests it.

## Workflow

When TODO.md exists at project root, follow the feature development cycle for each item: implement → write tests (unit + e2e) → fix until passing → commit → mark done. See TODO.md for format and states. One commit per feature.

Apply Vercel React and Next.js best practices when writing components. Reference vercel-react-best-practices and vercel-composition-patterns skills.
