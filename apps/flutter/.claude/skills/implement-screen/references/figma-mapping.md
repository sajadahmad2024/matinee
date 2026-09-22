# Design mapping

The mapping is a lookup, not a judgment call. Every colour, text style, spacing, radius, elevation and component in a Matinee frame has already been resolved into `docs/design/` (see `docs/design/README.md`). Fill the table below from those files before writing any widget, keep it in the task notes, and treat it as the review checklist.

The Visuals page binds almost no Figma variables, so `get_variable_defs` returns little; the raw values from `get_design_context` are what you look up. Map by the documented role, never by picking a "close" hex or size.

| Figma element (node id) | Raw value | `design-system` entry | Theme target | Note |
|---|---|---|---|---|
| `Frame/CTA` (`12:345`) | fill `#FFDC78` | `{goldCta}` → `ColorScheme.primary` | `colorScheme.primary` | |
| `Title` (`12:346`) | DM Sans 700 20/30 | `titleLarge` | `textTheme.titleLarge` | |
| gap between cards | 12 | spacing `md` | `AppSpacing.md` | |
| card corner | 16 | radius `card` | `CardTheme.shape` (already themed) | |

## Lookup order

**Colours** — `design-system.md`:
1. §2 `ColorScheme` (dark) — brand, surfaces, text, outline, error. Use the Material role.
2. §3 App roles — every named use in the design (nav, points pill, auth surfaces, badges, scrims…). Use `context.appColors.<role>`.
3. §4 Gradients — exposed by the theme (`AppColors` or its gradient helper); never rebuilt from stops in a widget.
4. §1 Primitives with an alpha level (`{primitive@NN%}`) — only when the doc itself expresses the value that way; alpha is `withValues(alpha:)` on the token, never a new hex.
5. Brand constants (WhatsApp, Telegram, Google…) are third-party colours; they live with the share/sign-in widgets, not in the theme.

**Text** — `design-system.md` §5: the `TextTheme` table (18 roles), the Oswald numerals table (7 roles), then "every design combination → role", which lists each raw family/weight/size seen in Figma and the role it was folded into. A weight or colour variation is `.copyWith(fontWeight:, color:)` with a theme colour at the call site; never a new `TextStyle`.

**Spacing, radius, border, icon size, control heights, elevation** — `design-system.md` §6. Spacing snaps to the `AppSpacing` scale defined there; radii go on the component theme; shadows/glows are the documented elevation levels as component themes, not ad-hoc `BoxShadow`.

**States** — `design-system.md` §7. Pressed, focused, disabled, selected are derived from the component's primary colour with the documented layer opacities; roles the design never drew fall to `ColorScheme.fromSeed`.

**Components** — `design-component-catalogue.md`:
1. Find the frame in the component × screen matrix; it lists every component on that screen.
2. Read the component spec: anatomy, tokens, variants, states, evidence node ids.
3. Check `get_code_connect_map`, then `core/widgets` for an existing implementation of that component id.
4. Otherwise compose from Material (`Card`, `ListTile`, `FilledButton`, `TextField`, `Chip`, `NavigationBar`, `SegmentedButton`, `Badge`) using the spec's tokens through the theme.

When a component is built for the second time, move it to `core/widgets` and add a Code Connect mapping with `add_code_connect_map`. `shared/` is for business logic two features need, never for widgets.

**Icons and images** — `design-system.md` §8: single-colour glyphs come from the app icon font through one `AppIcons` class; multi-colour marks (Google G, brand discs, logo) are SVGs under `assets/icons`. Raster/vector images from `download_assets` go to `assets/images`, are declared in `pubspec.yaml`, and always carry `semanticLabel` or `excludeFromSemantics: true`.

## Not found → stop

If an element's value or component has no entry in `docs/design/`, **stop before writing the widget** and report:

```
Missing from design docs
- Frame / node: <name> (<node id>)
- Raw Figma value: <hex / family weight size / px / component name>
- Looked in: design-system.md §<n>, design-component-catalogue.md <section>, design-system.json <path>
- Nearest existing entry and why it does not fit: <...>
- Proposed addition: <token name, value, theme target>
```

Do not proceed with a substitute, do not add to `lib/core/theme/`, do not put a literal in the widget. After the user confirms, add the value to `design-system.json`, the matching markdown table, and the theme in the same change, with a line in the decisions log (§9). Known gaps already listed in §10 "Open items" are reported the same way; they are not licence to improvise.
