# Output contract — `docs/design/`

Four files. `design-system.json` is authored; the two markdown files are rendered from it by `scripts/render_docs.py`; `README.md` is rendered by `scripts/render_readme.py` from `README.template.md`. `scripts/validate.py` enforces this contract; keys marked *optional* below may be absent and the renderer skips them — everything else is required (use `null`, `0`, `""` or `{}` when a required field has nothing to say).

## Token syntax (used in every string value)

- `{primitive}` — a colour primitive by name. `{primitive@NN%}` — that primitive at NN % opacity (`withValues(alpha: 0.NN)`); NN must be on `alphaScale.levels` except inside gradient stops (exact) and 0/100.
- `gradient.<name>` — an entry of `color.gradients`.
- `{textRole}` — in a **type** position (component tokens) a `textTheme`/`numerals` role name. Primitive names and text role names must not collide.
- Names of primitives, gradients and text roles are alphanumeric camelCase (`[A-Za-z][A-Za-z0-9]*`) so they fit inside `{}`; role keys in `color.roles` and component ids may use dots (`text.secondary`, `btn.primary`).
- Raw hexes appear only in `primitives[].value`, `brandConstants`, `mappingFromDesign` keys, `evidence` and `notes`. Never in `roles`, `colorScheme`, component `tokens/variants/states`.
- Node evidence: `Name#12:345`, several separated by `, `; every evidence string contains at least one node id. Screen ids are bare `12:345` and must exist in `components.screenRegistry`. A page-wide primitive (icons) uses `"screens": ["(all)"]` with `screenCount` = registry size.

## `design-system.json`

```jsonc
{
  "$meta": { "project": "…", "source": "Figma <fileKey> · page <Name> (<id>) only · <n> frames", "generated": "YYYY-MM-DD",
             "modes": "Dark-only app" /* or "Light-only app" / "Light + dark app" — rendered verbatim in the doc headers; must name every brightness present in colorScheme(+Alt) */,
             "units": "Flutter logical px; colours #RRGGBB, alpha as @NN% of a primitive",
             "tokenSyntax": "{primitive} or {primitive@NN%}; gradient.<name>; role names map to Flutter ThemeData/ColorScheme/TextTheme",
             "figma": { "fileKey": "…", "pageName": "…", "pageId": "12:345", "frameCount": n, "excludedPages": ["…"] } },   // README placeholders come from here
  "color": {
    "primitives":   { "<name>": { "value": "#RRGGBB", "meaning": "…", "evidence": "Name#id, Name#id" } },   // 20–35 is typical
    "brandConstants": { "<thirdParty>": "#RRGGBB" },                 // WhatsApp, Google G … — not theme tokens
    "alphaScale":   { "note": "…", "levels": [10,20,…,90], "conventions": { "pressed layer": "{x@10%}", … } },   // conventions may be {}
    "colorScheme":  { "brightness": "dark|light", "seedColor": "{primitive}", "note": "…",
                      "primary": "{…}", "onPrimary": "{…}", "primaryContainer": …, "secondary": …, "tertiary": …, "error": …,
                      "surface": …, "onSurface": …, "onSurfaceVariant": …, "surfaceContainer*": …, "outline": …, "outlineVariant": …, "scrim": …, "inverseSurface": … },
    "colorSchemeAlt": { same keys, the other "brightness" },        // optional — only when the design has frames for a second mode (checkpoint Q2)
    "roles":        { "<group>.<role>": "{primitive}|{primitive@NN%}|gradient.x|transparent" },   // text.*, icon.*, surface.*, nav.*, button.*, input.*, badge.*, overlay.* …
    "rolesAlt":     { same keys as roles, second-mode values },     // optional, paired with colorSchemeAlt
    "gradients":    { "<name>": { "type": "linear|radial", "angle": "top→bottom", "stops": [["{p@NN%}", 0.0], …], "layer2": [...]?, "radial": [...]?, "use": "…", "evidence": "…" } },
    "mappingFromDesign": { "#RRGGBB": "primitive" | "primitive@NN" | "brand.<constant>" | "gradient.<name>" },   // EVERY hex from the colour census; bare names, no braces, no % sign
    "dropped":      { "#RRGGBB or description": "why" }
  },
  "typography": {
    "families":     { "<Family>": { "weights": [400, 700], "role": "…" } },     // only weights a role uses
    "droppedFamilies": { "<Family>": "why / folded into" },
    "dropped":      { "<design string>": "why" },                                 // optional — census combinations that are not app UI (emoji glyphs, canvas labels)
    "textTheme":    [ { "role": "bodyMedium", "fontFamily": "…", "fontWeight": 400, "fontSize": 14, "lineHeightPx": 21, "height": 1.5,
                        "letterSpacingPx": 0, "textCase": null | "UPPER", "use": "…", "absorbs": "…" } ],   // all ten keys required; Material role names + caption/overline/nav as needed
    "numerals":     [ same shape ],                                          // display/tabular numeral roles; may be []
    "rawToRole":    [ { "design": "<Family> <Style> <size>/<lh>[ <±ls>][ <CASE>]", "count": n, "role": "…" } ],  // EVERY census combination not in typography.dropped. Numbers as Python :g of the value rounded to 2 dp (15, 22.5, 21.45), lh "auto" allowed, tracking signed (+1.2 / -0.15). e.g. "Inter Bold 10/15 +1.2 UPPER". census_coverage.py enforces the exact string.
    "note": "…", "accessibility": "…"
  },
  "layout": {
    "base": { "width": 375, "height": 812, "note": "…", /* optional extras, rendered as "<camel case → words> <value>": */ "statusInset": 44, "bottomNavHeight": 64 },
    "screenPadding": { "main": 16, … },
    "spacing":  { "scale": { "xxxs": 2, "xxs": 4, "sm": 8, … }, "snap": "…", "semantic": { "cardGap": 12, … } },   // semantic optional
    "radius":   { "scale": { "sm": 4, …, "full": 9999 }, "snap": "…", "roles": { "card": 16, … } },               // roles optional
    "border":   { "hairline": 1, "focus": 1.5, "emphasis": 2, "snap": "…" },                                        // any named widths; snap optional
    "iconSize": { "scale": { "xs": 12, … }, "roles": { "nav": 24, … }, "snap": "…" },                             // roles optional
    "avatar":   { "profile": 96, …, "badgeDisc": { … } },                                                            // optional block; nested dicts rendered as sub-lists
    "controlHeight": { "cta": 52, "input": 52, "appBarContent": 56, … },
    "elevation": { "<level>": { "offset": "0,6", "blur": 24, "color": "{primitive@NN%}" }, "backdropBlur": 20 /* optional */, "note": "…" },
    "bottomSheet": { "radius": "…", "handle": "…", … },                                                              // optional block
    "grids": { "<name>": "…" }                                                                                       // optional block
  },
  "states": { "principle": "…", "rules": { "enabled": "…", "pressed": "…", "focused": "…", "disabled": "…", "selected / active": "…", "loading": "…", "error (inputs)": "…" },
              "examples": { "button.primary": { "pressed": "…", … } } /* optional */, "seedDerived": ["inversePrimary", …] },
  "icons":  { "recommendation": "…", "why": "…", "pipeline": "…", "sizes": { … }, "glyphInventory": ["home", …], "multiColourAsSvg": ["googleG", …], "note": "…" },
  "components": {
    "count": n, "reusable": m,
    "items": [ { "id": "btn.primary", "name": "Button / Primary", "category": "primitive|composite|pattern", "reusable": true,
                 "screens": ["12:345", …], "screenCount": k, "instanceCount": i,
                 "anatomy": ["Container (auto-layout H, gap 8)", "Label", …],
                 "tokens": { "fill": "{…}", "label": "{labelLarge} {…}", "height": 52, "radius": 12, … } | { "<group>": { … } },
                 "variants": { "<name>": "…" }?, "states": { "enabled": "…", "disabled": "…", "pressed/hover": "not designed" }?,
                 "evidence": ["Name#id", …], "notes": ["…"]? } ],
    "usageMatrix": { "<screenId>": ["btn.primary", …] },           // every screen in the registry
    "screenRegistry": { "<screenId>": "<frame name>" },           // every root frame of the page
    "buildOrder": [ ["1 tokens", "…"], ["2 primitives (by reuse)", "… → …"], ["3 composites", "…"], ["4 patterns / one-offs", "…"] ]   // list of [label, text] pairs, not a dict
  },
  "decisions": [ { "topic": "…", "decision": "…" } ],              // one per checkpoint answer + each judgment call
  "openItems": [ "…" ]                                             // design gaps; never empty in practice
}
```

