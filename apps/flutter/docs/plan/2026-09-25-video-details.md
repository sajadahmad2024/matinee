**Type:** feat

# Video details sheet

The video details bottom sheet from Figma frame `35:4491`, opened from the Home action rail's info button.

## Screens

| Frame | Screen | Opens from |
|---|---|---|
| `35:4491` | Video details — title, studio and genres, synopsis, streaming services, cast | Action rail info button |

## Decisions confirmed with the user

- The details come from the `Reel` model: new `synopsis`, `cast` (`ReelCastMember` name + image URL) and `streamingOn` (`ReelStreamingService` name + logo URL), filled in the mock feed service. Only images vary, by URL.
- Reuse the core `AppBottomSheet` (content sized) and `AppAvatar`. `AppBottomSheet` gains an optional `titleStyle`, so the frame's `headlineSmall` title keeps the shared header and close button.
- The studio + genre tags row is shared with `ReelMeta` as `ReelCredits` (one source of truth).
- Cast avatars are a new `AppAvatarVariant.cast`: 52, card fill, `titleMedium` initials, an outline ring. The frame's 1.66 ring snaps to `AppBorderWidth.focus` 1.5.
- Streaming logos are a new core `LogoTile`: a rounded square image from a URL.
- Logo tiles and cast members take optional `onTap` hooks, unwired for now; with one they are 48dp buttons.

## Assumptions

- The streaming row is newer than `docs/design/`: logo tiles are 52 square, radius `md` 12, gap `md` 12, under a `STREAMING ON` eyebrow 20 above, like `CAST`.
- A new colour role `avatar.outline` (`AppPalette.outline`) rings cast photos and edges logo tiles.
- Both rows scroll sideways when they overflow; sections are hidden when empty.
- The red "S N" bubble in the frame is Figma's collaborator cursor, not UI.

## Feature tree

```
lib/core/widgets/
  app_avatar.dart          + AppAvatarVariant.cast
  app_bottom_sheet.dart    + titleStyle
  logo_tile.dart
lib/features/reels/presentation/widgets/
  reel_credits.dart
  details/cast_member.dart
  details/video_details_sheet.dart
```
