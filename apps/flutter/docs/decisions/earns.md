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
