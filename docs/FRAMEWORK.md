# Framework

Runtime version truths for this codebase. Check this before using any version-sensitive API.

---

## Stack Versions

| Package | Version | Docs |
|---|---|---|
| Next.js | 16.2 | https://nextjs.org/docs |
| React | 19 | https://react.dev |
| TypeScript | 6.x (strict) | https://www.typescriptlang.org/docs |
| Tailwind CSS | 4 | https://tailwindcss.com/docs |
| Bun | 1.x | https://bun.sh/docs |
| shadcn/ui | latest | https://ui.shadcn.com/docs |
| Biome | latest | https://biomejs.dev |
| Zod | 4.x | https://zod.dev |

When unsure about any API, check `node_modules/next/dist/docs/` first. Training data may be outdated.

---

## Next.js 16

| Old | New | Reference |
|---|---|---|
| `middleware.ts` with `middleware` export | `proxy.ts` with `proxy` export | https://nextjs.org/docs/app/building-your-application/routing/middleware |
| `error.tsx` `reset` prop | `unstable_retry` prop | https://nextjs.org/docs/app/api-reference/file-conventions/error |
| Manual `PageProps` / `LayoutProps` types | Auto-generated `PageProps<'/route'>` and `LayoutProps<'/route'>` from route tree | https://nextjs.org/docs/app/api-reference/file-conventions/page |
| Manual `useMemo` / `useCallback` | React Compiler handles memoization (`reactCompiler: true` in `next.config.ts`) | https://nextjs.org/docs/app/api-reference/next-config-js/reactCompiler |

---

## React 19

| Old | New | Reference |
|---|---|---|
| `useFormState` (react-dom) | `useActionState` (react) | https://react.dev/reference/react/useActionState |
| `forwardRef` wrapper | `ref` is a regular prop | https://react.dev/blog/2024/12/05/react-19#ref-as-a-prop |
| `React.cache` namespace access | `import { cache } from 'react'` — still experimental, verify before use | https://react.dev/reference/react/cache |

---

## Tailwind CSS 4

| Old | New | Reference |
|---|---|---|
| `tailwind.config.js` / `tailwind.config.ts` | CSS-based config with `@theme` in `globals.css` | https://tailwindcss.com/docs/theme |
| Plugin system via JS | `@utility` and `@variant` directives in CSS | https://tailwindcss.com/docs/adding-custom-styles |
| `@apply` (discouraged) | Direct utility classes or `@utility` for custom utilities | https://tailwindcss.com/docs/adding-custom-styles |
