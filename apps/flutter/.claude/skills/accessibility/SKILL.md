---
name: accessibility
description: Flutter accessibility auditing and remediation against WCAG 2.2 with conformance level selection (A, AA, AAA) across mobile, desktop, and web. Use when building, auditing, or reviewing widgets for screen reader support, target sizes, focus management, color contrast, text scaling, or motion sensitivity. Begins by confirming the WCAG level and target platform(s), then applies level-appropriate, platform-aware criteria and verifies with the flutter_test accessibility guidelines.
argument-hint: "[wcag-level] [platform]"
disable-model-invocation: true
effort: high
---

# Accessibility

Flutter accessibility auditing and remediation across WCAG 2.2 conformance levels A, AA, and AAA — semantics, target sizes, focus management, color contrast, text scaling, and motion sensitivity on mobile, desktop, and web.

WCAG 2.2 is the current W3C Recommendation (October 2023, updated December 2024). It is backward compatible with 2.1: every 2.1 criterion is in 2.2 except 4.1.1 Parsing, which was removed as obsolete. Audit against 2.2 unless the user names an older version; a 2.2 report satisfies a 2.1 request.

Verified against Flutter 3.47 (Dart 3.11). The APIs below are the current ones; the deprecated ones they replace fail this repo's `flutter analyze --fatal-infos`.

---

## Core Standards

Apply these standards to ALL accessibility work:

- **Confirm the WCAG 2.2 conformance level (A, AA, or AAA) before auditing** — never assume AA. If `$ARGUMENTS` supplies it, use it without asking
- **Confirm the target platforms (mobile, desktop, web) before auditing** — screen reader behavior and keyboard requirements differ per platform. If `$ARGUMENTS` supplies them, use them without asking
- **Every `Image` must have `semanticLabel` or be wrapped in `Semantics(label:)`** — decorative images use `excludeFromSemantics: true`
- **Never use `GestureDetector` for tap targets** — use `InkWell`, `FilledButton`, `TextButton`, or `IconButton`; `GestureDetector` is pointer-only and unreachable via keyboard or switch access
- **Interactive elements meet the project baseline of 48x48 dp** — this is the Material and Android guideline, checked by `androidTapTargetGuideline`. WCAG itself requires 24x24 CSS px at AA (2.5.8) and 44x44 at AAA (2.5.5); iOS requires 44x44 pt (`iOSTapTargetGuideline`). Enforce with `SizedBox`, `ConstrainedBox`, or `padding`
- **Never use color as the sole differentiator** — always pair color with a label, icon, or shape
- **All animations must respect `MediaQuery.disableAnimationsOf(context)`** — gate every `AnimationController`, implicit animation, `Hero` and route transition on it; use the selective `disableAnimationsOf`, never `MediaQuery.of(context).disableAnimations`, which rebuilds on every media query change
- **Icon-only buttons must have `Tooltip` or `Semantics(label:)`** — screen readers have no other way to convey purpose; `labeledTapTargetGuideline` catches misses
- **Never use `ExcludeSemantics` on non-decorative content** — doing so hides meaningful information from assistive technology
- **Fixed-height containers must not wrap `Text`** — use `minHeight` constraints; fixed heights clip text at 1.5-2x font scale
- **Announce changes with live regions, not one-off announcements** — `Semantics(liveRegion: true)` or `SemanticsRole.status` / `SemanticsRole.alert`. `SemanticsService.announce` is deprecated since Flutter 3.35; where a one-off is unavoidable, check `MediaQuery.supportsAnnounceOf(context)` and call `SemanticsService.sendAnnouncement(View.of(context), ...)`
- **Expose structure with roles, not only flags** — `Semantics(role: SemanticsRole.x)` for tabs, dialogs, lists, menus, status and alerts; `headingLevel` alongside `header: true` for headings. `SemanticsRole` needs `import 'package:flutter/semantics.dart'`; `material.dart` does not re-export it
- **All text and UI components must meet the contrast ratio for the selected WCAG level** — see the WCAG Level Criteria Reference section below for level-specific thresholds
- **Verify with the built-in guidelines** — every screen test ends with `meetsGuideline` for `androidTapTargetGuideline`, `iOSTapTargetGuideline`, `labeledTapTargetGuideline` and `textContrastGuideline` (see [references/testing.md](references/testing.md))

