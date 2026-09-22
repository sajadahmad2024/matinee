---
name: implement-screen
description: Implements one screen from a Figma frame using the Figma MCP server, resolving every colour, text style, spacing and component against docs/design/ and the existing theme before writing widgets, then runs the app and compares against the Figma screenshot until they match. Use when given a figma.com URL or node id to build as Flutter widgets, or asked to "implement this screen / design", "build the UI from Figma", or "match the design". Not for creating or updating designs inside Figma. The feature's data layer and cubit must already exist (create-feature); this skill owns the widget tree only.
argument-hint: "<figma-url> [feature]"
allowed-tools: Bash(dart *) Bash(flutter *)
---

# Implement screen

Turns a Figma frame into the `presentation/` widgets of a feature. Fidelity comes from two disciplines: resolve every design value against `docs/design/` and the theme before writing a widget, and look at the running app next to the design instead of guessing. Human review still gates the merge; one-pixel borders and shadow spreads slip through automated comparison.

## Invariants

`.claude/rules/presentation.md` and `dart-style.md` apply to every widget written here — the second one's comment cap included, since a semantics or layout decision is where comments run long. The Figma-specific rules on top of it:

- `docs/design/` is the source of truth (`README.md` there explains the files). The Figma file is evidence; values are not re-derived from it.
- No widget is written before the mapping table exists (step 2) and has no unresolved row. A value or component that is not in `docs/design/` is a **stop**: report it with the template in [references/figma-mapping.md](references/figma-mapping.md) and wait for the user. Never substitute, never add to `lib/core/theme/` unconfirmed, never put a literal in the widget.
- Data shapes come from the cubit state, which comes from the API spec. The design never adds a field; it can only decide which fields to show.
- The frame is one window size; the app runs on all of them. The app is dark-only. Components already mapped through Code Connect are reused, never rebuilt.

## Workflow

1. **Locate.** Call the Figma server's `get_metadata` for the file or node to list frames and their ids. Confirm the target frame with the user only when the URL points at a page rather than a frame. Find the frame in the component × screen matrix of `docs/design/design-component-catalogue.md`; that is the component list for the screen.
2. **Map.** Call `get_design_context` for the frame for structure, text, raw values and component instances. Build the mapping table per [references/figma-mapping.md](references/figma-mapping.md): each colour, text style, spacing, radius, elevation and component → its `docs/design/` entry → its theme target (`ColorScheme` role, `context.appColors` role, `TextTheme` role, `AppSpacing` value, component theme, existing widget). `get_variable_defs` adds little on this file (almost nothing is variable-bound) — call it, but the raw values are what you look up. Any row without an entry stops the task (see Invariants). A confirmed addition goes through the material-theming skill and into `docs/design/` in the same change.
3. **Reference image.** Call `get_screenshot` for the frame. Check `get_code_connect_map`: components already mapped to the app's widgets are used as those widgets, not rebuilt.
4. **Confirm the data.** If `lib/features/<feature>` does not exist, stop and run create-feature first; this skill never emits data-layer files. Open the feature's state class. Every text and image in the frame must trace to a field. If something is missing, stop and report it as a spec gap rather than inventing a field.
5. **Write the widgets.** `presentation/<feature>_screen.dart` and `presentation/widgets/`. Follow the component specs (anatomy, tokens, variants, states) from the catalogue. Layout per the responsive-adaptive skill: usually one `isExpanded` branch or a `ContentContainer`. Reusable pieces that two screens will share go to `core/widgets`, which is where every cross-feature widget lives: a widget carries no business knowledge, so `shared/` is not its home (`docs/decisions/architecture.md`).
6. **Run and compare.** Follow [references/verify-loop.md](references/verify-loop.md): launch the dev flavor through the Dart MCP server, navigate to the route, take a screenshot, place it next to the Figma screenshot, list the differences, fix, hot reload, repeat. Stop when only sub-pixel differences remain. Check `get_runtime_errors` is empty and the text scale at 1.3 does not overflow.
7. **Test.** Per `.claude/rules/testing.md`: a widget test with a mocked cubit for non-trivial rendering, a golden only for a new reusable component.
8. **Verify and review.** `flutter analyze --fatal-infos`, `flutter test test/features/<feature>`, then `/code-review`. Report the mapping table, any additions confirmed by the user, remaining known differences, and the screenshots compared.

## Emit checklist

- Mapping table in the task notes; every row resolved to a `docs/design/` entry; unresolved rows were raised with the user, not worked around
- No `Color(`, `TextStyle(`, or raw spacing literal in the new widgets; no value that is not in `docs/design/`
- No comment block over two lines: a decision that touches several arguments is explained on the line above each one, not in a paragraph above the `return`
- Components taken from the catalogue spec and reused where an implementation exists
- Screen renders on a phone and at an expanded width without overflow; `get_runtime_errors` empty
- Widget test for non-trivial rendering; analyze and tests clean; `/code-review` findings addressed
