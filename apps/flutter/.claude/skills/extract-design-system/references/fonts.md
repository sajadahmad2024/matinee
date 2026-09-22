# Fonts — bundle exactly what `typography.families` declares

Flutter does not map `fontWeight` onto a variable font's `wght` axis; ship **static** TTFs, one per declared weight, under `assets/fonts/<Family>/` with the family's licence file beside them.

## Source

Google Fonts repository, raw files: `https://raw.githubusercontent.com/google/fonts/main/ofl/<family-lowercase>/<File>.ttf` and `…/OFL.txt` (Apache-licensed families live under `apache/`, UFL under `ufl/`). Family directory names drop spaces (`dmsans`, `plusjakartasans`). If the family is not on Google Fonts (a purchased or client-supplied face) stop and ask the user for the files and licence terms — never substitute a look-alike silently; record the substitution in `decisions` if the user chooses one.

Two distribution shapes:

- **Static set** (`Family-SemiBold.ttf`, `Family-Bold.ttf`…): download the weights needed as-is.
- **Variable font** (`Family[wght].ttf` or `Family[opsz,wght].ttf`): download once and instance with fontTools:

```python
import re
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
NAMES = {100:"Thin",200:"ExtraLight",300:"Light",400:"Regular",500:"Medium",600:"SemiBold",700:"Bold",800:"ExtraBold",900:"Black"}
vf = TTFont(src)
axes = {a.axisTag: a for a in vf['fvar'].axes}
for w in weights:
    loc = {"wght": w}
    if "opsz" in axes: loc["opsz"] = axes["opsz"].defaultValue      # pin optical size at the default (body sizes)
    st = instancer.instantiateVariableFont(TTFont(src), loc, updateFontNames=True)
    for rec in st['name'].names:                                      # strip "9pt"/"14pt" optical-size fragments from names
        if rec.nameID in (1,2,3,4,6,16,17):
            rec.string = re.sub(r'\s*\d+pt\s*', ' ', rec.toUnicode()).strip() or "Regular"
    st['OS/2'].usWeightClass = w
    st.save(f"assets/fonts/{Family}/{Family}-{NAMES[w]}.ttf")
```

Verify each output with fontTools: `'fvar' not in font`, `OS/2.usWeightClass == weight`, family name clean. Note the `opsz` choice in `decisions` when the family has the axis (large display roles would be marginally tighter at a higher optical size).

## `pubspec.yaml`

```yaml
flutter:
  fonts:
    - family: <Family as used in TextStyle.fontFamily>   # spaces as the foundry writes it; must equal the typography.families key
      fonts:
        - asset: assets/fonts/<Family>/<Family>-Regular.ttf
          weight: 400
        - asset: assets/fonts/<Family>/<Family>-Bold.ttf
          weight: 700
```

One entry per declared weight, nothing extra (validate.py warns on a declared weight no role uses — drop the weight and the file rather than shipping dead bytes). Commit a comment pointing at `docs/design/design-system.md §5`. A fonts-only pubspec change needs no `pub get`; a running app needs a full restart, not hot reload.

## Size notes to pass on

Report per-family bytes. Large multilingual families (Inter ≈ 340 KB/weight) can be subset to Latin later if bundle size matters; do not subset by default — glyph fallback differs across platforms.
