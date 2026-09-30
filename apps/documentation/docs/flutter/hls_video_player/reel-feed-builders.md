# ReelFeed Builders — Implementation Plan

> A layered, `table_calendar`-style page API on top of the existing `ReelFeed` engine. The package owns the
> page structure, gestures, curtain and rebuild timing; the host supplies UI per layer through optional builders
> and positions controls through `ReelStyle`.
>
> **Status:** Implemented (phases 1–10). Where the build differs from this plan, §14 says so.
> **Superseded shape:** `ReelFeed(builders: ReelBuilders(...))` became `itemBuilder` returning a `ReelItem`, and
> `header`/`footer`/`showHud` moved onto `ReelFeed` (`hudFor`); see [Declarative Items](./reel-feed-declarative.md).
> Layers, rebuild rules, gestures and locking are unchanged.
> **Builds on:** [ReelFeed API](./reel-feed-api.md), implemented and verified.
> **Package:** `apps/flutter/packages/hls_video_player`

---

## 1. Goals, non-goals, constraints

### Goals

1. **The package owns the page.** One fixed layer order that covers most reel screens; a complete working screen
   with only a controller.
2. **Every layer is a builder, and `null` means "use the default".** `slot.index == 0 ? Intro() : null` works in
   every builder, the same way `table_calendar`'s `CalendarBuilders` do.
3. **Locking is enforced, not wired.** A locked reel gets no player and no cache, and shows the curtain above
   everything with video gestures blocked and swipe-through built in.
4. **Gestures are owned by the package** (tap, double tap, long press), with callbacks and animation builders.
5. **Controls are positioned, not rebuilt**: seek bar, timer and fullscreen button placement through `ReelStyle`.
6. **No cliff at the edge of the 80%.** The default page is built from public pieces (`ReelLayers`), so a custom
   page reuses them instead of starting from nothing.
7. **The type says how often a builder runs.** A builder that receives `ReelPlaybackState` runs on player ticks;
   one that does not, runs only when data or focus changes.

### Non-goals

- Layouts that change page geometry (split video and comments, video in a card, mini player). These use the
  `page` builder with `ReelLayers` (§6).
- A layer below the scrim for host UI. Covered by `page` when needed.
- Any change to native code, the cache, prefetch, reachability or `HlsPortWindow` behaviour.

### Hard constraints

| Constraint | How it is enforced |
|---|---|
| **Zero regression in existing functionality** | `HlsReelPager`, `HlsVideoPlayer`, the old barrel, v1 `ReelsScreen` unchanged. Existing tests (322 package, 743 app) pass **unedited** |
| **Zero regression in the ReelFeed API already built** | `ReelFeed.itemBuilder`, `ReelVideo`, `ReelControls`, `ReelTapToPlay`, `ReelStateBuilder`, controller and handle keep their signatures and behaviour; their tests stay unedited |
| **Same native behaviour** | The layers are pure composition over `ReelHandle`; the parity test is extended to run through the builders path and must match `HlsReelPager` call for call |
| **Playback speed unchanged** | Fast-start rules in the ReelFeed plan §5 still apply; no layer adds work to the page-change path; single tap stays instant (§5.2) |
| **No per-tick page rebuilds** | Enforced by structure (§4) and asserted by build-counter tests per layer |

---

## 2. What the host writes

### 2.1 Minimum: a complete screen

```dart
ReelFeed<Reel>(controller: feed)
```

Video, tap to play or pause, centre play and mute while paused, seek bar, timer, fullscreen, loader, error with
retry. No `itemBuilder` needed.

### 2.2 The Reels screen (v2) as the acceptance example

