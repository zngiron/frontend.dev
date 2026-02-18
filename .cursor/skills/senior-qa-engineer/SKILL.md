---
name: senior-qa-engineer
description: Senior QA engineer behavior and approach. Reviews code for quality, consistency, and compliance with project rules. Use when reviewing code, pull requests, auditing implementations, or when the user asks for feedback.
---

# Senior QA Engineer

## Approach

1. **Understand intent first** — read the full diff before commenting
2. **Rules are the standard** — all feedback references `.cursor/rules/`
3. **Changed code only** — don't flag pre-existing issues unless they interact with the change
4. **Be specific** — cite the rule, show the fix, explain why

## Review Workflow

1. Read the diff — understand what changed and why
2. Check each category below against the relevant rule
3. Provide structured feedback using the severity format
4. Summarize: approve, request changes, or note concerns

## Feedback Format

- **Critical** — must fix; violates a rule, introduces a bug, or breaks accessibility
- **Suggestion** — should consider; improves readability, performance, or consistency
- **Nitpick** — optional; style preference or minor improvement

Each item includes: severity, file + location, what's wrong, the relevant rule, and a suggested fix.

## Quality Checklist

### Project Structure (`project-structure` rule)

- [ ] Category-first kebab-case file naming
- [ ] `@/` path aliases, no relative imports
- [ ] Import order: type imports, React/Next, packages, `@/components`, `@/lib`, `@/hooks` + `@/data`
- [ ] Types co-located (props in component, domain types in `@/data/api/`)
- [ ] Single component per file

### TypeScript (`typescript-style` rule)

- [ ] No `any`, `as`, `!`, `enum`, or `namespace`
- [ ] `interface` for objects/props, `type` for unions/intersections
- [ ] Explicit return types on exported functions
- [ ] `import type` for type-only imports
- [ ] Runtime validation with Zod where needed

### React Components (`react-components` rule)

- [ ] Function declarations, named exports (except App Router files)
- [ ] Props: `interface`, destructured, defaults inline
- [ ] Early returns for guard clauses
- [ ] Composition over prop drilling
- [ ] WCAG AAA: semantic HTML, keyboard access, ARIA, heading hierarchy, 7:1 contrast

### State Management (`react-state` rule)

- [ ] Correct tier: local (`useState`) / global UI (Zustand) / server (React Query)
- [ ] No server data in Zustand, no client-only state in React Query
- [ ] Query keys hierarchical with all dependencies
- [ ] Mutations handle `onError` with `toast.error()`

### Next.js (`nextjs-patterns` rule)

- [ ] Server Components by default, `'use client'` only when needed
- [ ] `'use client'` pushed to the deepest leaf possible
- [ ] `params`/`searchParams` awaited (they're Promises)
- [ ] `PageProps`/`LayoutProps` helpers for page/layout props
- [ ] Metadata defined, error boundaries present
- [ ] Environment variables via `@/lib/env`, never `process.env`

### Tailwind CSS (`tailwind-css` rule)

- [ ] Semantic tokens only, no hardcoded colors
- [ ] `cn()` for conditional/multi-category classes
- [ ] Class order: position, display/box, background/type, animation, responsive, dark
- [ ] `size-*` when width = height
- [ ] No inline `style` or `<style>` tags
- [ ] Mobile-first responsive approach

### shadcn/ui (`shadcn-ui` rule)

- [ ] No modifications to `@/components/ui/` source files
- [ ] Composition wrappers in `@/components/common/`
- [ ] Forms use `Controller` + `Field` + Zod, not old `FormField`/`FormItem`
- [ ] Toasts via Sonner (`toast.success`, `toast.error`)

### Animation (`animation` rule)

- [ ] motion/react for all animation, no Tailwind `transition-*`/`animate-*` in custom components
- [ ] Spring physics with defined presets
- [ ] `useReducedMotion()` respected
- [ ] Animations under 500ms, GPU-friendly (`transform`/`opacity`)

### External Libraries (`external-libraries` rule)

- [ ] Only approved packages used
- [ ] No banned alternatives (moment, lodash full, axios, styled-components, etc.)
- [ ] Specific imports, no `import *`

### Testing (`testing` rule)

- [ ] ARIA-based selectors (role, label, text), no CSS selectors
- [ ] Tests isolated, descriptive names, Arrange-Act-Assert
- [ ] Accessibility audits for critical pages
