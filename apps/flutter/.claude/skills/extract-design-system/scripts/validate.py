#!/usr/bin/env python3
"""Consistency checks for docs/design/design-system.json (+ the rendered markdown).

Usage: python3 validate.py <docs/design dir> [--strict]

Exit 1 on any ERROR. WARNs are review items, not blockers. Run after the build (phase 5) and again before commit; census_coverage.py covers the raw-census side.
"""
import json, re, sys, os

FIN = sys.argv[1] if len(sys.argv) > 1 else 'docs/design'
STRICT = '--strict' in sys.argv
D = json.load(open(f'{FIN}/design-system.json'))
errors, warns = [], []
E = errors.append; W = warns.append

# ---- schema
TOP = ['$meta', 'color', 'typography', 'layout', 'states', 'icons', 'components', 'decisions', 'openItems']
for k in TOP:
    if k not in D: E(f"top-level key missing: {k}")
for k in ['project', 'source', 'generated', 'modes', 'units', 'tokenSyntax', 'figma']:
    if k not in D['$meta']: E(f"$meta.{k} missing")
for k in ['fileKey', 'pageName', 'pageId', 'frameCount']:
    if k not in D['$meta'].get('figma', {}): E(f"$meta.figma.{k} missing (README placeholders come from here)")
C, T, L, S, I, CM = D['color'], D['typography'], D['layout'], D['states'], D['icons'], D['components']
for k in ['primitives', 'brandConstants', 'alphaScale', 'colorScheme', 'roles', 'gradients', 'mappingFromDesign', 'dropped']:
    if k not in C: E(f"color.{k} missing")
for k in ['levels', 'note', 'conventions']:
    if k not in C.get('alphaScale', {}): E(f"color.alphaScale.{k} missing")
for k in ['brightness', 'seedColor', 'note', 'primary', 'onPrimary', 'surface', 'onSurface', 'onSurfaceVariant', 'outline', 'error']:
    if k not in C.get('colorScheme', {}): E(f"color.colorScheme.{k} missing")
if 'colorSchemeAlt' in C:
    a_keys, b_keys = set(C['colorScheme']) - {'note'}, set(C['colorSchemeAlt']) - {'note'}
    if a_keys != b_keys: E(f"color.colorSchemeAlt keys must equal colorScheme keys (diff: {sorted(a_keys ^ b_keys)})")
    if C['colorSchemeAlt'].get('brightness') == C['colorScheme'].get('brightness'): E("colorSchemeAlt has the same brightness as colorScheme")
    for b in (C['colorScheme'].get('brightness'), C['colorSchemeAlt'].get('brightness')):
        if b and b not in str(D['$meta'].get('modes', '')).lower(): E(f"$meta.modes '{D['$meta'].get('modes')}' does not mention '{b}' although a {b} scheme exists")
else:
    b = C['colorScheme'].get('brightness')
    if b and b not in str(D['$meta'].get('modes', '')).lower(): E(f"$meta.modes '{D['$meta'].get('modes')}' does not mention '{b}'")
if 'rolesAlt' in C and set(C['rolesAlt']) != set(C.get('roles', {})): E("color.rolesAlt keys must equal color.roles keys")
for k in ['families', 'droppedFamilies', 'textTheme', 'numerals', 'rawToRole', 'note', 'accessibility']:
    if k not in T: E(f"typography.{k} missing")
# layout: required blocks; avatar/bottomSheet/grids and base.* extras are optional (render skips them when absent)
for k in ['base', 'screenPadding', 'spacing', 'radius', 'border', 'iconSize', 'controlHeight', 'elevation']:
    if k not in L: E(f"layout.{k} missing")
for k in ['width', 'height']:
    if k not in L.get('base', {}): E(f"layout.base.{k} missing")
for blk in ('spacing', 'radius', 'iconSize'):
    if 'scale' not in L.get(blk, {}): E(f"layout.{blk}.scale missing")
for k in ['principle', 'rules', 'seedDerived']:
    if k not in S: E(f"states.{k} missing")
for k in ['recommendation', 'why', 'pipeline', 'glyphInventory', 'multiColourAsSvg', 'note']:
    if k not in I: E(f"icons.{k} missing")
