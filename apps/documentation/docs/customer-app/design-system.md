# Customer App — Design System

The consumer (Flutter) app's design tokens and component catalogue live **inside the app**, next to the Claude Code skills that consume them, so they load with the codebase and can be referenced by relative path:

- `apps/flutter/docs/design/README.md` — how to use the docs; the reuse-first / confirm-before-adding rule
- `apps/flutter/docs/design/design-system.md` — colour primitives, `ColorScheme` mapping, app colour roles, gradients, typography roles, layout scales, component states, icon strategy, decisions log, open items
- `apps/flutter/docs/design/design-component-catalogue.md` — 81 components with anatomy, tokens, variants, states, Figma evidence and screen usage
- `apps/flutter/docs/design/design-system.json` — machine-readable twin

Source: Figma `vVGHTFgrIRYQBTZaRZCYe0`, page **Visuals** (final; the "Visuals (For Dev)" page is an older draft and is not used). The app is dark-only.

This page is a pointer only, so there is a single source of truth. Edit the files in `apps/flutter/docs/design/`, not here.
