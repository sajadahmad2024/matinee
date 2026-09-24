import 'package:matinee/features/reels/data/models/reel.dart';
import 'package:matinee/features/reels/data/models/reel_playback.dart';

///
/// Stands in for the reels feed endpoint until the API exists. Returns the
/// mock catalogue as typed models; it does not play, prefetch, or persist.
///
class ReelsFeedApiService {
  const ReelsFeedApiService();

  static const Duration mockLatency = Duration(milliseconds: 600);

  static const ReelPlayback _clearLive = ReelPlayback(
    kind: ReelPlaybackKind.normal,
    drm: ReelDrmKind.none,
    authMode: ReelAuthMode.none,
    cachePolicy: ReelCachePolicy.liveSegmentCache,
    prefetchEnabled: true,
    substitutionEnabled: true,
    maxPrefetchSegments: 10,
    maxPrefetchHeight: 480,
  );

  static const ReelAuthor _mux = ReelAuthor(
    id: 'u_mux',
    handle: 'mux',
    displayName: 'Mux Test Streams',
  );

  static const ReelAuthor _studio = ReelAuthor(
    id: 'u_host',
    handle: 'studio',
    displayName: 'Studio',
  );

  static const List<Reel> _feed = [
    Reel(
      id: 'reel-1',
      masterUri: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      title: 'Big Buck Bunny',
      caption: 'Public Mux HLS. Clear, no token.',
      author: _mux,
      likeCount: 12840,
      commentCount: 312,
      shareCount: 90,
      durationMs: 634000,
      thumbnailUrl: 'https://test-streams.mux.dev/x36xhzz/poster.jpg',
      playback: _clearLive,
    ),
    Reel(
      id: 'reel-2',
      masterUri: 'https://assets.afcdn.com/video49/20210722/v_645516.m3u8',
      title: 'AFCDN clip',
      caption: 'Public AFCDN master. Clear, no token.',
      author: ReelAuthor(id: 'u_afcdn', handle: 'afcdn', displayName: 'AFCDN'),
      likeCount: 5402,
      commentCount: 88,
      shareCount: 21,
      durationMs: 45000,
      playback: _clearLive,
    ),
    Reel(
      id: 'reel-3',
      masterUri: 'https://test-streams.mux.dev/x36xhzz/url_6/193039199_mp4_h264_aac_hq_7.m3u8',
      title: 'BBB HQ rung',
      caption: 'Mux HQ media playlist treated as a master in the fixture feed.',
      author: _mux,
      likeCount: 2100,
      commentCount: 40,
      shareCount: 9,
      durationMs: 634000,
      playback: _clearLive,
    ),
    Reel(
      id: 'reel-4',
      masterUri: 'https://test-streams.mux.dev/pts_shift/master.m3u8',
      title: 'PTS shift',
      caption: 'Mux PTS-shift sample. Clear HLS.',
      author: _mux,
      likeCount: 980,
      commentCount: 17,
      shareCount: 4,
      durationMs: 120000,
      playback: _clearLive,
    ),
    Reel(
      id: 'reel-5',
      masterUri: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
      title: 'Tears of Steel',
      caption: 'Unified Streaming demo. Clear HLS.',
      author: ReelAuthor(id: 'u_unified', handle: 'unified', displayName: 'Unified Streaming'),
      likeCount: 22110,
      commentCount: 640,
      shareCount: 301,
      durationMs: 734000,
      playback: _clearLive,
    ),
    Reel(
      id: 'reel-6',
      masterUri: 'https://test-streams.mux.dev/tos_ismc/main.m3u8',
      title: 'TOS ISMC',
      caption: 'Mux Tears of Steel ISMC. Clear HLS.',
      author: _mux,
      likeCount: 1760,
      commentCount: 29,
      shareCount: 11,
      durationMs: 734000,
      playback: _clearLive,
    ),
    Reel(
      id: 'reel-7',
      masterUri: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_4x3/bipbop_4x3_variant.m3u8',
      title: 'Apple BIPBOP 4x3',
      caption: 'Apple MPEG-TS BIPBOP. Clear HLS. Not the fMP4 BIPBOP.',
      author: ReelAuthor(id: 'u_apple', handle: 'apple', displayName: 'Apple Streaming'),
      likeCount: 8900,
      commentCount: 150,
      shareCount: 70,
      durationMs: 1800000,
      playback: _clearLive,
    ),
    Reel(
      id: 'reel-signed-1',
      masterUri:
          'https://cdn.example.com/reels/signed/master.m3u8?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9&expires=1730000000',
      title: 'Signed URL reel',
      caption: 'Token lives on the query string. Keep this exact URL for prefetch and play.',
      author: _studio,
      likeCount: 430,
      commentCount: 12,
      shareCount: 3,
      durationMs: 28000,
      thumbnailUrl: 'https://cdn.example.com/reels/signed/thumb.jpg',
      playback: ReelPlayback(
        kind: ReelPlaybackKind.signed,
        drm: ReelDrmKind.none,
        authMode: ReelAuthMode.signedUrl,
        cachePolicy: ReelCachePolicy.liveSegmentCache,
        prefetchEnabled: true,
        substitutionEnabled: true,
        maxPrefetchSegments: 10,
        maxPrefetchHeight: 480,
        authConfig: ReelAuthConfig(tokenRefreshId: 'signed-reel-1'),
      ),
    ),
    Reel(
      id: 'reel-token-1',
      masterUri: 'https://cdn.example.com/reels/authed/master.m3u8',
      title: 'Header-token reel',
      caption: 'Clear HLS. CDN wants Authorization on every origin fetch.',
      author: _studio,
      likeCount: 210,
      commentCount: 6,
      shareCount: 1,
      durationMs: 22000,
      thumbnailUrl: 'https://cdn.example.com/reels/authed/thumb.jpg',
      playback: ReelPlayback(
        kind: ReelPlaybackKind.tokened,
        drm: ReelDrmKind.none,
        authMode: ReelAuthMode.tokenHeader,
        cachePolicy: ReelCachePolicy.liveSegmentCache,
        prefetchEnabled: true,
        substitutionEnabled: true,
        maxPrefetchSegments: 10,
        maxPrefetchHeight: 480,
        authConfig: ReelAuthConfig(
          headerName: 'Authorization',
          headerValue: 'Bearer replace-with-host-token',
          tokenRefreshId: 'header-reel-1',
        ),
      ),
    ),
    Reel(
      id: 'reel-fairplay-1',
      masterUri: 'https://cdn.example.com/reels/fairplay/master.m3u8',
      title: 'FairPlay reel',
      caption: 'iOS DRM. Matches HlsContentDescriptor.fairplayManualQa (fullDownload).',
      author: _studio,
      likeCount: 75,
      commentCount: 2,
      shareCount: 0,
      durationMs: 31000,
      thumbnailUrl: 'https://cdn.example.com/reels/fairplay/thumb.jpg',
      playback: ReelPlayback(
        kind: ReelPlaybackKind.drm,
        drm: ReelDrmKind.fairplay,
        authMode: ReelAuthMode.none,
        cachePolicy: ReelCachePolicy.fullDownload,
        prefetchEnabled: false,
        substitutionEnabled: false,
        maxPrefetchSegments: 10,
        maxPrefetchHeight: 480,
        drmConfig: ReelDrmConfig(
          certificateUrl: 'https://license.example.com/fairplay/cert',
          licenseServerUrl: 'https://license.example.com/fairplay/license',
          contentId: 'asset-fairplay-1',
        ),
      ),
    ),
    Reel(
      id: 'reel-widevine-1',
      masterUri: 'https://cdn.example.com/reels/widevine/master.m3u8',
      title: 'Widevine reel',
      caption: 'Android DRM. Host must pass HlsContentDescriptor, not liveSegmentFixture.',
      author: _studio,
      likeCount: 61,
      commentCount: 1,
      shareCount: 0,
      durationMs: 29000,
      thumbnailUrl: 'https://cdn.example.com/reels/widevine/thumb.jpg',
      playback: ReelPlayback(
        kind: ReelPlaybackKind.drm,
        drm: ReelDrmKind.widevine,
        authMode: ReelAuthMode.tokenHeader,
        cachePolicy: ReelCachePolicy.liveSegmentCache,
        prefetchEnabled: false,
        substitutionEnabled: false,
        maxPrefetchSegments: 10,
        maxPrefetchHeight: 480,
        authConfig: ReelAuthConfig(
          headerName: 'X-DRM-Session',
          headerValue: 'replace-with-host-session',
          tokenRefreshId: 'widevine-reel-1',
        ),
        drmConfig: ReelDrmConfig(
          licenseServerUrl: 'https://license.example.com/widevine/license',
          contentId: 'asset-widevine-1',
        ),
      ),
    ),
  ];

  Future<List<Reel>> fetchReelsFeed() async {
    await Future<void>.delayed(mockLatency);
    return _feed;
  }
}
