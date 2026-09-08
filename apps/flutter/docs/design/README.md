# Design system — source of truth for UI work

Extracted from the Matinee Figma file `vVGHTFgrIRYQBTZaRZCYe0`, page **Visuals** (`3:1066`, 71 frames), on 2026-09-03 and simplified per the decisions log in `design-system.md` §9. The app is **dark-only**. Every value a widget or the theme needs is meant to be in these three files; the Figma file is evidence, not the working reference.

| File | What it holds | Read it when |
|---|---|---|
| `design-system.md` | 26 colour primitives, `ColorScheme` mapping, 159 app colour roles, 9 gradients, typography (4 families, 18 `TextTheme` roles + 7 Oswald numeral roles, every design combination → role), layout scales (spacing, radius, border, icon, avatar, control heights, elevation, bottom sheet, grids), derived component states, icon strategy, decisions log, open items | Building or changing anything in `lib/core/theme/`; mapping a colour, text style or spacing you see in a frame |
| `design-component-catalogue.md` | 81 components: anatomy, tokens, variants, states, evidence node ids, screens that use them, component × screen matrix, build order by reuse | Implementing a screen — find the component first, then its tokens |
| `design-system.json` | Machine-readable twin of both docs (`$meta`, `color`, `typography`, `layout`, `states`, `icons`, `components`, `decisions`, `openItems`) | Exact lookups, scripted checks, generating theme code |

## Rules for agents and humans

1. **Reuse first.** A colour, text style, spacing, radius or component that appears in a Figma frame is looked up here and expressed through the theme (`colorScheme.*`, `context.appColors.*`, `textTheme.*`, `AppSpacing.*`, component themes). Never a literal in a widget.
2. **Lookup order** for a colour: `design-system.md` §2 `ColorScheme` role → §3 app role → §4 gradient → §1 primitive with an alpha level. For text: §5 TextTheme / numerals table, then the "every design combination → role" table. For a component: catalogue index → its spec → its tokens.
3. **Not found → stop and ask.** If a value or component in a frame has no entry here, do not invent a token, do not pick a "close enough" hex, and do not add to `lib/core/theme/` on your own. Report exactly what is missing (frame node id, raw Figma value, where you looked) and wait for confirmation. Once confirmed, add it to **both** the theme and these docs (`design-system.json` first, then the markdown) in the same change, and record the reason in the decisions log.
4. **Colour syntax.** `{primitive}` is a token name; `{primitive@NN%}` is that token with the alpha level applied (`withValues(alpha: 0.NN)`); `gradient.<name>` is a gradient. There are no extra hexes behind these.
5. **Evidence.** Every value carries Figma node ids. Use them to look at the original when something reads ambiguously; do not re-extract from Figma unless the design itself has changed.
6. **Open items** (§10) are known design gaps. Do not paper over them in code; surface them.

Related: `.claude/skills/implement-screen` (screen build workflow), `.claude/skills/material-theming` (changing the theme), `.claude/rules/presentation.md` (widget conventions).
