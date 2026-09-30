# ReelFeed API — Implementation Plan

> A new, host-controlled reels API for `packages/hls_video_player`.
> The package keeps owning players, memory, caching, prefetch, offline and HUD.
> The host gets a `ListView.builder`-style pager and a handle per reel.
>
> **Status:** Implemented, including phase 9: the `ReelFeed` screen is now the app's only Reels screen, `ReelsScreen`.
> v1 lives on in the package as `ReelPagerLab` (see `reel-feed-lab.md`).
> Where the build differs from this plan, §15 says so.
> **Package:** `apps/flutter/packages/hls_video_player`
> **First consumer:** `apps/flutter/lib/features/reels/`

---

## 1. Goals and non-goals

### Goals

1. **The package manages memory and player instances.** The host never creates, keeps or disposes a player.
2. **The host controls every reel** through a handle: play, pause, seek, mute, per-reel mute override.
3. **The host decides which reels may play and be cached.** A locked reel gets a page but no player, no
   `openAsset`, no prefetch and no cache, until the host says otherwise.
4. **The host can insert non-video pages** (ads, promos) without shifting reel indexes.
5. **Analytics callbacks**: focus, start, time to first frame, pause, buffering, loop, watch time, error.
6. **Any host UI per reel.** The builder receives the reel handle; the package ships optional default
   controls built on the same public API.
7. **Usable without docs.** Types, named constructors, sealed events and IDE doc comments guide the developer.

### Non-goals (for this version)

- Commands on reels **outside** the window are ignored (they return `false`). The return type leaves room to
  queue them later without an API change (§12).
- No change to native code (Android, iOS), the cache, prefetch, reachability or the fork.
- No change to the behaviour of `HlsReelPager`, `HlsVideoPlayer` or the existing barrel.

### Hard constraints

| Constraint | How it is enforced |
|---|---|
| **No regression** in memory/instance management, HUD accuracy, offline playback, offline → online switch | New layer reuses `HlsPortWindow` and HUD classes as they are; existing test suite must pass unedited; parity tests (§10) |
| **One source of truth** | The new layer stores no player, cache, network or playback state (§4) |
| **Instant playback on swipe** stays as fast as today | Fast-start rules (§5), measured with a time-to-first-frame event on both screens |
| **Existing code untouched** | Only additive, default-off changes to two files (§6); everything else is new files |

---

## 2. Decisions already made

| Topic | Decision |
|---|---|
| Commands for reels outside the window | Ignored for now, return `false`; extensible later |
| Mute | Global `feed.muted`, optional per-reel override |
| Ads and other inserts | Separate `inserts`, own index space; `feed[i]` is always reel `i` |
| Names | `ReelFeed` (widget), `ReelFeedController`, `ReelHandle` |
| Where it is built | Directly in the package (`lib/src/feed/`), proven in the app behind a flag |
| Memory owner | `HlsPortWindow` stays the only owner; ports still create `VideoPlayerController` |

---

## 3. Architecture

```
Host (app)
  ReelsScreen ─── builds ──► ReelFeed<Reel>(controller, itemBuilder, inserts, onEvent)
        │                             │  pages, fullscreen, HUD, TickerMode
        │ commands                    ▼
        └──────────────────► ReelFeedController<Reel>
                               │  handles, page ↔ reel index map, events, host commands
                               │  (no player / cache / network state)
                               ▼
                             HlsPortWindow                ◄── unchanged owner of:
                               │                              keep-set, open/evict, epochs,
                               │                              reachability, rebuild, prefetch
                               ▼
                             HlsPlayerPortFactory → HlsPlayerPort → VideoPlayerController
                               ▼
                             Native engine (Android SimpleCache / iOS loopback)   ◄── unchanged
```

`ReelFeedController` **wraps** an `HlsPortWindow`; it does not replace or subclass it.
`ReelFeed` **reuses** `HlsHudTelemetry`, `HlsHudBinder`, `PortraitPoolOverlay`, `HlsFullscreenView`,
`HlsPlayerView` and `HlsPlayerBottomBar` without editing them.

---

## 4. Single source of truth

The new layer only **passes through** or **derives read-only** values.

