# P2P and the three games

Why the P2P tab and the screens under it are built the way they are. The six
Figma sections behind them repeat a Home frame that is out of scope, and they
disagree with each other in a handful of places; what follows records which
value was made load-bearing and which yielded.

## The tab is a hub, and the games are pushed

`/p2p` is a shell branch, like Rewards. Every screen under it is outside the
shell, because its frame draws no bottom nav and would be covered by one:
`/p2p/quests`, `/p2p/quests/:questId`, `/p2p/quests/:questId/claimed`,
`/p2p/streaks`, `/p2p/predictions`, `/p2p/predictions/:predictionId`.

They are pushed rather than gone to, so the platform back gesture returns to
the tab the user came from. The tracker is the exception in one direction: once
a quest is claimed it replaces itself with the receipt, because backing into a
tracker for a finished quest is a dead end.

## The streak has one route, not two

The design draws the intro and the ladder as separate frames. Whether the
streak has started is state the API reports, not a place the user can navigate
to, so both live behind `/p2p/streaks` and the screen picks. The intro wears the
header transparently over its still; the ladder gets a bar of its own.

## A list is re-read on the way back from its detail

The tracker can advance an action or claim a quest outright, and the vote screen
moves a prediction's turnout. Both lists therefore await their push and re-read
on return.

The re-read is silent in both directions: the list is already on screen, so it
neither blanks itself with a loading state nor replaces itself with an error
when the fetch fails. The figures already drawn stay until one succeeds. The
tab's own header does the same on a balance change.

## A receipt is only drawn for a quest that was paid

`/p2p/quests/:questId/claimed` is reachable by link as well as from a claimed
row. A quest that was never claimed has no receipt, so it lands on the same
failure a missing quest would rather than drawing 'Congratulations' and a badge
unlock over an unfinished quest.

For the same reason a load is not a transition: the completion modal and the
level drawer fire on a state *change*, so entering the tracker for a quest that
was already claimed does not reopen the celebration.

## The header reads the shared ladder, not the frame's figures

The frame's stat card writes 5,000 points, a "Cinematic Visionary" badge and a
363/1000 fraction. None of those agree with the balance the rest of the app
reads: `shared/points` holds 7,082 on Expert with 918 to Cinematic Loyalist, and
Rewards and My Earns are already drawn off it.

So P2P reads the same standing, and the fraction is derived from the rung the
balance sits on — 2,082 of 3,000. `PointsStanding` gained `pointsIntoBadge` and
`badgeSpan` for it, because reproducing whole points from the progress share
would not round back to the figures the design writes. The ladder stays in one
place; P2P does not compute it.

The streak column is the odd one out: the frame labels it "Streak" and fills it
with a points figure. Nothing else on the card could pay those points, so the
figure is derived from the run — days times the level's daily minutes — rather
than stored beside it and left free to drift.

## A quest's progress is its action count

The hero card writes "4 / 10" over a description asking for ten trailers, while
the tracker for the same quest says "2 of 4 actions done" and draws a 50% ring.
Both cannot be true of one quest.

The action count wins, because it is the only figure the tracker can compute
from what it draws: the ring, the headline and the hero's fraction all come off
`actionsDone / actionsTotal`, so no two of them can disagree. The frame's 4/10
is not reproduced.

## The featured quest is not repeated below itself

The section is called ALL WEEKLY QUESTS and the frame lists three quests under a
hero showing a fourth. Read literally the list should hold the hero too; the
frame does not draw it that way, and repeating a card the user is looking at
reads as a bug. The list holds everything but the featured quest.

## The Watch button advances an action

The frame puts a 'Watch' button beside every unwatched curated clip, and there is
no player behind it yet. Left disabled, the whole flow below it — the claim, the
completion modal, the receipt — became unreachable in the app.

So the button does the one thing the design asks of it: it counts its clip
towards the action. Watching a clip that is already counted changes nothing, so a
second tap cannot push a count past its target. When a player exists it takes
over and this stays as the completion step.

## Two control heights, not five

The frames draw CTAs at 30, 40, 42, 50 and 52 tall. The design system documents
two: `cta` 52 and `button` 32. Full-width CTAs take 52 — Track Progress, Cast
Your Vote, Submit, Claim Reward, Start My Streak — and the small buttons take 32
— Start Quest, Watch. Nothing new was added to the control scale.

