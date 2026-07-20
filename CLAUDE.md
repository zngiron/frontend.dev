# CLAUDE.md

This is NOT the Next.js you know. This codebase runs versions with breaking changes. When unsure about any Next.js API, check `node_modules/next/dist/docs/` before writing code. Training data is outdated.

## Stack

| Package | Version |
|---|---|
| Next.js | 16.2 |
| React | 19.2 |
| TypeScript | 5.9 (strict) |
| Tailwind CSS | 4.3 |
| shadcn/ui | Nova preset |
| Biome | 2.5 |
| Motion | 12.42 |
| Bun | 1.x |

Anything not in this table is installed on demand: get approval first, read current official docs (Context7) before writing integration code.

## Breaking Changes

| Old | New |
|---|---|
| `middleware.ts` with `middleware` export | `proxy.ts` with `proxy` export |
| `error.tsx` `reset` prop | `unstable_retry` prop — verify exact API in `node_modules/next/dist/docs/` before writing an error boundary |
| Hand-written route prop types | Generated `PageProps<'/route'>` / `LayoutProps<'/route'>` (global types, `next typegen`) |
| Manual `useMemo` / `useCallback` | React Compiler is on — default to none; justified exceptions only (referential contracts, expensive non-React computation) |
| `useFormState` | `useActionState` from `react` |
| `forwardRef` | `ref` is a regular prop in authored components |
| `tailwind.config.*` | CSS config via `@theme` in `globals.css` |

## Architecture

```
src/
├── app/                       → Routes (App Router)
│   ├── layout.tsx             → Root layout: fonts, providers, metadata
│   ├── page.tsx               → Landing page
│   ├── globals.css            → Tokens (:root/.dark), @theme, custom utilities
│   ├── favicon.ico
│   ├── error.tsx              → on demand
│   ├── loading.tsx            → on demand
│   ├── not-found.tsx          → on demand
│   ├── robots.ts              → on demand
│   ├── sitemap.ts             → on demand
│   └── [route]/page.tsx       → One folder per route, kebab-case
├── components/
│   ├── ui/                    → shadcn primitives (CLI-owned)
│   ├── core/                  → Providers, app-wide wrappers
│   ├── layout/                → Header, footer, nav (on demand)
│   └── [feature]/             → Feature-scoped, created at 2+ components
├── data/                      → on demand
│   ├── api/                   → Fetch functions + domain types, one file per domain, reads only
│   ├── static/                → Hard-coded app data (navigation, pricing)
│   └── graphql/               → .graphql operations + __generated__/ output
├── hooks/                     → Custom hooks, one per file (use-name.ts, on demand)
└── lib/
    ├── utils.ts               → cn()
    ├── fonts.ts               → display / sans / mono next/font consts
    ├── constants.ts           → Site config, magic values
    └── motion.ts              → Duration/easing constants (with first animation)

public/
└── static/                    → Brand assets, {namespace}-{element}-{light|dark}.ext
```

- Server Components by default. `'use client'` only when interactivity can't be isolated to a child.
- No barrel exports in authored code. Direct imports only.
- One component per file. Single feature components live flat in `components/` until a second justifies a folder.
- `components/ui/` is shadcn-CLI-owned — no manual visual edits.
- No route groups without approval.
- Data reads live in `data/api/`, consumed by Server Components. Mutations via Server Actions.

## Conventions

- All filenames kebab-case.
- Authored components: `[feature]-[element]-[item].tsx` (item optional). Export PascalCases the full filename: `pricing-card-header.tsx` → `PricingCardHeader`.
- Hooks: `use-name.ts`, camelCase `use`-prefixed export.
- Named exports only in authored `src/` code. Default exports only where the framework requires them (App Router route files, `next.config.ts`).
- Import groups (type → package → `@/` alias, blank line between) are enforced by Biome — don't fight the organizer.
- Self-documenting code. No comments in authored `src/` code.
- Blank line before `return`. Constants over magic values.
- Env vars: declare in `.env.example`, read once in `lib/constants.ts` — never `process.env` inline in components or routes.
- Remote images: allowlist exact hostnames in `next.config.ts` `images.remotePatterns`, per project. Never wildcards; the template ships with none.

## Workflow

- Loop: implement → `bun run lint` + `bun run typecheck` (+ `bun run test` once present) pass → commit.
- Testing (on demand, approval-gated): Vitest + Testing Library, added at the first logic worth testing. Implement fully first, then test — tests gate the commit, never the implementation.
- Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`. One line. No co-author trailers.
- Lefthook runs Biome on staged files at every commit.
- Research, studies, data exploration, and all note-taking go to Obsidian when available (skip silently when not) — never committed to this repo.

## Restrictions

1. Do not push to remote. Commit locally only.
2. Do not merge branches or handle PRs.
3. Do not modify `CLAUDE.md`.
4. Do not access or modify `.env.local`. Reference `.env.example` only.
5. Do not delete files without explicit approval.
6. Do not install dependencies without approval.
7. Do not suppress Biome warnings.
8. Do not write placeholder or TODO code. Implement fully or ask.
9. Do not refactor working code unless asked.
10. Do not assume requirements. Ask when unclear.

@DESIGN.md
