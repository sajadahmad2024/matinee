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

Map host models to `HlsReelItem`. Use the **same master URLs** for prefetch and
later playback so native disk cache hits.

`allowedOriginHosts` on `initialize` is unused here (no Dart SSRF allowlist).
Widgets do not take an `engine:` argument.

## What the package does not do

- Host HTTP / local DB
- OS background schedulers
- Dart-pluggable segment storage (Android `SimpleCache`, iOS `HlsBodyCache`)
