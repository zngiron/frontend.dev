# Styling

Tailwind, shadcn/ui, and class ordering rules.

---

## Rules

- Prefer predefined Tailwind classes over arbitrary values (`text-sm` not `text-[14px]`).
- Arbitrary values allowed with `rem`, `em`, `%`, `vw`, `vh`, `dvh`, `svh`, `clamp()` — never `px`.

## `cn()` Usage

- Use for dynamic/conditional classes or to group classes by sort order.
- No `cn()` if all classes belong to a single group (just use a plain string).
- Each group is a separate string argument: `cn('positioning', 'display', 'box-model', 'typography')`.

## Class Sort Order

Sort within each group too.

1. **Top-level** — `container`, `group`
2. **Positioning** — position, coordinates (`inset-*`, `top-*`, etc.), stacking (`z-*`)
3. **Display** — type, flex, grid, alignment (`items-*`, `justify-*`, `gap-*`)
4. **Box model** — size, padding, margin, border, visual (`shadow-*`, `opacity-*`), overflow
5. **Background** — `bg-*`, gradients
6. **Typography** — font, text, decoration, wrapping
7. **Animation** — transition, transform, animate
8. **States** — interaction (`cursor-*`), variants (`hover:`, `focus:`, etc.), group/peer, children
9. **Responsive** — `sm:`, `md:`, `lg:`, `xl:`, `2xl:`
10. **Dark mode** — `dark:`

## Custom Utilities

Defined via `@utility` in `globals.css`.

- `safe-top`, `safe-bottom`, `safe-left`, `safe-right` — padding for device safe areas
- `no-scrollbar` — hide scrollbar while keeping scroll functionality
- `no-tap-highlight` — remove mobile tap flash
- `touch-scroll` — smooth momentum scrolling on mobile
- `full-bleed` — break out of container to span full viewport width
