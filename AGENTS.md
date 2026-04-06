# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

---

## Next.js 16 Breaking Changes

### Type Helpers

Next.js 16 provides generated route-typed props. Use them instead of manual types:

```ts
export default function Page(_: PageProps<'/'>) { ... }
export default function Layout({ children }: LayoutProps<'/'>) { ... }
```

These are auto-generated from the route tree. Do not define custom `PageProps` or `LayoutProps` types.

### Proxy Replaces Middleware

`middleware.ts` is replaced by `proxy.ts`. Export `proxy`, not `middleware`:

```ts
// src/proxy.ts
export async function proxy(request: NextRequest) { ... }
export const config = { matcher: [...] }
```

### Error Boundary

`reset` is replaced by `unstable_retry` in `error.tsx`:

```ts
export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) { ... }
```

### React Compiler

Enabled by default (`reactCompiler: true` in `next.config.ts`). No need for manual `useMemo`/`useCallback` optimization. The compiler handles memoization automatically.

### General Rule

When unsure about any Next.js API, check `node_modules/next/dist/docs/` first. Your training data may be outdated.

---

## MCP Servers

Available via Claude.ai integrations or project config.

| Server | Purpose | Setup |
|---|---|---|
| shadcn/ui | Browse, search, install components with accurate props | `.mcp.json` (project) |
| Supabase | Query DB, inspect schemas, manage migrations | Claude.ai integration |
| Vercel | Deploy, check logs, manage env vars | Claude.ai integration |
| Figma | Read designs, extract tokens, generate code | Claude.ai integration |

shadcn config in `.mcp.json`:

```json
{
  "mcpServers": {
    "shadcn": {
      "command": "npx",
      "args": ["shadcn@latest", "mcp"]
    }
  }
}
```
