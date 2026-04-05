@AGENTS.md

## References

- Architecture: @docs/ARCHITECTURE.md
- Conventions: @docs/CONVENTIONS.md
- Decisions: @docs/DECISIONS.md
- Design: @docs/DESIGN.md

## External References

- Next.js App Router: https://nextjs.org/docs
- Next.js Security: https://nextjs.org/docs/app/guides/security
- Vercel Best Practices: https://vercel.com/docs/best-practices
- Supabase RLS: refer to Supabase docs when Supabase is in use

## Stack Quick Reference

### Tier 1 (Pre-Installed)

Next.js 16.2, TypeScript (strict), Tailwind CSS 4, Biome, Bun, shadcn/ui, Zod, Sonner, Lefthook, Vitest (config only), Playwright (config only)

### Tier 2 (Install On Demand)

| Need | Install | Guide |
|------|---------|-------|
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

## Project Rules

- No barrel exports. Direct imports only.
- Follow naming conventions in @docs/CONVENTIONS.md.
- Do not disable or suppress Biome warnings without approval.
- .env.local only. Never commit secrets. Maintain .env.example.
- Do not customize shadcn components until @docs/DESIGN.md is filled in.

## Commit Format

- Conventional commits: feat:, fix:, refactor:, docs:, test:, chore:
- One line only. Short and concise.
- No co-author trailers.
- No long descriptions.

## Restrictions

See @docs/guides/ai-restrictions.md for the full list.
