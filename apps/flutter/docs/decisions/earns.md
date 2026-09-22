# My Earns and Badges

Built 2026-09-10 from `486:1739` (My earns & rewards), `414:12370` (Badges / Earned) and
`414:12502` (Badges / Locked). `486:1868`, `486:1997` and `429:21290` are byte-identical
duplicates of the first and added nothing.

## One screen, two segments

The three frames are one screen. The segmented control switches the body; the Earned / Locked
pills filter the badge grid. Neither refetches, so both live in the view's `State` rather than in
the cubit — unlike the exclusive library, whose filter is a server query.

## Where it sits

Inside the profile branch, at `/profile/earns`, pushed from the profile menu's My Earns row. The
frames are contradictory here and were not followed literally: they highlight **REWARDS** in the
bottom nav, and the Badges frames title the header "Rewards" with no back button while their My
Earns sibling has both a back button and a "My Earns" title. Read together, those frames are the
Rewards screen duplicated and edited, so the nav highlight and the missing back button are
artifacts. The user chose the profile branch, which keeps the tab bar on screen as the frames draw
it while the screen's own back returns to the profile.

Consequences: the header is the My Earns shape (back, title, segmented) on **both** segments, and
the badges segment adds the balance row and the full-width bar the frame draws under it. The
Badges frames' "REWARDS" eyebrow is dropped — the screen is titled My Earns.

## The balance moved to `shared/`

The badges segment shows the balance, badge standing and distance to the next badge — data the
Rewards tab already owned in `RewardsApiService`, which also broadcast a change on every spend. A
feature may not read another feature's repository, and copying the balance would let the two
screens disagree after a top-up.

So the balance and the badge ladder moved to `shared/points/`: `PointsService` owns the figure,
the ladder and the change stream; `PointsRepository` wraps it in `guardApi`. `RewardsApiService`
now takes the service and delegates, keeping `RewardsSummary` and every Rewards widget untouched.
Rejected: a second mock service inside the feature (the demo balance would drift), and building My
Earns inside `features/rewards` (the user asked for a feature, and the entry point is the profile).

`shared/` holds that data layer and nothing else. `PointsHeader`, `HeaderBlock` and `ProgressBar`
were first put in a new `shared/widgets/` on the strength of the implement-screen skill, which said
a component reused by two screens moves there. That contradicted `architecture.md`, where the line
between `core/` and `shared/` is business knowledge rather than reuse, and it split cross-feature
widgets across two homes when the seven that already existed all sat in `core/widgets`. All three
are widgets that take formatted strings and know nothing, so they went to `core/widgets` with the
rest, `shared/widgets/` was deleted, and the two skill references were corrected.

## The ladder is derived, not seeded

The design's copy pins it: a 7,082 balance reads "918 pts to Loyalist", which puts the next rung at
8,000, and the locked tiles' own captions ("5,000+ pts", "2,500–4,999 pts") give the shape. So
`PointsService.tiers` runs 0 / 1,000 / 2,500 / 5,000 / 8,000 / 12,000 and everything else is read
off it: which badge is earned, which is current, which are locked, and progress measured across the
tier the balance sits in rather than from zero.

The same holds for the earn rows. The frame's four values sum to exactly the balance
(2,691 + 2,691 + 1,200 + 500 = 7,082) and its percentages are those quotients, so a row carries
only its points and the share is derived. Nothing in the data can contradict the total.

Where the design's dummy data contradicts itself it was made consistent: the header bar (47%) and
the current-badge bar (73%) draw different progress for the same standing, and both now show the
one derived value; the Earned grid repeats "Cinematic Newbie" twice and the Locked grid repeats
"Cinematic Loyalist" and "Visionary", which the ladder replaces with distinct rungs.

## Accessibility

- Each earn row, badge tile and the current-badge card is one semantics stop with a composed
  sentence. A row is four texts plus a bar that only repeats the percentage, so read separately it
  is five stops saying the same thing twice.
