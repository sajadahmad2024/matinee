# ReelsPage handover (for `video_player_package_demo`)

Copy this file into `video_player_package_demo` as `README-REELS.md` and point the implementing AI at it.

`flutter_video_player_and_offline_opt_native` only supplies the package. The sibling owns Clean Architecture, routing, and product chrome. Do **not** implement ReelsPage inside the HLS package repo.

---

## Instructions for the implementing AI

1. **Read the host project first.** Open `video_player_package_demo` docs: `README`, `AGENT.md` / `.cursorrules`, existing feature modules, and how presentation / domain / data are named. Match **that** project's folders, naming, DI, and error style. Do not copy the HLS lab demo (`PortraitVideoPlayerScreen` is lab-only).
2. **Then read the package docs** if needed:
   - `flutter_video_player_and_offline_opt_native/packages/hls_video_player/README.md`
   - `flutter_video_player_and_offline_opt_native/apps/documentation/docs/flutter/hls-engine-package.md`
   - `flutter_video_player_and_offline_opt_native/apps/documentation/docs/flutter/hls-engine-dependency.md`
3. Implement **one feature: ReelsPage** (vertical feed). Use `hls_video_player` for video only.
4. **No local database.** Data source returns the mock JSON (in-memory or a fake remote). Repository maps JSON → domain. Presentation maps domain → `HlsReelItem`.
5. **Do not edit any code in `packages/hls_video_player`.** Treat it as a read-only dependency. No playback, cache, or pager changes there. All ReelsPage work stays in `video_player_package_demo`.

---

## Add the package (path, no git)

One dependency only. Do **not** add `video_player` or `dependency_overrides`.

If the sibling sits next to the HLS repo:

```yaml
dependencies:
  hls_video_player:
    path: ../flutter_video_player_and_offline_opt_native/packages/hls_video_player
```

Absolute fallback:

```yaml
dependencies:
  hls_video_player:
    path: /Users/nomankhanbhai/Documents/Flutter Study/flutter_video_player_and_offline_opt_native/packages/hls_video_player
```

```dart
import 'package:hls_video_player/hls_video_player.dart';
```

In `main()`, after `WidgetsFlutterBinding.ensureInitialized()`:

```dart
await HlsEngine.initialize();
```

Optional after the repository has URLs (disk only, no players):

```dart
await HlsEngine.prefetchMasters(reels.map((r) => r.masterUri));
```

Feed widget (production `showHud: false`):

```dart
HlsReelPager(
  items: items,
  windowRadius: 2,
  showHud: false,
  muted: true,
  autoplay: true,
  itemBuilder: (context, slot) {
    final reel = slot.item.data as YourReelEntity;
    return Stack(
      fit: StackFit.expand,
      children: [
        slot.video,
        YourReelOverlay(reel: reel, isFocused: slot.isFocused),
      ],
    );
  },
);
```

```dart
HlsReelItem(
  id: reel.id,
  masterUri: reel.masterUri,
  data: reel,
  descriptor: descriptorOrNull,
);
```

Clear HLS: omit `descriptor`. Signed / token / DRM: build `HlsContentDescriptor` from `playback` in the JSON.

---

## Do not

- Edit any file under `packages/hls_video_player`. The package is read-only.
- Build a `PageView` of `HlsVideoPlayer` (that is one engine per page; you lose N±2).
- Import `package:video_player`.
- Call `openAsset` / `startMaster` from the host.
- Change master query tokens between prefetch and play.
- Use `PortraitVideoPlayerScreen` or `HlsReelCatalog.fixtures()` in the product app.
- Add Hive / SQLite / Drift / Isar in this task.

---

## Clean Architecture flow (no DB)

```
MockReelsDataSource (JSON)
  → ReelsRepository (DTO → entity)
  → ReelsCubit / Bloc
  → ReelsPage
  → map to HlsReelItem
  → HlsReelPager
  → slot.video + host overlay (likes, caption)
```

