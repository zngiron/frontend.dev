# Conventions

Naming, imports, and coding patterns. This is the single source for all coding rules.

---

## File Naming

All files: **kebab-case lowercase**.

| Type | Pattern | Location |
|---|---|---|
| Component | `name.tsx` | `components/` |
| Hook | `use-name.ts` | `hooks/` |
| Store | `name.store.ts` | `stores/` |
| Validator | `name.schema.ts` | `lib/validators/` |
| Data fetch | `name.ts` | `data/api/` |
| Static data | `name.ts` | `data/static/` |
| Utility | `name.ts` | `lib/` |
| Route | `kebab-case/page.tsx` | `app/` |
| Test | `name.test.tsx` | `tests/unit/` |
| E2E Test | `name.spec.ts` | `tests/e2e/` |
| Migration | `00001-description.sql` | `supabase/migrations/` |

## Exports

- Components, Stores, Validators → `PascalCase`
- Hooks → `camelCase` with `use` prefix
- Data fetch functions → `camelCase` with `get` prefix (e.g. `getPosts`, `getUser`)
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

**No namespace imports for type access.** Always destructure what you use:

```ts
// Wrong — namespace import
import type * as React from 'react'
// Then: React.ComponentProps<'button'>

// Right — destructured
import type { ComponentProps } from 'react'
// Then: ComponentProps<'button'>
```

This applies to all packages, not just React.

## Markdown

- Root + `docs/` top-level → `ALL_CAPS.md`
- `docs/integrations/` → `kebab-case.md`

## Assets

`public/static/` → `{namespace}-{element}-{l/d}.ext`

## Components

- Server Components by default. `'use client'` only when interactivity can't be isolated to a child.
- No barrel exports. Direct imports only.
- One component per file.
- Never import server-only code in client components. Use Server Actions to bridge.

## Server Actions

- All mutations via Server Actions. No client-side API calls for writes.
- Co-locate with consuming component, or use sibling `actions.ts`.
- Return `ActionResult` from every action (defined in `lib/types.ts`).
- Validate all inputs server-side with Zod. Never trust client data.
- `useActionState` for form submissions with pending state.
- `revalidatePath` / `revalidateTag` after successful mutations.

## Data Layer

- Read operations go in `data/api/`. One file per domain.
- Each file exports its domain types + fetch functions together.
- Consumer pattern: `import { getPosts } from '@/data/api/posts'`

## Code Style

- Self-documenting code. No comments.
- Constants over magic values.
- Blank line before `return` statements.
- Blank line between logical blocks: setup, transformation, output.
- Group related statements together. Separate unrelated ones with a blank line.
- No suppressing Biome warnings without approval.
- `.env.local` only. Never commit secrets. Maintain `.env.example`.
