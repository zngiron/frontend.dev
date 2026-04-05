# Forms Setup Guide

> **Purpose:** Step-by-step guide for adding React Hook Form with Zod validation to the project.
>
> **Last Updated:** 2026-04-06
>
> **Status:** Active

---

## Prerequisites

Zod is already installed as a Tier 1 dependency — no action needed. React Hook Form is a Tier 2 dependency and must be installed before use.

## Dependencies

Install React Hook Form and its Zod resolver:

```bash
bun add react-hook-form @hookform/resolvers
```

## File Structure

Zod schemas live in a dedicated validators directory, one file per feature domain:

```
src/lib/validators/
├── auth.schema.ts
└── [feature].schema.ts
```

Form components live either in their feature directory (co-located with the page or module that uses them) or in `src/components/forms/` when they are shared across features.

## Step-By-Step Implementation

### 1. Install Dependencies

Run the install command from the project root:

```bash
bun add react-hook-form @hookform/resolvers
```

### 2. Create The Validators Directory

```bash
mkdir -p src/lib/validators
```

### 3. Create A Zod Schema

Define the schema and export a type inferred from it. Example for an authentication form:

```ts
import { z } from "zod"

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export type LoginValues = z.infer<typeof LoginSchema>
```

### 4. Create A Form Component

Mark the component as a Client Component, wire `useForm` to `zodResolver`, and render error messages beneath each field:

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
    // Call Server Action or API
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div>
        <Input
          type="email"
          placeholder="Email"
          {...register("email")}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>
      <div>
        <Input
          type="password"
          placeholder="Password"
          {...register("password")}
        />
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

## Environment Variables

None required for React Hook Form or Zod validation.

## Common Patterns

### Server Action Integration

Validate form data inside a Server Action using `safeParse`. This provides a second layer of validation independent of the client:

```ts
"use server"

import { LoginSchema } from "@/lib/validators/auth.schema"

export async function loginAction(data: FormData) {
  const parsed = LoginSchema.safeParse(Object.fromEntries(data))
  if (!parsed.success) {
    return { error: "Invalid input" }
  }
  // Authenticate user
}
```

Pass the action to the form component and call it inside `onSubmit` after client-side validation has already passed.

### Multi-Step Forms

Split the schema into partial objects using `z.object` for each step. Use local state or a context to track the current step index and accumulate validated data. Only submit to the server once all steps pass.

### Field Arrays

Use `useFieldArray` from React Hook Form when the form contains a dynamic list of identical fields (e.g., a list of contacts or line items). It provides `fields`, `append`, and `remove` helpers that integrate with the registered form state.

```ts
const { fields, append, remove } = useFieldArray({
  control,
  name: "items",
})
```

### Conditional Validation

Use `z.discriminatedUnion` or `.superRefine` to express fields that are required only when another field has a specific value. Keep conditional logic inside the schema rather than in the component to ensure server-side validation stays consistent.

## Verification

1. Render the form in the browser.
2. Submit the form without filling in any fields.
3. Confirm that validation error messages appear beneath the email and password inputs.
4. Enter an invalid email format and a password shorter than 8 characters, then submit again. Confirm the specific error messages display correctly.
5. Fill in valid data and submit. Confirm the `onSubmit` handler is called with the parsed values and no errors are shown.