Suggested layers — **rename to match the sibling**:

- `data/datasources/reels_mock_data_source.dart` — returns the JSON list. No HTTP required for v1.
- `data/models/reel_dto.dart` — `fromJson`.
- `data/repositories/reels_repository_impl.dart` — DTO → entity. No persist.
- `domain/entities/reel.dart` — id, masterUri, caption, author, counts, playback.
- `domain/repositories/reels_repository.dart` — `Future<List<Reel>> getReels()`.
- `presentation/reels/reels_page.dart` — Scaffold + pager.
- `presentation/reels/reels_overlay.dart` — likes, caption, comments; not video.
- `presentation/reels/reel_to_hls_item.dart` — mapper only.

Descriptor rules:

- `playback.drm == none` and `authMode == none` → no descriptor.
- `signedUrl` / `tokenHeader` / `fairplay` / `widevine` → set `HlsReelItem.descriptor`.

`reel-1` … `reel-7` are **playable** public masters. signed / token / FairPlay / Widevine objects are **shape** for mapping; they will not play without real CDN/license URLs. First playable list may omit those four, or show a host error if opened.

---

## Mock response (use this)

Required per item: `id`, `masterUri`, `playback.drm`, `playback.authMode`.  
Product chrome: `caption`, `author`, `likeCount`, `commentCount`.

Copy this array into the mock data source as a Dart literal or `assets/mock/reels.json`.