```dart
late final feed = ReelFeedController<Reel>(
  items: reels,
  id: (reel) => reel.id,
  source: toReelSource,
  // Locked: no player, no cache, curtain shown by the package.
  locked: (reel) => reel.isExclusive && !unlocked.contains(reel.id),
);

ReelFeed<Reel>(
  controller: feed,
  style: ReelStyle(
    scrim: context.appColors.overlay.hero,
    fullscreenButton: ReelControlPosition.bar,
  ),
  builders: ReelBuilders<Reel>(
    thumbnail: (context, slot) => ReelThumbnail(url: slot.data.thumbnailUrl),
    overlay: (context, slot) => Padding(
      padding: slot.insets,
      child: RailAndMeta(reel: slot.data, onShare: share),
    ),
    curtain: (context, slot) => UnlockOverlay(
      ...,
      confirmAndUnlock: () {
        unlocked.add(slot.id);
        slot.refresh();
      },
    ),
    fullscreenIcon: (context, slot) => const Icon(Icons.screen_rotation_rounded),
    header: (context, current) => TitleAndPointsPill(hidePill: current?.isLocked ?? false),
  ),
)
```

**Acceptance:** `reels_screen_v2.dart` shrinks from ~270 lines to about half, and has no `Stack` ordering, no
`SwipeThroughOverscroll`, no `ListenableBuilder` and no manual padding for the seek bar.

---

## 3. The page structure

### 3.1 Layer order (bottom to top)

| # | Layer | Default | Rebuilds on | Takes touches |
|---|---|---|---|---|
| 0 | `background` | Black fill | data | No |
| 1 | `thumbnail` | None | data; fades out on first frame | No |
| 2 | `video` | `ReelVideo` with `style.fit` | port change | No |
| 3 | `scrim` | `style.scrim` gradient, or none | data | No |
| 4 | *gestures* | Package-owned, not replaceable | — | Yes (tap, double tap, long press) |
| 5 | `effects` | Tap pulse; double-tap and long-press effects when builders given | gesture | No |
| 6 | `overlay` | None | data, focus | Yes, where the host draws |
| 7 | `controls` | Centre play/mute while paused, bottom bar | tick | Yes, on the controls only |
| 8 | `status` | Loader while opening or stalled; error with retry | tick | Error retry only |
| 9 | `curtain` | None; shown only when locked | data, focus | Yes, the whole page |
| 10 | `aboveCurtain` | None | data, focus | Yes, where the host draws |

Feed-level, outside the pages: `header` and `footer` (receive the current slot), `insert` (non-video pages),
`fullscreen` (the rotated view).

### 3.2 Why this order

- **Gestures sit under the host overlay and controls,** so a button in `overlay` or `controls` always wins its tap,
  and empty space falls through to tap-to-play.
- **Effects sit above gestures and never take touches,** so a double-tap heart does not block the next tap.
- **Controls sit above the overlay,** so a growing caption can never cover the seek bar; `slot.insets` tells the
  overlay where the controls are.
- **Status sits above controls,** so an error with retry is always visible and reachable.
- **Curtain sits above everything except `aboveCurtain`,** so a locked reel never exposes video controls, while
  Share or Like can stay usable through `aboveCurtain`.
- **Thumbnail sits under video,** so the first frame replaces it with no flash; on a locked reel it stays as the
  curtain's backdrop.

---

## 4. Rebuild rules (enforced by structure)

Each layer is its own widget. Its builder's signature decides when it runs:

| Kind | Builder signature | Runs when | Layers |
|---|---|---|---|
| Data | `(BuildContext, ReelSlot<T>)` | Item data, focus, lock or insets change | background, thumbnail, scrim, overlay, curtain, aboveCurtain, header, footer |
| Tick | `(BuildContext, ReelSlot<T>, ReelPlaybackState)` | Every player tick (~10 Hz while playing) | controls pieces, status |
| Effect | `(BuildContext, ReelSlot<T>, ReelGestureEffect)` | Once per gesture; animation driven by the package | tapEffect, doubleTapEffect, longPressEffect |

- A data layer is wrapped so its subtree is **not** rebuilt by ticks. Only tick layers listen to `slot.state`.
- The page itself rebuilds only on controller notifications (focus, items, window changes), never on ticks — the
  same rule as today.
- **Tested:** a build counter per layer; ten player ticks must rebuild tick layers and zero data layers.

---

## 5. Gestures and effects

### 5.1 Callbacks on `ReelFeed`