---

## Workflow

Every accessibility engagement follows four phases in sequence. Phases 1 and 2 are skipped only when `$ARGUMENTS` already answers them.

### Phase 1 — Conformance Level Selection

Before auditing or writing any accessibility code, ask:

> "Which WCAG 2.2 conformance level are you targeting?
>
> - **A** — Removes the most critical barriers. Covers alt text, keyboard access, no seizure risks, basic structure, error identification, consistent help and no redundant entry.
> - **AA** — Builds on Level A. Adds contrast ratios (4.5:1 / 3:1), resize text, reflow, focus visible and not obscured, 24x24 target size, drag alternatives, accessible authentication. This is the most common legal and compliance standard (EN 301 549, ADA, EAA).
> - **AAA** — Highest level. Adds enhanced contrast (7:1), 44x44 target size, focus appearance, no timing, and full keyboard operability. Full AAA is rarely required for entire products but may apply to specific components.
>
> Reply with A, AA, or AAA."

Record the selected level. All subsequent audit checks, report criteria references, and fix recommendations apply only the rules for that level (plus all levels below it).

### Phase 2 — Platform Selection

Ask:

> "Which platform(s) is this app targeting? Select all that apply:
>
> - **Mobile** — iOS (VoiceOver) and/or Android (TalkBack)
> - **Desktop** — macOS (VoiceOver), Windows (Narrator, NVDA, JAWS), Linux (Orca)
> - **Web** — browser-based; NVDA+Chrome (Windows), JAWS+Chrome (Windows), VoiceOver+Safari (macOS)
>
> Reply with one or more: Mobile, Desktop, Web."

Record selected platforms. Apply platform-specific checks during the audit:

- **Mobile** — 48 dp targets (44 pt on iOS), TalkBack/VoiceOver traversal order, gesture alternatives for every pointer-only interaction, drag alternatives (2.5.7); TalkBack on Android 14+ ignores announcements, so live regions are the only reliable status channel
- **Desktop** — full keyboard navigation for every interaction, focus indicators always visible and never obscured by sticky headers or sheets (2.4.11), no touch-only interactions, hover content dismissable (1.4.13)
- **Web** — the semantics tree is off until `SemanticsBinding.instance.ensureSemantics()` is called (keep the returned handle alive); bypass blocks (2.4.1), page titles (2.4.2, `Title` widget or route title), language of page (3.1.1), reflow at 320 CSS px (1.4.10), hover/focus content persistence (1.4.13)

### Phase 3 — Level-Appropriate Audit

Audit the provided files or widgets across the following six categories, checking only criteria applicable to the selected level AND relevant to the selected platforms. For each finding, capture: file path and approximate line number, WCAG criterion ID and name, platform(s) affected, current behavior, expected behavior, Flutter fix (before/after code).

Audit categories (check all six in order):

1. **Semantics & Screen Reader** — labels, roles (`SemanticsRole`), headings (`headingLevel`), live regions, merge/exclude semantics, form field `inputType` and `validationResult`. Screen readers by platform: TalkBack (Android), VoiceOver (iOS/macOS), Narrator/NVDA/JAWS (Windows), Orca (Linux)
2. **Target Sizes** — 48x48 dp project baseline on every interactive element; WCAG floor is 24x24 at AA (2.5.8) and 44x44 at AAA (2.5.5); on desktop/web verify the keyboard focus area is visible and sufficient
3. **Focus & Keyboard Navigation** — keyboard operability, traversal order, dialog focus trapping, focus indicators visible and not obscured, drag operations have a single-pointer alternative; critical for desktop and web; verify gesture fallbacks exist on mobile
4. **Color Contrast** — text and UI component ratios at the selected level's threshold; run `textContrastGuideline` against the real theme
5. **Text Scaling** — no fixed-height text containers, no `TextScaler.noScaling` or clamped `textScaler`, overflow handling at 200% scale, `MediaQuery.boldTextOf` respected
6. **Animation & Motion** — `disableAnimationsOf` gating on every animation and route transition; no content flashing > 3 Hz

