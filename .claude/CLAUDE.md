# Frontend.dev

## Tech Stack

Next.js 16 (App Router), React 19 + React Compiler, TypeScript (strict), Tailwind CSS v4 (OKLCH), shadcn/ui (New York), Biome, Zustand, TanStack React Query, Zod, React Hook Form, motion/react, Sonner, date-fns, Pino, Playwright (future).

## Commands

```bash
bun run dev        # Start dev server
bun run build      # Production build
bun run lint       # Biome check
bun run format     # Biome format --write
```

## Directory Tree

```
src/
├── app/                        # App Router (pages, layouts, loading, error)
├── components/
│   ├── common/                 # Shared reusable components
│   ├── core/                   # Providers, scripts, error boundaries
│   ├── layout/                 # Header, footer, sidebar, navigation
│   └── ui/                     # shadcn/ui (never modify directly)
├── data/
│   ├── api/                    # API functions + domain types per domain
│   └── stores/                 # Zustand stores per domain
├── hooks/                      # Custom hooks + React Query hooks
└── lib/                        # Utilities (client, env, logger, request, utils)
tests/                          # Playwright tests (future)
```

Route groups only when needed (shared layouts, auth grouping). Never a generic `(routes)/` wrapper.

## File Naming — Category-First Kebab-Case

Component type first, then variant — groups related files in the tree:

```
components/common/
├── button-icon.tsx
├── button-submit.tsx
├── card-product.tsx
├── card-user.tsx
├── dialog-confirm.tsx
```

Other files: `use-auth.ts`, `layout.store.ts`, `users.ts` (api), `format-date.ts` (lib).

## Symbol Naming

| Symbol | Convention | Example |
|--------|-----------|---------|
| Components | PascalCase | `ButtonSubmit` |
| Hooks | camelCase + `use` | `useAuth` |
| Stores | camelCase + `use` + `Store` | `useLayoutStore` |
| Interfaces/Types | PascalCase | `UserCardProps`, `Status` |
| Constants | PascalCase | `MaxRetries` |
| Functions/vars | camelCase | `formatDate`, `isLoading` |

## Types — Co-locate With Data

No `@/types/` folder. Types live next to the code that owns them:

- Domain types (User, Product) → `@/data/api/[domain].ts`
- Component props → in the component file
- Store types → in the store file

## Path Aliases

Always `@/` aliases — never relative imports (`../`, `./`):

`@/components/*`, `@/lib/*`, `@/hooks/*`, `@/data/api/*`, `@/data/stores/*`

## Import Order (Biome-enforced)

```tsx
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import type { User } from '@/data/api/users';

import { Suspense } from 'react';
import Image from 'next/image';

import { useQuery } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';

import { cn } from '@/lib/utils';

import { useUsers } from '@/hooks/use-users';
import { useLayoutStore } from '@/data/stores/layout.store';
```

Groups: type imports → React/Next → packages → `@/components` → `@/lib` → `@/hooks` + `@/data`. Blank line between each group.

**Never import React** — Next.js auto-imports it. Never use `React.XXX` — import types/hooks by name.

## File Organization

Single file per component, in order: type imports → dependency imports → local interfaces → constants → helpers → component export(s).

---

# TypeScript Style

## Strict Rules

- **No `any`** — use `unknown` + type guards
- **No `as` assertions** — use type guards, generics, or `satisfies`
- **No `!` non-null assertions** — handle nullability explicitly
- **No `enum`** — use `as const` objects or union types
- **No `namespace`** — use ES modules
- **No JSDoc** — self-documenting code with descriptive names
- **Explicit return types** on all exported functions and hooks

## Interface vs Type

`interface` for object shapes, props, API responses. `type` for unions, intersections, mapped types:

```tsx
interface UserCardProps {
  user: User;
  isCompact?: boolean;
  onSelect: (id: string) => void;
}

type Status = 'active' | 'inactive' | 'pending';
type Result<T> = { data: T; error: null } | { data: null; error: Error };
```

## Enum Alternatives

```tsx
const Status = { active: 'active', inactive: 'inactive', pending: 'pending' } as const;
type Status = (typeof Status)[keyof typeof Status];

type Variant = 'default' | 'destructive' | 'outline';
```

## Type Imports

Always `import type` for type-only imports:

```tsx
import type { ReactNode, MouseEvent } from 'react';
import type { User } from '@/data/api/users';
```

## Clean Function Signatures

