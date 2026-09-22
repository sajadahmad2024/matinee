---
name: extract-design-system
description: Extracts a complete, simplified design system from a Figma file into docs/design/ (design-system.json + design-system.md + design-component-catalogue.md + README.md) so the theme and every screen can be built from documented tokens instead of re-reading Figma. Use when given a figma.com URL and asked to "extract the design system", "pull the tokens", "build the design docs", "create the design system files", or before the first theme setup of a project. Not for implementing screens (implement-screen) or changing the theme (material-theming). Runs once per project and again when the design changes.
argument-hint: "<figma-url> [page-name]"
allowed-tools: Bash(python3 *), Bash(curl *), Bash(mkdir *), Bash(ls *)
---

# Extract design system

Turns one Figma page into the project's design source of truth: `docs/design/` (see the output contract). The result is what `implement-screen`, `material-theming` and `.claude/rules/presentation.md` read; after this skill, nobody re-derives a colour, text style, spacing or component from Figma by eye.

The method is a **census, not a tour**: every node on the page is counted, the raw values are collapsed into a small token set with the user's decisions recorded, and every value keeps the Figma node ids it came from.

## Invariants

- **One page is the source.** The user names the final page (or confirms the one the URL points at). Draft, wireframe and "for dev" pages are not read for values. Other pages are listed once so the user can choose; they are never mixed in.
- **Census before judgment.** No token is named before the colour, typography, layout and component censuses (phase 2) exist as saved raw output. Frequencies and screen counts drive what becomes a token; taste decides only ties.
- **Nothing is invented.** A token exists because the design paints it. Undesigned states, screens and roles are recorded as gaps (`openItems`) or derived by a documented rule (`states`), never filled in silently.
- **Evidence everywhere.** Every primitive, gradient, text role, layout value and component carries at least one `Name#node:id` from the page. Verification (phase 6) resolves every id.
- **The user decides the simplifications, once.** Phase 4 is a single checkpoint with the full decision list from [references/simplification-checkpoint.md](references/simplification-checkpoint.md); recommended defaults are proposed, the answers go in `decisions`. No silent re-simplification later.
- **JSON first, markdown rendered.** `design-system.json` is edited; the two markdown files are always produced by `scripts/render_docs.py`. Hand-edited markdown drifts.
- **Nothing project-specific in this skill.** Names, palettes, families and decisions come from the file and the user. Scripts take the page id as a placeholder.

## Inputs

- Figma URL → `fileKey` (`figma.com/design/<fileKey>/…`) and, if present, `node-id` (`123-456` → `123:456`), which may point at the page or a frame inside it.
- Page name, if the user gave one.
- Repo conventions: `docs/design/` is the output directory; the app's theme folder (named in `CLAUDE.md`) is what the tokens will later become. Read `CLAUDE.md` and `.claude/rules/presentation.md` first so role names match the theme classes this template uses.

## Workflow

Load the `figma-use` skill before the first `use_figma` call (mandatory). Tooling rules that bit before are in [references/figma-extraction.md](references/figma-extraction.md) — read it before phase 1.

