# Design

> **Purpose:** Brand guidelines and design tokens for the Front-End Development Framework. This document must be completed before customizing any shadcn component styling.
>
> **Last Updated:** 2026-04-06
>
> **Status:** Template

---

## Overview

This file is the single source of truth for brand decisions. **It must be completed before any shadcn component styling is modified.**

Until every section below is filled in and the status above is changed to `Active`, the AI must not modify:

- Component colors (background, foreground, border, ring, etc.)
- Typography (font families, sizes, weights)
- Spacing values beyond Tailwind defaults
- Border radius values

The workflow is:

1. A designer or product owner fills in this document with project-specific values.
2. A developer transcribes those values into the CSS variables in `src/app/globals.css`.
3. The AI may then help customize shadcn component styles, referencing this document as the authority.

---

## Brand Colors

All color values use the `oklch(L C H)` format already established in `globals.css`. When defining values, use the same format (e.g. `oklch(0.55 0.18 264)`). Alpha variants use the slash notation: `oklch(1 0 0 / 10%)`.

| Token | CSS Variable | Light Value | Dark Value | Usage |
|---|---|---|---|---|
| Primary | `--primary` / `--primary-foreground` | `[define]` / `[define]` | `[define]` / `[define]` | Main interactive elements: buttons, links, active states |
| Secondary | `--secondary` / `--secondary-foreground` | `[define]` / `[define]` | `[define]` / `[define]` | Secondary actions, badges, subtle fills |
| Accent | `--accent` / `--accent-foreground` | `[define]` / `[define]` | `[define]` / `[define]` | Hover states, highlights |
| Destructive | `--destructive` | `[define]` | `[define]` | Error states, delete actions, warnings |
| Muted | `--muted` / `--muted-foreground` | `[define]` / `[define]` | `[define]` / `[define]` | Disabled states, placeholder text, subtle backgrounds |
| Background | `--background` | `[define]` | `[define]` | Page background |
| Foreground | `--foreground` | `[define]` | `[define]` | Default text color |
| Card | `--card` / `--card-foreground` | `[define]` / `[define]` | `[define]` / `[define]` | Card and panel surfaces |
| Popover | `--popover` / `--popover-foreground` | `[define]` / `[define]` | `[define]` / `[define]` | Dropdowns, tooltips, floating surfaces |
| Border | `--border` | `[define]` | `[define]` | Default border color |
| Input | `--input` | `[define]` | `[define]` | Form input borders |
| Ring | `--ring` | `[define]` | `[define]` | Focus ring color |

> **Note on chart tokens:** `--chart-1` through `--chart-5` are used for data visualizations. Define these separately once the above core palette is established.

> **Note on sidebar tokens:** `--sidebar`, `--sidebar-foreground`, `--sidebar-primary`, `--sidebar-primary-foreground`, `--sidebar-accent`, `--sidebar-accent-foreground`, `--sidebar-border`, and `--sidebar-ring` are available for sidebar-specific theming. They can inherit from the core palette or diverge if the sidebar has its own visual treatment.

---

## Typography

### Font Families

| Role | CSS Variable | Tailwind Utility | Current Default | Project Value |
|---|---|---|---|---|
| Heading | `--font-heading` | `font-heading` | Geist Sans | `[define]` |
| Body | `--font-sans` | `font-sans` | Geist Sans | `[define]` |
| Monospace | `--font-mono` | `font-mono` | Geist Mono | `[define]` |

Fonts are loaded in `src/app/layout.tsx` via `next/font`. To change a font, update the import and the CSS variable assignment there, then confirm the variable name matches the `@theme inline` block in `globals.css`.

### Size Scale

Reference: Tailwind v4 default type scale. Override only what diverges from these defaults.

| Step | Tailwind Class | Default rem | Default px (16px base) | Project Override |
|---|---|---|---|---|
| xs | `text-xs` | 0.75rem | 12px | `[define or inherit]` |
| sm | `text-sm` | 0.875rem | 14px | `[define or inherit]` |
| base | `text-base` | 1rem | 16px | `[define or inherit]` |
| lg | `text-lg` | 1.125rem | 18px | `[define or inherit]` |
| xl | `text-xl` | 1.25rem | 20px | `[define or inherit]` |
| 2xl | `text-2xl` | 1.5rem | 24px | `[define or inherit]` |
| 3xl | `text-3xl` | 1.875rem | 30px | `[define or inherit]` |
| 4xl | `text-4xl` | 2.25rem | 36px | `[define or inherit]` |
| 5xl | `text-5xl` | 3rem | 48px | `[define or inherit]` |

### Weight Scale

| Name | Tailwind Class | Value | Usage |
|---|---|---|---|
| Regular | `font-normal` | 400 | Body copy |
| Medium | `font-medium` | 500 | Labels, captions |
| Semibold | `font-semibold` | 600 | Subheadings, emphasis |
| Bold | `font-bold` | 700 | Headings, CTAs |

