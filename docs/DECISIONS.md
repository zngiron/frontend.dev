# Decisions

Architecture Decision Records for non-obvious choices in the project.

---

### ADR-001: Biome Over ESLint

**Decision:** Biome for linting and formatting (replaces ESLint + Prettier).

**Why:** Rust-based, significantly faster. Single config file. Native TypeScript/JSX support. No plugin ecosystem to maintain. Trade-off: smaller ecosystem, fewer custom rules.

---

### ADR-002: Hand-Rolled Zod Env Over t3-env

**Decision:** Zod schema in `src/lib/env.ts` instead of `@t3-oss/env-nextjs`.

**Why:** Eliminates a dependency. Zod is already in the stack. Equivalent capability with a simpler mental model — just a Zod schema, no framework abstraction.

---

### ADR-003: Tier 1 And Tier 2 Dependency Split

**Decision:** Tier 1 = pre-installed. Tier 2 = installed on demand via documented patterns.

**Why:** Template stays lean. Simple projects skip unused deps. Docs ensure consistent integration regardless of when Tier 2 deps are added. AI reads `CLAUDE.md` to know what's installed.

---

### ADR-004: No Barrel Exports

**Decision:** Direct imports only. No `index.ts` re-export files.

**Why:** Avoids circular dependencies. Improves tree-shaking. Every import explicitly identifies its source file.

---

### ADR-005: Docs-Heavy Code-Minimal Template

**Decision:** Ship minimal code, comprehensive docs. AI scaffolds features from docs on demand.

**Why:** No dead code to clean up. Clean baseline for every project. Trade-off: first feature scaffold is slightly slower since AI generates from docs rather than copying existing code.

---

### ADR-006: Static Assets Over Dynamic Icon Generation

**Decision:** Static files in `public/static/` with `{namespace}-{element}-{l/d}` naming.

**Why:** Full design control, SVG support, light/dark switching via CSS media queries. Aligns with project asset naming conventions. Trade-off: manual creation vs programmatic generation.

---

### ADR-007: Lefthook Over Husky

**Decision:** Lefthook for git hooks.

**Why:** Single YAML config replaces `.husky/` directory and shell scripts. Works natively with Bun. Simpler to read and maintain.
