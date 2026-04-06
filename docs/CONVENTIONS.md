# Conventions

Naming, imports, and coding patterns.

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

Three groups, blank line between each. Biome enforces order.

```ts
import type { ReactNode } from 'react'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
```

1. Type imports
2. Third-party packages
3. Alias imports (`@/`)

## Markdown

- Root + `docs/` top-level → `ALL_CAPS.md`
- `docs/guides/` → `kebab-case.md`

## Assets

`public/static/` → `{namespace}-{element}-{l/d}.ext`

## Components

- Server Components by default. `'use client'` only when required.
- No barrel exports. Direct imports only.
- One component per file.

## Server Actions

- All mutations via Server Actions. No client-side writes.
- Co-locate with consuming component, or use sibling `actions.ts`.
- Return `ActionResult` from every action:

```ts
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }
```

- `useActionState` for form submissions with pending state.
- `revalidatePath` / `revalidateTag` after successful mutations.
- Full patterns: `docs/guides/server-actions.md`.

## Code Style

- Self-documenting code. No comments.
- Constants over magic values.
- Blank line before `return` statements.
- Blank line between logical blocks: setup, transformation, output.
- Group related statements together. Separate unrelated ones with a blank line.
