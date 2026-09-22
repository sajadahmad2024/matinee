#!/usr/bin/env bash
# Shared by the hook scripts. Reads the hook's stdin JSON and exports FILE (the
# edited path) and PKG (the nearest directory above it with a pubspec.yaml).
# Each helper exits 0 early when the tool call is not one the hook cares about,
# so the same scripts work whether the app is the repo root or a monorepo app.
set -euo pipefail

hook_read_file() {
  local input
  input=$(cat)
  FILE=$(printf '%s' "$input" | python3 -c 'import json, sys
try:
    print(json.load(sys.stdin).get("tool_input", {}).get("file_path", ""))
except Exception:
    print("")')
  [ -n "$FILE" ] || exit 0
}

hook_require_dart_package() {
  case "$FILE" in
    *.dart) ;;
    *) exit 0 ;;
  esac
  PKG=$(dirname "$FILE")
  while [ "$PKG" != "/" ] && [ ! -f "$PKG/pubspec.yaml" ]; do
    PKG=$(dirname "$PKG")
  done
  [ -f "$PKG/pubspec.yaml" ] || exit 0
}

hook_is_generated() {
  case "$FILE" in
    *.g.dart|*.freezed.dart|*/l10n/gen/*|*/core/api/generated/*|*/generated_plugin_registrant.*|*GeneratedPluginRegistrant*) return 0 ;;
    *) return 1 ;;
  esac
}
