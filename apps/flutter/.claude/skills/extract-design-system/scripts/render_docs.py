#!/usr/bin/env python3
"""Render design-system.md and design-component-catalogue.md from design-system.json.

Usage: python3 render_docs.py <docs/design dir>

The JSON is the single source; never hand-edit the markdown. Section numbering in
design-system.md (§1–§10) is a contract: .claude/skills/implement-screen/references/figma-mapping.md,
.claude/skills/material-theming/SKILL.md and .claude/rules/presentation.md cite these numbers.
"""
import json, os, re, sys

FIN = sys.argv[1] if len(sys.argv) > 1 else 'docs/design'
D = json.load(open(f'{FIN}/design-system.json'))
M = D['$meta']

def esc(s): return str(s).replace('|', '\\|').replace('\n', ' ')

HDR = (f"> Source: {M['source']}. {M['modes']}. Units: {M['units']}. "
       f"Colour syntax: `{{primitive}}` or `{{primitive@NN%}}` (opacity applied to a primitive — there are no extra hexes); "
       f"`gradient.<name>`. Machine-readable twin: `design-system.json`. Extracted values were simplified on {M['generated']} "
       "per the decisions log at the end.\n")

# ---------------------------------------------------------------- design-system.md
d = []; a = d.append
a(f"# {M['project']} — Design system (final tokens)\n"); a(HDR)
C = D['color']
a(f"## 1. Colour primitives ({len(C['primitives'])})\n| Token | Hex | Meaning | Evidence |\n|---|---|---|---|")
for k, v in C['primitives'].items(): a(f"| `{k}` | `{v['value']}` | {esc(v['meaning'])} | {esc(v['evidence'])} |")
a("\nBrand constants (third-party, not theme tokens): " + ", ".join(f"{k} `{v}`" for k, v in C['brandConstants'].items()) + "\n")
a("### Alpha scale\n" + C['alphaScale'].get('note', '') + " Levels: " + ", ".join(f"{x}%" for x in C['alphaScale']['levels']) + ".\n")
if C['alphaScale'].get('conventions'):
    a("| Convention | Value |\n|---|---|"); [a(f"| {k} | {v} |") for k, v in C['alphaScale']['conventions'].items()]
a(f"\n## 2. Flutter `ColorScheme` ({C['colorScheme']['brightness']})\n" + C['colorScheme'].get('note', '') + "\n")
alt = C.get('colorSchemeAlt')
a("| Role | Token |" + (f" {alt['brightness']} |" if alt else "") + "\n|---|---|" + ("---|" if alt else ""))
for k, v in C['colorScheme'].items():
    if k == 'note': continue
    a(f"| `{k}` | `{v}` |" + (f" `{alt.get(k, '')}` |" if alt else ""))
ralt = C.get('rolesAlt')
a("\n## 3. App roles\n| Role | Token |" + (f" {alt['brightness'] if alt else 'alt'} |" if ralt else "") + "\n|---|---|" + ("---|" if ralt else ""))
for k, v in C['roles'].items(): a(f"| `{k}` | `{v}` |" + (f" `{ralt.get(k, '')}` |" if ralt else ""))
a(f"\n## 4. Gradients ({len(C['gradients'])})\n| Name | Type | Stops | Use | Evidence |\n|---|---|---|---|---|")
for k, g in C['gradients'].items():
    stops = ", ".join(f"`{c}`@{p}" for c, p in g['stops'])
    if 'layer2' in g: stops += " + layer 2: " + ", ".join(f"`{c}`@{p}" for c, p in g['layer2'])
    if 'radial' in g: stops += " + radial: " + ", ".join(f"`{c}`@{p}" for c, p in g['radial'])
    a(f"| `{k}` | {g['type']} {g.get('angle', '')} | {stops} | {esc(g['use'])} | {esc(g['evidence'])} |")
