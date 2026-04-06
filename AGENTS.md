# This is NOT the Next.js you know

This version has breaking changes. Check `docs/FRAMEWORK.md` for version truths and breaking changes before writing any code. Check `node_modules/next/dist/docs/` when unsure about any Next.js API.

---

## References

- Framework versions and breaking changes: `docs/FRAMEWORK.md`
- Architecture and file structure: `docs/ARCHITECTURE.md`
- Coding conventions: `docs/CONVENTIONS.md`
- Design and shadcn gate: `docs/DESIGN.md`
- Styling and class ordering: `docs/STYLING.md`
- AI restrictions: `docs/AI-RESTRICTIONS.md`

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
