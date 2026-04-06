# Conventions

Naming, imports, and coding patterns for the project.

---

## File Naming

All files: **kebab-case lowercase**.

| Type | Pattern |
|---|---|
| Component | `name.tsx` |
| Hook | `use-name.ts` |
| Store | `name.store.ts` |
| Validator | `name.schema.ts` |
| Service | `name.service.ts` |
| Utility | `name.ts` |
| Route | `kebab-case/page.tsx` |
| Test | `name.test.tsx` |
| E2E Test | `name.spec.ts` |
| Migration | `00001-description.sql` |

## Exports

- Components, Stores, Validators, Services → `PascalCase`
- Hooks → `camelCase` with `use` prefix
- Utilities → `camelCase`

## Imports

Three groups separated by blank lines. Biome enforces via `organizeImports`.

```ts
import type { ReactNode } from "react"

import { useState } from "react"

import { Button } from "@/components/button"
```

1. Type imports
2. Third-party packages
3. Alias imports (`@/`)

## Markdown Files

- Root + `docs/` top-level → `ALL_CAPS.md`
- `docs/guides/` → `kebab-case.md`

## Assets

`public/static/` with `{namespace}-{element}-{l/d}.ext` naming.

## Components

- Server Components by default. `"use client"` only when required.
- No barrel exports. Direct imports only.
- One component per file.

## Server Actions

- All mutations via Server Actions. No client-side writes.
- Co-locate with the consuming component, or use a sibling `actions.ts`.

## Code Style

- Self-documenting code. No comments.
- Constants over magic values.
- Line breaks between logical blocks.