After completing all six categories, produce the Audit Report using the level-specific template in [references/audit-templates.md](references/audit-templates.md).

### Phase 4 — Remediation Scope Selection

After delivering the report, use the `AskUserQuestion` tool with a single question:

```yaml
question: "The audit is complete. How would you like to proceed with fixes?"
header: "Fix scope"
options:
  - label: "All issues"
    description: "Fix every CRITICAL, MAJOR, and MINOR finding"
  - label: "Critical + Major only"
    description: "Fix blockers and significant barriers; skip MINOR polish items"
  - label: "Critical only"
    description: "Fix only what blocks assistive technology users entirely"
  - label: "Specific findings"
    description: "List the finding numbers you want fixed"
```

Apply exactly the fixes the user selects. Add or extend the `meetsGuideline` test for each touched screen. After applying fixes, confirm: "Fixed [N] findings ([severities]). [N remaining] remain open."

---

## WCAG Level Criteria Reference

Use this table during Phase 3 to determine which criteria apply at the selected level. Level AA includes all Level A criteria. Level AAA includes all Level A and AA criteria. Criteria new in WCAG 2.2 are marked **(2.2)**.

### Level A — Core Criteria

| WCAG ID | Criterion | Flutter Check |
| --- | --- | --- |
| 1.1.1 | Non-text Content | `semanticLabel` on images and icons; `Semantics(label:)` on custom paint; `excludeFromSemantics: true` on decorative |
| 1.3.1 | Info and Relationships | `SemanticsRole` for lists, tabs, dialogs, tables, menus; `header: true` + `headingLevel`; `MergeSemantics` for grouped content; `button`, `checked`, `selected` flags |
| 1.3.2 | Meaningful Sequence | Reading order matches visual order; `FocusTraversalGroup` with `OrderedTraversalPolicy` when it does not |
| 1.3.3 | Sensory Characteristics | Instructions do not rely solely on shape, size, visual location, or sound |
| 1.4.1 | Use of Color | Color never sole differentiator — always pair with icon, label, or pattern |
| 2.1.1 | Keyboard | All functionality via keyboard/switch access; no bare `GestureDetector` |
| 2.1.2 | No Keyboard Trap | Focus can always be moved away; standard Flutter overlay widgets handle this |
| 2.1.4 | Character Key Shortcuts | Single-key `Shortcuts` can be turned off or remapped, or only fire while a widget has focus |
| 2.3.1 | Three Flashes or Below Threshold | No content flashes > 3 times/second |
| 2.4.1 | Bypass Blocks | Skip navigation mechanism for repeated blocks — **web platform only** |
| 2.4.2 | Page Titled | Each screen has a meaningful title; `Title` widget or route title on web sets `<title>` |
| 2.4.3 | Focus Order | Tab/focus order preserves meaning; `FocusTraversalOrder` with `NumericFocusOrder` |
| 2.5.1 | Pointer Gestures | Multipoint or path-based gestures (pinch, swipe) have a single-pointer alternative |
| 2.5.2 | Pointer Cancellation | Actions fire on up, not down; `onTap`, never `onTapDown`, for commits |
| 2.5.3 | Label in Name | Visible label text is contained in the accessible name |
| 2.5.4 | Motion Actuation | Shake or tilt actions have a UI alternative and can be disabled |
| 3.2.6 **(2.2)** | Consistent Help | Help, contact and support entry points appear in the same relative place on every screen |
| 3.3.1 | Error Identification | Form errors identified in text, not color alone; `validationResult` on the field's semantics |
| 3.3.2 | Labels or Instructions | All form fields have visible labels; `InputDecoration(labelText:)` |
| 3.3.7 **(2.2)** | Redundant Entry | Previously entered data is auto-populated or selectable, never retyped within the same flow |
| 4.1.2 | Name, Role, Value | `Semantics(label:, role:)` or `button: true`, `Tooltip`; state exposed via `checked`, `selected`, `enabled`, `toggled` |
| 4.1.3 | Status Messages | `Semantics(liveRegion: true)` or `SemanticsRole.status` / `SemanticsRole.alert` for async status |

### Level AA — Additional Criteria (includes all Level A)