| State | Owner (unchanged) | New layer does |
|---|---|---|
| Cache, prefetch, offline, reachability | Native engine | Nothing |
| Which players exist | `HlsPortWindow._ports` | `handle.hasPlayer` → `window.portAt(index) != null`, looked up on every call |
| Focused index | `HlsPortWindow.focusedIndex` | Reads it; sets it only through `window.sync()` |
| Play intent, global mute | `window.playRequested`, `window.muted` | Writes to them, keeps no copy |
| Per-reel mute override | `HlsPortWindow` (new, §6.2) | Writes to it |
| Playback (position, buffering, size, errors) | `port.snapshotListenable` | `handle.state` forwards it |
| Open errors | `window.errorAt(index)` | `handle.state.openError` reads it |
| HUD telemetry | `HlsHudTelemetry` bound to `window.focusedPort` | Same code path as `HlsReelPager` |
| Analytics (watch time, loops) | Derived from port snapshots | Computed, emitted, **never fed back** |

**Rule: a handle never stores an `HlsPlayerPort`.** Going offline → online runs `_rebuildPorts`, which swaps in new
port objects and seeks back to the saved position. Because every handle method resolves
`window.portAt(index)` at call time, handles pick up rebuilt players automatically.

`handle.state` is a `ValueListenable<ReelPlaybackState>` that re-binds to the current port whenever the window
notifies (port attached, rebuilt or evicted). It is a view, not a copy.

---

## 5. Fast-start rules (no playback delay)

Today a swipe plays instantly because the next reel's player is already open and `sync()` calls
`applyPlayback()` **before** its first network `await`. The new layer must keep every one of these:

1. **Page change calls `window.sync()` synchronously inside `onPageChanged`**: no post-frame callback, debounce,
   `await` or `Future.microtask` before it.
2. **Nothing new runs before the first `applyPlayback()`** in `sync()`. The playable check (§6.1) is a
   synchronous field read inside `keepIndexes`.
3. **Default window radius stays 2**, so ±2 neighbours are opened and prefetched ahead, exactly as now.
4. **Attach-time autoplay is kept**: `_ensurePort(...).then(applyPlayback)` is unchanged, so a player that
   finishes opening while focused starts at once.
5. **During an insert page (ad), the window focuses the next reel with play suppressed**, so that reel is
   already open, prefetched and paused on frame 0 when the user swipes on.
6. **`source()` is synchronous** and evaluated when items are set or updated, never during a swipe.
7. **No rebuild on snapshot ticks.** Neither the controller nor `ReelFeed` notifies on port ticks (the same rule
   `HlsPortWindow._onSnapshot` documents). Per-reel UI listens to `handle.state` directly.
8. **Analytics work on a tick is sync and allocation-light**: no `await`, no I/O. Host `onEvent` and
   `events` are delivered in one microtask after the current work, so host code never runs inside a swipe.
9. **Video widgets keep stable keys**: `ValueKey('reel-${id}')` on the page and the port's instance key on
   the texture, as today, so the texture is not recreated on rebuild.

**Accepted cost:** a locked reel has no player by design, so after unlock it opens cold (open + first segments),
like the first reel at app start. This is the direct result of "locked reels must not be cached beforehand".

**Measured by:** `ReelFirstFrame` event (§7.6), time from focus to first `isPlaying`, logged on the old and new
screen. Acceptance: new ≤ old + one frame (≈16 ms) on the same device and feed.

---

## 6. Changes to existing files (additive, default-off)

Only two existing files change. Every change defaults to today's behaviour, and the existing tests must pass
**without edits**.

### 6.1 `HlsReelItem.playable` — skip players for locked reels

`lib/src/player/hls_reel_item.dart`

```dart
const HlsReelItem({..., this.playable = true});

/// False keeps this item's page but gives it no player, openAsset or prefetch.
final bool playable;
```

- `sameFeedIdentity` also compares `playable`, so flipping it triggers `updateItems`. Old callers always pass
  `true`, so the old pager sees no difference.

`lib/src/player/hls_port_window.dart`, `keepIndexes`:

```dart
if (index >= 0 && index < _items.length && _items[index].playable) {
  keep.add(index);
}
```

- A non-playable reel still **counts toward the radius** (indexes are not skipped), so the number of players can
  only go down, never above `2·radius + 1`.
- Because `sync`, `_ensurePort`, `_onBackOnline` and eviction all use `keepIndexes`, one change covers opening,
  prefetch, reachability and eviction. Unlocking (`playable: true` through `updateItems`) opens the player on the
  next `sync`.

### 6.2 Per-reel mute override

`lib/src/player/hls_port_window.dart`

```dart
final Map<String, bool> _mutedOverrides = <String, bool>{};

bool isMutedFor(String id) => _mutedOverrides[id] ?? muted;

/// null clears the override. Applies volume to the focused port only.
Future<void> setMutedOverride(String id, bool? value) async { ... }
```