## Scrims the design draws once and the system names twice

The hero quest card and the prediction card darken the bottom of a still so the
copy under it reads. That is `overlay.gameCardBottom`, the role for a scrim over
a card image, rather than the exact 20%→80% ramp the frames use. The prediction
and quest heroes darken throughout instead, where the copy sits *on* the still,
so they take `overlay.auctionHero`.

The curated thumbnails needed two states the system has no role for: a watched
clip takes `tag.gold.background`, which is the documented gold tint over an
image, with the tick in `icon.accent`; an unwatched one gets a disc of
`pill.overImage.background` behind its play glyph rather than a full scrim, so
the mark holds its contrast over a bright still.

## What moved to core

`RedeemCard` and `CategoryTag` came out of `features/rewards`, and `StatusBadge`
out of `features/earns`: the hub's game cards are the same `gameCard` the rewards
list draws, and quests, curated rows and predictions all carry the status pill.
`ProgressRing`, `CheckDisc`, `SheetSurface` and `BackAppBar` are new there —
each was about to be written a second time.

`StatusBadge` gained an `active` tone for the pill the frame sets over a running
quest's still. It is the `badge.status` component's own variant, so it belongs to
that widget rather than to a second one.

`ProgressBar` gained a `success` tone, which is the documented
`progress.fill.success` role: a finished action's bar turns green.

`BackAppBar`'s title is optional. On the two screens whose hero carries the
screen's heading, the frame leaves the bar holding nothing but the back button,
and a second title there would be read twice.

## Accessibility

Every card composes its texts into one spoken sentence and excludes the subtree,
which is what the pills, bars, rings and dots need — none of them announces
anything on its own. That leaves two blind spots the project has hit before, and
both are covered:

- `textContrastGuideline` cannot see inside `excludeSemantics`, so the tinted
  grounds these screens introduce are asserted in
  `test/core/theme/contrast_test.dart`: the gold-washed streak card, the
  green-washed congratulations card, a picked vote button, the two glyph discs
  and the three check discs.
- `expectControlsAreActivatable` caught the vote buttons declaring a selected
  state with no tap action on the node that declared it — excluding the subtree
  had taken the button's tap with it. Both now forward `onTap`.

A curated row is the one place a card is not collapsed to a single node: it holds
a button, so the title's sentence and the button stay two stops under
`explicitChildNodes`.

The completion modal and the level drawer arrive without being asked for, so
they carry `SemanticsRole.alert` rather than waiting to be reached. The countdown
carries `SemanticsRole.status` and is read in words, because `06:14:22` is
otherwise announced as one long number.

## What the AA audit changed

Five things the first pass got wrong, all found against WCAG 2.2 AA on mobile.

**Nothing survived 200% text.** Five of the seven screens clipped their content
at the scale 1.4.4 asks for, and the suite had only ever been run at 1.0 and 1.3.
Two causes: a still with a fixed height cannot grow to hold copy that has, and a
row of intrinsic-width text has nowhere to put the overflow. Every still is now a
minimum height — `ConstrainedBox` over `IntrinsicHeight`, with the photograph
`Positioned.fill` so the stack measures itself against the copy and not against
the asset's own pixels — and the rows that carried two pieces of text became
`Wrap`s or gave their label a `Flexible`. The guideline suite runs at 2.0 as well
now, which is what keeps it that way.

**A row that is one button has to say what is written on it.** The quest row's
name was its three lines of copy, and the words on the control it wraps —
'Start Quest' — were not in it, so 2.5.3 fails and voice control has nothing to
match. The action is part of the sentence now.

**Upper case is not a name.** 'YES' and 'NO' name the two vote buttons, and a
two-letter capitalised run is spelled out rather than read. `StatusBadge` and
`VoteOptionButton` take a spoken label beside the drawn one, the way `ScreenTitle`
and `SectionLabel` already did.

**A summary that quotes the screen is not prose.** Two summary templates
interpolated the drawn eyebrow and unit, so the receipt announced '4 / 4,
ACTIONS DONE' — a slash read as a word and a heading spelled out. Both templates
are gone; each card names itself in a sentence.

