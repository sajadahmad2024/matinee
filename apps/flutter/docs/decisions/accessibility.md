# Decision record: accessibility

What the app was audited against, what was changed to meet it, and the Flutter behaviours the fixes turn on. Grounded in WCAG 2.2 (W3C Recommendation, October 2023, updated December 2024) and verified against Flutter 3.47.2 by reading the live semantics tree rather than by inspection.

## Target

**WCAG 2.2 Level AA on mobile, plus the Level AAA criteria that cost nothing visually.** AA is the standard EN 301 549, the ADA and the EAA reference, so it is the line the app has to hold. Two AAA criteria were taken because they neither change a layout nor need a design decision: 2.5.5 Target Size (Enhanced), which the project's own 48 dp baseline already exceeds, and 2.3.3 Animation from Interactions, which is one gate on a flag the platform already provides. The rest of AAA — 7:1 contrast above all — would mean re-deriving the palette and was left out.

Mobile only. Desktop and web add keyboard operability, reflow at 320 px, bypass blocks and the web semantics switch; none of that applies until those targets ship, and `SemanticsBinding.instance.ensureSemantics()` in particular is web-specific.

## Flutter behaviours the fixes turn on

These four are not obvious, cost a day to establish, and are the reason several fixes look the way they do. Each was confirmed by dumping the semantics tree in a widget test, not from the documentation.

**A fully transparent `Opacity` drops its subtree from the semantics tree.** `RenderOpacity.visitChildrenForSemantics` skips the child when the alpha is zero unless `alwaysIncludeSemantics` is set. The OTP row draws its digits in boxes over an invisible field, so before the flag the only nodes on the verify screen were six loose digits — there was no field to type a code into and the screen could not be completed with a screen reader at all. This is the single worst failure the audit found, and the fix is one flag.

**`Semantics(label:)` around a `TextField` does name it; `textField: true` on top of that breaks it.** The label alone merges into the field's own node. Adding the flag makes a second text-field node that cannot merge with the real one, which leaves two focus stops — one holding the name with no value, one the value with no name. The bid bar had exactly that shape. So a field whose label the design draws outside its frame takes `Semantics(label:)` and never the flag.

**`InputDecoration.errorText` reaches the field's `hint`, never its validation state.** Neither `TextField` nor `InputDecorator` sets `validationResult` in 3.47, so an invalid field is announced with its message but is not announced as invalid. Fields set `validationResult` themselves, and the ones with no Material `errorText` pass the message as `hint` to match what Material does.

**A `Semantics` annotation with no `container: true` merges into the nearest ancestor node, siblings and all.** Three profile counters annotated separately came out as one node reading "2,500 Total Points 257 Streaks #260 Rank". Anything that groups a block into one label and is not itself a control — a stat card, a bid row, a feature row — needs `container: true`; a control does not, because its tap action already forms a boundary.

**Semantics assertions only fire when something is listening.** The role checks run in `SemanticsNode._addToUpdate`, reached from `flushSemantics`, which does nothing until semantics are enabled — so a defect of this kind is invisible to a test that does not call `ensureSemantics()`, and 226 passing tests said nothing about it. Every flow that shows a message or swaps a screen in place is now pumped with semantics on, and each of those tests was checked by reintroducing the crash and watching it fail. Timing matters as much as the flag: the check runs when the node is flushed, which for a snackbar is after its entrance animation, so a frame or two proves nothing — and `pumpAndSettle` overshoots, running out the four seconds a snackbar lives for and the half-second before the edit-profile save pops its route. `pumpAnnouncement` in `test/helpers` sits inside both windows.

**A live region has to have a size, and an annotation with a label has to exclude what it wraps.** A status region around a `SizedBox.shrink()` is a zero-area node that VoiceOver discards, so it never speaks — an attempt to announce a quick-add's new bid total was removed for that reason rather than left in looking correct. And a `Semantics(label:)` whose child still carries its own text merges the two: the top-up receipt announced its title twice until the subtree was excluded.

Two smaller ones: `IconButton`'s `tooltip` is a valid accessible name, carried in the node's `tooltip` rather than its `label`, and `labeledTapTargetGuideline` accepts it; and that same guideline **skips nodes flagged `isTextField`**, which is why a suite full of passing guideline checks sat on top of three unnamed form fields. Guideline checks are necessary and not sufficient — a field's name needs its own assertion.

## What the app does now

**One heading per screen, and sections under it.** `ScreenTitle` marks the text that names a screen as level 1; `SectionLabel` carries level 2. Both read their label from the semantics rather than the glyphs, because the design sets several titles and every eyebrow in upper case and a short capitalised run — "P2P", "LIVE" — is spelled out letter by letter by several screen readers. Before this nothing in the app was a heading except the section eyebrow, so heading navigation had nothing to jump between.

