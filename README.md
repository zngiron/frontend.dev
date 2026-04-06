# Front-End Development Framework

AI-guarded front-end framework. Next.js 16, Tailwind CSS 4, TypeScript.

---

## Quick Start

```bash
bun setup && bun dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Stack

| Technology | Purpose |
|---|---|
| Next.js 16 | App Router framework |
| TypeScript | Strict type safety |
| Tailwind CSS 4 | Utility-first styling |
| Biome | Linting + formatting |
| shadcn/ui | UI primitives |
| Zod | Schema validation |
| Sonner | Toast notifications |
| Bun | Package manager + runtime |
| Lefthook | Git hooks |
| Vitest + Playwright | Testing |

---

## Structure

```
src/       → Application source
docs/      → Architecture, conventions, design, decisions, guides
tests/     → Unit, integration, e2e
scripts/   → Developer automation
```

---

## Docs

| Document | Content |
|---|---|
| `docs/ARCHITECTURE.md` | System design, folder structure, layer boundaries |
| `docs/CONVENTIONS.md` | Naming, imports, coding patterns |
| `docs/DECISIONS.md` | Architecture decision records |
| `docs/DESIGN.md` | Brand, tokens, component theming |

11 guides in `docs/guides/`.

---

## Scripts

| Command | Action |
|---|---|
| `bun dev` | Dev server |
| `bun build` | Production build |
| `bun start` | Production server |
| `bun lint` | Biome linter |
| `bun format` | Biome formatter |
| `bun typecheck` | TypeScript check |
| `bun test` | Unit + integration tests |
| `bun test:watch` | Tests (watch mode) |
| `bun test:e2e` | Playwright e2e |
| `bun setup` | Install + configure env |

---

## License

MIT