```dart
ReelFeed<Reel>(
  onTap: (slot, position) => slot.reel.togglePlay(),   // default when omitted
  onDoubleTap: (slot, position) => like(slot.data),     // opt-in
  onLongPressStart: (slot, position) => slot.reel.pause(),
  onLongPressEnd: (slot) => slot.reel.play(),
  ...
)
```

- `onTap: null` keeps the default (toggle play). Pass `ReelGestures.none` to disable tap entirely.
- Gestures fire only on the focused, unlocked reel. A locked reel's gestures belong to the curtain.

### 5.2 Double-tap latency

With a double-tap recogniser, Flutter waits `kDoubleTapTimeout` (300 ms) before a single tap fires. So:

- The double-tap recogniser exists **only when `onDoubleTap` is set**. Without it, single tap is instant, exactly
  as today.
- `ReelFeed.onDoubleTap`'s doc comment states the 300 ms cost.
- **Tested:** with no `onDoubleTap`, a tap toggles play in the same frame.

### 5.3 Effect builders

```dart
builders: ReelBuilders(
  tapEffect: (context, slot, effect) => PlayPausePulse(effect.animation, playing: effect.state.isPlaying),
  doubleTapEffect: (context, slot, effect) => Positioned(
    left: effect.position.dx - 40,
    top: effect.position.dy - 40,
    child: ScaleTransition(scale: effect.animation, child: const Icon(Icons.favorite, size: 80)),
  ),
)
```

- `ReelGestureEffect` carries `position`, `animation` (owned and disposed by the package) and the state at the
  moment of the gesture.
- Effects stack: two quick double taps show two hearts. Each is removed when its animation completes.
- Duration from `style.effectDuration` (default 600 ms). Reduced motion (`MediaQuery.disableAnimationsOf`) skips
  effects.

---

## 6. `ReelLayers`: no cliff

The default page is built from `ReelLayers<T>`, a public object that exposes each resolved layer (the host's
builder or the default):

```dart
builders: ReelBuilders(
  page: (context, slot, layers) => slot.index.isEven
      ? null // default stack
      : Column(children: [
          Expanded(child: Stack(children: [layers.video, layers.gestures, layers.controls])),
          CommentsPanel(slot.data),
        ]),
)
```

- `layers.background`, `.thumbnail`, `.video`, `.scrim`, `.gestures`, `.effects`, `.overlay`, `.controls`,
  `.status`, `.curtain`, `.aboveCurtain`, and `layers.stack` (the default composition).
- A custom page keeps the package's gesture handling, curtain enforcement and rebuild rules for every piece it
  reuses.
- **Enforcement stays on for custom pages:** if the reel is locked and the custom page does not include
  `layers.curtain`, the package paints the curtain on top anyway (debug builds also assert with a message).

`ReelFeed.itemBuilder` stays exactly as it is today for full manual control; `itemBuilder` and `builders` are
mutually exclusive (assert with a clear message).

---

## 7. Controls: pieces and positions

### 7.1 Public pieces

New widgets built on the existing `HlsEngineSeekBar` and `HlsEngineTimer` (unchanged):

| Widget | Does |
|---|---|
| `ReelSeekBar(slot)` | Seek bar with tap/drag to seek; `builders.seekBar` replaces its visual |
| `ReelTimer(slot)` | `m:ss / m:ss`; `builders.timer` replaces the text |
| `ReelPlayPauseButton(slot)` | Centre play; `builders.playIcon` replaces the visual |
| `ReelMuteButton(slot)` | Feed mute toggle; `builders.muteIcon` |
| `ReelFullscreenButton(slot)` | Enter or exit fullscreen; `builders.fullscreenIcon` |

Each keeps a **48 dp tap target** regardless of its visual size, and has a semantic label taken from
`ReelLabels` (host-supplied strings, English defaults).

### 7.2 Positions in `ReelStyle`