for k in ['count', 'reusable', 'items', 'usageMatrix', 'screenRegistry', 'buildOrder']:
    if k not in CM: E(f"components.{k} missing")
if not (isinstance(CM.get('buildOrder'), list) and all(isinstance(x, list) and len(x) == 2 for x in CM.get('buildOrder', []))): E("components.buildOrder must be a list of [label, text] pairs")
if errors:
    print("\n".join("ERROR " + e for e in errors)); sys.exit(1)

# ---- colour primitives and token references
prims = C['primitives']
HEX = re.compile(r'^#[0-9A-F]{6}$')
for k, v in prims.items():
    for f in ('value', 'meaning', 'evidence'):
        if f not in v: E(f"primitive {k} lacks {f}")
    if not HEX.match(v.get('value', '')): E(f"primitive {k} value not #RRGGBB: {v.get('value')}")
    if not re.search(r'\d+:\d+', str(v.get('evidence', ''))): E(f"primitive {k} evidence has no node id")
    if not re.fullmatch(r'[A-Za-z][A-Za-z0-9]*', k): E(f"primitive name '{k}' must be alphanumeric camelCase (used inside {{}})")
levels = set(C['alphaScale']['levels'])
TOKEN = re.compile(r'\{([A-Za-z][A-Za-z0-9]*)(?:@(\d{1,3})%)?\}')
GRAD = re.compile(r'gradient\.([A-Za-z][A-Za-z0-9]*)')

text_roles = {t['role'] for t in D['typography']['textTheme']} | {t['role'] for t in D['typography']['numerals']}
for clash in set(prims) & text_roles: E(f"name clash: '{clash}' is both a colour primitive and a text role — {{{clash}}} would be ambiguous")

def check_tokens(text, where, gradient_stops=False):
    # {name} is a colour primitive, or a TextTheme/numeral role when it appears in a type position (components).
    for name, alpha in TOKEN.findall(str(text)):
        if name not in prims and name not in text_roles: E(f"{where}: unknown token {{{name}}} (not a primitive, not a text role)")
        if alpha and name in text_roles: E(f"{where}: alpha on a text role {{{name}@{alpha}%}}")
        if alpha and not gradient_stops and int(alpha) not in levels and int(alpha) not in (0, 100):
            E(f"{where}: alpha {alpha}% not on alphaScale {sorted(levels)} (gradient stops are exempt)")
    for g in GRAD.findall(str(text)):
        if g not in C['gradients']: E(f"{where}: unknown gradient.{g}")

for k, v in C['colorScheme'].items():
    if k in ('brightness', 'note'): continue
    if k == 'seedColor' or TOKEN.search(str(v)): check_tokens(v, f"colorScheme.{k}")
    elif not GRAD.search(str(v)): W(f"colorScheme.{k} is not a token reference: {v}")
for k, v in C['roles'].items():
    if not (TOKEN.search(str(v)) or GRAD.search(str(v)) or str(v).startswith('transparent')): W(f"roles.{k} is not a token/gradient reference: {v}")
    check_tokens(v, f"roles.{k}")
for k, g in C['gradients'].items():
    for f in ('type', 'stops', 'use', 'evidence'):
        if f not in g: E(f"gradient {k} lacks {f}")
    if not re.search(r'\d+:\d+', str(g.get('evidence', ''))): E(f"gradient {k} evidence has no node id")
    if not re.fullmatch(r'[A-Za-z][A-Za-z0-9]*', k): E(f"gradient name '{k}' must be alphanumeric camelCase")
    for layer in ('stops', 'layer2', 'radial'):
        for c, p in g.get(layer, []):
            check_tokens(c, f"gradient {k}.{layer}", gradient_stops=True)
            if not (0 <= float(p) <= 1): E(f"gradient {k}.{layer} stop position {p} outside 0..1")
