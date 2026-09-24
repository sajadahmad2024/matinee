# hls_video_player

Native-heavy HLS package. Hosts own reels APIs, local DB, and page chrome.
This package owns player lifecycle, native cache/prefetch, and optional HUD.

## Sibling app pubspec

```yaml
dependencies:
  hls_video_player:
    path: ../flutter_video_player_and_offline_opt_native/packages/hls_video_player
```

```dart
import 'package:hls_video_player/hls_video_player.dart';
```

## Host API

```dart
await HlsEngine.initialize();

await HlsEngine.prefetchMasters(urisFromDb); // disk cache only; no reachability

HlsVideoPlayer(masterUri: uri, showHud: kDebugMode);

HlsReelPager(
  items: items, // HlsReelItem(id, masterUri)
  windowRadius: 2,
  showHud: kDebugMode,
  itemBuilder: (context, slot) => Stack(children: [slot.video, /* host UI */]),
);
```

### Controls

```dart
HlsReelPager(
  items: items,
  controls: HlsPlayerControls(
    showTimer: false,                                  // each control hides alone
    muteBuilder: (context, state) => MyMute(state),    // or playPauseBuilder,
  ),                                                   // seekBarBuilder, timerBuilder
  itemBuilder: ...,
);
```

- Play/pause and mute sit at the video centre (mute above play) and show only
  while paused. Tapping the video toggles play; mute taps do not.
- Pause is per reel: every newly focused reel starts from `autoplay`. Mute is
  shared across reels.
- Seek bar and timer sit at the bottom of the player surface (inside the
  bottom safe area). Reserve `HlsPlayerControls.bottomBarHeight` under host UI
  laid over `slot.video`.
- Host layers over `slot.video` (e.g. an opaque bottom scrim) hide the embedded
  bar. Pass `embedBottomBar: false` and place `slot.bottomBar` in the host
  Stack above those layers (the reels screen does this).
- A fullscreen button (`showFullscreen`, `fullscreenBuilder`) follows the
  timer. It paints the **same port** in the root overlay, turned a quarter turn
  when the screen is portrait (not when it is already landscape). Device
  orientation is never locked. Back or the button exits.
- Builders are **visual only**. The package wraps each one with its tap and
  action (play, mute, fullscreen toggle; tap-to-seek over the seek visual).
  A button inside a builder wins the tap, so it never fires twice.
- Builders get `HlsControlsState` (snapshot, focus, play/mute intent, actions)
  and run on every snapshot tick, so keep them cheap.
- `controls` never recreates the player window; only `windowRadius`,
  `connectivity`, `autoplay` and `muted` do.

Map host models to `HlsReelItem`. Use the **same master URLs** for prefetch and
later playback so native disk cache hits.

`allowedOriginHosts` on `initialize` is unused here (no Dart SSRF allowlist).
Widgets do not take an `engine:` argument.

## What the package does not do

- Host HTTP / local DB
- OS background schedulers
- Dart-pluggable segment storage (Android `SimpleCache`, iOS `HlsBodyCache`)

## Implementation notes

Fork of `video_player_android` 2.12.2 (Media3 1.9.2) and
`video_player_avfoundation` 2.11.1, plus a native HLS cache engine. Dart owns
player lifecycle and UI; native owns every fetch, cache, prefetch and offline
decision. See `FORK.md` / `FORK.android.md` for the hook files.

### Dart (`lib/src/`)

- `engine/hls_engine.dart`: process singleton (bridge + player factory).
  `prefetchMasters` runs a worker pool (concurrency 2) over `prefetchToDisk`.
- `bridge/hls_native_bridge.dart`: `dev.flutter.hls_engine/control` methods
  `openAsset`, `prefetchToDisk`, `prefetchMaster`, `refreshReachability`,
  `clearCache`, `cacheStats`, `isCacheOnlyFor`; events on
  `dev.flutter.hls_engine/events` as `HlsFetchEvent`.
- `domain/`: `HlsContentDescriptor` (frozen channel contract: DRM, auth,
  cache policy, substitution, prefetch caps 10 segments / 480p),
  `HlsOpenAssetResult` (`direct` / `loopback` / `download`), `HlsFetchEvent`,
  `HlsVariant`.
- `player/hls_player_port.dart`: wraps `VideoPlayerController` (always loops)
  and publishes `HlsPlayerSnapshot` so UI never imports `video_player`.
- `player/hls_port_window.dart`: keeps players for `focused ± windowRadius`.
  `sync()` pauses non-focused, evicts leavers, `openAsset`, refreshes
  reachability (rebuilds flipped ports at the same position), prefetches, opens
  missing ports. `_openEpoch` drops stale opens. It must never notify on
  snapshot ticks: that rebuilt the PageView every tick and stuck scrolling.
  `playRequested` and `muted` are window-wide flags; the pager resets
  `playRequested` to `autoplay` on each page change (pause is per reel).
