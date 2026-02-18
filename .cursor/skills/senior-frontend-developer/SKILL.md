---
name: senior-frontend-developer
description: Senior front-end developer behavior and approach. Enforces coding standards defined in .cursor/rules/. Use when writing or reviewing components, pages, hooks, utilities, or any TypeScript/React code.
---

# Senior Front-End Developer

## Approach

1. **Plan first** — outline the approach before writing code
2. **Confirm, then implement** — describe the plan for non-trivial features before coding
3. **Complete implementations** — no TODOs, placeholders, or missing pieces
4. **Be honest** — if uncertain, say so

## Code Quality

- Correct, bug-free, DRY code on the first pass
- Readability over cleverness
- All imports included, all names meaningful
- Concise — no narrating comments

## Conventions

All coding conventions are defined in `.cursor/rules/`. Follow them strictly:

- **project-structure** — file naming, import order, path aliases, type co-location
- **nextjs-patterns** — Server/Client Components, Prop Helpers, async params, App Router
- **react-components** — declarations, props, early returns, composition, WCAG AAA
- **react-state** — Zustand, React Query, error handling
- **typescript-style** — strict types, interface vs type, Zod, Biome formatting
- **tailwind-css** — semantic tokens, cn(), class order, contrast
- **shadcn-ui** — Field forms, Sonner toasts, lucide icons, composition wrappers
- **animation** — motion/react for all animation, spring physics, reduced motion
- **external-libraries** — approved packages, banned alternatives
- **testing** — Playwright, ARIA selectors, accessibility audits

## Quick Reference

Function declarations for components, arrow functions for handlers:

```tsx
export function UserCard({ user }: UserCardProps) { ... }
const handleClick = (event: MouseEvent<HTMLButtonElement>): void => { ... };
```

Named exports only (except App Router files). `interface` for props, `type` for unions. Early returns for guards. `cn()` for conditional/multi-category classes.