- A badge tile spells its state out. The design says "earned" with a tick and "locked" with a
  padlock and a grey, none of which reaches a screen reader.
- Both selectors are `SemanticsRole.tabBar` with `tab` children carrying `selected`.
- The design draws the segment items and the filter pills 27 tall. Both keep that height and grow a
  48 tap target around it, the segmented control painting its track behind the items so the track
  stays the height the design draws. Neither inks: a ripple would trace the 48 target rather than
  the pill inside it and wash over the gap around it, and choosing a tab already moves the
  selection.
- The header is a `Wrap`: at a large text scale the segmented control alone is wider than the
  screen, so it drops below the title instead of overflowing.

## Icons

Every glyph is exported from the frames themselves as SVG and tinted through one `SvgIcon` widget,
so they match the design 1:1 rather than approximating it with a Material icon. Seven ship:
`fire`, `help_circle`, `puzzle`, `trophy_cup` for the earn rows, `trophy_medal`, `check`, `lock`
for the badge grid and the current-badge disc. The four earn glyphs are stroked and the three badge
glyphs are filled; `srcIn` tints both.

`puzzle` is byte-identical to the existing `nav_p2p` — the design reuses one glyph for the P2P tab
and the Prediction Games row. It ships twice rather than renaming a shipped nav asset; the two fold
together when the icon font lands.

Sizes still follow §6's scale rather than the frame's raw values, so an 18 glyph is drawn at 20 and
a 26 at 24. The glyph is exact; only its box is snapped.

## Known differences from the frames

- **Weekly Quests' glyph is a circled question mark** in the design file. That is very likely a
  placeholder rather than a chosen icon, but it ships as drawn; worth confirming with design.
- **The empty eyebrow slot** above the first earn row (`486:1759`, a 68×15 text node with no text)
  is not rendered. No label was invented for it, so the earns list opens 16 below the header where
  the frame leaves about 29.
- **The segmented control's active gradient** runs left to right, where the frame runs it at ~157°.
  `goldSegment` is a shared token the auth and CTA styles also use, so it was left alone.
- `numeralSm` carries the row value, not the `numeralMd` that the catalogue's `earnRow` line and
  §5's combination table both name. The raw value is Oswald 600 18/18, which *is* `numeralSm`
  (`numeralMd` is 20/1.5), and `numeralSm`'s documented use is literally "Row values (2,691)". The
  two doc lines are the same slip and are worth correcting at the source.

## Drive-by

`PointsHeader` gained the bottom hairline its catalogue entry specifies and the original
implementation omitted, so the Rewards header now closes with the same rule as P2P and Badges. Its
badge column also became `Flexible`: sized to its text it pushed the row past the screen at a large
text scale, which the longer "918 pts to Cinematic Loyalist" made visible.

`highlightCard`, the wash behind the current-badge card, was first snapped onto the 10% alpha grid
as gold@10%→gold@0%. Against the frame that read visibly washed out, so the design's own
gold@14%→gold@4% is kept — the one exception to the grid besides the existing 25/85 steps.

`ProgressBar` fills the width it is offered rather than sizing to its own fill. Under the loose
constraints a start-aligned column hands down, it had been shrinking to the filled stretch, so the
pending remainder of every bar was missing.

Two alignment fixes came out of looking at the built screens on a device:

`BackDiscButton` pulls its own tap-target overhang back into the screen margin. The target is 48
around a 36 disc, so a button laid flush with the content margin painted its disc 6 *inside* the
cards beneath it — visible on six of the seven screens that use it, and the seventh
(`exclusive_library`) had compensated for it by hand. Now the widget owns the rule, that hand-rolled
compensation is gone, and the rows that follow the disc dropped their own gap because the trailing
half of the overhang is the 12 the frame leaves. Both directions are covered: the pull mirrors under
RTL, and the target stays 48x48 and on screen.

