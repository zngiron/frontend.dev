# Server Actions

Mutation patterns, return types, and error handling.

---

## Dependencies

None. Uses built-in Next.js Server Actions and React 19 `useActionState`.

## File Structure

```
src/app/
├── (dashboard)/
│   ├── settings/
│   │   ├── page.tsx
│   │   └── actions.ts    → Co-located actions for settings
src/lib/
├── types.ts               → ActionResult type
├── validators/            → Zod schemas for input validation
```

Co-locate actions in `actions.ts` beside the consuming `page.tsx`. Move to `lib/services/` only when shared across 2+ routes.

## Implementation

### ActionResult Type

Define in `src/lib/types.ts`:

```ts
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }
```

Every Server Action returns `ActionResult`. No exceptions.

### Basic Action

`src/app/(dashboard)/settings/actions.ts`:

```ts
'use server'

import type { ActionResult } from '@/lib/types'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'
import { ProfileSchema } from '@/lib/validators/profile.schema'

export async function updateProfile(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const parsed = ProfileSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { success: false, error: 'Invalid input.' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('profiles')
    .update(parsed.data)
    .eq('id', parsed.data.id)

  if (error) return { success: false, error: 'Failed to update profile.' }

  revalidatePath('/settings')
  return { success: true, data: undefined }
}
```

### Form With useActionState

```tsx
'use client'

import { useActionState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { updateProfile } from './actions'

export function ProfileForm() {
  const [state, action, isPending] = useActionState(updateProfile, {
    success: true,
    data: undefined,
  })

  return (
    <form action={action} className="flex flex-col gap-4">
      <Input name="name" placeholder="Name" />
      {!state.success && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Saving...' : 'Save'}
      </Button>
    </form>
  )
}
```

### Action With Return Data

```ts
'use server'

import type { ActionResult } from '@/lib/types'

export async function createInvite(
  _prev: ActionResult<{ code: string }>,
  formData: FormData
): Promise<ActionResult<{ code: string }>> {
  // ... create invite
  return { success: true, data: { code: 'ABC123' } }
}
```

## Common Patterns

### Double Validation

Always validate on server even if the form validates on client:

```ts
const parsed = Schema.safeParse(Object.fromEntries(formData))
if (!parsed.success) return { success: false, error: 'Invalid input.' }
```

### Non-Form Actions

For actions triggered by buttons (not forms), call directly:

```tsx
'use client'

import { useTransition } from 'react'

import { deleteItem } from './actions'

export function DeleteButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => deleteItem(id))}
    >
      {isPending ? 'Deleting...' : 'Delete'}
    </button>
  )
}
```

### Toast On Result

```tsx
'use client'

import { useActionState, useEffect } from 'react'

import { toast } from 'sonner'

import { updateProfile } from './actions'

export function ProfileForm() {
  const [state, action, isPending] = useActionState(updateProfile, {
    success: true,
    data: undefined,
  })

  useEffect(() => {
    if (!state.success) toast.error(state.error)
    if (state.success && state.data !== undefined) toast.success('Saved.')
  }, [state])

  // ... form JSX
}
```

### Redirect After Action

```ts
'use server'

import { redirect } from 'next/navigation'

export async function createProject(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  // ... create project
  redirect(`/projects/${project.id}`)
}
```

`redirect` throws internally — it must be called outside try/catch.

## Verification

1. Submit valid form → `success: true`, page revalidates
2. Submit invalid form → error message displayed, no mutation
3. Network tab → form submission is a POST, no client-side fetch
4. `isPending` → button disabled during submission