- `applyPlayback` uses `isMutedFor(entry.key)` instead of `muted` for the focused port. With no overrides this is
  exactly `muted`, so behaviour is unchanged.
- Overrides for ids that leave `_items` are dropped in `updateItems`.

### 6.3 Retry a failed open (fixes README known issue #7 for the new API)

`lib/src/player/hls_port_window.dart`

```dart
/// Clears the open error for [id] and opens it again if it is in the keep-set.
Future<void> retry(String id) async { ... }
```

- Not called by `HlsReelPager`, so the old behaviour is unchanged.

### Not changed

`HlsReelPager`, `HlsVideoPlayer`, `HlsPlayerChrome`, `HlsHud*`, `HlsFullscreenView`, `HlsEngine`, the bridge,
all native code, `lib/hls_video_player.dart`, and all existing tests.

---

## 7. Public API

Imported from a **new barrel**: `package:hls_video_player/reels.dart`. It exports only the new API plus the
types a host needs with it (`HlsEngine`, `HlsConnectivity`, `HlsContentDescriptor`). The old barrel is
untouched.

### 7.1 `ReelSource` — what plays and how

```dart
sealed class ReelSource {
  /// Clear HLS; package defaults for cache and prefetch.
  const factory ReelSource.hls(Uri masterUri) = HlsReelSource;

  /// HLS with a full descriptor (DRM, auth, cache policy, prefetch caps).
  const factory ReelSource.descriptor(HlsContentDescriptor descriptor) = DescriptorReelSource;
}
```

The host returns `null` from `source` for "no player, no cache" (locked, geo-blocked, processing…).

### 7.2 `ReelWindow` — memory configuration

```dart
class ReelWindow {
  const ReelWindow({this.radius = 2}) : assert(radius >= 0, 'ReelWindow.radius must be 0 or more');
  /// Players are kept for the focused reel and [radius] reels on each side.
  final int radius;
}
```

Constructor-only on the controller, so it can never trigger a teardown by accident.

### 7.3 `ReelFeedController<T>`

```dart
class ReelFeedController<T> extends ChangeNotifier {
  ReelFeedController({
    required List<T> items,
    required String Function(T item) id,           // stable id, used to keep players on list changes
    required ReelSource? Function(T item) source,  // null → no player, no cache
    ReelWindow window = const ReelWindow(),
    bool autoplay = true,                          // play intent given to each newly focused reel
    bool muted = true,                             // global mute
    HlsConnectivity? connectivity,                 // same meaning as on HlsReelPager
  });

  // Items (pagination, edits). Players are kept by id.
  List<T> get items;
  int get length;
  ReelHandle<T> operator [](int index);
  void update(int index, T item);                  // re-runs source(): unlock = update with unlocked model
  void addAll(Iterable<T> items);
  void insert(int index, T item);
  void removeAt(int index);
  void replaceAll(List<T> items);                  // refresh; focus is kept by id when possible

  // Focus and navigation.
  ReelHandle<T>? get current;                      // null while an insert page is showing
  int get currentIndex;                            // reel index; next reel while on an insert
  Future<void> jumpTo(int index);
  Future<void> animateTo(int index, {Duration duration, Curve curve});
  Future<void> next();
  Future<void> previous();

  // Global playback.
  bool autoplay;                                   // no teardown when changed
  bool muted;                                      // global; per-reel override on the handle
  bool get isActive;                               // false while the feed is hidden (§8.3)

  // Fullscreen (same port, rotated, as today).
  bool get isFullscreen;
  void enterFullscreen();
  void exitFullscreen();

  // Analytics.
  Stream<ReelEvent<T>> get events;                 // same events as ReelFeed.onEvent

  @override
  void dispose();                                  // disposes the window and every player
}
```

`notifyListeners()` fires only on: focus change, item list change, player attached/evicted/rebuilt, mute or
active change, fullscreen change. **Never on snapshot ticks.**

### 7.4 `ReelHandle<T>` — one per reel

```dart
class ReelHandle<T> {
  T get data;
  int get index;
  String get id;
  bool get isFocused;
  bool get isPlayable;                             // source(data) != null
  bool get hasPlayer;                              // inside the window with an open player
  ValueListenable<ReelPlaybackState> get state;    // forwards the current port's snapshot

  // Commands. Return false when not applied (outside the window, or not focused for play).
  bool play();
  bool pause();
  bool togglePlay();
  bool seekTo(Duration position);                  // any reel with a player, focused or not
  bool retry();                                    // after an open error

  // Mute.
  bool get isMuted;                                // override ?? feed.muted
  bool? mutedOverride;                             // null = follow feed.muted
}
```

