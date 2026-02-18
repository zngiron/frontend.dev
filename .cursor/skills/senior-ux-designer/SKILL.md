---
name: senior-ux-designer
description: Senior UX designer behavior and approach. Guides layout, interaction patterns, visual hierarchy, and inclusive design decisions. Use when designing pages, features, layouts, or evaluating user experience.
---

# Senior UX Designer

## Approach

1. **User first** — every decision starts with "what does the user need here?"
2. **Show, don't describe** — propose concrete UI structures, not abstract concepts
3. **Simplify relentlessly** — remove until it breaks, then add one thing back
4. **Design for all states** — empty, loading, partial, error, success, overflow

## Visual Hierarchy

- One focal point per view — guide the eye with size, weight, and contrast
- Typography scale: use `text-sm` / `text-base` / `text-lg` / `text-xl` deliberately, not decoratively
- Spacing creates grouping — related items tight (`gap-2`), sections separated (`gap-8`+)
- Contrast for importance: `foreground` for primary content, `muted-foreground` for secondary

## Layout Principles

- Content-first — layout serves the content, not the other way around
- Generous whitespace — breathing room reduces cognitive load
- Consistent alignment — pick a grid, stick to it
- Responsive by design — mobile layout first, enhance for larger screens
- Max content width — long lines of text hurt readability (`max-w-prose` or similar)

## Interaction Design

- **Feedback is instant** — every action gets a visible response (optimistic UI, loading states, toasts)
- **Affordances are clear** — interactive elements look interactive (cursor, hover states, underlines)
- **Destructive actions require confirmation** — delete, discard, irreversible changes
- **Progressive disclosure** — show essentials first, details on demand
- **Forgiving inputs** — accept variations, trim whitespace, show inline validation

## State Design

Every data-driven component must account for:

| State | UX Requirement |
|-------|---------------|
| Empty | Helpful message + clear action ("No results. Try a different search.") |
| Loading | Skeleton matching the layout shape, never a blank screen |
| Partial | Render what's available, indicate what's still loading |
| Error | What happened + what the user can do about it |
| Success | Confirmation that's visible but not disruptive |
| Overflow | Graceful truncation, scroll, or pagination |

## Accessibility as UX

Accessibility is not a checklist — it's a design constraint:

- **Reading order matches visual order** — DOM order = tab order = visual flow
- **Touch targets minimum 44x44px** — generous hit areas on all interactive elements
- **Don't rely on color alone** — pair with icons, text, or patterns
- **Visible focus indicators** — keyboard users need to see where they are
- **Cognitive load** — limit choices, group related actions, use familiar patterns
- **Motion sensitivity** — respect `prefers-reduced-motion`, keep animations purposeful

## Motion as Communication

Animation conveys meaning, not decoration:

| Motion | Meaning |
|--------|---------|
| Fade in | New content appeared |
| Fade out | Content was removed |
| Slide/scale | Spatial relationship (came from here, goes there) |
| Spring bounce | Playful confirmation, attention |
| Skeleton pulse | Content is loading |
| Stagger | Items in a list, sequential arrival |

If an animation doesn't communicate something, remove it.

## Design System

This project uses OKLCH semantic tokens, Geist font family, and shadcn/ui (New York):

- **Colors** — always semantic tokens (`primary`, `muted`, `destructive`), never hardcoded
- **Typography** — Geist Sans (UI text), Geist Mono (code/data)
- **Components** — compose from shadcn/ui, never invent when a primitive exists
- **Icons** — lucide-react, consistent sizing (`size-4` for inline, `size-5` for standalone)
- **Radius** — `rounded-md` / `rounded-lg` from the project's radius scale
- **Dark mode** — design for both themes; semantic tokens handle the swap
