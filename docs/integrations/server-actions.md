# Server Actions

**Stack:** Next.js Server Actions + Zod

---

## When To Use

**Use for:** all data mutations (create, update, delete). Form submissions, button actions, any client-initiated write.

**Don't use for:** data reads (use `data/api/` in Server Components), scheduled jobs (use API routes or external triggers).

## Dependencies

None additional. Zod is Tier 1 (pre-installed).

## File Placement

- Co-locate with consuming component as a `'use server'` function, or
- Use a sibling `actions.ts` file when the action is shared across components

## Conventions

- Every Server Action returns `ActionResult`:

```ts
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }
```

Defined in `src/lib/types.ts`.

- Validate all inputs server-side with Zod `safeParse`. Never trust client data.
- Use `useActionState` (React 19) for form submissions with pending state → see `docs/FRAMEWORK.md`.
- Call `revalidatePath` / `revalidateTag` after successful mutations.
- Never import server-only code in client components. Server Actions are the bridge.

## References

- Next.js Server Actions: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
- React useActionState: https://react.dev/reference/react/useActionState
- Zod safeParse: https://zod.dev/?id=safeparse

## Verification

1. Action validates input → returns `{ success: false, error: '...' }` on invalid data
2. Action succeeds → returns `{ success: true, data: ... }` and page revalidates
3. `useActionState` shows pending state during submission