- `play`/`pause` apply to the **focused** reel only, because the window plays exactly one reel. Pause is per
  reel: the next focused reel starts from `autoplay`, as today.
- Handles are cached per id, so the same reel returns the same handle object.
- `seekTo` on an in-window, non-focused reel lets the host resume a reel at a saved position before it is
  shown.

### 7.5 `ReelPlaybackState`

```dart
@immutable
class ReelPlaybackState {
  final ReelPlayerStatus status;   // noPlayer, opening, ready, playing, paused, buffering, error
  final Duration position;
  final Duration duration;
  final List<HlsBufferedRange> buffered;
  final double aspectRatio;
  final bool isMuted;
  final String? error;             // player error or window openError
}
```

Built from `HlsPlayerSnapshot` plus `window.errorAt` / `isMutedFor`. `status` is one enum, so hosts `switch` on
it instead of combining booleans.

### 7.6 `ReelEvent<T>` — analytics (sealed)

| Event | When | Fields |
|---|---|---|
| `ReelFocused` | Reel becomes current | `reel`, `fromIndex` |
| `ReelFirstFrame` | First `isPlaying` after focus | `reel`, `timeToFirstFrame` |
| `ReelPlayed` / `ReelPaused` | Play intent changes (user or host) | `reel`, `position`, `byUser` |
| `ReelBufferingStarted` / `ReelBufferingEnded` | Stall during playback (not the initial load) | `reel`, `position`, `stallDuration` on end |
| `ReelLooped` | Position wraps to the start while playing | `reel`, `loopCount` |
| `ReelProgress` | Every `progressInterval` of watch time (default 5 s) | `reel`, `watchTime`, `position` |
| `ReelLeft` | Reel stops being current (swipe, dispose, feed hidden) | `reel`, `watchTime`, `maxPosition`, `loops`, `completed` |
| `ReelError` | Player or open error | `reel`, `message` |
| `InsertShown` / `InsertLeft` | Insert page shown or left | `pageIndex`, `slot` |

- **Watch time** = wall-clock time while the focused reel `isPlaying && !isBuffering` and the feed is active.
  It pauses automatically when the app goes to the background (the player stops) or the feed is hidden.
- Derived in `_ReelAnalytics` from its own listener on the focused port. The window listener stays silent.

### 7.7 `ReelInserts` — ads and other non-video pages

```dart
sealed class ReelInserts {
  const factory ReelInserts.none() = ...;
  /// An insert after every [every] reels, starting after reel [startAfter].
  const factory ReelInserts.every(int every, InsertBuilder builder, {int startAfter}) = ...;
  /// Inserts before specific reel indexes.
  const factory ReelInserts.at(Map<int, InsertBuilder> builders) = ...;
}

typedef InsertBuilder = Widget Function(BuildContext context, ReelInsertSlot slot);
```

- `_PageMap` converts page index ↔ reel index in O(1) for `every` and O(log n) for `at`. It is recomputed only
  when the item count or the inserts change, and it is stable under pagination.
- While an insert is showing, `current` is `null`, every player is paused, and the window focuses the **next**
  reel (fast-start rule 5).

### 7.8 `ReelFeed<T>` — the widget

```dart
ReelFeed<T>({
  required ReelFeedController<T> controller,
  required Widget Function(BuildContext context, ReelHandle<T> reel) itemBuilder,
  ReelInserts inserts = const ReelInserts.none(),
  ValueChanged<ReelEvent<T>>? onEvent,
  VoidCallback? onEndReached,              // pagination
  int endReachedThreshold = 3,             // reels before the end
  bool? active,                            // null = automatic from TickerMode (§8.3)
  Widget Function(BuildContext, ReelHandle<T>)? fullscreenBuilder, // default: package chrome
  bool showHud = false,
  ScrollPhysics? physics,
})
```

### 7.9 Building blocks for host UI

| Widget | Purpose |
|---|---|
| `ReelVideo(reel, {fit, placeholder, showBufferLoader})` | The video surface only: black background, aspect ratio, texture, optional loader. No gestures. `reel.video` is shorthand for `ReelVideo(reel)` |
| `ReelStateBuilder(reel, builder: (context, state) => ...)` | Rebuilds on `reel.state` only; cheap per-reel controls |
| `ReelTapToPlay(reel, child)` | Tap-to-toggle layer, focused reel only |
| `ReelControls(reel, {showSeekBar, showTimer, showMute, showFullscreen, builders…})` | Optional default controls, reusing `HlsPlayerBottomBar` and the existing paused play/mute visuals, driven **only** through the public handle API |

