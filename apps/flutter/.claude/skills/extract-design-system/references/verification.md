# Verification

Run after the build (phase 5) and again before commit. A failed check is fixed, not explained away; a warning that stays is written into `openItems` or `decisions`.

## 1. Internal consistency — `scripts/validate.py docs/design`

Exit 0 required. It checks: the schema in `output-contract.md` (including `$meta.figma`); every `{token}` resolves to a primitive or text role; alpha levels on the scale (gradient stops and 0/100 exempt); `mappingFromDesign` targets exist; `height == lineHeightPx / fontSize`; every `rawToRole` role exists and every role absorbs something; every declared font weight is used by a role; component counts, screen ids in the registry, node ids in every evidence string, no raw hex in component tokens; `(all)` components carry the registry size; every registry frame has components or is named in `openItems`; `design-system.md` has sections §1–§10 in order; README has no unfilled placeholders and its counts match; markdown not older than JSON.

## 2. Census coverage — `scripts/census_coverage.py docs/design <raw dir>`

Exit 0 required. Every `#RRGGBB` in `raw/03_color_census.txt` is a key of `mappingFromDesign`, a brand constant, or named in `dropped`; every combination in `raw/04_typography_census.txt` has a `rawToRole` row with the exact grammar from the contract (`<Family> <Style> <size>/<lh>[ <±ls>][ <CASE>]`, numbers `:g` at 2 dp) or an entry in `typography.dropped` (emoji glyphs, canvas labels). A row that matches only on family/style/size is an ERROR — the line height, tracking or case was lost in the fold.

## 3. Evidence resolves — `scripts/08_verify_evidence.js`

Collect every `\d+:\d+` cited anywhere in the JSON (evidence strings, screens, registry, matrix). Filter out obvious non-ids (timer text like `0:59`, library keys) by requiring the id to appear in an evidence/screen field. Set `__PAGE_ID__`; run in batches ≤ 400. Target: 100 % found. A missing id after extraction means the file changed under you — re-read that node's parent frame and update the entry, and say so in the report.

Spot checks in the same call (`__GEO__`): ≥ 5 geometries (heights, radii, paddings) and, by reading fills, ≥ 10 colours against their documented token values.

## 4. Coverage (manual, from `raw/06_components.txt` and `raw/05_layout_census.txt`)

- Every aggregation group with count ≥ 3 or screens ≥ 2 is a component or is named in a component's `variants`/`notes`.
- Every padding/gap/radius value with frequency above noise is on a scale or covered by its `snap` rule; every effect with count ≥ 2 is an `elevation` level.
- Every family in the census is in `families` or `droppedFamilies` (census_coverage.py warns).

## 5. Decisions applied

For each conflict decided at the checkpoint, grep the JSON for the losing value/name: it may appear only in `evidence`, `absorbs`, `dropped`, `notes` or `decisions`.

## 6. Docs and skills wiring

- `render_docs.py` and `render_readme.py` re-run after the last JSON edit; `git diff` shows only intended changes.
- `figma-mapping.md`, `material-theming/SKILL.md`, `rules/presentation.md`, `CLAUDE.md` reference `docs/design/` and the confirm-before-adding rule; every relative path they cite exists.
- `pubspec.yaml` declares exactly the families/weights in `typography.families`; each asset file exists.

## 7. Report

File list with sizes; counts; the decisions table; open items; verification numbers (ids checked/found, spot checks, coverage); anything observed in the Figma file that post-dates the extraction (new frames, deleted nodes).