`PointsHeader` spreads its two blocks with `spaceBetween` and makes both flexible. The balance was
`Expanded`, so it took exactly half the row whatever it needed, and the badge block — sized to its
own text — was left stranded about 24 short of the right margin. **The widget test said it was
flush**: tests render with stub font metrics, and with a long caption the block happened to fill its
half. The regression test therefore uses a deliberately short caption, which reproduces the defect
under any font, and the device is what confirmed the fix.

## The four history screens

Built 2026-09-11 from `416:15593` (Daily streaks rewards), `429:21790` (Rewards / Live auction),
`429:22526` (Rewards / Prediction Games) and `429:23212` (Weekly Quest Rewards). Each My Earns row
opens the one behind it.

### One screen, four cards

The frames share a shape: back header, a totals block with one stat, a section eyebrow, then a list.
Only the card differs. So there is one `EarnDetailScreen`, one `EarnDetailCubit` and one repository
method taking an `EarnSourceKind`; the payload is a sealed `EarnDetail` with a variant per source, and
the screen switches on it once to pick the header's stat and the card. Four screens would have copied
the provider, the state switch, the header, the section and the list padding four times over.

The rows became controls to reach them. `EarnRow` gained an `onTap` and a hint, and paints through a
`Material` so its ink is clipped to the card's corners; the label stays composed and the tap action is
handed to the `Semantics` node, which `excludeSemantics` would otherwise drop.

### Where they sit

Outside the shell at `/profile/earns/{streaks,auction-wins,predictions,quests}`, unlike My Earns
itself. Their frames draw no bottom nav, which is the same reason edit profile and the rewards detail
screens sit outside it; the paths still nest so the URLs and the back affordance read right.

### The total is the row's, not the frame's

The frames and their own My Earns sibling disagree on two of the four totals: the list says Daily
Streaks 2,691 and Weekly Quests 2,691, while the detail frames head them 1,190 and 2,100. Auction
(500) and Prediction Games (1,200) agree.

The list's four figures are load-bearing — they sum to exactly the 7,082 balance, which the shares,
the badge ladder and the standing are all read off — so the detail header yields: `fetchDetail` takes
the total from the row in `_sources`, and a test asserts the two agree for every source. The history
is then the recent entries rather than the whole ledger, which is what the frames draw anyway: the
streak log is clipped mid-scroll and its visible days sum to 890 of the total. Only the auction's
history happens to be complete, its four wins summing to exactly 500.

### Everything else is derived

- **Active days** is the newest logged day's count. **Total wins** is the length of the win list.
  **Accuracy** is the correct results over all of them. **Completed** is the count of claimed weeks.
  None is stored beside the list it counts, so no stat can contradict what is on screen.
- **A day's level** is the highest rung its watch time cleared, and **a rung is reached** once one day
  met it. Both fall out of the ladder (30 / 45 / 60 minutes) and reproduce the frame exactly: every
  LV 2 pill it draws, the LV 1 on the 34-minute day, and the third rung left grey because the longest
  day in the log is 52.
- **A quest week is claimed** when every action landed, partial otherwise — 4/4 and 3/4 in the frame.
- **Dates** are measured back from the newest logged day by the day counts, so the two cannot drift.

Where the frames contradict themselves they were made consistent, as the badge grid was:

- The streak log dates the 7-day row **Jun 30** while dating the 8-day row Jul 2, which leaves Jul 1
  missing from an unbroken streak. It is Jul 1 here.
- The log unlocks **Spark Keeper twice**, on the 15-day row and the 8-day row. Badges come off day
  thresholds instead — 7 for First Flame, 15 for Spark Keeper — which keeps both rows the frame
  highlights and drops only the duplicate on day 8.
- Prediction accuracy reads **67% but captions it '4/6 correct'** with three cards drawn. Two of the
  three drawn are right, which is also 67%, so the caption is derived and reads '2/3 correct' rather
  than inventing three more predictions.

### Accessibility