```dart
enum ReelControlPosition { bar, topEnd, bottomStart, bottomEnd, hidden }
enum ReelBarPlacement { bottom, hidden }

const ReelStyle(
  seekBar: ReelBarPlacement.bottom,
  timer: ReelControlPosition.bar,
  fullscreenButton: ReelControlPosition.bar,
  centreControls: true,          // play and mute while paused
  bottomBarHeight: 48,
  controlsPadding: EdgeInsets.symmetric(horizontal: 12),
  fit: BoxFit.contain,
  scrim: null,                   // a Gradient, or null for none
  effectDuration: Duration(milliseconds: 600),
  thumbnailFade: Duration(milliseconds: 150),
);
```

- `style` is data only: *where* and *whether*. Anything drawn is a builder.
- `slot.insets` is computed from the style (bottom bar height, safe area, corner controls), so overlay padding
  follows the style automatically.

### 7.3 The 44 dp question

The existing bar (`HlsPlayerBottomBar`) is 44 dp and stays unchanged for `HlsReelPager` and `ReelControls`. The new
controls layer defaults to **48 dp**, which fixes the skipped accessibility test for screens that move to the
builders. v2's bottom row becomes 4 dp taller. Approved (§12).

---

## 8. Locking

### 8.1 On the controller

```dart
ReelFeedController<Reel>(
  ...,
  locked: (reel) => reel.isExclusive && !unlocked.contains(reel.id),
);
```

- New optional `locked` predicate; default: nothing is locked.
- A reel is given a player only when `source != null && !locked`. The window sees exactly today's `playable`
  flag, so no window change is needed.
- `source == null` without `locked` keeps today's meaning: no player, no curtain (e.g. still processing).
- `feed.refresh(index)` / `slot.refresh()` re-runs `source` and `locked` for one item after the host changes its own
  state, such as a session unlock. It is `update(index, sameItem)` under the hood.
- `ReelHandle.isLocked` and `ReelSlot.isLocked` expose it.

### 8.2 What the package enforces when locked

- No player, no `openAsset`, no prefetch, no cache (already true through `playable`).
- The curtain layer is shown above video, controls and status; the gesture layer is disabled.
- **Swipe-through is built in:** the curtain is wrapped in the package's own overscroll handler (the same
  60 px-threshold logic as the app's `SwipeThroughOverscroll`), so a scrollable curtain scrolls and an overscroll
  moves to the next or previous page.
