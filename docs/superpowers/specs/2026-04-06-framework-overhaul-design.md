# Framework Overhaul — Spec 1

Rewrite the documentation layer, architecture, and conventions of the Front-End Development Framework to optimize for AI-assisted development. Guides become directives (rules + file placement + external references), not tutorials. Rules are deduplicated. A `data/` layer is introduced. A setup CLI scaffolds integrations on demand.

**Spec 2 (Automation)** is a separate follow-up covering Claude Code hooks, workflow instructions, and skill integration.

---

## Goals

1. AI gets code right on the first pass — no revision cycles from outdated APIs or misplaced files
2. Guides direct AI to official docs for implementation, not paraphrased examples
3. Every rule has exactly one home — no duplication across docs
4. The `data/` layer makes data access readable at the call site
5. Setup CLI scaffolds Tier 2 integrations without boilerplate code

---

## 1. Architecture: The `data/` Layer

### New Directory Structure

```
src/
├── data/
│   ├── api/           → Fetch functions + their types, one file per domain
│   │                    e.g. posts.ts exports Post type + getPosts(), getPost()
│   └── static/        → Hard-coded data used across the app
│                        e.g. navigation.ts, pricing-plans.ts
├── lib/
│   ├── supabase/      → Client setup only (client.ts, server.ts, middleware.ts, admin.ts)
│   ├── payments/      → Client singletons only (stripe.ts, paymongo.ts)
│   ├── email/         → Sender utility only (resend.ts)
│   ├── validators/    → Zod schemas per domain
│   ├── env.ts, utils.ts, constants.ts, types.ts
```

### Rules

- **`data/api/`** — anything that reads data. Fetch functions + their domain types co-located in the same file. One file per domain.
- **`data/static/`** — hard-coded data (navigation items, pricing tiers, feature lists). Importable constants, not fetched.
- **`lib/`** — everything that isn't data. Client setup, utilities, validators, env, types.
- **`lib/types.ts`** — shared utility types only (e.g. `ActionResult`). Domain types live in `data/api/`.
- **Server Actions** — all writes/mutations. Unchanged.
- **`lib/services/`** — removed from architecture. Read operations go to `data/api/`, writes are Server Actions.

### Consumer Pattern

```ts
import { getPosts } from '@/data/api/posts'

const posts = await getPosts()
```

---

## 2. Guide Rewrite — Tutorials to Directives

### New Guide Format

Every guide follows this structure:

1. **Stack** — exact packages this integration uses
2. **When to use / When not to use** — decision criteria
3. **Dependencies** — what to install
4. **File placement** — where files go per architecture
5. **Conventions** — project-specific rules and constraints
6. **References** — external links to official docs, migration guides, blog posts
7. **Verification** — how to confirm it works

No code examples unless the pattern is project-specific and not derivable from official docs.

### Guide-by-Guide Plan

| Guide | Stack | Keep Snippets? | Reasoning |
|---|---|---|---|
| `auth.md` | Supabase Auth + @supabase/ssr | Yes — Supabase cookie wiring for Next.js 16 proxy | Non-obvious integration, not documented elsewhere |
| `forms.md` | React Hook Form + @hookform/resolvers + Zod | No | Standard RHF + Zod usage, well-documented upstream |
| `state-management.md` | Zustand | No | Standard Zustand, well-documented upstream |
| `payments.md` | Stripe + PayMongo | No | Standard SDK usage, link to official docs |
| `email.md` | Resend | No | Simple wrapper, Resend docs are clear |
| `file-upload.md` | Supabase Storage | No | Standard Storage usage, link to Supabase docs |
| `realtime.md` | Supabase Realtime | No | Standard Realtime hooks, link to Supabase docs |
| `analytics.md` | Vercel Analytics + Google Analytics 4 | No | Standard setup, link to both docs |
| `sentry.md` | @sentry/nextjs | No | Standard setup, link to Sentry Next.js guide |
| `testing.md` | Vitest + Testing Library + Playwright | Yes — CI workflow yaml | Project-specific CI config |
| `seo.md` | Next.js Metadata API | No | Well-documented by Next.js, link to Metadata API docs |
| `data-fetching.md` | Next.js Server Components + `cache` from `react` | No | Link to Next.js data fetching docs, flag `unstable_cache` as version-sensitive. Use `import { cache } from 'react'` not `React.cache` |
| `server-actions.md` | Next.js Server Actions + Zod | Yes — `ActionResult` type | Project-specific return type convention |
| `loading-streaming.md` | Next.js Loading + React Suspense | No | Standard Next.js patterns, link to docs |
| `ai-restrictions.md` | N/A | N/A | Keep as-is, already pure rules |

---