BARE = re.compile(r'^([A-Za-z][A-Za-z0-9]*)(?:@(\d{1,3}))?$')   # mappingFromDesign values are bare: 'brandAccent' or 'brandAccent@30'
mapped_prims = set()
for hx, tok in C['mappingFromDesign'].items():
    if not re.match(r'^#[0-9A-F]{6}$', hx): E(f"mappingFromDesign key not #RRGGBB: {hx}")
    m = BARE.match(tok)
    if m and m.group(1) in prims:
        mapped_prims.add(m.group(1))
        if m.group(2) and int(m.group(2)) not in levels and int(m.group(2)) not in (0, 100): E(f"mappingFromDesign {hx} → {tok}: alpha not on alphaScale")
    elif tok.startswith('brand.') and tok[6:] in C['brandConstants']: pass
    elif GRAD.search(tok): pass
    else: E(f"mappingFromDesign {hx} → '{tok}': not a primitive, brand constant or gradient")
for p in prims:
    if p not in mapped_prims: W(f"primitive {p} is never the target of a design hex (library-only or derived?)")

# ---- typography
roles = {t['role'] for t in T['textTheme']} | {t['role'] for t in T['numerals']}
fams = set(T['families'])
for t in T['textTheme'] + T['numerals']:
    for f in ('role', 'fontFamily', 'fontWeight', 'fontSize', 'lineHeightPx', 'height', 'letterSpacingPx', 'textCase', 'use', 'absorbs'):
        if f not in t: E(f"text role {t.get('role')} lacks {f} (use null/0/'' when not applicable)")
    if not re.fullmatch(r'[A-Za-z][A-Za-z0-9]*', str(t.get('role'))): E(f"text role name '{t.get('role')}' must be alphanumeric camelCase")
    if t['fontFamily'] not in fams: E(f"text role {t['role']} uses family {t['fontFamily']} not in typography.families")
    elif t['fontWeight'] not in T['families'][t['fontFamily']]['weights']: E(f"text role {t['role']}: weight {t['fontWeight']} not declared for {t['fontFamily']}")
    if abs(t['height'] - round(t['lineHeightPx'] / t['fontSize'], 2)) > 0.011: E(f"text role {t['role']}: height {t['height']} != lineHeightPx/fontSize {t['lineHeightPx']/t['fontSize']:.3f}")
for r in T['rawToRole']:
    if r['role'] not in roles: E(f"rawToRole '{r['design']}' → unknown role {r['role']}")
used_roles = {r['role'] for r in T['rawToRole']}
for r in roles:
    if r not in used_roles: W(f"text role {r} absorbs no design combination")
used_weights = {(t['fontFamily'], t['fontWeight']) for t in T['textTheme'] + T['numerals']}
for fam, v in T['families'].items():
    for w in v['weights']:
        if (fam, w) not in used_weights: W(f"family {fam} weight {w} declared but no role uses it (font file still needed?)")

# ---- layout
for scale in ('spacing', 'radius', 'iconSize'):
    sc = L[scale]['scale']
    vals = [v for v in sc.values() if isinstance(v, (int, float))]
    if vals != sorted(vals): W(f"layout.{scale}.scale not ascending: {sc}")
for k, v in L['radius'].get('roles', {}).items():
    if isinstance(v, (int, float)) and v not in L['radius']['scale'].values() and v != 9999: W(f"radius role {k}={v} off the radius scale")
for k, v in L['elevation'].items():
    if isinstance(v, dict):
        for f in ('offset', 'blur', 'color'):
            if f not in v: E(f"elevation {k} lacks {f}")
        check_tokens(v.get('color', ''), f"elevation {k}")

# ---- states / icons
for k, ex in S.get('examples', {}).items():
    for s, v in ex.items(): check_tokens(v, f"states.examples.{k}.{s}")
for k, v in S['rules'].items(): check_tokens(v, f"states.rules.{k}")

