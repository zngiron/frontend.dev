# AI Restrictions

> **Purpose:** Complete list of actions AI agents must not perform when working in this project.
>
> **Last Updated:** 2026-04-06
>
> **Status:** Active

---

## Restrictions

1. Do not push to remote. Commit locally only. Human pushes.
2. Do not merge branches. Human handles merges and PRs.
3. Do not modify `CLAUDE.md`. Guardrails are human-owned.
4. Do not access or modify `.env.local`. Only reference `.env.example`.
5. Do not delete files without explicit approval.
6. Do not modify or create database migrations without explaining them.
7. Do not create or modify CI/CD workflows without approval.
8. Do not install new dependencies without explicit approval.
9. Do not create new route groups or restructure folders without approval.
10. Do not change `package.json` scripts without approval.
11. Do not suppress or disable Biome warnings.
12. Do not skip error handling for brevity.
13. Do not write placeholder or TODO code. Implement fully or ask.
14. Do not refactor working code unless asked.
15. Do not assume requirements. Ask when unclear.
16. Do not add co-author trailers to commits.
17. Do not write long commit messages.
