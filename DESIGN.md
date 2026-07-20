# DESIGN.md

**Status:** Template

Rules live here; values live in `globals.css`. Never duplicate a token value into this doc.

## Gate

The Nova preset defaults, Geist fonts, and placeholder assets ARE the template baseline — shipping them is not customization. Until Status is `Active`, brand customization is blocked: no changing colors, typography, spacing, or radius away from the baseline. Structural and convention fixes are always allowed.

Rebrand workflow: define brand → edit `:root` and `.dark` in `globals.css` → verify both modes → set Status to `Active`.

## Theming

- Tokens live in `globals.css`: `:root`, `.dark`, and the `@theme inline` mapping block.
- Components consume utilities (`bg-primary`, `text-foreground`) — never hardcoded colors.
- Rebrands touch only CSS variables, never component files.
- New token: add var to `:root` + `.dark` → map in `@theme inline` → use the utility.

## Typography and Radius

- Three fixed font roles in `lib/fonts.ts`: `display`, `sans`, `mono` → CSS variables `--font-display`, `--font-sans`, `--font-mono` → utilities `font-display`, `font-sans`, `font-mono`.
- Rebrands swap the font inside the const. The variable names never change.
- Radius derives from the single `--radius` variable. No per-component overrides.
- shadcn's font-heading token aliases --font-display; component headings follow the display role automatically.

## Components

- Justify the component before writing it: name the UX problem it solves and why composition can't.
- Check `components/ui/` first, then the shadcn registry. Compose primitives before authoring new ones.
- A new component is the last resort, not the first move.

## Libraries

- Recommend a library when it removes real work — name the tradeoff with it.
- Installing needs approval. Ask first; never install to explore.

## Styling

- Prefer predefined Tailwind classes. Arbitrary values allowed with `rem`, `em`, `%`, viewport units, `clamp()` — never `px`.
- `cn()` for any className containing a variable, a conditional, or multiple sort groups — never template-literal interpolation. Plain string only when every class is static.
- Class order follows the groups below, in sequence. Skip any group you don't use.
- Multi-group classNames use the array form — `cn([...])`, one group per element, in that order. `formatter.expand: "always"` keeps arrays expanded, so the line breaks are stable; comma-separated arguments are not, and Biome collapses them onto one line whenever they fit.
- Conditionals and the `className` passthrough are elements like any other, and go last.
- Single-group classNames stay a plain string.
- `components/ui/` is exempt — shadcn re-emits its own order on every CLI run.

```tsx
className={cn([
  'group/card',
  'relative flex items-center gap-2',
  'rounded-lg border bg-card',
  'text-sm font-medium',
  'hover:bg-muted',
  isActive && 'ring-2 ring-ring',
  className,
])}
```

| # | Group | Examples |
|---|---|---|
| 1 | Group / container markers | `group`, `group/button`, `peer`, `@container/card-header` |
| 2 | Position & layer | `relative`, `absolute`, `inset-0`, `top-*`, `z-*` |
| 3 | Display & layout | `flex`, `grid`, `hidden`, `flex-col`, `items-*`, `justify-*`, `gap-*` |
| 4 | Sizing | `size-*`, `w-*`, `h-*`, `min-w-*`, `max-w-*` |
| 5 | Spacing | `m-*`, `p-*`, `space-x-*` |
| 6 | Border & ring | `rounded-*`, `border-*`, `ring-*`, `outline-*` |
| 7 | Background & effects | `bg-*`, `bg-clip-*`, `shadow-*`, `opacity-*`, `backdrop-*` |
| 8 | Typography | `font-*`, `text-*`, `leading-*`, `tracking-*`, `truncate` |
| 9 | Transition & animation | `transition-*`, `duration-*`, `ease-*`, `animate-*` |
| 10 | Interactivity | `cursor-*`, `select-none`, `pointer-events-*`, `outline-none`, `touch-*` |
| 11 | States | `hover:`, `focus-visible:`, `active:`, `disabled:`, `aria-*:`, `data-*:` |
| 12 | Descendant & relational | `[&_svg]:*`, `*:`, `has-*:`, `in-*:`, `group-*:`, `peer-*:` |
| 13 | Responsive | `sm:` → `2xl:` |
| 14 | Dark | `dark:`, `dark:hover:` |

## Motion

- Motion usage lives behind `'use client'` boundaries — client leaf components composed into Server Component trees, never imported by server code.
- Shared duration/easing constants go in `lib/motion.ts`, created with the first animation.
- Respect `prefers-reduced-motion` (Motion's reduced-motion support).
- Animate transforms and opacity, not layout properties.
- No animation without purpose: entrance, feedback, or continuity.

## Assets

- `public/static/`, named `{namespace}-{element}-{light|dark}.ext`; mode-neutral files skip the suffix.
- Shipped placeholders (replace at rebrand): `frontend-dev-logo.svg`, `frontend-dev-icon-light.svg`, `frontend-dev-icon-dark.svg`, `frontend-dev-icon-light.png`, `frontend-dev-thumbnail.png`.
- Update `layout.tsx` metadata references when replacing.
