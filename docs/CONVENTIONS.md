# Conventions

> **Purpose:** Naming standards, import organization, and coding patterns for the Front-End Development Framework.
>
> **Last Updated:** 2026-04-06
>
> **Status:** Active

---

## File Naming

All file names use kebab-case lowercase.

| Type | Pattern | Example |
|------|---------|---------|
| Component | `name.tsx` | `button.tsx` |
| Hook | `use-name.ts` | `use-auth.ts` |
| Store | `name.store.ts` | `ui.store.ts` |
| Validator | `name.schema.ts` | `auth.schema.ts` |
| Service | `name.service.ts` | `feature.service.ts` |
| Utility | `name.ts` | `utils.ts` |
| Route | `kebab-case/page.tsx` | `settings/page.tsx` |
| Test | `name.test.tsx` | `button.test.tsx` |
| E2E Test | `name.spec.ts` | `auth.spec.ts` |
| Migration | `00001-description.sql` | `00001-initial.sql` |

## Export Naming

| Type | Export Example |
|------|---------------|
| Component | `export function Button` |
| Hook | `export function useAuth` |
| Store | `export const authStore` |
| Validator | `export const AuthSchema` |
| Service | `export const AuthService` |
| Utility | `export function formatDate` |

Components, stores, validators, and services use PascalCase. Hooks use camelCase with the `use` prefix. Utilities use camelCase.

## Import Organization

Imports are grouped into three sections separated by blank lines:

1. Type imports (`import type { ... }`)
2. Third-party packages
3. Custom alias imports (`@/`)

```ts
import type { ReactNode } from "react"
import type { User } from "@/types/user"

import { useState } from "react"
import { z } from "zod"

import { Button } from "@/components/button"
import { useAuth } from "@/hooks/use-auth"
```

Biome enforces this order via `organizeImports`.

## Markdown Files

| Location | Convention |
|----------|-----------|
| Root | ALL CAPS (`CLAUDE.md`, `AGENTS.md`, `README.md`) |
| `docs/` Top-Level | ALL CAPS (`ARCHITECTURE.md`, `CONVENTIONS.md`, `DECISIONS.md`, `DESIGN.md`) |
| `docs/guides/` | kebab-case (`auth.md`, `state-management.md`) |

## Static Asset Naming

Convention: `{namespace}-{element}-{l/d}.ext`

Examples:
- `frontend-dev-logo.svg`
- `frontend-dev-icon-dark.svg`
- `frontend-dev-thumbnail.png`

Assets live in `public/static/`.

## Component Patterns

- Server Components by default.
- Add `"use client"` only when interactivity is required — event handlers, hooks, or browser APIs.
- No barrel exports. Use direct imports only.
- Each component lives in its own file.

## Server Actions

- All mutations go through Server Actions.
- No client-side fetching for write operations.
- Server Actions live in the same file as the component that uses them, or in a separate `actions.ts` file in the same directory.

## Document Format Standard

- Title Case for all headings.
- Metadata header with Purpose, Last Updated, and Status fields.
- Horizontal rule after the metadata block.
- Professional wording, no filler.


## Code Readability

- Code must be self-explanatory through clear naming.
- No comments — code should be self-documenting.
- Use constants instead of magic strings or numbers.
- Insert line breaks between logical blocks.
