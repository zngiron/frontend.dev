# Forms

**Stack:** React Hook Form + `@hookform/resolvers` + Zod

---

## When To Use

**Use for:** any form with validation, multi-field forms, multi-step wizards.

**Don't use for:** single-input forms (use native form + Server Action), search inputs (use URL search params).

## Dependencies

Zod is Tier 1 (pre-installed). Install React Hook Form:

```bash
bun add react-hook-form @hookform/resolvers
```

## File Placement

```
src/lib/validators/   → Zod schemas, one per domain (auth.schema.ts, profile.schema.ts)
src/components/forms/  → Shared form components used in 2+ features
```

## Conventions

- Zod schemas in `lib/validators/`, named `[domain].schema.ts`. Export both the schema and inferred type.
- `zodResolver` from `@hookform/resolvers/zod` connects the schema to React Hook Form.
- Double-validate: client-side via React Hook Form, server-side via `safeParse` in the Server Action.
- Return `ActionResult` from every Server Action → see `docs/CONVENTIONS.md`.
- `useActionState` for form submissions with pending state → see `docs/FRAMEWORK.md` for React 19 API.
- Field arrays: use `useFieldArray` from React Hook Form.
- Conditional validation: use `z.discriminatedUnion` or `.superRefine`. Keep logic in the schema, not the component.

## References

- React Hook Form docs: https://react-hook-form.com/get-started
- Zod docs: https://zod.dev
- @hookform/resolvers: https://github.com/react-hook-form/resolvers

## Verification

1. Submit empty form → validation errors appear
2. Invalid data → specific error messages
3. Valid data → `onSubmit` called with parsed values, no errors