## 3. Rule Deduplication

### Document Responsibilities

| Doc | Owns | Does NOT Contain |
|---|---|---|
| `CLAUDE.md` | Entry point — stack summary, commit format, references to other docs | Rules (those live in their home doc) |
| `AGENTS.md` | Slim reference file as Next.js created it, points to FRAMEWORK.md and other docs | Duplicated rules or breaking changes |
| `FRAMEWORK.md` | Version truths, breaking changes with external doc links | Coding rules or architecture |
| `ARCHITECTURE.md` | Directory structure, route groups, data flow, security boundaries | Coding style, naming conventions |
| `CONVENTIONS.md` | All coding patterns — naming (including `data/` layer), imports, component rules, error handling | Architecture decisions, file structure |
| `DECISIONS.md` | ADRs for non-obvious choices | Rules (those are consequences of decisions) |
| `DESIGN.md` | Brand tokens, typography, theming, shadcn gate | Coding conventions |
| `STYLING.md` | Tailwind class ordering, `cn()` usage, custom utilities | Component behavior |
| Guides | Per-integration directives (stack, placement, conventions, references) | Project-wide rules |

### Current Duplications to Resolve

| Rule | Currently In | Moves To |
|---|---|---|
| No barrel exports | CLAUDE.md, CONVENTIONS.md | CONVENTIONS.md only |
| Server Components by default | CONVENTIONS.md, ARCHITECTURE.md | CONVENTIONS.md only |
| Server Actions for mutations | CONVENTIONS.md, ARCHITECTURE.md, server-actions.md | CONVENTIONS.md (principle), guide (placement details) |
| `use client` only when needed | CONVENTIONS.md, ARCHITECTURE.md | CONVENTIONS.md only |
| All DB access through `lib/supabase/` | ARCHITECTURE.md, auth.md | ARCHITECTURE.md only |
| Validate inputs server-side | ARCHITECTURE.md, forms.md, server-actions.md | CONVENTIONS.md only |
| No shadcn customization until DESIGN.md Active | CLAUDE.md, DESIGN.md | DESIGN.md only |
| Next.js 16 breaking changes | AGENTS.md, inline in guides | FRAMEWORK.md only |

Other docs reference with a one-liner pointer: `→ see CONVENTIONS.md` or `→ see FRAMEWORK.md`.

---

## 4. FRAMEWORK.md — Version Truth Source

New file at `docs/FRAMEWORK.md`. AI reads this before using any version-sensitive API.

### Structure

**Stack Versions table** — package, locked version, link to official docs.

| Package | Version | Docs |
|---|---|---|
| Next.js | 16.2 | https://nextjs.org/docs |
| React | 19 | https://react.dev |
| TypeScript | 5.x (strict) | https://www.typescriptlang.org/docs |
| Tailwind CSS | 4 | https://tailwindcss.com/docs |
| Bun | 1.x | https://bun.sh/docs |
| shadcn/ui | latest | https://ui.shadcn.com/docs |
| Biome | latest | https://biomejs.dev |

**Breaking Changes tables** — one section per major dependency, each entry has Old, New, and a link to the official migration/announcement.

Sections needed:
- Next.js 16 (proxy.ts, unstable_retry, React Compiler, typed route props, PageProps/LayoutProps)
- React 19 (useActionState, ref as prop, React.cache status)
- Tailwind CSS 4 (@theme CSS config, @utility, @variant)

### What It Absorbs

- AGENTS.md "Next.js 16 Breaking Changes" section → moves here
- AGENTS.md "Type Helpers" section → moves here
- Inline version notes scattered across guides → consolidated here

---

## 5. Shadcn Gate — Clarified Scope

### Current Problem

The gate in DESIGN.md says "don't modify component styling until DESIGN.md is Active" but doesn't distinguish between visual customization and structural/convention fixes.

### New Definition

The shadcn gate protects **visual customization only**:
- Colors, typography, spacing, border radius — blocked until DESIGN.md is Active

The gate does NOT block **structural/convention fixes**:
- Import style changes (e.g. `React.*` → destructured imports)
- Code formatting, linting fixes
- Adding/removing props for functionality

### Prototyping Workflow

Added to DESIGN.md as the opening section:

> The template starts as a prototyping tool. shadcn/ui components ship with Tailwind defaults. Once brand guidelines are defined (DESIGN.md filled in, status changed to `Active`), the design cascades through CSS variables in `globals.css` — no component file edits needed for color/typography changes. Until then, components remain visually untouched.

---

## 6. Import Style — Global Convention

### Rule

No `Package.xxx` pattern anywhere. Always destructured imports. Applies to all packages.

