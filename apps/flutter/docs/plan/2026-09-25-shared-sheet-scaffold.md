**Type:** refactor

# Shared bottom-sheet scaffold

Every bottom sheet opens through `showAppBottomSheet` and lays out in `AppBottomSheet`, instead of each repeating `showModalBottomSheet` options, a frame, a header and scroll handling.

## Sheets moved

| Sheet | Before | Now |
|---|---|---|
| Refer a friend | private copy of `SheetSurface`, own messenger and dismiss area | `hostsSnackBars`, shared header |
| Prediction analysis | `SheetSurface`, own eyebrow + close row | `isModal`, `eyebrow`, `title` (`headlineSmall`), shared close |
| Streak level, Quest completion | `SheetSurface`, own show call | `isModal`, no header |
| Top up | handle and round close drawn on one row | the shared handle row, no title |
| Subscribe | warm `auth.surface`, own messenger | navy sheet surface, `hostsSnackBars`, full height |
| Dial code picker | warm `auth.surfaceContainer`, theme handle | navy sheet surface, shared title |

## Decisions confirmed with the user

- Every sheet follows top up: a round 32 close disc (`sheet.closeBackground`) level with the handle, drawn by `SheetSurface`. `closeLabel` is required, so no sheet can leave it out. Headers and bodies stay as each design draws them.
- Streak level, Quest completion, Subscribe and the dial-code picker gain that close as well.
- `AppBottomSheet` gains `surfaceColor`, but every sheet uses the one sheet surface, the auth sheets included.

## Scaffold changes

- New options: `eyebrow`, `isModal`, `surfaceColor`, `hostsSnackBars`.
- The title is the sheet's top-level heading (`ScreenTitle`).
- Room is measured from the route's constraints, not the screen size.
- `SheetSurface` puts a transparent `Material` over its fill so ink splashes show.

## Behaviour that changes

- Sheets that were capped at Material's 9/16 height now grow to the shared 90% before scrolling.
- Close buttons move from the title row to the handle row, as a round disc with the `close.svg` glyph; a titled sheet grows by that row.
- `auth.surfaceContainer` is no longer used by any sheet.
