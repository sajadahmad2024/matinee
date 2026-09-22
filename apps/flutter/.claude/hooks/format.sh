#!/usr/bin/env bash
# PostToolUse on Edit|Write: formats the edited Dart file in place.
set -euo pipefail
source "$(dirname "$0")/_common.sh"
hook_read_file
hook_require_dart_package
if hook_is_generated; then
  exit 0
fi
[ -f "$FILE" ] || exit 0
cd "$PKG"
dart format "$FILE" >/dev/null