- `player/hls_reel_pager.dart`: vertical `PageView` over one window; each
  page is `HlsVideoPlayer.fromPort`, handed to the host as `HlsReelSlot`.
  Changing `windowRadius`, `connectivity`, `autoplay` or `muted` recreates the
  whole window (all players torn down).
- `player/hls_video_player.dart`: standalone (private radius-0 window) or
  `.fromPort` (paints a pager-owned port).
- `player/hls_player_chrome.dart`: video, tap-to-toggle and loader inside the
  video's `AspectRatio`; paused play/mute and `HlsPlayerBottomBar` on the page.
  `HlsPlayerControls` configures them; `HlsControlTap` makes builder visuals
  tappable; `HlsFullscreenView` rotates the same port in the root overlay.
- `player/hls_hud_*`: telemetry fold (`HlsHudSession`) subscribed for the
  widget lifetime, even when the HUD is hidden; `HlsEngineHud` paints it.
- `portrait_*`, `HlsReelCatalog.fixtures()`: lab/demo screen.

### Android (`android/.../hls/`)

ExoPlayer plays the origin URL (`openAsset` returns `direct`). `VideoAsset`
forces HLS for registered URLs; `HttpVideoAsset` installs
`HlsCachingDataSource.Factory` and Widevine `DrmConfiguration`.

- `HlsCachingDataSource` wraps `CacheDataSource`: classifies the resource,
  substitutes a cached same-asset segment covering the same time on a miss
  (then `scheduleUpgrade` fetches the real one), fails fast offline, and
  rewrites playlists in cache-only mode to list only cached content.
- `MasterReachabilityStore`: one HEAD/GET probe (4 s) per master on first open;
  unreachable masters stay cache-only until `refreshReachability` flips them.
- `SegmentPrefetcher`: best rung at or below the height cap, first N segments.
- `HlsCacheHolder`: `SimpleCache` in `cacheDir/hls_engine_cache`, 256 MB LRU.
- FairPlay → `unsupported_drm`.

### iOS / macOS (`darwin/.../hls/`)

AVPlayer only sees `http://127.0.0.1:<port>/<token>/<id>.<ext>`.

- `HlsContentStrategyRouter`: DRM → download (`.movpkg`), `cachePolicy: none`
  → direct, else loopback.
- `LoopbackHlsServer`: BSD-socket HTTP/1.1, GET/HEAD, Range, `Connection: close`.
- `HlsEngine.resolve` order: cached segment/init/key → substitute (+ upgrade)
  → cached playlist → cache-only miss → origin. Every playlist is rewritten to
  loopback URIs, which is how segment timing and variants are learned.
- `HlsBodyCache`: RAM dict + `.bin` files keyed by SHA-256 of the URL
  **without query** (signed URLs survive token rotation).
- `HlsDownloadManager` (`AVAssetDownloadTask`) + `FairPlayKeyDelegate`;
  `VideoPlayerPlugin.swift` retains a FairPlay session per file-URL player.

### App integration

`lib/di/service_locator.dart` registers `HlsEngine.initialize`.
`features/reels/presentation/reels_screen.dart` uses `HlsReelPager` with its
own `PageController`; `reel_to_hls_item.dart` maps `Reel` → `HlsReelItem`, and
`isPlayableReel` drops DRM and auth reels, so only clear HLS with
`liveSegmentCache` runs in production.

### Known issues (from code reading, not verified at runtime)

1. iOS `HlsBodyCache` never evicts: RAM and disk grow until `clearCache`.
2. Android `MasterReachabilityStore.start` probes the network inside
   `@Synchronized`, so concurrent `openAsset` calls serialize.
3. Android `SegmentTimeline` is an unsynchronized `ArrayList` shared across
   loader and upgrade threads.
4. Cache keys differ: iOS strips the query, Android keeps it.
5. Cached playlists are served forever on both platforms (VOD-only).
6. iOS loopback buffers a full segment before responding, even for Range.
7. `HlsPortWindow` never retries an item in `_openErrors` while it stays in
   the window.
8. `cacheStats` walks the whole cache on the main thread, on every focus change.
9. `openAsset` runs twice per item per `sync`; `tokenRefreshId`,
   `HlsAuthMode.signedUrl` and `allowedOriginHosts` are unused natively.
10. `FORK*.md` point to `apps/documentation/docs/flutter/video-player-fork.md`,
    which does not exist.