Named `interface` for complex params — keep signatures readable:

```tsx
interface FormatPriceParams {
  amount: number;
  currency: string;
}

export function formatPrice({ amount, currency }: FormatPriceParams): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

// 1-2 primitives can be inline
export function getUser(id: string): Promise<User> { ... }
```

Arrow functions for local handlers:

```tsx
const handleClick = (event: MouseEvent<HTMLButtonElement>): void => {
  event.preventDefault();
};
```

## Code Style (Biome)

2-space indent, single quotes, 120 char width, trailing commas, semicolons.

## Zod for Runtime Validation

```tsx
const userSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  email: z.email(),
});

type User = z.infer<typeof userSchema>;
```

## Nullability

```tsx
const user = users.find((u) => u.id === id);
if (!user) throw new Error(`User ${id} not found`);

const name = user?.profile?.displayName ?? 'Anonymous';
```

---

# React Components

## Declaration

Named exports + function declarations. Never default exports (except App Router files), never arrow function components:

```tsx
export function UserProfile({ user }: UserProfileProps) {
  return <div>{user.name}</div>;
}
```

## Props

- Define with `interface`, destructure in signature, provide defaults inline
- Callback props: `on` prefix (`onSelect`, `onChange`)
- Internal handlers: `handle` prefix (`handleClick`, `handleSubmit`)
- Booleans: `is`/`has`/`should` prefix (`isLoading`, `hasError`)

```tsx
interface DialogProps {
  title: string;
  isOpen?: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function Dialog({ title, isOpen = false, onClose, children }: DialogProps) {
  if (!isOpen) return null;
  // ...
}
```

## Early Returns

Reduce nesting — return early for guard clauses:

```tsx
export function UserAvatar({ user, size = 'md' }: UserAvatarProps) {
  if (!user) return null;
  if (!user.avatarUrl) return <FallbackAvatar size={size} />;
  return <Image src={user.avatarUrl} alt={user.name} />;
}
```

## Composition

- Prefer composition over prop drilling
- Use `children` and render props
- Extend shadcn/ui via composition, never modify source
- Reusable logic → `@/hooks`, domain types → `@/data/api/`
- Component-specific types stay in the component file

## Accessibility (WCAG 2.1 AAA)

### Semantic HTML
- `<button>` for actions, `<a>` for navigation — never `<div onClick>`
- Semantic elements: `<nav>`, `<main>`, `<section>`, `<article>`
- Proper heading hierarchy: `h1` → `h2` → `h3`, never skip

### Keyboard
- All interactive elements keyboard accessible (`Tab`, `Enter`, `Space`, `Escape`)
- Trap focus in modals, return focus on close

### ARIA
- `aria-label` on icon-only buttons
- `aria-hidden="true"` on decorative icons
- `aria-describedby` for supplementary descriptions
- `aria-live` for dynamic updates

### Contrast
- Normal text: 7:1 (AAA), large text: 4.5:1
- Never rely solely on color

---

# React State and Data Fetching

## Three-Tier State Model

| Tier | Tool | Use For |
|------|------|---------|
| Local | `useState` / `useReducer` | Form inputs, toggles, component-specific UI |
| Global UI | Zustand (`@/data/stores/`) | Theme, modals, sidebar, UI preferences |
| Server | React Query (`@/hooks/` + `@/data/api/`) | API data, caching, synchronization |

Never cache server data in Zustand. Never use React Query for client-only UI state.

## Zustand — Global UI State

One flat store per domain. Separate `State` and `Actions` interfaces:

```tsx
// @/data/stores/layout.store.ts
import { create } from 'zustand';

interface LayoutState {
  isMenuOpen: boolean;
}

interface LayoutActions {
  openMenu: () => void;
  closeMenu: () => void;
  toggleMenu: () => void;
}

export const useLayoutStore = create<LayoutState & LayoutActions>((set) => ({
  isMenuOpen: false,
  openMenu: () => set({ isMenuOpen: true }),
  closeMenu: () => set({ isMenuOpen: false }),
  toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),
}));
```

Naming: `use[Domain]Store`, file: `[domain].store.ts`.

## React Query — Server State

Architecture: `@/data/api/[domain].ts` (API functions) → `@/hooks/use-[domain].ts` (query/mutation hooks) → component.

