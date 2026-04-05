# Decisions

> **Purpose:** Architecture Decision Records for non-obvious choices in the Front-End Development Framework.
>
> **Last Updated:** 2026-04-06
>
> **Status:** Active

---

### ADR-001: Biome Over ESLint

**Status:** Accepted
**Date:** 2026-04-06

**Context:** The project needs a linting and formatting tool. ESLint combined with Prettier is the traditional choice in the JavaScript ecosystem, but it requires maintaining two separate tools, multiple configuration files, and a growing plugin dependency tree.

**Decision:** Use Biome as a single tool for both linting and formatting.

**Consequences:** Biome is Rust-based and significantly faster than ESLint + Prettier. It requires only a single configuration file and has no plugin ecosystem to maintain. It includes native TypeScript and JSX support out of the box. The trade-off is a smaller ecosystem than ESLint with fewer custom rules available.

---

### ADR-002: Hand-Rolled Zod Env Over t3-env

**Status:** Accepted
**Date:** 2026-04-06

**Context:** The project needs type-safe environment variable validation. `@t3-oss/env-nextjs` is a popular solution in the Next.js ecosystem and is purpose-built for this use case.

**Decision:** Use a hand-rolled Zod schema in `src/lib/env.ts` instead of adopting `@t3-oss/env-nextjs`.

**Consequences:** This eliminates one dependency from the project. Zod is already in the stack for form validation, so no new package is introduced. The validation capability is equivalent. The mental model is simpler — it is just a Zod schema with no framework-specific abstractions to understand or keep updated.

---

### ADR-003: Tier 1 And Tier 2 Dependency Split

**Status:** Accepted
**Date:** 2026-04-06

**Context:** The template needs to serve both simple one-page projects and enterprise-scale SaaS applications. Pre-installing every possible dependency makes the template bloated for simple projects, while omitting dependencies makes it inconsistent for larger ones.

**Decision:** Split dependencies into Tier 1 (pre-installed in the template) and Tier 2 (installed on demand via documented patterns).

**Consequences:** The template stays lean by default. Simple projects do not carry unused dependencies. Documentation ensures consistent integration patterns regardless of when a Tier 2 dependency is added. AI agents read `CLAUDE.md` to determine what is already installed versus what needs to be added before scaffolding any feature.

---

### ADR-004: No Barrel Exports

**Status:** Accepted
**Date:** 2026-04-06

**Context:** Barrel exports — `index.ts` files that re-export from an entire directory — are common in React projects as a way to create cleaner import paths.

**Decision:** Use direct imports only. No barrel files are created or permitted.

**Consequences:** Eliminating barrel files avoids circular dependency issues that are otherwise difficult to debug. It improves tree-shaking because bundlers can more accurately determine which exports are used. Imports become explicit and traceable: each import statement clearly identifies which file provides the export.

---

### ADR-005: Docs-Heavy Code-Minimal Template

**Status:** Accepted
**Date:** 2026-04-06

**Context:** The template must scale from a one-page marketing site to an enterprise application without requiring the developer to delete large amounts of boilerplate or dead code at the start of every project.

**Decision:** Ship minimal code with comprehensive documentation. AI agents read the docs to scaffold features on demand rather than shipping pre-built feature code.

**Consequences:** There is no dead code to clean up at project start. Every project begins from a clean, minimal baseline. The documentation serves as the single source of truth for patterns and conventions. The trade-off is that the first instance of a given feature takes slightly longer to generate since the AI must scaffold it from documentation rather than copying existing code.

---

### ADR-006: Static Assets Over Dynamic Icon Generation

**Status:** Accepted
**Date:** 2026-04-06

**Context:** Next.js 16 supports both static favicon files placed in the `public/` directory and dynamic icon generation via `app/icon.tsx`. Both approaches are valid for most use cases.

**Decision:** Use static files in `public/static/` with the `{namespace}-{element}-{l/d}` naming convention for light and dark variants.

**Consequences:** Static files provide full design control and support SVG (not only PNG). The naming convention aligns with the rest of the project's asset naming patterns. Static files enable light/dark favicon switching via CSS media queries. The trade-off is that assets must be manually created and exported rather than generated programmatically.

---

### ADR-007: Lefthook Over Husky

**Status:** Accepted
**Date:** 2026-04-06

**Context:** The project needs git hooks to enforce pre-commit linting and commit message validation. Husky is the most widely used tool for this in the JavaScript ecosystem.

**Decision:** Use Lefthook instead of Husky.

**Consequences:** Lefthook eliminates the `.husky/` directory and shell script boilerplate. It uses a YAML configuration file which is simpler to read and maintain than individual shell scripts. It works natively with Bun without additional configuration. All hooks are defined in a single configuration file, reducing the overhead of managing multiple hook scripts.
