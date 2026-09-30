# Reels labs

Two debug screens in the package, both on seven public HLS streams from `HlsReelCatalog.fixtures()`. Neither is part
of a product screen. Import them from `package:hls_video_player/reels_lab.dart`.

| Lab | Built on | What it shows |
|---|---|---|
| `ReelFeedLab` | `ReelFeed` | Every field of the declarative API, live, from a settings panel |
| `ReelPagerLab` | `HlsReelPager` | The blank-paper way: the host draws and manages everything itself (the former v1 Reels screen) |

Each lab brings its own `MaterialApp`, so its chips, sheets and snackbars work in a host built on another Material
library (the app uses `material_ui`).

## Running them

In VS Code, pick a launch config. Each builds with `--dart-define=REELS_LAB=…`, which makes the Home tab open that lab
instead of the Reels screen.

| Launch config | Flag |
|---|---|
| **Matinee DEV (ReelFeed Lab)** | `REELS_LAB=feed` |
| **Matinee DEV (Pager Lab v1)** | `REELS_LAB=pager` |

Without the flag, Home shows `ReelsScreen`, the app's `ReelFeed` screen.

## ReelFeed Lab

A tune button opens a panel with one section per area. Every switch changes the running feed at once.

| Section | What you can try |
|---|---|
| Controller | play, pause, toggle, seek ±10 s, jump to first/last, next, previous, fullscreen, retry, global mute, per-reel mute override, autoplay, window radius (recreates the controller) |
| Data (`items`) | lock or unlock the current reel, remove or restore its source, insert a reel at the top, remove the current reel, shuffle all, append a page |
| Style | fit, seek bar placement, timer and fullscreen positions, centre controls, scrim, effect duration |
| Page builders (`ReelItem`) | thumbnail, overlay, curtain, aboveCurtain, custom controls on reel 1, custom loading and error, custom seek track, custom timer, custom icons |
| Per-item | a custom page (video plus a comments panel) on reel 2, a per-item style on reel 3 |
| Gestures | custom tap, double tap with a heart effect, tap effect, long press (pause while held) with its effect |
| Feed | inserts every 4 reels, pagination, header, footer, HUD on every reel or on reel 1 only, `active` (auto, on, off), custom labels |
| Events | a live log of every `ReelEvent`: focus, first frame, watch time, loops, stalls, errors, inserts |

Reading the screen:

- The live-players tracker (top, with the HUD on) shows the ±2 window as you swipe.
- Reel 4 of every page starts locked: no player until you unlock it, and swiping past its curtain still works.
- The event log shows `ReelFirstFrame` times; on a swipe to an already-open neighbour they should be small.

## Pager Lab (v1)

The former v1 Reels screen, ported widget for widget onto package types, with placeholder UI where the app had its
own widgets. Everything `ReelFeed` does for you is done here by hand:

| Concern | How the host does it |
|---|---|
| Paging | Owns the `PageController`, so a swipe on the curtain can drive the pager |
| Controls | `HlsPlayerControls(embedBottomBar: false)`; the seek bar comes back as `slot.bottomBar` and is painted above the scrim |
| Locked reels | Keeps its own set of unlocked ids for the session; the curtain shows on the focused locked page |
| Swipe through a curtain | `SwipeThroughOverscroll` turns an overscroll on the curtain into next/previous page |
| Header | The focused page reports "locked is showing" after the frame, so the header can hide its pill |
| Share | A snackbar; the host wires whatever it needs |

Unlike `ReelFeed`, a locked reel here still has a player under its curtain, because the pager knows nothing about
locks. With the HUD on, the tracker shows it. That contrast is the point of the lab.