| WCAG ID | Criterion | Flutter Check |
| --- | --- | --- |
| 1.3.4 | Orientation | App does not lock to single orientation without essential reason; remove `SystemChrome.setPreferredOrientations` locks |
| 1.3.5 | Identify Input Purpose | Text fields use correct `keyboardType` and `autofillHints`; `Semantics(inputType:)` on custom fields |
| 1.4.3 | Contrast (Minimum) | Normal text 4.5:1; large text 3:1 against background; `textContrastGuideline` |
| 1.4.4 | Resize Text | Text scales to 200% without loss of content or functionality; no fixed-height text containers, no `TextScaler.noScaling`, no `clamp` on the user's scaler |
| 1.4.5 | Images of Text | Do not use images of text for styled text — use `Text` widget |
| 1.4.10 | Reflow | Content reflows at 320 CSS px equivalent without horizontal scroll — use `Flexible`, `Wrap`, `SingleChildScrollView` |
| 1.4.11 | Non-text Contrast | UI components and focus indicators have at least 3:1 contrast |
| 1.4.12 | Text Spacing | Content not lost when letter/word/line spacing increased; avoid `overflow: TextOverflow.clip` in fixed containers |
| 1.4.13 | Content on Hover or Focus | Hoverable/focusable content is dismissable, hoverable, and persistent — **web/desktop: hover tooltips and menus** |
| 2.4.5 | Multiple Ways | More than one way to locate a screen (search, navigation, sitemap) |
| 2.4.6 | Headings and Labels | Headings and labels are descriptive; `Semantics(header: true, headingLevel:)` for section headings |
| 2.4.7 | Focus Visible | Keyboard focus indicator is always visible |
| 2.4.11 **(2.2)** | Focus Not Obscured (Minimum) | Focused element is not fully hidden behind sticky headers, bottom bars, sheets or snackbars — **desktop/web priority** |
| 2.5.7 **(2.2)** | Dragging Movements | Every drag (reorder, slider, dismiss) has a single-pointer alternative: buttons, a menu action, or `Slider` keyboard steps |
| 2.5.8 **(2.2)** | Target Size (Minimum) | Targets at least 24x24 CSS px or spaced so 24 px circles do not overlap; the project baseline of 48 dp already exceeds this |
| 3.1.2 | Language of Parts | Language changes in content are programmatically identified — **web platform: `lang` attribute** |
| 3.2.3 | Consistent Navigation | Navigation is consistent across screens |
| 3.2.4 | Consistent Identification | Components with same function identified consistently |
| 3.3.3 | Error Suggestion | When input error is detected, correction is suggested if possible |
| 3.3.4 | Error Prevention | Submissions with legal/financial data are reversible or confirmable |
| 3.3.8 **(2.2)** | Accessible Authentication (Minimum) | No cognitive function test (memorised password retyping, puzzles) without an alternative; allow paste and autofill, support passkeys or magic links |

### Level AAA — Additional Criteria (includes all Level A and AA)

| WCAG ID | Criterion | Flutter Check |
| --- | --- | --- |
| 1.4.6 | Contrast (Enhanced) | Normal text 7:1; large text 4.5:1 against background |
| 2.1.3 | Keyboard (No Exception) | All functionality via keyboard with no exceptions — no `GestureDetector` anywhere |
| 2.2.3 | No Timing | No time limits except for real-time events |
| 2.2.6 | Timeouts | Users warned of inactivity timeouts |
| 2.3.2 | Three Flashes | No content flashes at all — zero tolerance, not just below threshold |
| 2.3.3 | Animation from Interactions | All motion animation can be disabled — gate every animation and transition on `disableAnimationsOf` |
| 2.4.8 | Location | Users always know where they are within the app |
| 2.4.9 | Link Purpose (Link Only) | Link purpose understandable from link text alone |
| 2.4.12 **(2.2)** | Focus Not Obscured (Enhanced) | No part of the focused element is hidden by author content |
| 2.4.13 **(2.2)** | Focus Appearance | Focus indicator area at least a 2 px perimeter of the component, with 3:1 contrast between focused and unfocused states |
| 2.5.5 | Target Size (Enhanced) | Targets at least 44x44 CSS px; the 48 dp baseline satisfies this, `iOSTapTargetGuideline` checks 44 |
| 2.5.6 | Concurrent Input Mechanisms | App does not restrict input to a single modality |
| 3.2.5 | Change on Request | Context changes only initiated by user request |
| 3.3.5 | Help | Context-sensitive help is available |
| 3.3.6 | Error Prevention (All) | All submissions are reversible or confirmable |
| 3.3.9 **(2.2)** | Accessible Authentication (Enhanced) | No cognitive function test at all, not even object or picture recognition |

