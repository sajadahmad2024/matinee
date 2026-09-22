---
name: responsive-adaptive
description: Decision guide for multi-window Flutter layout using the template's lib/core/responsive helpers (compact / medium / expanded). Use when designing a page for phones and desktop at once, building the adaptive navigation shell (NavigationBar to NavigationRail), choosing a page's ContentContainer width, or adapting a page to pointer and keyboard input. Everyday layout rules load from .claude/rules/presentation.md; this skill is for the decisions.
argument-hint: "[page|shell|platform|error]"
---

# Responsive and adaptive layout

The helpers come from bootstrap: `WindowSize` and `Breakpoints` (600 and 840 dp), `context.windowSize`, `context.isCompact / isMedium / isExpanded`, `context.responsive(compact:, medium:, expanded:)`, and `ContentContainer`. Mobile and desktop are first-class; web is secondary. Add wider tiers only when a project ships wide desktop layouts, and when you do, change `isExpanded` to mean expanded or wider (`>=` on the enum index) or every existing `isExpanded` branch silently stops matching the new tiers.

## Decide

The everyday rules (branch on `isExpanded`, `ContentContainer` widths, `LayoutBuilder` for columns, no orientation lock) are in `.claude/rules/presentation.md`. The decisions that are not:

| Question | Answer |
|---|---|
| Two-pane or single pane? | Two panes only when the design has a wide variant; otherwise one pane inside `ContentContainer`. |
| How many grid columns? | `(constraints.maxWidth / minItemWidth).floor().clamp(1, maxColumns)` from a `LayoutBuilder` on the panel. |
| Bottom bar or rail? | `!isExpanded` bottom `NavigationBar`; `isExpanded` `NavigationRail`. |
| Dialog or full screen? | `isCompact` full-screen route; otherwise `showDialog` with a 560 max width. |
| Medium tier? | Compact layout unless the design gives medium its own; never let it fall into the expanded branch by accident. |

`isCompact` is not the inverse of `isExpanded`: medium satisfies neither. Branch on `isExpanded` and treat everything else as the compact layout unless the design gives medium its own.

## Adaptive navigation shell

The shell wraps the top-level routes through a `ShellRoute` (or `@TypedShellRoute`) so the router owns the selected destination. Both bars consume one list of destinations. See [references/adaptive-navigation.md](references/adaptive-navigation.md) for the shell widget, state preservation with `PageStorageKey` or `IndexedStack`, and pitfalls (a `NavigationRail` goes in a `Row`, never a `Column`).

## Pointer and keyboard

Behavioural, not layout, adaptation, gated on pointer presence rather than `Platform`. Project conventions: visible focus is a 2 dp `colorScheme.outline` border; `visualDensity: VisualDensity.adaptivePlatformDensity` is already set in `AppTheme`, so do not set density per widget; register `CallbackShortcuts` once at the page, not per widget.

## Verify

Run the app on a phone simulator and on macOS, drag the window across 600 and 840 dp, and check that the layout switches without overflow and that state survives the switch. The implement-screen skill drives this through the Dart MCP server.
