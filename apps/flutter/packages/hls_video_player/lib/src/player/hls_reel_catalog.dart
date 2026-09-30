import 'package:hls_video_player/src/domain/hls_content_descriptor.dart';
import 'package:hls_video_player/src/domain/hls_fetch_event.dart';
import 'package:hls_video_player/src/domain/hls_variant.dart';
import 'package:hls_video_player/src/player/hls_player_snapshot.dart';

/// Origin HTTPS masters shown in the portrait feed.
///
/// v1 repeats known public HLS URLs so the feed is real video, not placeholders.
/// Swap this class for an API-backed catalog later without changing the screen.
class HlsReelCatalog {
  /// Creates a catalog of [masters].
  const HlsReelCatalog(this.masters);

  /// Origin master playlist URIs in feed order.
  final List<Uri> masters;

  /// Unique lowercase hosts from [masters]. Use this as the session allowlist
  /// so every fixture CDN is accepted, not only the first URL's host.
  Set<String> get originHosts => <String>{
    for (final Uri master in masters) master.host.toLowerCase(),
  };

  /// Live-segment-cache descriptor for [master] (`drm: none`).
  HlsContentDescriptor descriptorFor(Uri master) {
    return HlsContentDescriptor.liveSegmentFixture(originUrl: master);
  }

  /// [descriptorFor] for every catalog master, feed order.
  List<HlsContentDescriptor> get liveSegmentDescriptors {
    return masters.map(descriptorFor).toList(growable: false);
  }

  /// Seven public HTTPS VOD masters so the ±2 window and eviction are visible.
  ///
  /// Apple fMP4 BIPBOP (`img_bipbop_adv_example_fmp4`) is not included.
  /// Item 7 is Apple MPEG-TS BIPBOP 4x3, not that fMP4 stream.
  factory HlsReelCatalog.fixtures() {
    return HlsReelCatalog(<Uri>[
      Uri.parse('https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'),
      Uri.parse('https://assets.afcdn.com/video49/20210722/v_645516.m3u8'),
      Uri.parse(
        'https://test-streams.mux.dev/x36xhzz/url_6/193039199_mp4_h264_aac_hq_7.m3u8',
      ),
      Uri.parse('https://test-streams.mux.dev/pts_shift/master.m3u8'),
      Uri.parse(
        'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
      ),
      Uri.parse('https://test-streams.mux.dev/tos_ismc/main.m3u8'),
      Uri.parse(
        'https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_4x3/bipbop_4x3_variant.m3u8',
      ),
    ]);
  }
}

/// Data the HUD paints. Built by the player HUD binder while `showHud` is true.
class HlsHudModel {
  /// Creates HUD inputs from live session and player state.
  const HlsHudModel({
    required this.snapshot,
    required this.isCacheOnly,
    required this.playRequested,
    required this.muted,
    required this.originBytes,
    required this.cacheServedBytes,
    required this.cacheHits,
    required this.cacheBackendName,
    required this.cacheEntryCount,
    required this.cacheStoredBytes,
    required this.variants,
    required this.recentFetches,
    required this.segmentTimeline,
    this.ttffMs,
    this.currentFetchedVariant,
    this.lastSegment,
    this.openError,
    this.nowPlayingByTrack = false,
  });

  /// Native player snapshot.
  final HlsPlayerSnapshot snapshot;

  /// True when origin is unreachable and playlists are trimmed.
  final bool isCacheOnly;

  /// Last user play/pause intent.
  final bool playRequested;

  /// Whether volume is zero.
  final bool muted;

  /// First-frame time in milliseconds, if measured.
  final int? ttffMs;

  /// Origin-served bytes counted from fetch events.
  final int originBytes;

  /// Cache-served bytes counted from fetch events.
  final int cacheServedBytes;

  /// Cache hit count from fetch events.
  final int cacheHits;

  /// `disk` or `memory`.
  final String cacheBackendName;

  /// Live cache entry count.
  final int cacheEntryCount;

  /// Live stored bytes.
  final int cacheStoredBytes;

  /// Variants from the last rewritten master.
  final List<HlsVariant> variants;

  /// Recent playlist, segment, and init events, newest first.
  final List<HlsFetchEvent> recentFetches;

  /// Segment and init events that have a [HlsFetchEvent.segmentStart], newest
  /// first. Powers the NOW PLAYING line against the playhead.
  final List<HlsFetchEvent> segmentTimeline;

  /// Current fetched variant when known.
  final HlsVariant? currentFetchedVariant;

  /// Last media segment event.
  final HlsFetchEvent? lastSegment;

  /// Native/loopback open failure for the focused reel, if any.
  final String? openError;

  /// One NOW PLAYING row per track (video, audio). Set for a per-reel HUD,
  /// whose timeline holds only that reel.
  final bool nowPlayingByTrack;
}