`ReelControls` being built on the public API alone is the proof that a host can build any control it needs.

---

## 8. Behaviour details

### 8.1 Page change

```
onPageChanged(page)
  └─ _PageMap: page → reel index r (or insert → next reel r, play suppressed)
  └─ emit ReelLeft(previous)
  └─ window.playRequested = isInsert ? false : autoplay   // pause is per reel, as today
  └─ unawaited(window.sync(focusedIndex: r))               // sets focus synchronously, plays focus first
  └─ controller.notifyListeners()                          // focus is visible in the UI right away
  └─ emit ReelFocused / InsertShown
```

The immediate notify fixes the old pager's late focus (taps not working and a locked reel briefly showing
without its curtain) **without touching `HlsPortWindow`**: `sync()` already sets `focusedIndex` before its first
`await`.

### 8.2 Items and pagination

- Items map to `HlsReelItem(id: id(item), masterUri, descriptor, data: item, playable: source(item) != null)`.
- `addAll` / `update` / `replaceAll` call `window.updateItems`, which already keeps players by id and keeps focus
  by id.
- `onEndReached` fires once per growth of `length`, when `currentIndex >= length - endReachedThreshold`.

### 8.3 Active / hidden

- `active: null` (default) follows `TickerMode.of(context)`. `StatefulShellRoute` turns tickers off for hidden
  tabs, so switching tabs pauses the feed with no host code. **To verify on device in phase 3**; if a case is
  missed, the host passes `active` explicitly.
- Inactive → `window.playRequested = false; applyPlayback()`. Active again → restore the focused reel's intent.
  No teardown, players stay open, so resuming is instant.
- App background/foreground stays with `video_player`'s existing lifecycle observer (unchanged).

### 8.4 Fullscreen

Same mechanism as `HlsReelPager`: `OverlayPortal` in the root overlay, `HlsFullscreenView` paints the **same
port** rotated. `PopScope` exits fullscreen before leaving the screen. The default `fullscreenBuilder` uses
`ReelVideo` + `ReelControls`.

### 8.5 HUD

`ReelFeed` owns one `HlsHudTelemetry` for its lifetime (even when hidden, as today, for accuracy), refreshes
stats on focus change with the same call as `HlsReelPager._refreshFocusedStats`, and paints `PortraitPoolOverlay`
+ `HlsHudBinder` when `showHud` is true. The numbers come from the same native events, so they must match the
old pager exactly.

### 8.6 Controller lifecycle

- Host creates the controller in `initState` and disposes it in `dispose` (like `ScrollController`).
- `ReelFeed` attaches on mount and calls `window.initialize(focusedIndex: currentIndex)` the first time.
- One `ReelFeed` per controller: a second attach fails an assert with a clear message.
- Detach without dispose (widget rebuilt elsewhere) → feed becomes inactive; players stay until `dispose`.

---

## 9. Guiding developers without docs

| Technique | Example |
|---|---|
| Generic types | `reel.data` is `Reel`, no casts |
| One entry point | `import 'package:hls_video_player/reels.dart'`; everything is reachable from `feed.` and `reel.` |
| Sealed types | `switch (event)` lists every `ReelEvent`; `switch (state.status)` lists every status |
| Named constructors | `ReelSource.hls(...)`, `ReelInserts.every(...)` show up in autocomplete |
| Required parameters | `id` and `source` are required, so the "same id and URL for prefetch and playback" rule can't be missed |
| Command results | `bool` tells the host whether a command applied; the doc comment says why it may not |
| Assert messages | e.g. `'ReelFeedController is already attached to a ReelFeed. Use one controller per feed.'` |
| Doc comments with examples | Every public member has `///` with a short example, so IDE hover is the documentation |
| Examples in `example/` | `example/lib/basic_feed.dart`, `locked_reels.dart`, `ads_and_pagination.dart`, `custom_controls.dart`, `analytics.dart` |

---

## 10. Testing and regression plan

### 10.1 Existing tests

All current tests under `test/` run **unedited** after every phase. Editing an existing test counts as a
regression that needs explicit sign-off.

### 10.2 New shared fakes

`test/support/fakes.dart`: a recording bridge (every `openAsset`, `prefetchMaster`, `refreshReachability`,
`cacheStats` call), a fake factory and a fake port with a controllable snapshot and connectivity. New file; the
private fakes in `hls_port_window_test.dart` stay where they are.