Component `id`s are dotted kebab/camel (`btn.primary`, `chip.filter`, `appBar.back`, `sheet.bottom`); composites reference primitives by id in `anatomy`.

## `design-system.md` (rendered)

Section numbers are cited by other skills — **do not renumber**: `## 1. Colour primitives` · `## 2. Flutter ColorScheme` · `## 3. App roles` · `## 4. Gradients` (+ hex→token map, dropped) · `## 5. Typography` (families, TextTheme, numerals, every combination → role) · `## 6. Layout` · `## 7. Component states (derived)` · `## 8. Icons` · `## 9. Decisions log` · `## 10. Open items for design`.

## `design-component-catalogue.md` (rendered)

`## Index` · `## Specifications` (one `###` per component: anatomy, tokens, variants, states, evidence, notes, screens) · `## Component × screen matrix` · `## Build order (by reuse)`.

## `README.md` (rendered by `render_readme.py`)

`README.template.md` holds the prose: what each file holds, lookup order, the **reuse-first / not-found → stop and confirm** rule, token syntax, evidence rule, open-items rule, links to the consuming skills. Its placeholders are filled from the JSON — never by hand:

| Placeholder | Source |
|---|---|
| `PROJECT` | `$meta.project` |
| `FILE_KEY`, `PAGE_NAME`, `PAGE_ID`, `FRAME_COUNT` | `$meta.figma.*` |
| `DATE` | `$meta.generated` |
| `MODES_SENTENCE` | from `colorScheme.brightness` (+ `colorSchemeAlt.brightness`) |
| `PRIMITIVE_COUNT`, `ROLE_COUNT`, `GRADIENT_COUNT` | `len(color.primitives / roles / gradients)` |
| `FAMILY_COUNT`, `TEXT_ROLE_COUNT`, `NUMERAL_CLAUSE` | `len(typography.families / textTheme / numerals)` |
| `COMPONENT_COUNT` | `components.count` |

`validate.py` fails on a leftover `{{…}}` or a count that no longer matches the JSON.