```tsx
// @/data/api/users.ts
export function getUsers(): Promise<User[]> {
  return request<User[]>({ method: RequestMethod.GET, endpoint: '/users' });
}

export function createUser(input: CreateUserInput): Promise<User> {
  return request<User>({ method: RequestMethod.POST, endpoint: '/users', params: input });
}
```

```tsx
// @/hooks/use-users.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { createUser, getUsers } from '@/data/api/users';

export function useUsers() {
  return useQuery({ queryKey: ['users'], queryFn: getUsers });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User created');
    },
    onError: (error) => toast.error(error.message),
  });
}
```

### Query Keys

Arrays, nested hierarchically: `['users']`, `['users', id]`, `['users', userId, 'posts']`. Include all variables the query depends on.

### Best Practices

- Always handle `onError` in `useMutation` with `toast.error()`
- Use `enabled` for conditional fetching, `select` for data transformation
- Use `getQueryClient()` from `@/lib/client`

## Error Handling

- Async errors → `toast.error()` (Sonner)
- Form validation → inline via React Hook Form + Zod
- Server errors → log with `@/lib/logger`, toast to user
- Never expose raw error messages

---

# Next.js Patterns

## Prop Helpers

Use auto-generated `PageProps` and `LayoutProps` — never manually type page/layout props:

```tsx
export default function Page(_: PageProps<'/'>) {
  return <div>Home</div>;
}

function RootLayout({ children }: LayoutProps<'/'>) {
  return <html>{children}</html>;
}
export default RootLayout;
```

## Async Params (Next.js 15+)

`params` and `searchParams` are **Promises** — always `await` them. `children` is not a Promise.

```tsx
export default async function Page({ params }: PageProps<'/blog/[slug]'>) {
  const { slug } = await params;
  return <article>{slug}</article>;
}

export default async function Page({ searchParams }: PageProps<'/products'>) {
  const { page, sort } = await searchParams;
  return <ProductList page={page} sort={sort} />;
}

export async function generateMetadata({ params }: PageProps<'/blog/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  return { title: `Blog - ${slug}` };
}
```

Pages/layouts without dynamic segments don't need `async`.

## Default Exports — App Router Exception

App Router requires default exports for `page.tsx`, `layout.tsx`, `error.tsx`, `loading.tsx`, `not-found.tsx`. This is the **only** exception to named-exports-only.

## Server vs Client Components

Default to Server Components. Add `'use client'` only for:
- Event handlers, React hooks, Browser APIs, client libraries (motion/react, react-hook-form)

Push `'use client'` as deep as possible — wrap only the interactive leaf.

## App Router Files

| File | Purpose |
|------|---------|
| `page.tsx` | Route entry (Server Component) |
| `layout.tsx` | Persistent layout (Server Component) |
| `loading.tsx` | Suspense fallback |
| `error.tsx` | Error boundary (`'use client'` required) |
| `not-found.tsx` | 404 UI |
| `route.ts` | API handler |
| `template.tsx` | Re-mounting layout |

## Metadata

```tsx
// Static
export const metadata: Metadata = { title: 'Home', description: '...' };

// Dynamic — use async + await params
export async function generateMetadata({ params }: PageProps<'/blog/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  return { title: `Blog - ${slug}` };
}
```

## Error Boundaries

Every meaningful route segment should have an `error.tsx`. Log with `@/lib/logger`, never expose raw errors:

