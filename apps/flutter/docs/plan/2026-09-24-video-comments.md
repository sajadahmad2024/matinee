**Type:** feat

# Video comments sheet (UI only)

The comments bottom sheet from Figma frame `30:3890`, opened from the Home action rail's comment button. UI only: no data layer, no API.

## Screens

| Frame | Screen | Opens from |
|---|---|---|
| `30:3890` | Video comments — header, comment list, comment input | Action rail comment button (debug builds, sample data) |

## Decisions confirmed with the user

- The bottom sheet is a reusable core component: adaptive to its content by default, with an optional fixed height.
- The comment card is built from smaller widgets (avatar, header, body, actions) aggregated into one card.
- Replies use the same card. A top-level comment's replies sit one indent in; a reply to a reply stays at that level and starts with an `@mention`. No deeper tree.
- The comment input with its send action is its own widget.
- Pagination for comments and replies is UI only: hooks and loading rows, no data.
- The send glyph is not exported: `AppIconAssets.send` points at an existing SVG until the real one is added.
- The liked state tints the one `like.svg` gold (`icon.accent`), as the action rail does.
- New token `AppControlHeight.commentField = 40`, added to the theme and `docs/design/`.
- A new core `AppAvatar(size:)`; `ProfileAvatar` and the bidder avatar are compared and merged into it later.
- In debug builds the rail's comment button opens the sheet with hard-coded sample comments.

## Assumptions

- Replies, "View N replies", "Hide replies" and "View more replies" are not drawn; they use `caption` in `text.muted`, indented to the parent's text column (avatar 36 + gap 12).
- "See more" expands the body in place; there is no "See less".
- The sheet keeps the app's existing `SheetSurface` radius (`sheetTop`, 24) rather than the frame's 20.
- The comments sheet height is the frame's 484 over its 874 screen, as a fraction of the available height.
- Empty comments show a short line of text; loading more shows `LoadingView`.

## Feature tree

```
lib/core/widgets/
  app_avatar.dart
  app_bottom_sheet.dart
lib/features/reels/presentation/widgets/comments/
  comment_header.dart
  comment_body.dart
  comment_actions.dart
  comment_card.dart
  comment_thread.dart
  comment_input_bar.dart
  comments_sheet.dart
  comments_preview.dart
```