### 10.3 New unit and widget tests

| Area | Cases |
|---|---|
| `HlsPortWindow` additions | Non-playable item: no port, no `openAsset`, no prefetch; radius still counts it; flipping to playable opens it; overrides change only volume; `retry` reopens after an error |
| Controller | Handle identity per id; commands outside the window return `false`; `update`, `addAll`, `replaceAll` keep players by id; focus is kept by id |
| Handles after rebuild | Offline → online: handle resolves the new port, `state` re-binds, position is restored |
| Page map | `every` / `at` mapping, insert → next reel focused and paused, stable under pagination |
| Analytics | First frame, watch time excludes buffering and inactive time, loop detection, `ReelLeft` totals |
| Widget | Immediate `isFocused` on swipe; no rebuild on snapshot ticks (counted); TickerMode pauses; fullscreen shows the same port; HUD renders |

### 10.4 Parity tests (old vs new)

One scripted scenario (open, swipe ×5, swipe back, offline, online, append a page), run through
`HlsReelPager` and through `ReelFeed` with the recording fakes. The recorded sequences of `openAsset`,
`prefetchMaster`, `refreshReachability`, port open and dispose must be **identical**. A second scenario with
locked reels must be identical **except** for the locked reels' calls, which must be absent.

### 10.5 Device QA checklist (old and new screen, same build)

- [ ] Swipe playback starts with no visible delay; `ReelFirstFrame` new ≤ old + 16 ms
- [ ] Offline playback from cache
- [ ] Offline → online flip resumes at the same position
- [ ] HUD shows the same numbers on both screens
- [ ] Never more than `2·radius + 1` players (HUD pool overlay)
- [ ] Locked reel: no network requests for it until unlocked (proxy or HUD)
- [ ] Tab switch pauses; returning resumes instantly
- [ ] Fullscreen enter/exit, back button exits fullscreen first
- [ ] Ads: swiping from an ad to the next reel starts instantly

---

## 11. Phases

Each phase ends with the full test suite green and a short review.

| # | Phase | Output | Depends on |
|---|---|---|---|
| 0 | **Approve this plan** | Sign-off | — |
| 1 | Window additions | §6 changes + tests; old suite green | 0 |
| 2 | Core model | `ReelSource`, `ReelWindow`, `ReelPlaybackState`, `ReelHandle`, `ReelFeedController` (no widget) + unit tests + shared fakes | 1 |
| 3 | Widget | `ReelFeed`, `ReelVideo`, `ReelStateBuilder`, `ReelTapToPlay`, immediate focus, TickerMode, fullscreen, HUD, `reels.dart` barrel | 2 |
| 4 | Inserts and pagination | `ReelInserts`, `_PageMap`, `onEndReached` | 3 |
| 5 | Analytics | `ReelEvent`, `_ReelAnalytics`, `events` stream, `onEvent` | 3 |
| 6 | Default controls | `ReelControls` on the public API | 3 |
| 7 | Parity tests and examples | §10.4 + `example/` | 4, 5, 6 |
| 8 | App: Reels v2 behind a flag | `reels_screen_v2.dart`, flag, device QA (§10.5) | 7 |
| 9 | Switch and document | Default to v2, README consumer guide, update this doc | 8 QA passed |
| Later | Extensions | Queue commands for reels outside the window; deprecate `HlsReelPager` | 9 |

### File layout

```
packages/hls_video_player/
  lib/
    reels.dart                              # new barrel
    hls_video_player.dart                   # unchanged
    src/feed/
      reel_feed.dart                        # widget
      reel_feed_controller.dart
      reel_handle.dart
      reel_source.dart
      reel_window.dart
      reel_playback_state.dart
      reel_events.dart
      reel_inserts.dart
      reel_video.dart
      reel_state_builder.dart
      reel_tap_to_play.dart
      reel_controls.dart
      page_map.dart                         # internal
      reel_analytics.dart                   # internal
    src/player/hls_reel_item.dart           # + playable (§6.1)
    src/player/hls_port_window.dart         # + playable filter, mute override, retry (§6)
  test/
    support/fakes.dart
    feed/…_test.dart
  example/lib/…
```

---

## 12. Later extension: commands outside the window

Commands return `bool` today. Queueing them later means a `ReelWindow(queueCommands: true)` option in which the
controller stores the last seek, play and mute intents per id and applies them in the existing
`_ensurePort(...).then(...)` path. That changes no signatures, and a host that ignores the return value keeps
working.