---

## Semantics & Screen Reader

Flutter's `Semantics` widget communicates widget purpose to screen readers (TalkBack on Android, VoiceOver on iOS and macOS, Narrator/NVDA/JAWS on Windows, Orca on Linux).

**Anti-patterns — missing or wrong semantic labels:**

```dart
// WRONG — Empty semanticLabel on meaningful content
Image.asset('assets/warning_icon.png', semanticLabel: '') // announces nothing

// WRONG — No semanticLabel on informative image
Image.asset('assets/chart.png') // screen reader skips or announces filename
```

**Anti-pattern — excluding meaningful content:**

```dart
// WRONG — Hides actionable content from assistive technology
ExcludeSemantics(
  child: FilledButton(onPressed: _submit, child: const Text('Submit')),
)
```

**Roles and headings** — flags such as `button` and `header` still work; roles give assistive technology the structure the flags cannot:

```dart
import 'package:flutter/semantics.dart';

Semantics(header: true, headingLevel: 2, child: Text(context.l10n.recommended))
Semantics(role: SemanticsRole.list, child: ListView(...))
Semantics(role: SemanticsRole.alertDialog, child: AlertDialog(...))
```

**Live regions** — dynamic content that updates without interaction must announce changes. `SemanticsRole.status` is a polite live region and `SemanticsRole.alert` an assertive one; setting `liveRegion: true` on top of either is an assertion failure:

```dart
Semantics(liveRegion: true, child: Text('$itemCount items in cart'))
Semantics(role: SemanticsRole.status, child: Text(context.l10n.saved))
```

**Anti-pattern — deprecated announcement API:**

```dart
// WRONG — deprecated since Flutter 3.35; also ignored by TalkBack on Android 14+
SemanticsService.announce('Upload complete', TextDirection.ltr);

// CORRECT — only where the platform supports it, with the view passed explicitly
if (MediaQuery.supportsAnnounceOf(context)) {
  await SemanticsService.sendAnnouncement(View.of(context), message, Directionality.of(context));
}
```

---

## Target Sizes

Three numbers apply, and they are not the same rule:

| Source | Minimum | Level | Checked by |
| --- | --- | --- | --- |
| WCAG 2.5.8 Target Size (Minimum) | 24x24 CSS px, or 24 px spacing | AA | manual |
| WCAG 2.5.5 Target Size (Enhanced) and iOS HIG | 44x44 | AAA / iOS | `iOSTapTargetGuideline` |
| Material and Android guideline, project baseline | 48x48 dp | project | `androidTapTargetGuideline` |

The project baseline is 48 dp on every platform, which satisfies all three.

**Anti-pattern — touch target too small:**

```dart
// WRONG — Touch target is 24x24, below the 48dp baseline
SizedBox(
  width: 24,
  height: 24,
  child: GestureDetector(
    onTap: _onTap,
    child: const Icon(Icons.close, size: 24),
  ),
)
```

Use `IconButton` (48 dp with `MaterialTapTargetSize.padded`), `ConstrainedBox(minWidth: 48, minHeight: 48)`, or `Padding(padding: EdgeInsets.all(12))` around small icons.

---

## Focus & Keyboard Navigation

Every interactive widget must be reachable via keyboard and switch access (WCAG 2.1.1, 2.1.2). Use `FocusTraversalGroup` + `OrderedTraversalPolicy` when the default tab order does not match the visual reading order. `showDialog` and `showModalBottomSheet` handle focus trapping and restoration automatically.

**Anti-pattern — keyboard-inaccessible tap handler:**

```dart
// WRONG — GestureDetector is not keyboard-accessible
GestureDetector(onTap: _onTap, child: const Text('Click me'))

// CORRECT — InkWell is focusable and keyboard-accessible
InkWell(onTap: _onTap, child: const Text('Click me'))
```

