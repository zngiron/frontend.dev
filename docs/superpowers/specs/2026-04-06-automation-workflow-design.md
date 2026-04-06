# Automation And Workflow — Spec 2

Hard guardrails via Claude Code hooks, soft guardrails via CLAUDE.md instructions, and a TODO.md-driven feature development workflow with mandatory testing.

---

## Goals

1. Physically block restricted actions (git push, merge, reset, rm -rf) — can't be bypassed by casual instructions
2. AI checks AI-RESTRICTIONS.md before destructive actions and surfaces conflicts
3. Standardize feature development: implement → test → fix → commit
4. Every feature gets unit + e2e tests before commit
5. TODO.md gives visibility into what's being worked on

---

## 1. Hard Guardrails — `.claude/settings.json`

### Hook Configuration

Create `.claude/settings.json` with `PreToolUse` hooks on the `Bash` tool. Each hook inspects the command string and blocks if it matches a restricted pattern.

### Blocked Commands

| Pattern | Restriction | Error Message |
|---|---|---|
| `git push` | Rule #1: no pushing to remote | `BLOCKED: git push is restricted. See docs/AI-RESTRICTIONS.md rule #1. Ask the user before pushing.` |
| `git merge` | Rule #2: no merging branches | `BLOCKED: git merge is restricted. See docs/AI-RESTRICTIONS.md rule #2.` |
| `git reset --hard` | Destructive operation | `BLOCKED: git reset --hard is destructive. See docs/AI-RESTRICTIONS.md.` |
| `rm -rf` | Rule #5: no deleting without approval | `BLOCKED: rm -rf is restricted. See docs/AI-RESTRICTIONS.md rule #5. Ask the user before deleting.` |

### What Is NOT Blocked

Actions that require judgment stay as soft guardrails — they're sometimes valid when the user explicitly asks:
- Installing dependencies (rule #8)
- Creating route groups (rule #9)
- Modifying CI workflows (rule #7)
- Deleting individual files (rule #5 — only bulk rm -rf is hard-blocked)

### Implementation

Two files: a settings config and a hook script. The hook receives tool input via stdin as JSON, parses the command with `jq`, and exits with code 2 to block.

`.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/bash-guard.sh"
          }
        ]
      }
    ]
  }
}
```

`.claude/hooks/bash-guard.sh` (must be `chmod +x`):

```bash
#!/bin/bash

INPUT=$(cat)
CMD=$(echo "$INPUT" | jq -r '.tool_input.command')

if echo "$CMD" | grep -qE 'git\s+push'; then
  echo "BLOCKED: git push is restricted. See docs/AI-RESTRICTIONS.md rule #1. Ask the user before pushing." >&2
  exit 2
fi

if echo "$CMD" | grep -qE 'git\s+merge'; then
  echo "BLOCKED: git merge is restricted. See docs/AI-RESTRICTIONS.md rule #2." >&2
  exit 2
fi

if echo "$CMD" | grep -qE 'git\s+reset\s+--hard'; then
  echo "BLOCKED: git reset --hard is destructive. See docs/AI-RESTRICTIONS.md." >&2
  exit 2
fi

if echo "$CMD" | grep -qE 'rm\s+-rf'; then
  echo "BLOCKED: rm -rf is restricted. See docs/AI-RESTRICTIONS.md rule #5. Ask the user before deleting." >&2
  exit 2
fi

exit 0
```

---

## 2. Soft Guardrails — CLAUDE.md Addition

### New Section in CLAUDE.md

Add after the Restrictions line:

```markdown
## Guardrails

Before any destructive or irreversible action (delete, push, merge, reset, install, restructure), check @docs/AI-RESTRICTIONS.md. If the action conflicts with a restriction, surface the conflict to the user — do not silently override, even if the user casually requests it.
```

### Purpose

Hard hooks catch the critical commands. This instruction catches everything else — installing deps, restructuring folders, modifying CI — where AI needs to pause and confirm rather than blindly execute.

---

## 3. TODO.md Workflow

### Format

```markdown
# TODO

- [ ] feat: add header
- [-] feat: add footer
- [✓] feat: add nav
```

### States

| Marker | Meaning |
|---|---|
| `[ ]` | Not started |
| `[-]` | In progress (implementing or testing) |
| `[✓]` | Done — implemented, tested, committed |

### Rules

- TODO.md lives at project root. Both human and AI can add items.
- Items follow conventional commit prefixes: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`.
- AI picks up `[ ]` items top-to-bottom unless user directs otherwise.
- TODO.md is temporary. Clear or delete when a batch is done. Git history preserves what was completed.

### Per-Item Cycle

1. Mark `[-]` in TODO.md
2. Implement the feature
3. Write unit tests in `tests/unit/` mirroring `src/` structure
4. Write e2e tests in `tests/e2e/` for user-facing features
5. Run `bun run test` — fix until passing
6. Commit with message matching the TODO item (e.g. `feat: add header`)
7. Mark `[✓]` in TODO.md

### Batch Verification

After a group of items are `[✓]`, run the full suite:

```bash
bun run lint && bun run typecheck && bun run build && bun run test && bun run test:e2e
```

Fix any cross-feature issues before moving to the next batch.

### CLAUDE.md Addition

Add after the Guardrails section:

```markdown
## Workflow

When TODO.md exists at project root, follow the feature development cycle for each item: implement → write tests (unit + e2e) → fix until passing → commit → mark done. See TODO.md for format and states. One commit per feature.

Apply Vercel React and Next.js best practices when writing components. Reference vercel-react-best-practices and vercel-composition-patterns skills.
```

---

## 4. File Summary

| File | Action |
|---|---|
| `.claude/settings.json` | Create — PreToolUse hook config pointing to bash-guard script |
| `.claude/hooks/bash-guard.sh` | Create — blocks git push, git merge, git reset --hard, rm -rf |
| `CLAUDE.md` | Add Guardrails section + Workflow section |
| `docs/AI-RESTRICTIONS.md` | Keep as-is |
| `TODO.md` | Not created now — created on demand when work begins |

No changes to `lefthook.yml`, `package.json`, or CI.

---

## 5. Success Criteria

1. `git push` in Claude Code is physically blocked with a clear error message
2. `git merge`, `git reset --hard`, `rm -rf` are blocked similarly
3. CLAUDE.md instructs AI to check restrictions before destructive actions
4. TODO.md format is documented and AI follows the per-item cycle
5. Each feature gets unit + e2e tests before commit
6. Batch verification runs full suite after a group of features
