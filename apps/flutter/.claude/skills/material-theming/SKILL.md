---
name: material-theming
description: Decision guide for changing the app's Material 3 theme in lib/core/theme. Use when asked to add or change a colour token, add a font or change a TextTheme role, change a component theme, or map a Figma value onto the theme. The theme is generated from docs/design/ (the extracted design system); this skill keeps code and docs in step. Day-to-day theme usage rules load automatically from .claude/rules/presentation.md; this skill is for changing the theme itself.
argument-hint: "[token|typography|component|layout]"
---

# Material theming

The theme lives in `lib/core/theme/`: `AppColorScheme` (the dark `ColorScheme`), `AppColors` (`ThemeExtension` for the app colour roles and gradients Material lacks), `AppTextStyle`, `AppSpacing` (and the other layout scales), `AppTheme` (assembles `ThemeData`), `ThemeCubit` with a freezed `ThemeState`, and `context.appColors`. Widgets only read the theme; every change below happens in that folder.

## Source of truth

`docs/design/design-system.md` (and its twin `design-system.json`) defines every token the theme contains: primitives, `ColorScheme` roles, app roles, gradients, typography roles, layout scales, state rules. The code mirrors the doc; the doc is not written from the code. The app is **dark-only**: one `ColorScheme`, one `AppColors` value set, `ThemeMode.dark`. There is no light theme to keep in sync and no brightness switch in widgets.

Two consequences:

- A request that the doc already covers is a code change only — find the entry, implement it as written.
- A request the doc does not cover (a new colour, a new text role, a spacing value off the scale, a component the catalogue lacks) is **not made on the spot**. Stop, report what is missing (frame/node, raw value, where you looked, proposed addition — template in `.claude/skills/implement-screen/references/figma-mapping.md`), and wait for the user. Once confirmed, change `design-system.json`, the markdown table, the decisions log (§9) and the code in the same commit.

## Decide first

| Request | Change |
|---|---|
| A Material role looks wrong | Check §2 of the doc first. If the doc agrees with you, `.copyWith(role: ...)` on the `ColorScheme` in `AppColorScheme`, not in a widget. If the doc disagrees, the doc wins until the user changes it. |
| A colour with a meaning Material lacks (nav, points pill, auth surface, badge tier, scrim…) | It is almost certainly one of the §3 app roles → field on `AppColors`. Missing from §3 → stop and confirm. |
| A gradient | §4. Exposed through `AppColors` (or its gradient helper), never rebuilt from stops in a widget. |
| A text style | §5: 18 `TextTheme` roles plus the Oswald numeral roles on `AppTextStyle`. Fonts are bundled in `pubspec.yaml` (`DM Sans`, `Poppins`, `Inter`, `Oswald`); do not add Google Fonts at runtime. A design combination not in the "every design combination → role" table → stop and confirm. |
| A spacing, radius, border, icon size, control height | §6 scales. `AppSpacing` and friends mirror them exactly; a value off the scale is a stop, not a new constant. |
| A component looks different everywhere | Its `*ThemeData` in `AppTheme._build`, using the catalogue spec's tokens. Never style instances. |
| Pressed / focused / disabled / selected colours | §7 rules (layer opacities derived from the component's primary colour); roles the design never drew stay with `ColorScheme.fromSeed`. |
| A second selectable palette or a light theme | Not in the design. Raise it with the user; do not add `AppColorScheme` values speculatively. |

## Procedures

**Add or change a token (after confirmation).** Field on `AppColors` with its dark value, `copyWith` and `lerp` updated; entry in `design-system.json` → `color.roles`, row in `design-system.md` §3; decisions-log line. Use through `context.appColors.<role>`.

**Change a text role.** Edit the role on `AppTextStyle` to the doc's family/weight/size/`height`/letter spacing; if the doc is what changes, update §5 and the JSON `typography.textTheme` first.

**Add a component theme.** Read the component's spec in `design-component-catalogue.md`; set the `*ThemeData` in `AppTheme._build` from tokens only (`colorScheme.*`, `appColors.*`, `textTheme.*`, `AppSpacing.*`).

**Persist the user's choice.** Not applicable while the app is dark-only with one palette; `ThemeCubit` exists for text scale/other preferences only if a feature needs them.

**Verify.** `flutter analyze --fatal-infos`; run the dev flavor and check the changed element against the Figma frame named in the doc's evidence column; check `context.appColors` text roles against `colorScheme.surface` for contrast (§5 accessibility note).
