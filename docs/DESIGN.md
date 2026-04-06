# Design

Brand guidelines and design tokens. **Must be completed before customizing shadcn component styling.**

**Status:** Template

---

## Gate

Until this document is filled in and status changed to `Active`, AI must not modify: component colors, typography, spacing beyond Tailwind defaults, or border radius values.

**Workflow:** Fill this doc → update `:root` and `.dark` in `globals.css` → verify both modes → edit components only for structural changes → change status to `Active`.

---

## Brand Colors

Format: `oklch(L C H)`. Alpha: `oklch(1 0 0 / 10%)`.

| Token | CSS Variable | Light | Dark | Usage |
|---|---|---|---|---|
| Primary | `--primary` / `--primary-foreground` | `[define]` | `[define]` | Buttons, links, active states |
| Secondary | `--secondary` / `--secondary-foreground` | `[define]` | `[define]` | Secondary actions, badges |
| Accent | `--accent` / `--accent-foreground` | `[define]` | `[define]` | Hover states, highlights |
| Destructive | `--destructive` | `[define]` | `[define]` | Errors, delete actions |
| Muted | `--muted` / `--muted-foreground` | `[define]` | `[define]` | Disabled, placeholders |
| Background | `--background` | `[define]` | `[define]` | Page background |
| Foreground | `--foreground` | `[define]` | `[define]` | Default text |
| Card | `--card` / `--card-foreground` | `[define]` | `[define]` | Card surfaces |
| Popover | `--popover` / `--popover-foreground` | `[define]` | `[define]` | Dropdowns, tooltips |
| Border | `--border` | `[define]` | `[define]` | Default borders |
| Input | `--input` | `[define]` | `[define]` | Form input borders |
| Ring | `--ring` | `[define]` | `[define]` | Focus rings |

Additional tokens: `--chart-1` through `--chart-5` for data viz. Sidebar tokens (`--sidebar-*`) available for sidebar-specific theming.

---

## Typography

### Fonts

| Role | CSS Variable | Default | Project Value |
|---|---|---|---|
| Heading | `--font-heading` | Geist Sans | `[define]` |
| Body | `--font-sans` | Geist Sans | `[define]` |
| Monospace | `--font-mono` | Geist Mono | `[define]` |

Loaded via `next/font` in `layout.tsx`. Variable names must match the `@theme inline` block in `globals.css`.

### Size Scale

Tailwind v4 defaults. Override only what diverges.

| Step | Class | Default |  Override |
|---|---|---|---|
| xs | `text-xs` | 12px | `[define or inherit]` |
| sm | `text-sm` | 14px | `[define or inherit]` |
| base | `text-base` | 16px | `[define or inherit]` |
| lg | `text-lg` | 18px | `[define or inherit]` |
| xl–5xl | `text-xl`–`text-5xl` | 20–48px | `[define or inherit]` |

### Weights

| Name | Class | Value | Usage |
|---|---|---|---|
| Regular | `font-normal` | 400 | Body |
| Medium | `font-medium` | 500 | Labels |
| Semibold | `font-semibold` | 600 | Subheadings |
| Bold | `font-bold` | 700 | Headings, CTAs |

---

## Spacing

Base unit: `[define — default: 0.25rem / 4px]`. Base font: `[define — default: 16px]`.

Uses Tailwind default scale unless overridden. Document deviations here.

---

## Border Radius

Single `--radius` root variable. All tokens computed from it.

**Current:** `--radius: 0.625rem` (10px). **Project value:** `[define or confirm]`

| Token | Computed | Class | Usage |
|---|---|---|---|
| sm | 6px | `rounded-sm` | Tags, badges |
| md | 8px | `rounded-md` | Inputs, small buttons |
| lg | 10px | `rounded-lg` | Cards, standard buttons |
| xl | 14px | `rounded-xl` | Large cards, modals |
| 2xl–4xl | 18–26px | `rounded-2xl`–`rounded-4xl` | Panels, heroes, pills |

Update only `--radius` in `globals.css` to change global roundness.

---

## Component Theming

**How it works:**
1. CSS variables in `globals.css` (`:root` + `.dark`) — only place to change colors
2. `@theme inline` block maps vars to Tailwind utilities — structural wiring, don't change on rebrand
3. shadcn components use utilities (`bg-primary`, `text-foreground`) — auto-reflect variable changes
4. Edit component files only for structural changes (layout, sizing, variants). No hardcoded colors.

**Adding a new token** (e.g. `--success`): add to `:root` + `.dark` → add `@theme inline` mapping → document in Brand Colors table → use via `bg-success`.

---

## Logo And Assets

| File | Description | Replace With |
|---|---|---|
| `frontend-dev-logo.svg` | Full lockup, mode-neutral | `[define]` |
| `frontend-dev-icon-light.svg` | Icon, light mode | `[define]` |
| `frontend-dev-icon-dark.svg` | Icon, dark mode | `[define]` |
| `frontend-dev-icon-light.png` | Raster icon, light (OG fallback) | `[define]` |
| `frontend-dev-thumbnail.png` | OG/social preview 1200x630 | `[define]` |

Update references in `layout.tsx` metadata once replacements are in place.