---

## 13. App migration example (Reels v2)

```dart
class _FeedState extends State<_Feed> {
  late final feed = ReelFeedController<Reel>(
    items: widget.reels.where(isSupportedReel).toList(),
    id: (reel) => reel.id,
    source: (reel) => reel.isExclusive && !_unlocked.contains(reel.id)
        ? null                                           // no player, no cache
        : ReelSource.hls(Uri.parse(reel.masterUri)),
  );
  final _unlocked = <String>{};

  @override
  void dispose() {
    feed.dispose();
    super.dispose();
  }

  void _unlock(ReelHandle<Reel> reel) {
    _unlocked.add(reel.id);
    feed.update(reel.index, reel.data);                  // source() re-runs → player opens
  }

  @override
  Widget build(BuildContext context) {
    return Stack(fit: StackFit.expand, children: [
      ReelFeed<Reel>(
        controller: feed,
        inserts: ReelInserts.every(5, (context, slot) => const AdCard()),
        onEvent: getIt<Analytics>().trackReel,
        onEndReached: context.read<ReelsCubit>().loadMore,
        itemBuilder: (context, reel) => Stack(fit: StackFit.expand, children: [
          ReelTapToPlay(reel, child: reel.video),
          const _Scrim(),
          ReelControls(reel, showFullscreen: true),
          _RailAndMeta(reel: reel.data),
          if (!reel.isPlayable) UnlockOverlay(onConfirm: () => _unlock(reel), ...),
        ]),
      ),
      // Points pill hides while the current reel is locked. No post-frame callback.
      ListenableBuilder(
        listenable: feed,
        builder: (context, _) => feed.current?.isPlayable ?? true ? const _PointsPill() : const SizedBox.shrink(),
      ),
    ]);
  }
}
```

The flag is a `const bool.fromEnvironment('REELS_V2')` read in `HomeRoute.build`, so the old and new screens can be
compared on the same build.

> **Update:** the flag is gone. v2 became `ReelsScreen`, the only screen on Home, and v1 moved to the package as
> `ReelPagerLab`. `--dart-define=REELS_LAB=feed|pager` opens one of the two labs instead.

---

## 14. Risks

| Risk | Mitigation |
|---|---|
| A window change alters old pager behaviour | Additive, default-off; old tests unedited; parity tests |
| Handle holds a stale port after rebuild | No stored ports (§4); dedicated rebuild test |
| Extra rebuilds slow scrolling | No notify on ticks; rebuild counter in widget tests |
| Playback start gets slower | Fast-start rules (§5); `ReelFirstFrame` comparison on device |
| Unlocked reel starts slower than others | Accepted by design (no caching while locked); documented |
| `TickerMode` misses a hidden case | Explicit `active` override; verified in phase 3 |
| Two pagers on screen exceed decoder limits | Out of scope now; noted for a shared player budget on `HlsEngine` later |

---

## 15. Implementation notes

What was built, and where it differs from the plan above.

### Where the code is

| Part | Files |
|---|---|
| Public API | `packages/hls_video_player/lib/reels.dart` and `lib/src/feed/` |
| Window additions | `lib/src/player/hls_reel_item.dart` (`playable`), `lib/src/player/hls_port_window.dart` (`playable` filter, `portFor`, `errorFor`, `isMutedFor`, `setMuted`, `setMutedOverride`, `retry`, `reopen`) |
| Tests | `test/hls_port_window_additions_test.dart`, `test/feed/` (controller, widget, page map, parity), shared fakes in `test/support/fakes.dart` |
| Examples | `example/lib/` (basic, locked, ads and pagination, custom controls, analytics) |
| App | `lib/features/reels/presentation/reels_screen.dart` (was `reels_screen_v2.dart` behind `REELS_V2`), the Home screen |

### Differences from the plan

- **Events are delivered in a microtask**, not synchronously. This keeps host analytics out of the page-change call
  (fast-start rule 8), and it means an `onEvent` that calls `setState` never runs during a build.
- **`ReelFirstFrame`** fires on the first snapshot that is initialized, playing, not buffering and with position past
  zero. `video_player` sets `isPlaying` as soon as `play()` is called, so position is what proves frames are moving.
  Position is polled every 100 ms, so that is the resolution.
- **`ReelLeft` and a new `ReelFocused` are also emitted when the feed is hidden and shown again**, so watch sessions
  never include time spent on another tab.
- **`jumpTo` / `animateTo` right after an item change wait one frame.** Until it rebuilds, the `PageView` still has
  the old page count and would clamp the target. A widget test found this.