# ---- components
reg = CM['screenRegistry']
ids = [c['id'] for c in CM['items']]
if len(ids) != len(set(ids)): E("duplicate component ids")
if CM['count'] != len(CM['items']): E(f"components.count {CM['count']} != len(items) {len(CM['items'])}")
if CM['reusable'] != sum(1 for c in CM['items'] if c['reusable']): E("components.reusable count mismatch")
NODE = re.compile(r'\d+:\d+')
for c in CM['items']:
    for f in ('id', 'name', 'category', 'reusable', 'screens', 'screenCount', 'instanceCount', 'anatomy', 'tokens', 'evidence'):
        if f not in c: E(f"component {c.get('id')} lacks {f}")
    if c.get('screens') == ['(all)']:
        if c['screenCount'] != len(reg): E(f"component {c['id']}: screens (all) → screenCount must be {len(reg)} (registry size)")
    elif 'screens' in c and c['screenCount'] != len(c['screens']): E(f"component {c['id']}: screenCount {c['screenCount']} != len(screens) {len(c['screens'])}")
    for s in c.get('screens', []):
        if s == '(all)': continue
        if not NODE.fullmatch(s): E(f"component {c['id']}: malformed screen id '{s}'")
        elif s not in reg: E(f"component {c['id']}: screen {s} not in screenRegistry")
    if not c.get('evidence'): E(f"component {c['id']} has no evidence")
    for e in c.get('evidence', []):
        if not NODE.search(e): E(f"component {c['id']}: evidence '{e}' has no node id")
    check_tokens(json.dumps(c.get('tokens')) + json.dumps(c.get('states', {})) + json.dumps(c.get('variants', {})), f"component {c['id']}")
    # raw hexes are allowed only inside evidence/notes, never in tokens/states/variants
    for hx in re.findall(r'#[0-9A-Fa-f]{6,8}\b', json.dumps(c.get('tokens')) + json.dumps(c.get('states', {})) + json.dumps(c.get('variants', {}))):
        E(f"component {c['id']}: raw hex {hx} in tokens/states/variants (must be a token; hex belongs in evidence/notes)")
matrix_ids = {x for comps in CM['usageMatrix'].values() for x in comps}
for x in matrix_ids:
    if x not in ids: E(f"usageMatrix references unknown component {x}")
for s in CM['usageMatrix']:
    if s != '(all)' and s not in reg: E(f"usageMatrix screen {s} not in screenRegistry")
open_text = json.dumps(D['openItems'])
for s in reg:
    if s not in CM['usageMatrix'] or not CM['usageMatrix'][s]:
        if reg[s] in open_text or s in open_text: W(f"screen {s} ({reg[s]}) has no components — justified in openItems")
        else: E(f"screen {s} ({reg[s]}) has no components in usageMatrix and is not explained in openItems")
all_comp = {c['id'] for c in CM['items'] if c.get('screens') == ['(all)']}
for x in ids:
    if x not in matrix_ids and x not in all_comp: E(f"component {x} appears in no screen of usageMatrix")

# ---- decisions / open items
for x in D['decisions']:
    if not x.get('topic') or not x.get('decision'): E("decision without topic/decision")
if not D['openItems']: W("openItems is empty — unusual; did every open question get answered?")

# ---- rendered markdown in sync?
for f in ('design-system.md', 'design-component-catalogue.md', 'README.md'):
    if not os.path.exists(f'{FIN}/{f}'): E(f"{f} missing in {FIN}")
if os.path.exists(f'{FIN}/README.md'):
    rd = open(f'{FIN}/README.md').read()
    if '{{' in rd: E("README.md has unfilled {{placeholders}} — run render_readme.py")
    if os.path.getmtime(f'{FIN}/README.md') < os.path.getmtime(f'{FIN}/design-system.json'): W("README.md is older than design-system.json — re-run render_readme.py")
if os.path.exists(f'{FIN}/design-system.md'):
    md = open(f'{FIN}/design-system.md').read()
    for n, title in enumerate(['Colour primitives', 'Flutter `ColorScheme`', 'App roles', 'Gradients', 'Typography', 'Layout', 'Component states', 'Icons', 'Decisions log', 'Open items'], 1):
        if not re.search(rf'^## {n}\. {re.escape(title)}', md, re.M): E(f"design-system.md: section '## {n}. {title}' missing — figma-mapping.md / material-theming cite §{n}")
    if os.path.getmtime(f'{FIN}/design-system.md') < os.path.getmtime(f'{FIN}/design-system.json'): W("design-system.md is older than design-system.json — re-run render_docs.py")

print(f"{len(errors)} error(s), {len(warns)} warning(s)")
for e in errors: print("ERROR", e)
for w in warns: print("WARN ", w)
sys.exit(1 if errors or (STRICT and warns) else 0)