- Each card is one semantics stop with a composed sentence. A win card is seven texts, a prediction
  card nine; read apart they say the same thing several times over, and the prediction's two panels
  only mean anything together.
- Every state the design carries in colour alone is spoken: correct and incorrect, claimed and
  partial, and whether a ladder rung was reached.
- Both the dash on an unpaid prediction and the unreached rung's label step from `{textDisabled}` to
  `text.muted`. `text.disabled` is for inactive controls, and these are content.
- The history is a `SliverSemantics(role: list)` around the `SliverList`, with `listItem` on each
  card: the list role announces a position only if its children claim to be items in it, and the
  sliver form keeps the per-card indexes a box `Semantics` would collapse.
- A history with nothing in it gets a muted line under its heading as a `SemanticsRole.status`, the
  same shape the badge panel uses, rather than a heading over blank space. The design has none: §10
  lists empty screens as undesigned.
- Two layout fixes came out of the 1.3 text scale: the streak tile is a minimum square rather than a
  fixed one, and the award footer is a `Wrap`, so a long badge name drops to its own line instead of
  running past the card. The footer's overflow was 6 under the stub test fonts and invisible on the
  device, which is why the scale test covers all four screens rather than one.

### Shapes the mock cannot reach

Two of them, both found by review rather than by the screens:

`StreakDay.level` is nullable. The ladder starts at 30 minutes, so a shorter day clears no rung; the
first cut fell back to level 1, which would have drawn a LV 1 pill and spoken 'level 1' for a day that
earned neither. The pill is now omitted, the tile drops to the raised-card grey rather than keeping
the level-1 gold, and the spoken sentence skips the clause. Every day in the mock log clears 30, so
nothing on screen changes.

An entry that paid nothing takes the dash the design draws for a lost prediction, in the caption grey,
and its sentence says 'no points awarded'. Only the prediction card did this at first; a zero-point
win, week or streak day would have shown '+0' in the numeral gold while saying the opposite. One
helper now decides both the figure and its tone for all four cards.

### The header had to stop jumping

Pushing from My Earns to a history screen shifted the back disc and the title up by 4. My Earns
builds its header from `HeaderBlock`, which pads 8 under the status inset; the history screens use a
real `AppBar`, whose 56 toolbar centres the button's 48 tap target 4 under it. Measured on a 47 inset,
the disc's widget top was 55 on the parent and 51 on the child.

The frames cannot both be matched: My Earns draws its disc 6 below the status bar and the history
frames draw theirs 10.5 below, so any single position is 4 off one of them. Consistency wins, and the
history screens' is the position to keep — it is within half a pixel of their frames, it is what the
theme's 56 toolbar gives, and the six other back-header screens in the app already sit there.

So My Earns moved. It was 8 below its frame rather than 6, because the 48 target carries 6 above the
36 disc and the block's 8 stacked on top of that; at 4 the disc lands at the same 51 as every other
back header, 4 below where its own frame puts it and 4 closer than before.

That padding is set in two places, since both segments carry the disc and must move together: the
earns segment's `HeaderBlock` call and `PointsHeader`'s `top != null` branch, which only My Earns
uses — Rewards passes no top row and keeps the 32 its empty eyebrow slot needs.

A test pumps both headers under one inset and asserts the disc lands at the same place; it fails at 55
against 51 on the unfixed code.

### Known differences from the frames

- **The totals** on the streak and quest screens, covered above.
- **The prediction accuracy caption**, covered above.
- **The lot stills** are the frame's own uploads, which are 200px wide — the same order as the
  exclusive-content images already shipped. They are demo assets and want replacing with real ones.
- **The badge chip's label** renders as `labelSmall` (DM Sans Bold 10, +1 tracking) where the frame
  sets Inter SemiBold 10 untracked. That is the type-scale consolidation doing its job, not a slip.
- **The partial-quest glyph** is a second, simpler five-point star in the file. It ships as the one
  `star` asset; the two fold together when the icon font lands.
