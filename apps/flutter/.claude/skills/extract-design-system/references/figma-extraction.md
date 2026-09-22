# Figma extraction — tooling rules and scripts

Everything here was learned the hard way; each rule prevented a wrong number or a wasted call.

## Tool rules

| Rule | Why |
|---|---|
| Load the `figma-use` skill before the first `use_figma` call; pass `skillNames: "figma-use"`. | Mandatory for the MCP server; also where the Plugin API gotchas live. |
| List pages with `figma.root.children` (`01_list_pages.js`), **never** `get_metadata` without a `nodeId`. | `get_metadata` on a bare file key reports a single page and hides the rest. |
| Every script starts with `await figma.setCurrentPageAsync(page)` and switches page **at most once**. | Page context resets between calls; content of an unloaded page is empty; switching in a loop reloads the file. `getNodeByIdAsync` on a node of an unloaded page returns `null` — a "missing" id may just be an unloaded page. |
| `use_figma` returns ~20 KB. Aggregate inside Figma and return counts/rows; page the structural dump (`02_structural_dump.js`, `BUDGET = 19000`). | Returning raw node trees truncates silently. |
| Screenshots: `get_screenshot` with `enableBase64Response: true` when the sandbox cannot reach figma.com URLs (curl to the returned URL is blocked in the cloud sandbox). `maxDimension` 700–900 is enough. | Visual sanity only; numbers come from scripts. |
| Exclude device status bars: `isStatus = /status/i.test(name) && /ios|bar|iphone/i.test(name)` and every descendant. | They add iOS system colours and SF Pro to the census. |
| Skip `VECTOR`/`BOOLEAN_OPERATION` in the layout census; count them in the colour census under `vec`. | Glyph geometry is not layout; glyph colour is an icon token. |
| Collapse repeated identical subtrees (`=REP#id` in the dump) by structural signature. | List rows and card grids otherwise fill the budget with copies. |
| Colours are read as `#AARRGGBB` from `paint.color` + `paint.opacity` (solid) or `stop.color.a` (gradient). Text colour comes from `getStyledTextSegments(['fills'])`, not `node.fills`. | Mixed-style text nodes have per-segment fills. |
| Line height: `AUTO` → `auto`, `PIXELS` → px, `PERCENT` → `%`. Record px; convert `%` to px at build time (`size × pct / 100`). | Flutter `height` is a ratio of px/size. |
| Variables: only what is **bound on the page** (`07_variable_collection.js` walks `boundVariables` on nodes, fills and strokes). Resolve aliases to the rendered hex per mode. `get_libraries` names the collections. | Library collections with hundreds of unbound tokens are noise; the rendered value is the truth. |
| Text styles: `textStyleId` per text node, resolved with `getStyleByIdAsync`. | Tells you whether the designer used a type system or free text. |
| Save every raw output to a scratch directory as you go, named after the script: `raw/01_pages.txt`, `raw/01_frames.txt`, `raw/02_dump_00.txt`…, `raw/03_color_census.txt`, `raw/04_typography_census.txt`, `raw/05_layout_census.txt`, `raw/06_components.txt`, `raw/07_variables.txt`. | The build phase and `census_coverage.py` re-read them; the chat scrolls away. |
| `getNodeByIdAsync` only; never `getNodeById`. Instance main components via `await node.getMainComponentAsync()` (guarded with try/catch — remote components can throw). | Sync APIs are unavailable/throw in this runtime. |

## Scripts (`scripts/`)

Replace the placeholders (`__PAGE_ID__` in every script; `__CHUNK__` in 02; `__IDS__`, `__GEO__` in 08) before sending; pass the script as the `code` argument of `use_figma`. All are read-only. Python helpers: `render_docs.py`, `render_readme.py`, `validate.py`, `census_coverage.py` (usage in each file's docstring).

| Script | Returns | Notes |
|---|---|---|
| `01_list_pages.js` | Pages (`id|name`); with a page id also its sections and root frames (`S id|name|w×h|kids`, `  F id|name|w×h`) | Root frames = screen registry. Container nodes outside sections appear as `T` and are treated as root frames by every other script (a file without Sections works); loose page-level text/shapes (canvas labels) are skipped. |
| `02_structural_dump.js` | One chunk of the per-node dump; header `PAGES=n PAGE=k LINES=m` | Grammar is in the script's header comment. Loop `__CHUNK__` until `PAGES` reached. |
| `03_color_census.js` | `hex f=fills(txt,vec,frm) s=strokes scr=screens bound=n | top node names`; gradients with stops; image-fill counts | Sort is by total use. `scr` is the number of root frames using it. |
| `04_typography_census.js` | `family/style|size|lh|ls|case|deco|n=|scr=|al=|sty=|colours|samples` | `sty` = count using a text style. `MIX` nodes are split into segments. |
| `05_layout_census.js` | Frequency tables: padding T/R/B/L, gap, layout mode+alignment, radius, per-corner radius, stroke weight+align, effects (shadow offset/blur/spread/colour, blur radius), opacity; root-frame facts | Frequencies decide the spacing/radius scales. |
| `06_component_aggregation.js` | Groups per family (buttons, inputs, chips/tags, cards, nav, sheets, avatars, progress…) keyed by geometry+paint signature: `×count scr h F: S:@w R: P: g E: T: [sample ids]` | **Heuristics.** Buttons, inputs, headers and bottom navs are *candidates by layer name* (`Button|Btn|CTA`, `Input`, `Header|AppBar|TopBar`, `BottomNav|NavBar|TabBar|Navigation`); chips, cards, progress, avatars, sheets, handles, dividers are by geometry. A file with other naming (`Field`, `Primary`, `Top app bar`) yields empty groups — widen the regex in a scratch copy of the script, or find the instances in the structural dump (`→<main component>` and `L:`/`T:` fields) and record them by hand. Never commit a per-file regex into the skill. |
| `07_variable_collection.js` | Every bound variable (name, type, collection, per-mode values with aliases resolved, properties, screens, sample nodes); collections; bound text styles | Empty output = the page binds nothing; say so in `decisions`. |
| `08_verify_evidence.js` | `checked/found/missing` for a list of node ids; optional geometry spot checks | Takes `__PAGE_ID__` too (unloaded page → every id "missing"). ≤ 400 ids per call. |

## Reading the censuses into candidates

- **Primitives**: cluster hexes whose ΔE is small and whose *use* is the same (all page backgrounds, all card fills, all secondary text…). One primitive per cluster, named by role-neutral meaning (`surfaceCard`, `textSecondary`, `brandAccent`), value = the most frequent member. Everything else in the cluster goes to `mappingFromDesign` → that primitive. Semi-transparent paints become `{primitive@NN%}` on the nearest primitive, alpha snapped to the `alphaScale` levels (usually 10 % steps); gradient stops keep exact alphas.
- **Text roles**: sort combinations by count; the top ones with distinct hierarchy become roles; everything else is *absorbed* by the nearest role (same family, ±1–2 px). Record the absorption in `absorbs` and every combination in `rawToRole`. Numerals in a display face (condensed/tabular) get their own small role set.
- **Scales**: take values with frequency above noise; snap the rest and say so in `snap`.
- **Components**: an aggregation group used on ≥ 2 screens or ≥ 3 times is a reusable component; one-offs are catalogued as `one-off` with `reusable: false`. Composite components list their primitive children in `anatomy`.
- **Inconsistencies** (two heights for one button, three glows, a family used once) are not resolved in the census: list them for the checkpoint with a recommendation.