Focus indicators must meet 3:1 contrast (1.4.11 AA) and must not be hidden behind sticky bars or sheets (2.4.11 AA). At AAA, 2.4.13 requires the indicator to cover at least a 2 px perimeter of the component. Drag interactions such as reorderable lists, dismissibles and sliders need a single-pointer alternative (2.5.7 AA): an overflow menu action, move buttons, or keyboard steps.

---

## Color Contrast

Contrast requirements start at Level AA — Level A has no contrast requirement.

| Element | Level AA | Level AAA | WCAG criterion |
| --- | --- | --- | --- |
| Normal text (< 18pt / < 14pt bold) | 4.5:1 | 7:1 | 1.4.3 / 1.4.6 |
| Large text (>= 18pt / >= 14pt bold) | 3:1 | 4.5:1 | 1.4.3 / 1.4.6 |
| UI components and focus indicators | 3:1 | 3:1 | 1.4.11 |

Colours come from `Theme.of(context).colorScheme` and `context.appColors`, which mirror `docs/design/`. `textContrastGuideline` measures the rendered text at the AA thresholds; a failure is a theme finding for the **Material Theming** skill, not a widget override. When `MediaQuery.highContrastOf(context)` is true, widen hairlines and strengthen borders.

**Anti-patterns:**

```dart
// WRONG — Light gray on white fails 4.5:1
Text('Status: Active', style: TextStyle(color: Colors.grey.shade300))

// WRONG — Color as sole differentiator
Container(color: isValid ? Colors.green : Colors.red) // no label or icon
```

---

## Text Scaling

Widgets must accommodate user font-size preferences up to 2x scale without clipping (WCAG 1.4.4). Use `MediaQuery.textScalerOf(context)` when a dimension must scale with text, and honour `MediaQuery.boldTextOf(context)` in custom text painting.

**Anti-pattern — fixed height around text:**

```dart
// WRONG — Fixed height clips text at large scale
SizedBox(height: 48, child: Text('This text will be clipped at 1.5x font scale'))
```

**Anti-pattern — clamping text scale:**

```dart
// WRONG — Overrides user accessibility preferences
MediaQuery(
  data: MediaQuery.of(context).copyWith(textScaler: TextScaler.noScaling),
  child: const Text('Ignoring user font preferences'),
)
```

Use `ConstrainedBox(constraints: BoxConstraints(minHeight: 48))` around text containers.

---

## Animation & Motion

All animations must respect `MediaQuery.disableAnimationsOf(context)` (WCAG 2.3.3). No content may flash > 3 Hz (WCAG 2.3.1). Route transitions count: override `buildPage` on the typed route to return a `NoTransitionPage` when animations are disabled.

**Anti-pattern — ignoring reduced-motion preference:**

```dart
// WRONG — Animation always plays regardless of user preference
AnimatedContainer(
  duration: const Duration(milliseconds: 500),
  color: scheme.primary,
  child: child,
)

// CORRECT — Gate on the selective disableAnimationsOf, not MediaQuery.of(context)
AnimatedContainer(
  duration: MediaQuery.disableAnimationsOf(context)
      ? Duration.zero
      : const Duration(milliseconds: 500),
  color: scheme.primary,
  child: child,
)
```

---

## Additional Resources

- [Extended code examples](references/examples.md) — full widget classes per category (`AccessibleRatingBar`, `UploadStatusIndicator`, reduced-motion typed route, etc.)
- [Audit report templates](references/audit-templates.md) — level-specific templates (A, AA, AAA) with pre-annotated passed checks
- [Full accessibility test suite](references/testing.md) — `meetsGuideline` and `ensureSemantics` patterns covering all six categories, verified on Flutter 3.47
- [Widget-to-accessibility mapping](references/widget-mapping.md) — quick-reference table of Flutter widgets and their accessibility requirements

Official references:

- [Flutter Accessibility Guide](https://docs.flutter.dev/ui/accessibility)
- [WCAG 2.2 Recommendation](https://www.w3.org/TR/WCAG22/)
- [WCAG 2.2 Understanding Documents](https://www.w3.org/WAI/WCAG22/Understanding/)
- [What's New in WCAG 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/)
