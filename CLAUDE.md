@AGENTS.md

## References

- Architecture: @docs/ARCHITECTURE.md
- Conventions: @docs/CONVENTIONS.md
- Decisions: @docs/DECISIONS.md
- Design: @docs/DESIGN.md
- Styling: @docs/STYLING.md

## External References

- Next.js App Router: https://nextjs.org/docs
- Supabase RLS: refer to Supabase docs when Supabase is in use

## Stack

### Tier 1 (Pre-Installed)

Next.js 16.2, TypeScript (strict), Tailwind CSS 4, Biome, Bun, shadcn/ui, Zod, Sonner, Lefthook, Vitest (config only), Playwright (config only)

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

## Rules

- No barrel exports. Direct imports only.
- Follow @docs/CONVENTIONS.md.
- No suppressing Biome warnings without approval.
- `.env.local` only. Never commit secrets. Maintain `.env.example`.
- No shadcn component customization until @docs/DESIGN.md status is `Active`.

## Commits

Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`. One line. No co-author trailers.

## Recommended Skills

Install locally (not committed to repo):

```bash
npx skills add vercel-labs/agent-skills
```

Best-practice patterns for Next.js, React, and Vercel deployment. Installs to `~/.claude/skills/`.

## Restrictions

See @docs/guides/ai-restrictions.md for the full list.
