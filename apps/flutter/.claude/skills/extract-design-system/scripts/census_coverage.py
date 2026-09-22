#!/usr/bin/env python3
"""Check that every colour and text combination the censuses saw is accounted for in design-system.json.

Usage: python3 census_coverage.py <docs/design dir> <raw dir>
  <raw dir> holds the saved use_figma outputs: 03_color_census.txt and 04_typography_census.txt.
Exit 1 when a census hex is neither in color.mappingFromDesign nor color.dropped (as a key or mentioned in a value),
or a census text combination has no rawToRole row. Warnings list families not in families/droppedFamilies.
"""
import json, re, sys

FIN, RAW = sys.argv[1], sys.argv[2]
D = json.load(open(f'{FIN}/design-system.json'))
C, T = D['color'], D['typography']
errors, warns = [], []

# ---- colours: census lines start with #AARRGGBB
census_hex = set()
for line in open(f'{RAW}/03_color_census.txt'):
    m = re.match(r'^#([0-9A-F]{2})([0-9A-F]{6})\s', line.strip())
    if m: census_hex.add('#' + m.group(2))          # alpha handled by @NN% on the primitive
dropped_text = json.dumps(C['dropped'])
for hx in sorted(census_hex):
    if hx in C['mappingFromDesign'] or hx in dropped_text or hx in json.dumps(C['brandConstants']): continue
    errors.append(f"census hex {hx} is neither mapped nor dropped")

# ---- typography: family/style|size|lh|ls|case|deco|n=…
def fmt(x): return f"{round(float(x), 2):g}"
def design_string(fam, style, size, lh, ls, case):
    # Contract grammar for rawToRole[].design: "<Family> <Style> <size>/<lh>[ <±ls>][ <CASE>]", numbers :g at 2 dp, lh 'auto' allowed
    lhpx = fmt(lh[:-2]) if lh.endswith('px') else (fmt(float(size) * float(lh[:-1]) / 100) if lh.endswith('%') else 'auto')
    s = f"{fam} {style} {fmt(size)}/{lhpx}"
    if ls not in ('0', '0px', ''):
        v = float(ls.replace('px', '').replace('%', ''))
        if ls.endswith('%'): v = float(size) * v / 100
        if round(v, 2) != 0: s += f" {'+' if v > 0 else '-'}{fmt(abs(v))}"
    if case: s += f" {case}"
    return s
rows = {r['design'] for r in T['rawToRole']}
dropped_combos = json.dumps(T.get('dropped', {}))     # typography.dropped: {"<design string>": "why"} for emoji, canvas labels, etc.
fams_seen = set()
for line in open(f'{RAW}/04_typography_census.txt'):
    parts = line.rstrip('\n').split('|')
    if len(parts) < 7 or '/' not in parts[0] or parts[0].startswith('family/'): continue
    fam, style = parts[0].split('/', 1); fams_seen.add(fam)
    ds = design_string(fam, style, parts[1], parts[2], parts[3], parts[4])
    if ds in rows or ds in dropped_combos: continue
    prefix = f"{fam} {style} {fmt(parts[1])}/"
    near = [r for r in rows if r.startswith(prefix)]
    errors.append(f"typography combination '{ds}' has no exact rawToRole row" + (f" (near: {near[:3]} — line height/tracking/case lost in the fold?)" if near else ""))
for fam in sorted(fams_seen):
    if fam not in T['families'] and fam not in T['droppedFamilies']: warns.append(f"family {fam} is neither shipped nor in droppedFamilies")

print(f"{len(errors)} error(s), {len(warns)} warning(s); census hexes {len(census_hex)}, families {len(fams_seen)}")
for e in errors: print("ERROR", e)
for w in warns: print("WARN ", w)
sys.exit(1 if errors else 0)
