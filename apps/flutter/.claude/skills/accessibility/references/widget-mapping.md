# Accessibility — Widget-to-Accessibility Requirements Mapping

Quick-reference table mapping Flutter widgets to their accessibility requirements and recommended implementations. Current for Flutter 3.47.

---

## Widget-to-Accessibility Requirements Mapping

| Widget | Accessibility Requirement | Implementation |
| --- | --- | --- |
| `Image` | Text alternative | `semanticLabel` or `Semantics(label:)`; use `excludeFromSemantics: true` for decorative images |
| `Icon` | Text alternative | `semanticLabel` parameter, or rely on the enclosing labelled widget |
| `IconButton` | Text alternative + target size | `tooltip` parameter (also the semantic label); 48 dp target via `MaterialTapTargetSize.padded` |
| `GestureDetector` | Keyboard access | Replace with `InkWell` or a button widget; `GestureDetector` is pointer-only |
| `InkWell` | Semantic role | Add `Semantics(label:, button: true)` when used as a custom button |
| `FilledButton` / `TextButton` / `OutlinedButton` | Target size | Inherit 48 dp minimum; provide descriptive `child` text |
| `TextField` / `TextFormField` | Label + purpose | `InputDecoration(labelText:)` always; `keyboardType` and `autofillHints` for 1.3.5; `errorText` for 3.3.1 |
| `Checkbox` | Label + state | Wrap in `CheckboxListTile` for automatic label association |
| `Switch` | Label + state | Wrap in `SwitchListTile` for automatic label association |
| `Slider` | Label + value + drag alternative | `Semantics(label:, value:)`; keyboard steps are built in and satisfy 2.5.7 |
| `ReorderableListView` / `Dismissible` | Drag alternative | Provide move or delete actions via buttons or a menu (2.5.7) |
| `DropdownMenu` | Label + expanded state | `label:` parameter; `DropdownButtonFormField` with `InputDecoration(labelText:)` for the older widget |
| `Text` used as a heading | Structure | `Semantics(header: true, headingLevel: n)` |
| Section container | Landmark role | `Semantics(role: SemanticsRole.region / navigation / main)` |
| `ListView` of items | List semantics | `Semantics(role: SemanticsRole.list)` with `SemanticsRole.listItem` children when items are not `ListTile` |
| Status text | Live region | `Semantics(liveRegion: true)` or `Semantics(role: SemanticsRole.status)`; `SemanticsRole.alert` for errors; never both on one node |
| One-off announcement | Announcement | `SemanticsService.sendAnnouncement(View.of(context), ...)` guarded by `MediaQuery.supportsAnnounceOf`; `announce` is deprecated |
| `AlertDialog` | Focus management + role | `showDialog` traps and restores focus; `AlertDialog` already carries `SemanticsRole.alertDialog` |
| `BottomSheet` | Focus management | `showModalBottomSheet` handles focus trapping and restoration automatically |
| `TabBar` | Tab semantics | Flutter provides `tab` / `tabBar` / `tabPanel` roles via `TabBar` + `TabBarView` |
| `Tooltip` | Hover content (1.4.13) | Default `Tooltip` is dismissable and persistent; keep `showDuration` long enough to read |
| `AnimatedContainer` and other implicit animations | Motion sensitivity | `duration: MediaQuery.disableAnimationsOf(context) ? Duration.zero : ...` |
| `AnimationController` | Motion sensitivity | Skip `forward()` or set `value = 1` when `disableAnimationsOf` is true |
| `Hero` | Motion sensitivity | Return the child directly when `disableAnimationsOf` is true |
| `GoRouteData` page | Motion sensitivity | Override `buildPage` to return `NoTransitionPage` when `disableAnimationsOf` is true |
| Custom painted text | Bold text setting | Read `MediaQuery.boldTextOf(context)` and switch weight |
| Hairlines and outlines | High contrast setting | Read `MediaQuery.highContrastOf(context)` and widen |
| Web app root | Semantics tree | Call `SemanticsBinding.instance.ensureSemantics()` once and keep the handle; the tree is otherwise off until the user finds the hidden enable button |

---

## References

- [Flutter Accessibility Guide](https://docs.flutter.dev/ui/accessibility) — official Flutter documentation on accessibility APIs, TalkBack/VoiceOver integration, and `Semantics` widget usage
- [`Semantics` widget API](https://api.flutter.dev/flutter/widgets/Semantics-class.html) — every flag, role and action the semantics tree carries
- [`SemanticsRole` enum](https://api.flutter.dev/flutter/dart-ui/SemanticsRole.html) — the roles available for `Semantics(role:)`
- [WCAG 2.2 Understanding Documents](https://www.w3.org/WAI/WCAG22/Understanding/) — W3C explanations of each success criterion, including intent, examples, and sufficient techniques
- [WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/) — filterable checklist of all success criteria by level
