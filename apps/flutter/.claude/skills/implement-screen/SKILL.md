---
name: implement-screen
description: Implements one screen from a Figma frame using the Figma MCP server, mapping every design variable onto the existing theme before writing widgets, then runs the app and compares against the Figma screenshot until they match. Use when given a figma.com URL or node id to build as Flutter widgets, or asked to "implement this screen / design", "build the UI from Figma", or "match the design". Not for creating or updating designs inside Figma. The feature's data layer and cubit must already exist (create-feature); this skill owns the widget tree only.
argument-hint: "<figma-url> [feature]"
allowed-tools: Bash(dart *) Bash(flutter *)
---

# Implement screen

Turns a Figma frame into the `presentation/` widgets of a feature. Fidelity comes from two disciplines: map every design token to the theme before writing a widget, and look at the running app next to the design instead of guessing. Human review still gates the merge; one-pixel borders and shadow spreads slip through automated comparison.

## Invariants

`.claude/rules/presentation.md` applies to every widget written here. The Figma-specific rules on top of it:

- No widget is written before the variable mapping table exists (step 2). Unmapped variables are the review checklist.
- Data shapes come from the cubit state, which comes from the API spec. The design never adds a field; it can only decide which fields to show.
- The frame is one window size; the app runs on all of them. Components already mapped through Code Connect are reused, never rebuilt.

## Workflow

1. **Locate.** Call the Figma server's `get_metadata` for the file or node to list frames and their ids. Confirm the target frame with the user only when the URL points at a page rather than a frame.
2. **Map variables.** Call `get_variable_defs` for the frame. Build the mapping table from [references/figma-mapping.md](references/figma-mapping.md): each colour, text style, spacing, radius and elevation variable to a `ColorScheme` role, `TextTheme` role, `AppSpacing` value or component theme property. Anything with no fit is a proposed addition to `core/theme`; make those additions first, with the material-theming skill's procedures.
3. **Read the design.** Call `get_design_context` for the frame for structure, text and component instances, and `get_screenshot` for the reference image. Check `get_code_connect_map`: components already mapped to the app's widgets are used as those widgets, not rebuilt.
4. **Confirm the data.** If `lib/features/<feature>` does not exist, stop and run create-feature first; this skill never emits data-layer files. Open the feature's state class. Every text and image in the frame must trace to a field. If something is missing, stop and report it as a spec gap rather than inventing a field.
5. **Write the widgets.** `presentation/<feature>_screen.dart` and `presentation/widgets/`. Layout per the responsive-adaptive skill: usually one `isExpanded` branch or a `ContentContainer`. Reusable pieces that two screens will share go to `shared/widgets`.
6. **Run and compare.** Follow [references/verify-loop.md](references/verify-loop.md): launch the dev flavor through the Dart MCP server, navigate to the route, take a screenshot, place it next to the Figma screenshot, list the differences, fix, hot reload, repeat. Stop when only sub-pixel differences remain. Check `get_runtime_errors` is empty and the text scale at 1.3 does not overflow.
7. **Test.** Per `.claude/rules/testing.md`: a widget test with a mocked cubit for non-trivial rendering, a golden only for a new reusable component.
8. **Verify and review.** `flutter analyze --fatal-infos`, `flutter test test/features/<feature>`, then `/code-review`. Report the mapping table, remaining known differences, and the screenshots compared.

## Emit checklist

- Mapping table in the task notes; no unmapped variable left silently
- No `Color(`, `TextStyle(`, or raw spacing literal in the new widgets
- Screen renders on a phone and at an expanded width without overflow; `get_runtime_errors` empty
- Widget test for non-trivial rendering; analyze and tests clean; `/code-review` findings addressed
