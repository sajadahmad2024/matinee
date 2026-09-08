#!/usr/bin/env bash
# PostToolUse on Edit|Write: analyzes the edited Dart file. Warnings are
# failures and so are lints (--fatal-infos). Exit 2 shows the analyzer output to Claude so the file gets fixed.
set -euo pipefail
source "$(dirname "$0")/_common.sh"
hook_read_file
hook_require_dart_package
if hook_is_generated; then
  exit 0
fi
[ -f "$FILE" ] || exit 0
cd "$PKG"
if ! out=$(dart analyze --fatal-infos "$FILE" 2>&1); then
  printf 'dart analyze found issues in %s:\n%s\n' "$FILE" "$out" >&2
  exit 2
fi