**The streak intro had two level-one headings**, the bar's and the hero's, so
heading navigation had two tops and nothing nested. The bar holds nothing on the
intro now, the way it already did on the other two screens whose hero carries
the heading — which also fixes what the 200% pass found there: a title floating
over copy that scrolls under it collides with that copy.

Three smaller ones: the hub's game cards were three loose buttons rather than a
list of three; the vote pair declared `selected` without
`inMutuallyExclusiveGroup`, so it sounded like two independent toggles; and
`TimeChip` claimed a live region for a value that only moves on a reload, which
was dropped where it was inert and misleading where it was not.

Checked and found sound: the pills over a still are translucent, so their
contrast depends on the photograph under them — at the worst case, a pure white
frame, the reward pill measures 4.56:1 and the state pill 7.56:1, both over the
4.5:1 minimum.

## What the review pass changed

**A failed action no longer takes the screen with it.** Claiming a quest,
watching a clip and casting a vote all emitted a terminal failure, which
replaced the tracker or the vote screen with a full-screen error and discarded
the quest, the prediction and the side the user had picked. Each success state
carries an `actionError` instead: the data stays, a snackbar reports the
failure, and the tap is still there to repeat. A failed *load* still replaces
the screen, which is what the failure arm is for.

**The streak seed said two things at once.** The intro quoted the first rung's
thirty minutes and then dropped the user on a level-2, forty-five-minute screen
with a fourteen-day run behind it, and the hub credited streak points for a
streak that had not started. The seed is now a run that has lapsed: the best run
and the days already active are history, the current run is at day zero of rung
one, and starting is the flag and nothing else. The ladder after starting is
therefore day one rather than the frame's level 2.

**Two quests could be started and not advanced.** Nolan Exclusive and Genre
Explorer had no curated content on any action, so their trackers drew no Watch
button, no progress and no claim — 'Start Quest' led nowhere. Both now carry
three clips, and a test asserts that every unclaimed quest has an action that
can be advanced.

**The top of the badge ladder read '0 / 1'.** Standing exactly on the top
threshold left no points into the rung and a span forced to one, beside a bar
drawn full. The fraction is now the rung that reached the top, cleared in full,
and `isTopBadge` gives the header a caption instead of '0 pts to Visionary'
under a badge already called Visionary.

**An empty ladder threw out of `build`.** `currentTier` fell back to
`tiers.first`, which throws on an empty list — past the cubit's failure path and
into the global net. The accessors are total now.

## The ladder has a button, because nothing else moves it

The level-complete drawer fires when the streak reports its week finished, and
no frame draws anything that advances a day — so it was reachable only from a
test. The ladder now carries a Complete Today CTA, which is the same call the
Watch button makes for a quest: there is no session tracker behind it yet, so
the button does the counting until one exists.

A day counts towards the week, the run and the days active, and lifts the best
run once it passes it. The day that finishes the week leaves it finished, which
is what the drawer fires on; the day after opens the level above. At the top of
the ladder there is no day left to count, so the CTA is disabled rather than
inert.

## Shapes the mock cannot reach

Share Achievement on the receipt is drawn and disabled: there is no share sheet
behind it yet, and the design's own pattern for a screen that does not exist is
to draw the control and leave it inert.

## Known differences from the frames

- The hero quest fraction reads 2 / 4 rather than 4 / 10 (see above).
- Quest rewards, badge names and quest copy are literals in the mock service,
  which is where this repo puts content the API will own. The frames name a badge
  for one quest only; the other three were given names that match their titles.
- The receipt writes the quest's own reward (300 for Comment Connoisseur), where
  the frame's claimed screen writes 500 and credits the badge to a different
  quest.
- A prediction that is still open but already voted on has no drawing. Its card
  keeps the tonal button and reads 'Your vote is in' rather than inviting the
  vote again.
- The prediction detail frame writes a 2X multiplier for a card that writes 3X.
  The card's value wins, since it is the same prediction.
- The analysis sheet labels its two shares YES and NO with their real
  percentages; the frame labels both "Option-A" and reverses the split.
- The quest hero's CTA is 52 tall, not the frame's 42.
- The three game stills came out of the frame at 600px, the quest and title
  stills at 400–800px. They are the frame's own uploads and want replacing with
  real artwork.
