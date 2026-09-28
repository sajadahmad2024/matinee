**Type:** feat

# Points Earned and Unlock Premium sheets (UI only)

Two sheets on the shared `AppBottomSheet`, built from screenshots of Figma frames `1005:1488` and `1005:1293` while the Figma API was rate-limited.

## Screens

| Frame | Sheet | Opens from |
|---|---|---|
| `1005:1488` | Points Earned: +points chip, title, body, progress to next level, Subscribe Now | The action rail's Share button |
| `1005:1293` | Unlock Premium: title, body, Monthly Plan option, Subscribe Now, Maybe Later | Points Earned's Subscribe Now |

## Decisions confirmed with the user

- UI only. Points Earned shows the reels feed's mock balance, a sample +50 reward and a sample 1,000 level target; nothing is credited.
- Unlock Premium opens only from Points Earned's Subscribe Now; there is no end-of-feed trigger.
- Points Earned's Subscribe Now closes it and opens Unlock Premium.
- Unlock Premium's actions only close the sheet; the plan is hard-coded.

## Assumptions (to check against Figma)

- "Points Earned!" is `headlineSmall` in `text.warning`; the chip is the gold tag roles with `star.svg` at `sm`.
- The balance is `text.numeral`, its target `text.muted`; the bar is `ProgressBar` at `progressBarThick`.
- The plan row is a card (`card.background`, `card.border`, `borderHighlight` once picked) with a drawn radio mark; it starts unselected.
- `star.svg` stands in for the sparkle glyph on both sheets.

## Feature tree

```
lib/features/reels/presentation/widgets/
  points_earned_sheet.dart
  unlock_premium_sheet.dart
```