1. **Recon.** Run `scripts/01_list_pages.js` with an empty page id to list every page (never `get_metadata` without a nodeId — it reports one page). Ask the user which page is final unless the URL or their message already says. Run it again with the page id to get sections and root frames: this is the **screen registry** (frame id → name), the denominator for every "used on N screens" count. Save raw output to a scratch directory (not committed).
2. **Census.** Fan out the four census scripts in one message (independent, read-only): `03_color_census.js` (every solid/gradient/image paint, fills vs strokes, text vs vector vs frame, screen count, variable-bound count), `04_typography_census.js` (every family/style/size/line-height/letter-spacing/case combination with counts, colours and samples), `05_layout_census.js` (padding, gap, radius, stroke, effect and opacity frequencies plus root-frame facts), `06_component_aggregation.js` (buttons, inputs, chips, cards, nav, sheets… grouped by geometry+paint signature with sample ids; several groups are found by layer-name regex — see the heuristics note in figma-extraction.md and fall back to the structural dump for unnamed instances). Save each as `raw/<script-number>_<name>.txt`; `census_coverage.py` reads `raw/03_color_census.txt` and `raw/04_typography_census.txt` later. Then `07_variable_collection.js` for the variables and text styles actually bound on the page, and `get_libraries` for what those collections are. Only collections **bound on the page** matter; unbound library collections are noted and dropped.
3. **Structural dump.** Run `02_structural_dump.js` chunk by chunk (`__CHUNK__` 0…N until the header's `PAGES` count is reached; ~19 KB per chunk). This is the per-node record used to write component anatomies and to resolve ambiguities the censuses cannot (which text sits on which surface, exact paddings of a given card). Save every chunk. Take `get_screenshot` (base64 when the sandbox cannot fetch figma.com URLs) of a handful of representative frames for visual sanity.
4. **Checkpoint — simplification.** From the raw census draft a **candidate summary** (a chat message, not yet the JSON): candidate primitives (cluster near-identical hexes, propose one name each) with counts, the `ColorScheme` mapping, candidate text roles (fold the distinct combinations into a Material-shaped scale), spacing/radius/icon scales, elevation levels, the component list with reuse counts, and the inconsistencies found. Present it with the full checklist from [references/simplification-checkpoint.md](references/simplification-checkpoint.md) and a recommendation per item, in one message (AskUserQuestion where the tool exists). Wait. Record each answer as a `decisions` entry.
5. **Build.** Write `docs/design/design-system.json` to the contract in [references/output-contract.md](references/output-contract.md), applying the decisions: primitives (hex + meaning + evidence), `alphaScale`, `colorScheme`, `roles`, `gradients`, `mappingFromDesign` (every census hex → token), `dropped`; typography `families`, `textTheme`, `numerals`, `rawToRole` (every census combination → role); layout scales and roles; derived `states`; `icons` strategy; `components` (anatomy, tokens in token syntax, variants, states, evidence, screens, matrix, build order); `decisions`; `openItems`. Fill `$meta.figma` (fileKey, pageName, pageId, frameCount, excludedPages) — the README is generated from it. Then `python3 scripts/render_docs.py docs/design` and `python3 scripts/render_readme.py docs/design` (fills [references/README.template.md](references/README.template.md); every `{{placeholder}}` comes from the JSON).
6. **Verify.** `python3 scripts/validate.py docs/design` must exit 0 (it also enforces that every registry frame is covered or explained in `openItems`); `python3 scripts/census_coverage.py docs/design <raw dir>` must exit 0 (every census hex mapped or dropped, every text combination in `rawToRole` or `typography.dropped`). Run `scripts/08_verify_evidence.js` (page id set) over every node id cited in the JSON, batches ≤ 400 — 100 % must resolve; spot-check ≥ 10 colours and ≥ 5 geometries against the page. Resolve every warning or write it into `openItems`/`decisions`. Details in [references/verification.md](references/verification.md).
7. **Dependencies and wiring.** Bundle the font families the typography section needs ([references/fonts.md](references/fonts.md)) and declare them in `pubspec.yaml`. Check that `.claude/skills/implement-screen/references/figma-mapping.md`, `.claude/skills/material-theming/SKILL.md`, `.claude/rules/presentation.md` and `CLAUDE.md` point at `docs/design/` and state the reuse-first / confirm-before-adding rule; add the pointers if the template copy lacks them. Report: file list, counts (primitives, roles, gradients, text roles, components), decisions, open items, and anything in the file that changed while you worked.

## Re-running on a changed design

Same workflow. Keep the previous `design-system.json` open: reuse token names where the value is unchanged, add a `decisions` entry per renamed or removed token, and list frames that appeared or disappeared in the report. Never edit the old markdown by hand.

## Emit checklist

- `docs/design/design-system.json`, `design-system.md`, `design-component-catalogue.md`, `README.md` present; markdown rendered by `render_docs.py` / `render_readme.py`, not typed
- `validate.py` and `census_coverage.py` exit 0; every evidence node id resolves in Figma; every root frame covered or explained; every census hex and text combination accounted for
- One simplification checkpoint, every answer in `decisions`; undesigned things in `openItems`, not invented
- Fonts bundled and declared; skills and rules point at `docs/design/`
- Raw census and dump chunks kept in scratch (not committed); nothing project-specific added to this skill