---

## Spacing

### Base Unit

The spacing system is derived from a single base unit. Tailwind v4 defaults to `0.25rem` (4px) per spacing step.

| Setting | Value |
|---|---|
| Base unit | `[define — default: 0.25rem / 4px]` |
| Base font size | `[define — default: 16px]` |

### Scale Reference

Unless a custom spacing scale is defined here, all components use the Tailwind default spacing scale (`space-1` = 4px, `space-2` = 8px, etc.). Document any project-specific deviations below.

| Token | Value | Notes |
|---|---|---|
| `[define]` | `[define]` | `[define]` |

---

## Border Radius

The radius system is driven by a single `--radius` root variable. All other radius tokens are computed from it.

**Current base value:** `--radius: 0.625rem` (10px)

| Token | CSS Variable | Computed Value | Tailwind Class | Usage |
|---|---|---|---|---|
| sm | `--radius-sm` | `calc(0.625rem * 0.6)` = 0.375rem (6px) | `rounded-sm` | Tags, badges, small chips |
| md | `--radius-md` | `calc(0.625rem * 0.8)` = 0.5rem (8px) | `rounded-md` | Inputs, small buttons |
| lg | `--radius-lg` | `0.625rem` (10px) | `rounded-lg` | Default cards, standard buttons |
| xl | `--radius-xl` | `calc(0.625rem * 1.4)` = 0.875rem (14px) | `rounded-xl` | Large cards, modals |
| 2xl | `--radius-2xl` | `calc(0.625rem * 1.8)` = 1.125rem (18px) | `rounded-2xl` | Feature panels |
| 3xl | `--radius-3xl` | `calc(0.625rem * 2.2)` = 1.375rem (22px) | `rounded-3xl` | Hero sections, large banners |
| 4xl | `--radius-4xl` | `calc(0.625rem * 2.6)` = 1.625rem (26px) | `rounded-4xl` | Pill-style containers |

To change the global roundness of the UI, update only `--radius` in `globals.css`. All computed tokens adjust automatically.

**Project radius value:** `[define — or confirm 0.625rem is correct]`

---

## Component Theming

### How The System Works

1. **CSS variables in `globals.css`** — All brand values live in the `:root` and `.dark` blocks. This is the only place colors should be changed.
2. **`@theme inline` block** — Maps CSS variables to Tailwind utility classes (e.g. `--color-primary: var(--primary)`). These mappings do **not** need to change when rebranding; they are structural wiring.
3. **Component files in `src/components/ui/`** — shadcn components reference Tailwind utilities like `bg-primary`, `text-foreground`, `border-border`. Because utilities map to CSS variables, components automatically reflect any changes made in step 1.
4. **Direct component edits** — Only edit component files in `src/components/ui/` for structural changes: layout, sizing, icon placement, added variants. Do not hardcode color values into component files.

### Workflow For Customization

```
1. Fill in this document (sections above)
2. Update :root values in globals.css
3. Update .dark values in globals.css
4. Verify changes in the browser with both light and dark mode active
5. Edit component files only if structural (non-color) changes are needed
6. Change this document's Status from "Template" to "Active"
```

### Adding A New Token

If a new semantic color is needed (e.g. `--success`):

1. Add the CSS variable to `:root` and `.dark` in `globals.css`
2. Add a mapping in the `@theme inline` block: `--color-success: var(--success);`
3. Document the token in the Brand Colors table above
4. Use it via the Tailwind utility `bg-success`, `text-success`, etc.

---

## Logo And Assets

### Naming Convention

All static brand assets follow the convention:

```
public/static/{namespace}-{element}-{l/d}.{ext}
```

- `{namespace}` — project or brand slug (e.g. `frontend-dev`, `acme`)
- `{element}` — asset type (e.g. `logo`, `icon`, `thumbnail`, `wordmark`)
- `{l/d}` — optional light/dark variant suffix (`-light`, `-dark`); omit if the asset is mode-neutral
- `{ext}` — file extension (`svg`, `png`, `webp`)

### Current Placeholder Assets

The following files are present in `public/static/` and should be replaced with branded versions before launch:

| File | Description | Replace With |
|---|---|---|
| `frontend-dev-logo.svg` | Full lockup (icon + wordmark), mode-neutral | `[define branded logo]` |
| `frontend-dev-icon-light.svg` | Icon mark, light mode | `[define branded icon, light]` |
| `frontend-dev-icon-dark.svg` | Icon mark, dark mode | `[define branded icon, dark]` |
| `frontend-dev-icon-light.png` | Raster icon, light mode (fallback / OG) | `[define branded icon PNG, light]` |
| `frontend-dev-thumbnail.png` | OG / social preview thumbnail | `[define branded thumbnail 1200x630]` |

> Update references to these assets in `src/app/layout.tsx` (metadata icons and OG images) once replacements are in place.
