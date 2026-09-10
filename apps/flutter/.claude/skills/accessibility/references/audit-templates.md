# Accessibility — Audit Report Templates

Audit report templates by WCAG 2.2 conformance level, including severity guide and passed-checks checklists for levels A, AA, and AAA.

---

## Audit Report Templates by Level

Each template is pre-annotated with the criteria applicable at that level. Use the template matching the level selected in Phase 1 of the Workflow.

### Severity Guide

| Severity | Meaning |
| --- | --- |
| **CRITICAL** | Blocks assistive technology users entirely — fix before merging |
| **MAJOR** | Significant barrier — fix in current sprint |
| **MINOR** | Degraded experience or polish item — schedule for next sprint |

Severity assignment:

- **CRITICAL** — criterion applies at selected level AND issue completely blocks the use case (e.g., no semantic label on primary action, `GestureDetector` on a required flow, zero focus visibility, web app never calls `ensureSemantics`)
- **MAJOR** — criterion applies at selected level AND issue significantly degrades the experience (e.g., contrast ratio fails by > 1 point, target below 40 dp, dialog does not trap focus, drag with no single-pointer alternative)
- **MINOR** — criterion applies at selected level AND issue is a refinement (e.g., contrast fails marginally, live region missing on non-critical status, heading without `headingLevel`)

### Template (all levels)

```text
# Flutter Accessibility Audit

**Date:** YYYY-MM-DD
**Standard:** WCAG 2.2
**Level:** [A | AA | AAA]
**Platforms:** [Mobile | Desktop | Web | combination]
**Files audited:**
- path/to/file.dart

## Summary
| Severity | Count |
|----------|-------|
| CRITICAL |  0    |
| MAJOR    |  0    |
| MINOR    |  0    |

## Automated checks
[result of meetsGuideline for androidTapTargetGuideline, iOSTapTargetGuideline,
 labeledTapTargetGuideline, textContrastGuideline on each audited screen]

## Findings

### 1. [Short descriptive title]
- **File:** path/to/file.dart ~L42
- **WCAG:** [criterion ID] [criterion name] (Level [A/AA/AAA])
- **Platform(s):** [Mobile | Desktop | Web | All]
- **Severity:** [CRITICAL | MAJOR | MINOR]
- **Issue:** [description]
- **Fix:**
  // Before
  [existing code]

  // After
  [fixed code]

### 2. [Next finding...]

## Passed Checks
[copy the applicable checks from the level lists below]
```

### Passed Checks — Level A

```text
- [x] A · Semantics & Screen Reader — all images/icons have semantic labels; roles and headings correct (1.1.1, 1.3.1, 4.1.2)
- [x] A · Status Messages — async status uses a live region or status/alert role (4.1.3)
- [x] B · Target Sizes — all interactive elements >= 48 dp (project baseline)
- [x] C · Focus & Keyboard — all interactions reachable via keyboard; no traps; pointer gestures have alternatives (2.1.1, 2.1.2, 2.5.1)
- [x] D · Color — color is never sole differentiator (1.4.1)
- [x] E · Text Scaling — no fixed-height text containers
- [x] F · Animation & Motion — no content flashes > 3 Hz (2.3.1)
- [x] G · Consistent Help — help entry points in the same place on every screen (3.2.6)
- [x] H · Redundant Entry — no re-entry of data within a flow (3.3.7)
```

### Passed Checks — Level AA (Level A + these)

```text
- [x] C · Focus & Keyboard — focus indicator visible with 3:1 contrast and never obscured (2.4.7, 1.4.11, 2.4.11)
- [x] C · Dragging — every drag has a single-pointer alternative (2.5.7)
- [x] B · Target Sizes — WCAG minimum 24x24 CSS px or spacing met (2.5.8)
- [x] D · Color Contrast — normal text >= 4.5:1, large text >= 3:1, UI components >= 3:1 (1.4.3, 1.4.11); textContrastGuideline passes
- [x] E · Text Scaling — text scales to 200% without loss (1.4.4)
- [x] F · Animation & Motion — all animations gated on disableAnimationsOf (2.3.3)
- [x] I · Orientation — not locked to single orientation (1.3.4)
- [x] J · Input Purpose — autofillHints and keyboardType correct (1.3.5)
- [x] K · Reflow — content reflows at 320px equivalent (1.4.10) [web/desktop]
- [x] L · Accessible Authentication — paste and autofill allowed, no cognitive test without alternative (3.3.8)
```

### Passed Checks — Level AAA (Level AA + these)

```text
- [x] B · Target Sizes — all interactive elements >= 44x44 (2.5.5); iOSTapTargetGuideline passes
- [x] C · Focus & Keyboard — no GestureDetector anywhere (2.1.3); focus never obscured at all (2.4.12); indicator covers a 2 px perimeter with 3:1 change (2.4.13)
- [x] D · Color Contrast (Enhanced) — normal text >= 7:1, large text >= 4.5:1 (1.4.6)
- [x] F · Animation & Motion — zero flashing content (2.3.2)
- [x] M · No Timing — no mandatory time limits (2.2.3)
- [x] N · Location — breadcrumbs or current-screen indication visible (2.4.8)
- [x] O · Input Modality — no single-modality restriction (2.5.6)
- [x] L · Accessible Authentication (Enhanced) — no cognitive test of any kind (3.3.9)
```