```tsx
'use client';

import { useEffect } from 'react';

import { logger } from '@/lib/logger';

interface ErrorPageProps {
  error: Error;
  reset: () => void;
}

export default function Error({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    logger.error({ context: 'error-boundary' }, error.message);
  }, [error]);

  return (
    <div role="alert">
      <h2>Something went wrong</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

## Loading States

Use `loading.tsx` for routes, `<Suspense>` for components. Show skeleton UIs, never blank screens.

## Environment Variables

Access exclusively through `@/lib/env` (Zod-validated). Never `process.env` directly. Client vars prefixed `NEXT_PUBLIC_`.

## Performance

- `next/Image` with `width`/`height` or `fill` — never `<img>`
- `next/font` for fonts, `next/dynamic` for lazy-loading
- `<Suspense>` for streaming, `@next/third-parties` for scripts
- Minimize `'use client'` boundaries

---

# Tailwind CSS

## v4 Configuration

CSS-based config (no `tailwind.config.js`): `@import 'tailwindcss'`, `@import 'tw-animate-css'`, `@theme inline`, `@custom-variant dark`. OKLCH color system.

## Semantic Tokens

Always semantic tokens — never hardcoded colors:

```tsx
<div className="bg-background text-foreground" />
<div className="bg-primary text-primary-foreground" />
<div className="bg-muted text-muted-foreground" />
<div className="border-border" />
```

Available: `background`, `foreground`, `card`, `popover`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `input`, `ring`, `sidebar-*`, `chart-1`–`chart-5`.

## cn() Utility

Use `cn()` from `@/lib/utils` when classes are conditional or span multiple categories. Single-category classes use plain `className`.

## Class Organization Order

When using `cn()`, one string per category:

1. Root/Group — `container`, `group`
2. Overflow/Visibility — `overflow-*`, `opacity-*`
3. Position + Z — `relative`, `absolute`, `z-*`
4. Display + Box — `flex`, `grid`, `w-*`, `h-*`, `gap-*`, `p-*`, `m-*`, `border`, `rounded-*`
5. Background + Type — `bg-*`, `text-*`, `font-*`
6. Animation/Transition — `animate-*`, `transition-*`
7. Interactivity — `cursor-*`, `pointer-events-*`
8. Responsive — `sm:`, `md:`, `lg:`
9. Dark — `dark:`

## Styling Rules

- Tailwind utilities only — never inline `style` or `<style>` tags
- Standard utilities over arbitrary values (`p-4` not `p-[17px]`)
- `@apply` only for base resets in globals.css
- `size-*` when width = height: `size-4` not `w-4 h-4`

## Color Contrast (WCAG AAA)

Normal text: **7:1**, large text: **4.5:1**, UI components: **3:1**. Never rely solely on color.

## Responsive

Mobile-first — base for mobile, breakpoints up:

```tsx
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" />
```

## Dark Mode

Semantic tokens auto-swap. Use `dark:` only for edge cases where tokens are insufficient.

---

# shadcn/ui

## Configuration

Style: New York. Icons: lucide-react. Components: `@/components/ui/`. Add via `bunx shadcn@latest add [component]`.

## Usage Rules

- Import from `@/components/ui/[component]`
- Never modify `@/components/ui/` files — customize via `className` + `cn()`
- Use built-in variants, don't add custom variants to source files

## Composition

Wrappers in `@/components/common/` that compose shadcn/ui:

```tsx
// @/components/common/button-submit.tsx
interface ButtonSubmitProps extends ComponentProps<typeof Button> {
  isLoading?: boolean;
}

export function ButtonSubmit({ isLoading = false, children, className, disabled, ...props }: ButtonSubmitProps) {
  return (
    <Button type="submit" disabled={isLoading || disabled} className={cn('min-w-[120px]', className)} {...props}>
      {isLoading ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : children}
    </Button>
  );
}
```

## Forms — Field + Controller + Zod

Use `Field` with React Hook Form `Controller` and Zod validation.

- `Field` — wrapper (supports `orientation="horizontal"` / `"responsive"`)
- `FieldLabel` — label with `htmlFor`
- `FieldDescription` — helper text
- `FieldError` — validation errors (accepts `errors` array)
- `FieldGroup` — stacks fields with spacing
- `FieldSet` / `FieldLegend` — semantic grouping
- `FieldContent` — label + description in horizontal layouts

### Form Conventions

- Zod schema above component, type via `z.infer<typeof schema>`
- `zodResolver` for validation
- `Controller` (not old `FormField`), `Field` (not old `Form`/`FormItem`)
- `data-invalid={fieldState.invalid}` on `Field`, `aria-invalid` on input
- `FieldError` only when `fieldState.invalid`
- `defaultValues` for all fields, `field.name` as `id`/`htmlFor`

## Toasts — Sonner

```tsx
import { toast } from 'sonner';

toast.success('Changes saved');
toast.error('Failed to save', { description: 'File exceeds 5MB limit' });
toast.promise(saveChanges(), { loading: 'Saving...', success: 'Saved', error: 'Failed' });
```

## Icons — Lucide

```tsx
import { Search, X } from 'lucide-react';

<Search className="size-4" aria-hidden="true" />

<Button variant="ghost" size="icon" aria-label="Search">
  <Search className="size-4" />
