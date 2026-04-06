# Forms

React Hook Form with Zod validation.

---

## Dependencies

Zod is Tier 1 (pre-installed). Install React Hook Form:

```bash
bun add react-hook-form @hookform/resolvers
```

## File Structure

```
src/lib/validators/   → Zod schemas, one per domain (auth.schema.ts, etc.)
src/components/forms/  → Shared form components (used in 2+ features)
```

## Implementation

### 1. Create A Zod Schema

`src/lib/validators/auth.schema.ts`:

```ts
import { z } from "zod"

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export type LoginValues = z.infer<typeof LoginSchema>
```

### 2. Create A Form Component

```tsx
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LoginSchema, type LoginValues } from "@/lib/validators/auth.schema"

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(LoginSchema),
  })

  async function onSubmit(data: LoginValues) {
    // Call Server Action
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div>
        <Input type="email" placeholder="Email" {...register("email")} />
        {errors.email && (
          <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>
      <div>
        <Input type="password" placeholder="Password" {...register("password")} />
        {errors.password && (
          <p className="mt-1 text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  )
}
```

## Common Patterns

### Server Action Validation

Double-validate with `safeParse` inside the action:

```ts
"use server"

import { LoginSchema } from "@/lib/validators/auth.schema"

export async function loginAction(data: FormData) {
  const parsed = LoginSchema.safeParse(Object.fromEntries(data))
  if (!parsed.success) return { error: "Invalid input" }
  // Authenticate user
}
```

### Multi-Step Forms

Split schema into partial `z.object` per step. Track step index in local state. Submit to server only after all steps pass.

### Field Arrays

```ts
const { fields, append, remove } = useFieldArray({ control, name: "items" })
```

### Conditional Validation

Use `z.discriminatedUnion` or `.superRefine`. Keep logic in the schema, not the component.

## Verification

1. Submit empty form → validation errors appear
2. Invalid email + short password → specific error messages
3. Valid data → `onSubmit` called with parsed values, no errors