- Unlocking (`refresh` after the host's state changes) opens the player; the reel on screen starts playing, as
  `update` does today.

---

## 9. Public API summary

```dart
class ReelFeed<T> {
  ReelFeed({
    required ReelFeedController<T> controller,
    ReelBuilders<T> builders = const ReelBuilders(),
    ReelStyle style = const ReelStyle(),
    ReelLabels labels = const ReelLabels(),
    ReelItemBuilder<T>? itemBuilder,             // existing, mutually exclusive with builders
    ReelTapCallback<T>? onTap, onDoubleTap,
    ReelLongPressCallback<T>? onLongPressStart,
    ValueChanged<ReelSlot<T>>? onLongPressEnd,
    ...existing: inserts, onEvent, onEndReached, endReachedThreshold, active,
    fullscreenBuilder, emptyBuilder, showHud, physics,
  });
}

class ReelBuilders<T> {
  // data layers
  ReelSlotBuilder<T>? background, thumbnail, scrim, overlay, curtain, aboveCurtain;
  // tick layers (null = default piece; return null = default)
  ReelStateBuilder<T>? controls, status, loading, error;
  ReelStateBuilder<T>? seekBar, timer, playIcon, muteIcon, fullscreenIcon;
  // effects
  ReelEffectBuilder<T>? tapEffect, doubleTapEffect, longPressEffect;
  // page and feed level
  ReelPageBuilder<T>? page;
  ReelHeaderBuilder<T>? header, footer;
  InsertBuilder? insert;          // equivalent to ReelFeed.inserts builder, for one place to look
}

class ReelSlot<T> {
  ReelHandle<T> get reel;         // every command: play, pause, seekTo, retry, mutedOverride
  int get index; String get id; T get data;
  bool get isFocused; bool get isLocked; bool get isPlayable;
  ValueListenable<ReelPlaybackState> get state;
  EdgeInsets get insets;          // space taken by package controls
  void refresh();                 // re-run source and locked for this reel
}
```

All builder typedefs return `Widget?`; `null` always means the default.

---

## 10. File layout

```
packages/hls_video_player/lib/src/feed/
  builders/
    reel_builders.dart            # ReelBuilders, typedefs
    reel_style.dart               # ReelStyle, positions
    reel_labels.dart              # semantic label strings
    reel_slot.dart                # ReelSlot
    reel_layers.dart              # ReelLayers + default composition
    reel_page.dart                # the page widget: resolves builders, owns rebuild boundaries
    reel_gesture_layer.dart       # tap / double tap / long press, effect queue
    reel_curtain_layer.dart       # lock enforcement, swipe-through
    reel_controls_layer.dart      # positions the pieces from ReelStyle
    reel_control_pieces.dart      # ReelSeekBar, ReelTimer, buttons
```

Existing-file changes, all additive:

| File | Change |
|---|---|
| `reel_feed.dart` | Optional `builders`, `style`, `labels`, gesture callbacks; `itemBuilder` becomes optional; `header`/`footer` around the pager |
| `reel_feed_controller.dart` | Optional `locked` predicate; `refresh(index)` |
| `reel_handle.dart` | `isLocked` getter |
| `reels.dart` | Exports the new files |

No file outside `lib/src/feed/` and `lib/reels.dart` changes.

---

## 11. Phases and tests

| # | Phase | Output | Tests |
|---|---|---|---|
| 0 | Approve this plan | Sign-off | — |
| 1 | Locking | `locked`, `refresh`, `isLocked` | Locked: no native calls; refresh unlocks and plays; `source == null` stays curtain-free |
| 2 | Slot, style, labels, layers skeleton | Default page equals today's default look | Golden-free widget tests: every default layer present in order |
| 3 | Rebuild boundaries | Data vs tick layers | Build counters: 10 ticks → 0 data-layer builds |
| 4 | Gestures and effects | Tap, double tap, long press, effect queue | Tap instant without double tap; double tap fires once; effects stack and dispose; reduced motion skips effects |
| 5 | Controls pieces and positions | Pieces + layout from style | Each position renders where stated; 48 dp targets; labels present |
| 6 | Curtain enforcement | Curtain layer, swipe-through, custom-page fallback | Locked reel blocks taps; overscroll pages; custom page without curtain still shows it |
| 7 | Header, footer, fullscreen, page builder | Feed-level layers, `ReelLayers` reuse | Header gets current slot; fullscreen reuses same port; `page` returning null uses default |
| 8 | Parity and regression | Builders path in the parity test | Same 136-call sequence; all existing tests unedited |
| 9 | v2 on builders | Rewrite `reels_screen_v2.dart` | v2 tests unedited pass; guidelines test un-skipped |
| 10 | Examples and docs | `example/lib/builders_*.dart`, README section | Examples analyze clean |

**Regression gate after every phase:** package and app suites green with no existing test edited; parity test
green; `flutter analyze --fatal-infos` clean in the app.

---

## 12. Decisions

1. **48 dp bottom bar in the new controls layer** (§7.3): approved. v2's bottom row gets 4 dp taller, and the v2
   accessibility guideline test is un-skipped in phase 9.
2. **Tap on a paused reel**: keeps today's behaviour. A tap anywhere toggles play, and the centre play button does
   the same.
3. **Long press**: does nothing by default. `onLongPressStart` / `onLongPressEnd` are opt-in.

## 13. Risks

| Risk | Mitigation |
|---|---|
| Builders run per tick by accident | Signature decides the kind (§4); build-counter tests |
| Double tap slows single tap | Recogniser only when `onDoubleTap` is set; tested |
| Custom page skips the curtain | Package paints it anyway, debug assert |
| Too many options over time | Style holds position and on/off only; new slots added only for a real screen |
| Existing API drifts | Existing widgets and tests untouched; new behaviour only through new, optional parameters |

---

## 14. Implementation notes

### Where the code is

| Part | Files |
|---|---|
| Builders layer | `packages/hls_video_player/lib/src/feed/builders/` (`reel_builders`, `reel_style`, `reel_labels`, `reel_slot`, `reel_layers`, `reel_page`, `reel_gesture_layer`, `reel_curtain_layer`, `reel_controls_layer`, `reel_control_pieces`) |
| Existing files changed | `reel_feed.dart` (optional `builders`, `style`, `labels`, gesture callbacks; `itemBuilder` optional), `reel_feed_controller.dart` (`locked`, `refresh`, `refreshAll`), `reel_handle.dart` (`isLocked`), `reels.dart` (exports) |
| Tests | `test/feed/reel_feed_builders_test.dart` (24), `test/feed/reel_feed_builders_parity_test.dart`, locking group in `reel_feed_controller_test.dart` (5) |
| Example | `example/lib/builders_feed.dart` |
| App | `reels_screen_v2.dart` on builders; `toReelSource`; 7 new ARB labels for the control pieces |

### Differences from the plan

- **Gestures and effects are one layer** (`layers.gestures` includes the effects), because the gesture widget owns the
  effect animations.
- **The default tap effect is none**, not a pulse, so the default page looks exactly like today's.
- **There is no `insert` builder** in `ReelBuilders`; `ReelFeed.inserts` stays the one place for insert pages.
- **There is no `ReelGestures.none`.** To turn tap off, pass `onTap: (_, __) {}`.
- **A custom page without the curtain gets it added, with no debug assert.** The package detects this when the page
  builder does not read `layers.curtain` while building.
- **`refreshAll()` was added** next to `refresh(index)`, for unlocks that affect every reel (a subscription).
- **Control pieces read style and labels from `ReelScope`**, an `InheritedWidget` the page provides, so
  `ReelPlayPauseButton(slot: slot, state: state)` works inside host controls without extra parameters.
- **`ReelSeekBar` owns a 48 dp hit area and is a slider for screen readers** (value, step forward, step back). The
  existing `HlsEngineSeekBar` only paints inside it. `ReelLabels` gained `pause` and `seek`.
- **v2 did not shrink in lines** (about 270 before and after). All page plumbing is gone: the `Stack` ordering,
  `SwipeThroughOverscroll`, the `ListenableBuilder`, the seek-bar padding, and the `ReelTapToPlay` and
  `ReelControls` wiring. What remains is app UI content (13 localized curtain labels, header, rail and meta) that
  belongs in the app.

### Verified

- Package: 360 tests passing, 1 skipped (the same vendored skip as the baseline). No pre-existing test or vendored
  file changed.
- `/code-review` at high effort found 10 issues, all real and all fixed, with regression tests in
  `test/feed/reel_feed_edge_cases_test.dart`:
  - `reopen` now covers reels that failed or are still opening, so a new source always replaces the old one.
  - A feed that starts empty starts analytics for its first reel.
  - `onEndReached` checks again when items change, and fires for an empty feed so the first page can load.
  - v2 compares its reels with `!=`, since freezed wraps the list on every read.
  - The curtain's swipe-through ignores horizontal scrollables.
  - A feed built in a hidden tab never starts a player or a session: `ReelFeed` attaches after it knows its
    `TickerMode`.
  - Mute buttons toggle the reel's override when it has one (`ReelHandle.toggleMute`).
  - `ReelFocused.fromIndex` is tracked by id, so it stays right after inserts.
  - `update`, `refresh` and `add`/`addAll` read only the items they touch.
  - `ReelControls` reuses the shared control helpers.
- Builders parity: the same 136-call session through `HlsReelPager` and through a builders `ReelFeed` (with style,
  thumbnail, overlay, header and double tap) is identical.
- App: `flutter analyze --fatal-infos` is clean and 744 tests pass with none skipped. The v2 accessibility guideline
  test now runs and passes, with 48 dp targets throughout.

### Not verified yet

Device QA from the ReelFeed plan §10.5, now on the builders-based v2: time to first frame, HUD numbers, offline and
the online flip, player count, tab switching, fullscreen, plus double-tap feel and the curtain swipe-through.
