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

## Styling

- Prefer predefined Tailwind classes. Arbitrary values allowed with `rem`, `em`, `%`, viewport units, `clamp()` — never `px`.
- `cn()` only for conditional classes or to separate sort groups; plain string otherwise.
- Class order: position → display/layout → box model → background → typography → animation → states → responsive → dark.

## Motion

- Motion usage lives behind `'use client'` boundaries — client leaf components composed into Server Component trees, never imported by server code.
- Shared duration/easing constants go in `lib/motion.ts`, created with the first animation.
- Respect `prefers-reduced-motion` (Motion's reduced-motion support).
- Animate transforms and opacity, not layout properties.
- No animation without purpose: entrance, feedback, or continuity.

## Assets

- `public/static/`, named `{namespace}-{element}-{l/d}.ext`; mode-neutral files skip the suffix.
- Shipped placeholders (replace at rebrand): `frontend-dev-logo.svg`, `frontend-dev-icon-light.svg`, `frontend-dev-icon-dark.svg`, `frontend-dev-icon-light.png`, `frontend-dev-thumbnail.png`.
- Update `layout.tsx` metadata references when replacing.