a("\n### Design hex → token map\n" + ", ".join(f"`#{k[1:]}`→`{v}`" for k, v in C['mappingFromDesign'].items()) + "\n")
a("Dropped: " + ("; ".join(f"{k} ({v})" for k, v in C['dropped'].items()) or "nothing") + "\n")
T = D['typography']
a("## 5. Typography\n")
a("| Family | Weights | Role |\n|---|---|---|"); [a(f"| {k} | {', '.join(map(str, v['weights']))} | {v['role']} |") for k, v in T['families'].items()]
a("\nDropped families: " + ("; ".join(f"**{k}** — {v}" for k, v in T['droppedFamilies'].items()) or "none") + "\n")
if T.get('dropped'): a("Dropped combinations (not app UI): " + "; ".join(f"{k} — {v}" for k, v in T['dropped'].items()) + "\n")
a(T['note'] + " " + T['accessibility'] + "\n")
a(f"### TextTheme ({len(T['textTheme'])} roles)\n| Role | Family | Weight | Size | LH | `height` | Tracking | Case | Use | Absorbs (design combinations) |\n|---|---|---|---|---|---|---|---|---|---|")
for t in T['textTheme']: a(f"| `{t['role']}` | {t['fontFamily']} | {t['fontWeight']} | {t['fontSize']} | {t['lineHeightPx']} | {t['height']} | {t.get('letterSpacingPx', 0)} | {t.get('textCase') or '—'} | {esc(t['use'])} | {esc(t.get('absorbs', ''))} |")
if T.get('numerals'):
    fam = " / ".join(sorted({t['fontFamily'] for t in T['numerals']}))
    a(f"\n### Numerals — {fam} ({len(T['numerals'])} roles)\n| Role | Weight | Size | LH | `height` | Use | Absorbs |\n|---|---|---|---|---|---|---|")
    for t in T['numerals']: a(f"| `{t['role']}` | {t['fontWeight']} | {t['fontSize']} | {t['lineHeightPx']} | {t['height']} | {esc(t['use'])} | {esc(t.get('absorbs', ''))} |")
a("\n### Every design combination → role\n| Design (family weight size/lh +tracking case) | Count | Role |\n|---|---|---|")
for r in sorted(T['rawToRole'], key=lambda x: -x['count']): a(f"| {r['design']} | {r['count']} | `{r['role']}` |")
L = D['layout']
a("\n## 6. Layout\n")
B = L['base']
extras = ", ".join(f"{re.sub(r'(?<!^)(?=[A-Z])', ' ', k).lower()} {v}" for k, v in B.items() if k not in ('width', 'height', 'note'))
a(f"Base {B['width']}×{B['height']}" + (f", {extras}" if extras else "") + f". {B.get('note', '')}\n")
a("Screen padding: " + ", ".join(f"{k} {v}" for k, v in L['screenPadding'].items()) + "\n")
a("**Spacing** " + ", ".join(f"`{k}` {v}" for k, v in L['spacing']['scale'].items()) + f". Snap: {L['spacing'].get('snap', '—')}." + (" Semantic: " + "; ".join(f"{k} {v}" for k, v in L['spacing']['semantic'].items()) if L['spacing'].get('semantic') else "") + "\n")
a("**Radius** " + ", ".join(f"`{k}` {v}" for k, v in L['radius']['scale'].items()) + f". Snap: {L['radius'].get('snap', '—')}.\n")
if L['radius'].get('roles'):
    a("| Radius role | Value |\n|---|---|"); [a(f"| {k} | {v} |") for k, v in L['radius']['roles'].items()]
bd = L['border']
a("\n**Border** " + ", ".join(f"{k} {v}" for k, v in bd.items() if k != 'snap') + (f" (snap: {bd['snap']})" if bd.get('snap') else "") + ".\n")
a("**Icon sizes** " + ", ".join(f"`{k}` {v}" for k, v in L['iconSize']['scale'].items()) + f". Snap: {L['iconSize'].get('snap', '—')}.\n")
if L['iconSize'].get('roles'):
    a("| Icon role | Size |\n|---|---|"); [a(f"| {k} | {v} |") for k, v in L['iconSize']['roles'].items()]
if L.get('avatar'):
    av = L['avatar']
    words = lambda k: re.sub(r'(?<!^)(?=[A-Z])', ' ', k).lower()
    a("\n**Avatars** " + ", ".join(f"{k} {v}" for k, v in av.items() if not isinstance(v, dict)) + "".join("; " + words(k) + "s " + ", ".join(f"{kk} {vv}" for kk, vv in v.items()) for k, v in av.items() if isinstance(v, dict)) + "\n")
a("| Control | Height / size |\n|---|---|"); [a(f"| {k} | {v} |") for k, v in L['controlHeight'].items()]
a("\n**Elevation**\n| Level | Offset | Blur | Colour |\n|---|---|---|---|")
for k, v in L['elevation'].items():
    if isinstance(v, dict): a(f"| `{k}` | {v['offset']} | {v['blur']} | `{v['color']}` |")
