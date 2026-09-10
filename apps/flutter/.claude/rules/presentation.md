---
paths:
  - "**/lib/**/presentation/**/*.dart"
  - "**/lib/core/theme/**/*.dart"
  - "**/lib/core/responsive/**/*.dart"
  - "**/lib/core/widgets/**/*.dart"
  - "**/lib/app/**/*.dart"
---

# Presentation conventions

## Theme

- `ThemeData` is the single source of truth in code, and `docs/design/` (design-system.md, design-component-catalogue.md, design-system.json) is the source of truth for what the theme contains. Colours come from `Theme.of(context).colorScheme`, app roles and gradients from `context.appColors`, text styles from `Theme.of(context).textTheme`. No `Colors.x`, no `Color(0xFF...)`, no inline `TextStyle`, no brightness checks in widgets. The app is dark-only.
- A value or component that is not in `docs/design/` is a stop, not a judgment call: report what is missing and confirm with the user before anything is added to the theme or the docs. Never a "close enough" hex, size or Material default in its place.
- Spacing is `AppSpacing.*` only; the scale mirrors `docs/design/design-system.md` §6 and is not extended from a widget. `Column(spacing:)` and `Row(spacing:)` over `SizedBox` gaps. `EdgeInsets.symmetric` or `.only`, never `.fromLTRB`.
- Component styling lives in `AppTheme`, not on widget instances. `FilledButton` is the default button; `ElevatedButton` is not used.
- A new semantic colour is a field on `AppColors` (with `copyWith` and `lerp`), not a constant near the widget. A Figma value maps to its `docs/design/` entry — `ColorScheme` role, `AppColors` role, `TextTheme` role or `AppSpacing` value — via `.claude/skills/implement-screen/references/figma-mapping.md`; a token is added only after the user confirms it is missing, and then to the docs and the theme together.

## Strings

- Every user-facing string is `context.l10n.key` from `lib/l10n/arb/app_en.arb`. The only literal string in the app is inside `BootstrapErrorApp`.
- Shared widgets take strings as parameters; they never read `AppLocalizations` themselves.
- Failure messages come from `error.localizedMessage(context.l10n)`; screens do not compose their own error text.
- Side-dependent layout uses `EdgeInsetsDirectional`, `AlignmentDirectional`, `PositionedDirectional`.

## Navigation

- Routes are `GoRouteData` classes with `@TypedGoRoute` in `app/router/app_routes.dart`; navigate with `const SomeRoute().go(context)` or `SomeRoute(id: x).push(context)`. Never a literal path string, never `goNamed`, never `Navigator.push`. A typed route's `.location` is the one acceptable string.
- Identifiers in the path, filters in query parameters, never `extra`. Path segments use hyphens (`/order-history`), never underscores or camelCase.
- A detail route nests under its parent (`/orders` then `orders/:id`) so the app bar back button and URLs come out right; flat sibling routes are a review finding.
- `go()` by default; `push()` only when awaiting a result.
- Guards are `redirect` clauses reading a repository or cubit; widgets never decide access.

## Layout

- Layout switches on `context.windowSize` (compact, medium, expanded), never on platform, device type or `MediaQuery.of(context).size`. `context.isExpanded` else compact covers most screens.
- Branch high, stay const low: decide layout once near the top of a page and keep subtrees `const`. `context.responsive(compact: ..., expanded: ...)` for the few values that vary.
- Page bodies sit in `ContentContainer` so they do not stretch on wide windows: 560 for forms, 720 for reading, 1080 general.
- Column counts inside a panel come from `LayoutBuilder`, not window width.
- Never lock orientation.

## Accessibility baseline

The app targets WCAG 2.2 AA on mobile; `docs/decisions/accessibility.md` records why, and the Flutter behaviours these rules exist because of.