```ts
// Wrong
import type * as React from 'react'
// Using: React.ComponentProps<'button'>

// Right
import type { ComponentProps } from 'react'
// Using: ComponentProps<'button'>
```

### Current Violations to Fix

| File | Current | Fix |
|---|---|---|
| `src/components/ui/button.tsx` | `import type * as React from 'react'` | Destructured type imports |
| `src/components/ui/card.tsx` | `import type * as React from 'react'` | Destructured type imports |
| `src/components/ui/input.tsx` | `import type * as React from 'react'` | Destructured type imports |

Allowed under the shadcn gate clarification (Section 5) — these are convention fixes, not visual changes.

### Addition to CONVENTIONS.md

Add to the Imports section: explicit rule against namespace imports for type access. Import the specific types you use.

---

## 7. AGENTS.md — Slimmed Down

### Current State

AGENTS.md contains:
- Next.js 16 breaking changes (moves to FRAMEWORK.md)
- Type helpers (moves to FRAMEWORK.md)
- Proxy replaces middleware (moves to FRAMEWORK.md)
- Error boundary changes (moves to FRAMEWORK.md)
- React Compiler note (moves to FRAMEWORK.md)
- MCP server table and config (stays)

### New State

AGENTS.md retains:
- MCP server table and config
- Reference pointers to FRAMEWORK.md, ARCHITECTURE.md, CONVENTIONS.md

Everything else moves to its home doc.

---

## 8. Setup CLI — Front-End Development Framework

### Overview

Interactive CLI at `bun run setup` that scaffolds Tier 2 integrations.

### Dependency

`@clack/prompts` — lightweight terminal UI. Added as a dev dependency.

### Behavior

1. Displays branded header: "Front-End Development Framework — Project Setup"
2. Shows checkboxes for each Tier 2 integration:
   - Auth (Supabase Auth + @supabase/ssr + @supabase/supabase-js)
   - Forms (react-hook-form + @hookform/resolvers)
   - State Management (zustand)
   - Payments (stripe + paymongo-node)
   - Email (resend)
   - Analytics (@vercel/analytics)
   - Error Monitoring (@sentry/nextjs)
3. User selects integrations (multi-select + select all option)
4. For each selected integration:
   - Installs dependencies via `bun add`
   - Creates directory/file skeleton per architecture (empty files in correct locations)
   - Appends env vars to `.env.example` with comments
5. Prints summary of what was installed and where

### What It Does NOT Do

- No boilerplate code — AI generates implementation from directive guides
- No config file generation — AI handles that following guide conventions
- No runtime behavior — setup only

### File Location

`scripts/setup.ts` — executed via `package.json` script: `"setup": "bun run scripts/setup.ts"`

---

## 9. File Audit Summary

### Root Docs

| File | Action |
|---|---|
| `CLAUDE.md` | Rewrite — slim entry point with references |
| `AGENTS.md` | Rewrite — slim to MCP config + references |

### docs/ Top-Level

| File | Action |
|---|---|
| `FRAMEWORK.md` | Create — version truths and breaking changes |
| `ARCHITECTURE.md` | Rewrite — add `data/`, remove `lib/services/` |
| `CONVENTIONS.md` | Rewrite — single home for all coding rules |
| `DECISIONS.md` | Keep as-is |
| `DESIGN.md` | Rewrite — clarify shadcn gate scope, add prototyping rationale |
| `STYLING.md` | Keep as-is |

### docs/guides/

| File | Action |
|---|---|
| All 14 guides (excluding ai-restrictions) | Rewrite to directive format |
| `ai-restrictions.md` | Keep as-is |

### Source Code

| File | Action |
|---|---|
| `src/components/ui/button.tsx` | Fix imports — `React.*` to destructured |
| `src/components/ui/card.tsx` | Fix imports — `React.*` to destructured |
| `src/components/ui/input.tsx` | Fix imports — `React.*` to destructured |
| `src/data/api/.gitkeep` | Create directory |
| `src/data/static/.gitkeep` | Create directory |

### New Files

| File | Action |
|---|---|
| `scripts/setup.ts` | Create — interactive setup CLI |
| `docs/FRAMEWORK.md` | Create — version truth source |

---

## 10. Success Criteria

1. Every guide opens with the tech stack it covers
2. No guide contains code examples unless the pattern is project-specific
3. Every version-sensitive API has an external doc link in FRAMEWORK.md
4. No rule appears in more than one document
5. `data/` layer is documented in ARCHITECTURE.md with clear boundaries
6. Shadcn gate clearly scopes to visual customization only
7. No `React.xxx` or namespace imports in codebase
8. `bun run setup` scaffolds selected integrations interactively
9. AI can produce correct code on first pass using only the directive guides + FRAMEWORK.md + official docs