```json
[
  {
    "id": "reel-1",
    "masterUri": "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    "title": "Big Buck Bunny",
    "caption": "Public Mux HLS. Clear, no token.",
    "author": { "id": "u_mux", "handle": "mux", "displayName": "Mux Test Streams" },
    "likeCount": 12840,
    "commentCount": 312,
    "shareCount": 90,
    "durationMs": 634000,
    "thumbnailUrl": "https://test-streams.mux.dev/x36xhzz/poster.jpg",
    "playback": {
      "kind": "normal",
      "drm": "none",
      "authMode": "none",
      "cachePolicy": "liveSegmentCache",
      "prefetchEnabled": true,
      "substitutionEnabled": true,
      "maxPrefetchSegments": 10,
      "maxPrefetchHeight": 480
    }
  },
  {
    "id": "reel-2",
    "masterUri": "https://assets.afcdn.com/video49/20210722/v_645516.m3u8",
    "title": "AFCDN clip",
    "caption": "Public AFCDN master. Clear, no token.",
    "author": { "id": "u_afcdn", "handle": "afcdn", "displayName": "AFCDN" },
    "likeCount": 5402,
    "commentCount": 88,
    "shareCount": 21,
    "durationMs": 45000,
    "thumbnailUrl": null,
    "playback": {
      "kind": "normal",
      "drm": "none",
      "authMode": "none",
      "cachePolicy": "liveSegmentCache",
      "prefetchEnabled": true,
      "substitutionEnabled": true,
      "maxPrefetchSegments": 10,
      "maxPrefetchHeight": 480
    }
  },
  {
    "id": "reel-3",
    "masterUri": "https://test-streams.mux.dev/x36xhzz/url_6/193039199_mp4_h264_aac_hq_7.m3u8",
    "title": "BBB HQ rung",
    "caption": "Mux HQ media playlist treated as a master in the fixture feed.",
    "author": { "id": "u_mux", "handle": "mux", "displayName": "Mux Test Streams" },
    "likeCount": 2100,
    "commentCount": 40,
    "shareCount": 9,
    "durationMs": 634000,
    "thumbnailUrl": null,
    "playback": {
      "kind": "normal",
      "drm": "none",
      "authMode": "none",
      "cachePolicy": "liveSegmentCache",
      "prefetchEnabled": true,
      "substitutionEnabled": true,
      "maxPrefetchSegments": 10,
      "maxPrefetchHeight": 480
    }
  },
  {
    "id": "reel-4",
    "masterUri": "https://test-streams.mux.dev/pts_shift/master.m3u8",
    "title": "PTS shift",
    "caption": "Mux PTS-shift sample. Clear HLS.",
    "author": { "id": "u_mux", "handle": "mux", "displayName": "Mux Test Streams" },
    "likeCount": 980,
    "commentCount": 17,
    "shareCount": 4,
    "durationMs": 120000,
    "thumbnailUrl": null,
    "playback": {
      "kind": "normal",
      "drm": "none",
      "authMode": "none",
      "cachePolicy": "liveSegmentCache",
      "prefetchEnabled": true,
      "substitutionEnabled": true,
      "maxPrefetchSegments": 10,
      "maxPrefetchHeight": 480
    }
  },
  {
    "id": "reel-5",
    "masterUri": "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
    "title": "Tears of Steel",
    "caption": "Unified Streaming demo. Clear HLS.",
    "author": { "id": "u_unified", "handle": "unified", "displayName": "Unified Streaming" },
    "likeCount": 22110,
    "commentCount": 640,
    "shareCount": 301,
    "durationMs": 734000,
    "thumbnailUrl": null,
    "playback": {
      "kind": "normal",
      "drm": "none",
      "authMode": "none",
      "cachePolicy": "liveSegmentCache",
      "prefetchEnabled": true,
      "substitutionEnabled": true,
      "maxPrefetchSegments": 10,
      "maxPrefetchHeight": 480
    }
  },
  {
    "id": "reel-6",
    "masterUri": "https://test-streams.mux.dev/tos_ismc/main.m3u8",
    "title": "TOS ISMC",
    "caption": "Mux Tears of Steel ISMC. Clear HLS.",
    "author": { "id": "u_mux", "handle": "mux", "displayName": "Mux Test Streams" },
    "likeCount": 1760,
    "commentCount": 29,
    "shareCount": 11,
    "durationMs": 734000,
    "thumbnailUrl": null,
    "playback": {
      "kind": "normal",
      "drm": "none",
      "authMode": "none",
      "cachePolicy": "liveSegmentCache",
      "prefetchEnabled": true,
      "substitutionEnabled": true,
      "maxPrefetchSegments": 10,
      "maxPrefetchHeight": 480
    }
  },
  {
    "id": "reel-7",
    "masterUri": "https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_4x3/bipbop_4x3_variant.m3u8",
    "title": "Apple BIPBOP 4x3",
    "caption": "Apple MPEG-TS BIPBOP. Clear HLS. Not the fMP4 BIPBOP.",
    "author": { "id": "u_apple", "handle": "apple", "displayName": "Apple Streaming" },
    "likeCount": 8900,
    "commentCount": 150,
    "shareCount": 70,
    "durationMs": 1800000,
    "thumbnailUrl": null,
    "playback": {
      "kind": "normal",
      "drm": "none",
      "authMode": "none",
      "cachePolicy": "liveSegmentCache",
      "prefetchEnabled": true,
      "substitutionEnabled": true,
      "maxPrefetchSegments": 10,
      "maxPrefetchHeight": 480
    }
  },
  {
    "id": "reel-signed-1",
    "masterUri": "https://cdn.example.com/reels/signed/master.m3u8?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9&expires=1730000000",
    "title": "Signed URL reel",
    "caption": "Token lives on the query string. Keep this exact URL for prefetch and play.",
    "author": { "id": "u_host", "handle": "studio", "displayName": "Studio" },
    "likeCount": 430,
    "commentCount": 12,
    "shareCount": 3,
    "durationMs": 28000,
    "thumbnailUrl": "https://cdn.example.com/reels/signed/thumb.jpg",
    "playback": {
      "kind": "signed",
      "drm": "none",
      "authMode": "signedUrl",
      "authConfig": { "tokenRefreshId": "signed-reel-1" },
      "cachePolicy": "liveSegmentCache",
      "prefetchEnabled": true,
      "substitutionEnabled": true,
      "maxPrefetchSegments": 10,
      "maxPrefetchHeight": 480
    }
  },
  {
    "id": "reel-token-1",
    "masterUri": "https://cdn.example.com/reels/authed/master.m3u8",
    "title": "Header-token reel",
    "caption": "Clear HLS. CDN wants Authorization on every origin fetch.",
    "author": { "id": "u_host", "handle": "studio", "displayName": "Studio" },
    "likeCount": 210,
    "commentCount": 6,
    "shareCount": 1,
    "durationMs": 22000,
    "thumbnailUrl": "https://cdn.example.com/reels/authed/thumb.jpg",
    "playback": {
      "kind": "tokened",
      "drm": "none",
      "authMode": "tokenHeader",
      "authConfig": {
        "headerName": "Authorization",
        "headerValue": "Bearer replace-with-host-token",
        "tokenRefreshId": "header-reel-1"
      },
      "cachePolicy": "liveSegmentCache",
      "prefetchEnabled": true,
      "substitutionEnabled": true,
      "maxPrefetchSegments": 10,
      "maxPrefetchHeight": 480
    }
  },
  {
    "id": "reel-fairplay-1",
    "masterUri": "https://cdn.example.com/reels/fairplay/master.m3u8",
    "title": "FairPlay reel",
    "caption": "iOS DRM. Matches HlsContentDescriptor.fairplayManualQa (fullDownload).",
    "author": { "id": "u_host", "handle": "studio", "displayName": "Studio" },
    "likeCount": 75,
    "commentCount": 2,
    "shareCount": 0,
    "durationMs": 31000,
    "thumbnailUrl": "https://cdn.example.com/reels/fairplay/thumb.jpg",
    "playback": {
      "kind": "drm",
      "drm": "fairplay",
      "authMode": "none",
      "drmConfig": {
        "certificateUrl": "https://license.example.com/fairplay/cert",
        "licenseServerUrl": "https://license.example.com/fairplay/license",
        "contentId": "asset-fairplay-1"
      },
      "cachePolicy": "fullDownload",
      "prefetchEnabled": false,
      "substitutionEnabled": false,
      "maxPrefetchSegments": 10,
      "maxPrefetchHeight": 480
    }
  },
  {
    "id": "reel-widevine-1",
    "masterUri": "https://cdn.example.com/reels/widevine/master.m3u8",
    "title": "Widevine reel",
    "caption": "Android DRM. Host must pass HlsContentDescriptor, not liveSegmentFixture.",
    "author": { "id": "u_host", "handle": "studio", "displayName": "Studio" },
    "likeCount": 61,
    "commentCount": 1,
    "shareCount": 0,
    "durationMs": 29000,
    "thumbnailUrl": "https://cdn.example.com/reels/widevine/thumb.jpg",
    "playback": {
      "kind": "drm",
      "drm": "widevine",
      "authMode": "tokenHeader",
      "authConfig": {
        "headerName": "X-DRM-Session",
        "headerValue": "replace-with-host-session",
        "tokenRefreshId": "widevine-reel-1"
      },
      "drmConfig": {
        "licenseServerUrl": "https://license.example.com/widevine/license",
        "contentId": "asset-widevine-1"
      },
      "cachePolicy": "liveSegmentCache",
      "prefetchEnabled": false,
      "substitutionEnabled": false,
      "maxPrefetchSegments": 10,
      "maxPrefetchHeight": 480
    }
  }
]
```

---

## Acceptance

- `flutter pub get` in the sibling with only `hls_video_player` path.
- ReelsPage shows a vertical feed; focused page plays; neighbors pause.
- Overlay shows caption/likes from mock; video is `slot.video`.
- No DB files, no `video_player` in sibling pubspec.
- Clear fixtures play. DRM/signed items are omitted from the first playable list or shown with a host error state if opened.
