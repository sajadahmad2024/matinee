# Figma variable mapping

Fill this table from `get_variable_defs` before writing any widget. Map by intent, never by hex value or pixel size alone. Keep the finished table in the task notes; it is the review checklist.

| Figma variable | Kind | Theme target | Note |
|---|---|---|---|
| `color/brand/primary` | colour | `colorScheme.primary` | |
| `color/text/secondary` | colour | `colorScheme.onSurfaceVariant` | |
| `space/16` | spacing | `AppSpacing.lg` | |
| `type/heading/lg` | text | `textTheme.headlineMedium` | line height differs by 2 px, accepted |

## Colours

| Design intent | `ColorScheme` role |
|---|---|
| Brand fill, primary action | `primary`, text on it `onPrimary` |
| Tinted brand surface (chips, selected rows) | `primaryContainer` / `onPrimaryContainer` |
| Secondary action, less emphasis | `secondary`, `secondaryContainer` |
| Accent, highlight | `tertiary`, `tertiaryContainer` |
| Page background | `surface` |
| Card, sheet, dialog | `surfaceContainerLow` / `surfaceContainer` / `surfaceContainerHigh` by elevation |
| Body text | `onSurface`; secondary text `onSurfaceVariant` |
| Borders, dividers | `outline` (strong), `outlineVariant` (subtle) |
| Errors, destructive | `error`, `errorContainer`, `onError` |
| Success, warning, info | `context.appColors.success` / `warning` / `info` and their `on*` |

A colour with none of these meanings (a brand accent used as a semantic signal, a chart series) becomes a new `AppColors` field with light and dark values. A colour that is a lighter or darker version of a role is that role's container or the role with `withValues(alpha:)`; do not add a token for a tint.

## Text

Map by hierarchy first, size second:

| Design role | `TextTheme` |
|---|---|
| Hero numbers, splash titles | `displayLarge` .. `displaySmall` |
| Page titles | `headlineLarge` .. `headlineSmall` |
| Section and card titles, app bar | `titleLarge` .. `titleSmall` |
| Body copy | `bodyLarge` .. `bodySmall` |
| Buttons, tabs, captions, overlines | `labelLarge` .. `labelSmall` |

When the design's scale differs from Material's defaults (for example body at 15 px), change `AppTextStyle` once so the whole app moves. Weight and colour variations are `.copyWith(fontWeight:, color:)` at the call site with a theme colour; never a new `TextStyle`.

## Spacing, radius, elevation

- Spacing values snap to `AppSpacing` (4, 6, 8, 12, 16, 24, 32). A value that recurs in the design and is not on the scale is added to the scale once.
- Radii go on the component theme (`CardTheme.shape`, `InputDecorationTheme.border`, `FilledButtonTheme`). A one-off radius on a custom container uses `BorderRadius.circular(AppSpacing.sm)` and similar.
- Elevation and shadow map to Material surface tint levels (`surfaceContainer*`) first; explicit `BoxShadow` only when the design system defines one, then as a component theme.

## Components

`get_design_context` names component instances. Before building one:

1. Check `get_code_connect_map`; a mapped component is an existing app widget.
2. Check `core/widgets` and `shared/widgets` for an equivalent.
3. Otherwise compose from Material: `Card`, `ListTile`, `FilledButton`, `OutlinedButton`, `TextField`, `Chip`, `NavigationBar`, `SegmentedButton`, `Badge`.

When a component is built for the second time, move it to `shared/widgets` and add a Code Connect mapping with `add_code_connect_map` so the next `get_design_context` names the app widget directly.

## Images and icons

- Icons: Material `Icons` by intent. A custom icon set becomes an `IconData` font or SVG assets under `assets/icons`, referenced through one `AppIcons` class.
- Raster and vector images from `download_assets` (when available) go to `assets/images`, are declared in `pubspec.yaml`, and always carry `semanticLabel` or `excludeFromSemantics: true`.
