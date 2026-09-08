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

- Tap targets are `InkWell`, `IconButton`, `FilledButton`, `TextButton`; never a bare `GestureDetector` for actions. Minimum 48x48 dp.
- Every `Image` has `semanticLabel` or `excludeFromSemantics: true`; every icon-only button has a `tooltip`.
- Colour is never the only signal; pair with text or an icon.
- Text containers have no fixed height. Animations check `MediaQuery.disableAnimationsOf(context)`.

Run `/accessibility` for a WCAG-level audit before a release.

## State in widgets

- Screens are `BlocProvider` + a private view widget. The view switches exhaustively on the sealed state: `Initial` renders `SizedBox.shrink()`, `Loading` a `CircularProgressIndicator`, `Failure` an `ErrorView` with a retry.
- `BlocBuilder` for rendering, `BlocListener` for one-shot effects (snackbars, navigation). No business logic in `build`.
- The `GoRouter` is built once in `_AppViewState.initState` and never inside `build`; `BlocBuilder<ThemeCubit>` passes theme properties into the existing `MaterialApp.router`, it never returns a new one.