- Tap targets are `InkWell`, `IconButton`, `FilledButton`, `TextButton`; never a bare `GestureDetector` for actions. Minimum 48x48 dp. A control the design draws smaller keeps the 48 in layout and paints the smaller box inside it; the difference comes off the surrounding gap. On a screen margin that means the overhang is pulled back into the margin — a target laid flush with the margin paints its control *inside* the content's edge, which reads as a misalignment — and the row that follows adds no gap of its own, because the trailing overhang already is one.
- Every `Image` has `semanticLabel` or `excludeFromSemantics: true`; every icon-only button has a `tooltip`, which is a valid accessible name. A `DecorationImage` contributes nothing to the tree, so a meaningful one is wrapped in `Semantics(image: true, label:)`.
- Colour is never the only signal; pair with text, an icon, or a semantics flag (`selected`, `enabled`, `expanded`).
- Text containers have no fixed height, and every screen and sheet scrolls **only once its content does not fit**. A scroll view lays its `padding` out around the child, so a `minHeight` of the full viewport must have that padding subtracted or the screen is permanently scrollable by exactly that gap — which also clips any glow the last child paints outside its box. A flexible child cannot live in a shrink-wrapping column: use `mainAxisAlignment: spaceBetween`, not `Expanded`, inside a scroll view. `ContentContainer` takes `shrinkWrapHeight: true` inside a sheet.
- A field in a row stretched to give a neighbouring control full height needs `expands: true`, `maxLines: null` and `textAlignVertical: center` together, or its value sits against the top edge. Sizing the field to its text instead centres the value but shrinks its tap target to the text's height.
- Animations check `MediaQuery.disableAnimationsOf(context)` — page controllers included, where the gate is `jumpToPage`.
- One `ScreenTitle` per screen, `SectionLabel` for the sections under it. Both read their label from the semantics, because the design sets titles and eyebrows in upper case and screen readers spell short capitalised runs out.
- Loading is `LoadingView` and failure is `ErrorView`; Flutter announces neither on its own. Snackbars need nothing — `SnackBar` and `InputDecoration`'s error text are already live regions.
- Never put `SemanticsRole.alert` or `SemanticsRole.status` on a widget the framework already marks live (`SnackBar`, `InputDecoration` error and counter, `MaterialBanner`, `ExpansionTile`, `CalendarDatePicker`): a node cannot hold both, and the assertion only fires with a screen reader running. Read the widget's source before adding a role.
- A flow that shows a message or swaps a screen in place needs a test with `ensureSemantics()` and `pumpAnnouncement(tester)`; without semantics enabled, no role or live-region defect is visible at all.
- A field whose label the design draws outside its frame takes `Semantics(label:)` and **never** `textField: true`, which splits it into two focus stops. It sets its own `validationResult`; `errorText` does not.
- A `Semantics` block that groups several texts into one label and is not itself a control needs `container: true`, or it merges into its ancestor along with its siblings.
- A `Semantics` that sets `excludeSemantics: true` over a control **must forward `onTap:` as well**: excluding the subtree takes the `InkWell`'s tap action with it, leaving a node a screen reader can reach and cannot activate. The same holds for `IconButton`, `TextButton`, `OutlinedButton` and `FilledButton` children.
- `textContrastGuideline` also reads the semantics tree, so it cannot see text inside `excludeSemantics: true` — which is how every card here composes its spoken label. Contrast is therefore asserted against the theme's roles in `test/core/theme/contrast_test.dart`, and a new text or icon role has to clear 4.5:1 (3:1 for a glyph) on every surface it can be painted on. `text.disabled` and `icon.disabled` are the only exceptions, because WCAG exempts the label of an inactive control — never use either for content.
- Guideline checks are necessary, not sufficient: `labeledTapTargetGuideline` skips text fields, so a field's name needs its own assertion. All three tap-target and labelling guidelines only visit nodes that already carry a tap or long-press action, so an excluded control passes every one of them — `expectControlsAreActivatable` covers that blind spot and runs inside `expectMeetsGuidelines`. Every screen test ends with `expectMeetsGuidelines(tester)` from `test/helpers`.

Run `/accessibility` for a WCAG-level audit before a release.

## State in widgets

- Screens are `BlocProvider` + a private view widget. The view switches exhaustively on the sealed state: `Initial` renders `SizedBox.shrink()`, `Loading` a `LoadingView`, `Failure` an `ErrorView` with a retry.
- `BlocBuilder` for rendering, `BlocListener` for one-shot effects (snackbars, navigation). No business logic in `build`.
- The `GoRouter` is built once in `_AppViewState.initState` and never inside `build`; `BlocBuilder<ThemeCubit>` passes theme properties into the existing `MaterialApp.router`, it never returns a new one.
