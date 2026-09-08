#!/usr/bin/env bash
# PreToolUse on Edit|Write: blocks edits to generated files. Exit 2 denies the
# tool call and shows the reason to Claude.
set -euo pipefail
source "$(dirname "$0")/_common.sh"
hook_read_file
if hook_is_generated; then
  printf '%s is generated. Edit the source and regenerate (build_runner, flutter gen-l10n, or swagger_parser); see .claude/rules/generated.md.\n' "$FILE" >&2
  exit 2
fi
exit 0