a(("\nBackdrop blur " + str(L['elevation']['backdropBlur']) + ". " if 'backdropBlur' in L['elevation'] else "\n") + L['elevation'].get('note', '') + "\n")
if L.get('bottomSheet'): a("**Bottom sheet** " + "; ".join(f"{k} {v}" for k, v in L['bottomSheet'].items()) + "\n")
if L.get('grids'): a("**Grids** " + "; ".join(f"{k}: {v}" for k, v in L['grids'].items()) + "\n")
S = D['states']
a("## 7. Component states (derived)\n" + S['principle'] + "\n")
a("| State | Rule |\n|---|---|"); [a(f"| {k} | {v} |") for k, v in S['rules'].items()]
if S.get('examples'): a("\nExamples: " + "; ".join(f"**{k}** — " + ", ".join(f"{s}: {v}" for s, v in ex.items()) for k, ex in S['examples'].items()) + "\n")
a(f"Left to `ColorScheme.fromSeed(seedColor: {C['colorScheme']['seedColor']}, brightness: {C['colorScheme']['brightness']})` for now: " + ", ".join(S['seedDerived']) + "\n")
I = D['icons']
a("## 8. Icons\n**" + I['recommendation'] + "** " + I['why'] + "\n\nPipeline: " + I['pipeline'] + "\n\nGlyph inventory: " + ", ".join(I['glyphInventory']) + ". Multi-colour as SVG: " + ", ".join(I['multiColourAsSvg']) + ".\n\n" + I['note'] + "\n")
a("## 9. Decisions log\n| Topic | Decision |\n|---|---|"); [a(f"| **{x['topic']}** | {esc(x['decision'])} |") for x in D['decisions']]
a("\n## 10. Open items for design\n"); [a(f"- {x}") for x in D['openItems']]
open(f'{FIN}/design-system.md', 'w').write("\n".join(d))

# ---------------------------------------------------------------- design-component-catalogue.md
d = []; a = d.append
CM = D['components']
a(f"# {M['project']} — Component catalogue (final tokens)\n"); a(HDR)
a(f"{CM['count']} components ({CM['reusable']} reusable). Colours and type are expressed in final tokens/roles from `design-system.md`; **evidence** strings keep the raw Figma values so anything can be traced back to a node.\n")
a("## Index\n| id | Name | Category | Reusable | Screens | Instances |\n|---|---|---|---|---|---|")
for c in CM['items']: a(f"| `{c['id']}` | {c['name']} | {c['category']} | {'yes' if c['reusable'] else 'no'} | {c['screenCount']} | {c['instanceCount']} |")
a("\n## Specifications\n")
for c in CM['items']:
    a(f"### `{c['id']}` — {c['name']}\n*{c['category']} · {'reusable' if c['reusable'] else 'one-off'} · {c['screenCount']} screen(s) · {c['instanceCount']} instance(s)*\n")
    a("**Anatomy**"); [a(f"1. {x}") for x in c['anatomy']]
    if c['tokens']:
        a("\n**Tokens**")
        for k, v in c['tokens'].items():
            if isinstance(v, dict): a(f"- {k}: " + "; ".join(f"**{kk}** {vv}" for kk, vv in v.items()))
            else: a(f"- {k}: {v}")
    if c.get('variants'): a("\n**Variants**"); [a(f"- **{k}** — {v}") for k, v in c['variants'].items()]
    if c.get('states'): a("\n**States**"); [a(f"- **{k}** — {v}") for k, v in c['states'].items()]
    if c.get('evidence'): a("\n**Evidence:** " + ", ".join(f"`{e}`" for e in c['evidence']))
    if c.get('notes'): a("\n**Notes**"); [a(f"- {n}") for n in c['notes']]
    if c['screens'] == ['(all)']:
        a(f"\n**Screens:** all {len(CM['screenRegistry'])} screens\n")
    else:
        scr = c['screens'] if len(c['screens']) <= 12 else c['screens'][:12] + [f"… +{len(c['screens'])-12} more"]
        a("\n**Screens:** " + ", ".join(f"{s} ({CM['screenRegistry'].get(s, '')})" if s in CM['screenRegistry'] else s for s in scr) + "\n")
a("## Component × screen matrix\n| Screen | Components |\n|---|---|")
for s, comps in CM['usageMatrix'].items():
    if s == '(all)': continue
    a(f"| `{s}` {CM['screenRegistry'].get(s, '')} | {', '.join(f'`{x}`' for x in comps)} |")
a("\n## Build order (by reuse)\n"); [a(f"{i+1}. **{k}** — {v}") for i, (k, v) in enumerate(CM['buildOrder'])]   # list of [label, text] pairs
open(f'{FIN}/design-component-catalogue.md', 'w').write("\n".join(d))
print({f: os.path.getsize(f'{FIN}/{f}') for f in ('design-system.md', 'design-component-catalogue.md')})