</Button>
```

Sizes: `size-3` (12px), `size-4` (16px), `size-5` (20px), `size-6` (24px).

---

# Animation

## Core Principle

**Tailwind = how things look. motion/react = how things move.**

motion/react handles every transition, hover, entrance, exit, gesture, and scroll animation. Tailwind is static styling only — no `transition-*` or `animate-*` in custom components.

> shadcn/ui uses `tw-animate-css` internally. Don't use it in custom components.

## Spring Presets

| Preset | Config | Use For |
|--------|--------|---------|
| Snappy | `stiffness: 400, damping: 30` | Buttons, toggles, micro-interactions |
| Smooth | `stiffness: 300, damping: 30` | Cards, panels, modals |
| Gentle | `stiffness: 200, damping: 25` | Page transitions, large elements |
| Bouncy | `bounce: 0.3, duration: 0.6` | Playful elements, notifications |

Duration-based only for pure opacity fades (150-250ms, `easeOut`).

## Reduced Motion

Always respect `prefers-reduced-motion` — remove movement, keep opacity:

```tsx
const shouldReduceMotion = useReducedMotion();

<motion.div
  initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={shouldReduceMotion ? { duration: 0.15 } : { type: 'spring', stiffness: 300, damping: 30 }}
/>
```

## Performance

- Animate only `transform` and `opacity` (GPU-accelerated)
- Use `layout` prop instead of animating width/height
- `viewport={{ once: true }}` for one-shot reveals
- Stagger only visible items
- Nothing should exceed 500ms

---

# External Libraries

## Approved

**Core:** next, react, react-dom, typescript
**Styling:** tailwindcss, tw-animate-css, class-variance-authority, clsx, tailwind-merge
**UI:** shadcn/ui, lucide-react
**State/Data:** zustand, @tanstack/react-query, zod
**Animation:** motion/react
**Forms:** react-hook-form, @hookform/resolvers
**Utilities:** sonner, date-fns, next-themes, qs, pino, @next/third-parties
**Testing:** @playwright/test, @axe-core/playwright
**Tooling:** @biomejs/biome, lefthook, @commitlint/cli

## Adding Dependencies

1. Check native APIs first (`Intl`, `URL`, `fetch`, `structuredClone`, `crypto.randomUUID()`)
2. Check if an approved library covers it
3. Evaluate bundle size (bundlephobia.com, prefer tree-shakeable)
4. Verify maintenance and React 19 / Next.js 16 compatibility

## Banned

| Don't Use | Use Instead | Why |
|-----------|-------------|-----|
| moment.js | date-fns | Deprecated, massive bundle |
| lodash (full) | Native or lodash-es | Most methods have native equivalents |
| axios | `@/lib/request` | Unnecessary over fetch |
| styled-components/emotion | Tailwind CSS | Utility-first approach |
| Redux/MobX | Zustand + React Query | Less boilerplate |
| jQuery | React APIs | Incompatible paradigm |
| classnames | clsx + tailwind-merge | cn() handles this |
| GSAP | motion/react | Licensing, motion covers all cases |
| Lenis/smooth-scroll | motion/react `useScroll` | Breaks a11y |
| framer-motion | motion/react | Old package name |

## Imports

Always specific — never `import *`:

```tsx
import { format, parseISO } from 'date-fns';
import { Search, ChevronRight } from 'lucide-react';
```

---

# Testing

## Stack

@playwright/test + @axe-core/playwright. Install when ready to implement.

## File Organization

```
tests/
├── accessibility.spec.ts       # WCAG audits across pages
├── auth.spec.ts                # Feature: login, register, logout
├── checkout.spec.ts            # Feature: cart → payment → confirmation
├── dashboard.spec.ts           # Page: dashboard functionality
├── settings.spec.ts            # Page: settings
└── playwright.config.ts
```

Feature flows: name by feature. Single-page tests: name by page.

## Selector Priority

1. ARIA roles — `getByRole('button', { name: 'Submit' })`
2. Labels — `getByLabel('Email')`
3. Placeholder — `getByPlaceholder('Search...')`
4. Text — `getByText('Welcome back')`
5. Test ID — `getByTestId('...')` (last resort)

Never CSS selectors or XPath.

## Principles

- Test behavior, not implementation
- Each test isolated — no shared state
- Descriptive names: `should show error with invalid credentials`
- Arrange-Act-Assert
- No hardcoded waits — use auto-waiting
- One assertion per concern

## Accessibility Audits

```tsx
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('home page passes accessibility audit', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page }).withTags(['wcag2aaa']).analyze();
  expect(results.violations).toEqual([]);
});
```

Run audits for every critical page. Add `data-testid` only when ARIA selectors are insufficient.