- **`connectivity` defaults to null**, as on the current Reels screen. Reachability is then refreshed on every `sync`,
  exactly as `HlsReelPager` does today.
- **The v2 screen shows the unlock curtain on every locked page**, not only on the focused one. The locked reel has no
  player, so nothing plays under it.
- **Changing `ReelFeed.active` or `TickerMode` takes effect after the frame.** Pausing notifies other widgets, and
  that is not allowed during a build.
- **Handles and analytics look ports up by id** (`portFor`), not by index, because the window's item list can lag
  the controller's by one step during an item change.
- **`update()` with a new URL or descriptor for the same id replaces that reel's player** through `reopen`, the same
  path as a reachability flip, so the reel on screen resumes at its position. The window keeps ports by id, so without
  this the old player would go on playing the old stream.
- **`retry()` also covers a player that failed while playing**, through `reopen`, not only a failed open.
- **A removed handle keeps its last model** in `data`, so a late `ReelLeft` for it can still be read.
- **`ReelFeed` jumps instead of animating when `MediaQuery.disableAnimationsOf` is set.**
- **`ReelTapToPlay` takes `semanticLabel`.** Without one, it stays out of the semantics tree rather than add an
  unnamed control.
- **v2 maps playback settings through `toReelSource`**, now in `data/mappers/reel_feed_mapper.dart` and run by the
  repository. It used the same descriptor logic as v1's `toHlsReelItem`, which was removed with v1.

### Verified

- The package suite, existing tests unedited: 322 passing, 1 skipped (the baseline had 259 and the same skip).
- Parity: a scripted session of 136 native calls (swipes, back swipe, offline → online rebuild, pagination) is
  identical through `HlsReelPager` and `ReelFeed`. With reel 2 locked, the only difference is that reel 2's calls
  are missing.
- The app: `flutter analyze --fatal-infos` is clean and 743 tests pass, 1 skipped (see open questions).
- `/code-review` at high effort found 10 issues. Eight were fixed with regression tests and one (v2 dropping the
  descriptor) was fixed in `toReelSource`. The last one, v2 duplicating v1, is deliberate: v1 stays frozen as the
  comparison baseline and is deleted when v2 becomes the default.

### Open questions

- **The seek-bar row is 44 dp** (`HlsEngineSeekBar.hitHeight`), so the fullscreen button in it is under the 48 dp tap
  target. v1 has the same problem. Fixing it means changing the row height or moving the button, which is a design
  call. The v2 guideline test is skipped with this reason until that is decided.

### Not verified yet

Everything in §10.5 needs a device: time-to-first-frame on both screens, HUD numbers, offline playback,
the offline → online flip, the player count, tab switching and fullscreen.

---

## 16. HUD attribution (per-reel HUD values)

### Root cause

Native fetch events carried no asset. `HlsHudSession` folded every reel's events, neighbours' prefetch included,
into one process-wide timeline, and the HUD showed the newest entry as if it were the focused reel's. On a feed
that keeps ±2 neighbours prefetching, `NOW PLAYING`, `Current fetched rung`, `Last fetched`, `Available rungs`,
byte counters and hits were usually another reel's. TTFF was measured once per HUD session. `HlsReelPager` has
the same bug; it is not a ReelFeed regression.

### Fix

| Where | Change |
|---|---|
| Android `HlsEngine.emitFetch` | Adds `assetId` from the resource it already tracks |
| iOS `HlsEngine.emit(resource:)`, `emitDownloadProgress` | Adds `assetId` from `HlsResource.assetId` / the descriptor |
| `HlsFetchEvent` | Optional `assetId`; null from older native builds |
| `HlsHudSession` | Keeps the global fold as it is; adds a per-asset fold (newest 8 assets, same caps). `model(assetId:)` returns that asset's values; without an asset, today's values. TTFF per asset, from its focus |
| `NOW PLAYING` | One row per track covering the position: video, audio, or `media` (muxed/unknown), using native's own `HlsTrackClass` rule |
| `ReelFeed` | Passes the focused reel's `assetId` to the HUD |

### No-regression guarantees

- `HlsReelPager` and `HlsVideoPlayer` pass no asset, so their HUDs are unchanged.
- The new event key is additive: existing Dart parsing and native parity tests ignore it.
- Playback, cache, prefetch and reachability are untouched; only diagnostics change.
- Pre-existing tests pass unedited.

### Still whole-cache by nature

`strategy`, `entries` and `stored` describe the whole disk cache. They are correct, but not per reel.
