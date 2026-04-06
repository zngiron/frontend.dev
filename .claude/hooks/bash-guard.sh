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