**Async state is announced.** `LoadingView` is a polite status region and `ErrorView` an assertive alert; neither carried anything before. The top-up receipt is an alert too, because it replaces the picker in place with no route change and no focus move, so nothing else would prompt a re-read.

**Snackbars are left alone.** They already announce themselves: `SnackBar` wraps itself in `Semantics(container: true, liveRegion: true)`, and `InputDecorator` does the same for its error text. An audit finding that claimed otherwise was wrong, and the helper written to act on it — a snackbar whose content carried `SemanticsRole.alert` — put a role and a live region on one node, which the framework asserts against. It crashed the app on Save Changes with a screen reader running. **Never put `SemanticsRole.alert` or `SemanticsRole.status` on anything the framework already marks live**: `SnackBar`, `InputDecoration`'s error and counter, `MaterialBanner`, `ExpansionTile`, `CalendarDatePicker`. Check the widget's source before adding a role, rather than assuming nothing is there.

**Colour is never the only signal.** The standing bid, a selected top-up pack and the auth legal links were distinguished by gold, a two-pixel border and gold again. They now carry, respectively, a "Leading bid" prefix, `selected` with `inMutuallyExclusiveGroup`, and an underline. The links needed the underline only: a `TextSpan` with a recognizer already reaches a screen reader as a link with a tap action, so the role was never missing.

**Announcements are worded, not formatted.** A value that reads well on screen often does not read well aloud: `01:07:32` becomes "about 1h 7m", the last minute becomes "less than a minute" rather than the "about 0h 0m" that rounding produces, and under an hour drops the leading "0h". The drawn value is unchanged in every case.

**Ticking values are announced coarsely.** The auction countdown and the OTP resend timer repaint every second. Announced as drawn they would be re-read every second to anyone resting on them, so the countdown is spoken to the minute and the resend wait to the nearest ten seconds while the digits keep ticking visually. This is a deliberate divergence between what is drawn and what is said.

**A screen scrolls only when it has to.** Making a screen scrollable is not free: a viewport clips its child, so the unlock CTA's gold glow — which paints 30 below its own box — was cut off at the bottom edge, and the screen bounced with nowhere to go. Both came from one mistake: a scroll view lays its `padding` out around the child, so a minimum height of the full viewport makes the content taller than the viewport by exactly that padding. Subtracting it, the way `AuthScaffold` already did, leaves the unlock screen fixed at 1x and 1.5x and scrolling only at 2x, where it is needed — and the framework pushes no clip at all while the content fits, so the glow paints in full again.

**Nothing is unreachable as text grows.** The unlock screen, the top-up sheet and the refer sheet had no scroll view: the unlock screen ran 77 px past the bottom at a 1.5 text scale — below the everyday setting, let alone the 200% AA requires — and the refer sheet 471 px at 200%. All three scroll now. Two layout rules came out of it: a flexible child cannot live in a shrink-wrapping column, so a block that used an `Expanded` to centre itself uses `spaceBetween` instead; and `ContentContainer` needs `shrinkWrapHeight: true` inside a sheet, or its `Align` fills the cap it is given and stands the sheet full height whatever it holds.

**The bottom bar is a tab bar.** `SemanticsRole.tabBar` with `SemanticsRole.tab` children, which needs `explicitChildNodes` on the bar and the tap action on the tab node itself — the role asserts that a tab has one, and excluding the item's subtree takes the `InkWell`'s tap with it.

## Two colour tokens moved, and why that was a design change

`textContrastGuideline` found two pairs under AA's 4.5:1 for normal-size text: the LIVE badge's white on `error` at 3.48:1, and the onboarding stat caption's `authTextMuted` on the gold-tinted pill at 3.20:1. Both are theme findings, not widget ones, so neither was patched at the call site.

The caption took the adjacent documented role, `authTextSecondary`, which measures 6.24:1 — a remap, no new colour. The badge needed a colour that does not exist in the design, so `errorDeep` #C43A3A was derived from `error` and given to the badge alone (5.23:1), leaving `error` the frame's red everywhere it carries no white text. `docs/design/` records both in the palette table, the role map, the decisions log and the open items, and the open item says what would let the badge keep the frame's red: a LIVE label at 14pt semibold or heavier is large text and needs only 3:1, which #EB5757 already passes. That is a design decision, not a code one, so it is asked rather than assumed.

## What is still outstanding

- **The auction lot photograph has no real alternative text.** It is named from the lot's title, which describes the lot and not the picture. The `Auction` model needs an alt field from the API before this is honest.
- **The onboarding carousel announces its position but is still a swipe.** The Continue and Back buttons are the single-pointer alternative 2.5.1 requires, so this passes; a page-dot control would be better.
- **Level AAA contrast (1.4.6, 7:1) is not met** and was not attempted. Several gold-on-dark pairs would have to move.
- **Desktop and web were not audited.** See the Target section for what they would add.
