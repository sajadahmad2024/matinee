#!/usr/bin/env python3
"""Fill references/README.template.md from design-system.json → docs/design/README.md.

Usage: python3 render_readme.py <docs/design dir> [<template path>]
Every {{PLACEHOLDER}} is derived from the JSON ($meta.figma.* and counts); none is typed by hand.
"""
import json, os, re, sys

FIN = sys.argv[1] if len(sys.argv) > 1 else 'docs/design'
TPL = sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'references', 'README.template.md')
D = json.load(open(f'{FIN}/design-system.json'))
M, F = D['$meta'], D['$meta']['figma']
T, C, CM = D['typography'], D['color'], D['components']
numerals = len(T.get('numerals', []))
alt = C.get('colorSchemeAlt')
vals = {
    'PROJECT': M['project'], 'FILE_KEY': F['fileKey'], 'PAGE_NAME': F['pageName'], 'PAGE_ID': F['pageId'],
    'FRAME_COUNT': F['frameCount'], 'DATE': M['generated'],
    'MODES_SENTENCE': f"The app ships {'two colour modes (' + C['colorScheme']['brightness'] + ' + ' + alt['brightness'] + ')' if alt else 'one colour mode (' + C['colorScheme']['brightness'] + ')'}, as designed.",
    'PRIMITIVE_COUNT': len(C['primitives']), 'ROLE_COUNT': len(C['roles']), 'GRADIENT_COUNT': len(C['gradients']),
    'FAMILY_COUNT': len(T['families']), 'TEXT_ROLE_COUNT': len(T['textTheme']),
    'NUMERAL_CLAUSE': f" + {numerals} numeral roles" if numerals else "",
    'COMPONENT_COUNT': CM['count'],
}
out = open(TPL).read()
for k, v in vals.items(): out = out.replace('{{' + k + '}}', str(v))
left = re.findall(r'\{\{[A-Z_]+\}\}', out)
if left: sys.exit(f"unfilled placeholders: {left}")
open(f'{FIN}/README.md', 'w').write(out)
print(f"README.md {os.path.getsize(f'{FIN}/README.md')} bytes")
