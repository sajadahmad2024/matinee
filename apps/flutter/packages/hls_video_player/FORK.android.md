# Fork of video_player_android 2.12.2

Upstream: `video_player_android` **2.12.2** (Media3 **1.9.2**).

Matches latest pub.dev at the time of this pin.

## Additive HLS (do not overlay)

`android/src/main/kotlin/io/flutter/plugins/videoplayer/hls/`

## Hook files

- `android/src/main/java/io/flutter/plugins/videoplayer/VideoPlayerPlugin.java`
  — `HlsEngineChannels.register` / `unregister`; leftover
  `fromRemoteUrl(..., binaryMessenger)` arg
- `android/src/main/java/io/flutter/plugins/videoplayer/VideoAsset.java`
  — `HlsEngine.shouldCache` forces `StreamingFormat.HTTP_LIVE`
- `android/src/main/java/io/flutter/plugins/videoplayer/HttpVideoAsset.java`
  — HLS mime, Widevine `DrmConfiguration`, `HlsCachingDataSource.Factory`
- `android/build.gradle.kts`
  — extra `media3-database` / `media3-datasource`

Inventory, when to rebase, and the overlay checklist:
`apps/documentation/docs/flutter/video-player-fork.md`
