import 'package:flutter_test/flutter_test.dart';
import 'package:hls_video_player/hls_video_player.dart';
import 'package:hls_video_player/src/player/hls_hud_session.dart';

void main() {
  test('addEvent folds cache hits, origin bytes, and recent cap', () {
    final HlsHudSession session = HlsHudSession();
    final DateTime now = DateTime.utc(2026, 1, 1);

    session.addEvent(
      HlsFetchEvent(
        kind: HlsResourceKind.segment,
        originUri: Uri.parse('https://cdn.example/a.ts'),
        byteLength: 100,
        occurredAt: now,
        servedFromCache: true,
        segmentStart: Duration.zero,
        segmentDuration: const Duration(seconds: 2),
      ),
    );
    session.addEvent(
      HlsFetchEvent(
        kind: HlsResourceKind.segment,
        originUri: Uri.parse('https://cdn.example/b.ts'),
        byteLength: 40,
        occurredAt: now,
      ),
    );

    expect(session.cacheHits, 1);
    expect(session.cacheServedBytes, 100);
    expect(session.originBytes, 40);
    expect(session.recentFetches, hasLength(2));
    expect(session.segmentTimeline, hasLength(1));
  });

  test('markFirstFrame records TTFF once', () {
    final HlsHudSession session = HlsHudSession();
    const HlsPlayerSnapshot waiting = HlsPlayerSnapshot.empty;
    const HlsPlayerSnapshot playing = HlsPlayerSnapshot(
      isInitialized: true,
      isPlaying: true,
      isBuffering: false,
      hasError: false,
      duration: Duration(seconds: 10),
      position: Duration.zero,
      width: 1080,
      height: 1920,
      aspectRatio: 9 / 16,
    );

    expect(session.markFirstFrame(waiting), isFalse);
    expect(session.ttffMs, isNull);
    expect(session.markFirstFrame(playing), isTrue);
    expect(session.ttffMs, isNotNull);
    expect(session.markFirstFrame(playing), isFalse);
  });

  test('resetAfterClear drops counters and timeline', () {
    final HlsHudSession session = HlsHudSession()
      ..originBytes = 9
      ..cacheServedBytes = 4
      ..cacheHits = 2;
    session.segmentTimeline.add(
      HlsFetchEvent(
        kind: HlsResourceKind.segment,
        originUri: Uri.parse('https://cdn.example/a.ts'),
        byteLength: 1,
        occurredAt: DateTime.utc(2026, 1, 1),
        segmentStart: Duration.zero,
        segmentDuration: const Duration(seconds: 1),
      ),
    );

    session.resetAfterClear();

    expect(session.originBytes, 0);
    expect(session.cacheServedBytes, 0);
    expect(session.cacheHits, 0);
    expect(session.segmentTimeline, isEmpty);
  });

  test('session keeps rungs and substituted timeline across a HUD hide', () {
    final HlsHudSession session = HlsHudSession();
    final HlsVariant rung = HlsVariant(
      playlistUri: Uri.parse('https://cdn.example/480.m3u8'),
      bandwidth: 800000,
      height: 480,
    );
    session.addEvent(
      HlsFetchEvent(
        kind: HlsResourceKind.masterPlaylist,
        originUri: Uri.parse('https://cdn.example/master.m3u8'),
        byteLength: 12,
        occurredAt: DateTime.utc(2026, 1, 1),
        advertisedVariants: <HlsVariant>[rung],
        variant: rung,
      ),
    );
    session.addEvent(
      HlsFetchEvent(
        kind: HlsResourceKind.segment,
        originUri: Uri.parse('https://cdn.example/seg0.ts'),
        byteLength: 50,
        occurredAt: DateTime.utc(2026, 1, 1),
        variant: rung,
        segmentStart: Duration.zero,
        segmentDuration: const Duration(seconds: 2),
        cacheSkipReason: 'substituted',
      ),
    );

    expect(session.variants, hasLength(1));
    expect(session.segmentTimeline, hasLength(1));
    expect(session.currentFetchedVariant?.height, 480);
    session.dispose();
  });

  test('playbackSourceLabel distinguishes cache, substitute, and network', () {
    HlsFetchEvent event({bool fromCache = false, String? skip}) {
      return HlsFetchEvent(
        kind: HlsResourceKind.segment,
        originUri: Uri.parse('https://cdn.example/seg.ts'),
        byteLength: 1,
        occurredAt: DateTime.utc(2026, 1, 1),
        servedFromCache: fromCache,
        cacheSkipReason: skip,
      );
    }

    expect(playbackSourceLabel(event(fromCache: true)), 'CACHE');
    expect(
      playbackSourceLabel(event(skip: 'substituted')),
      'CACHE (substituted)',
    );
    expect(playbackSourceLabel(event()), 'NETWORK');
    expect(hudEventFromCache(event(skip: 'substituted')), isTrue);
    expect(hudEventFromCache(event()), isFalse);
  });

  test(
    'telemetry start is idempotent and does not require a widget setState',
    () {
      final HlsHudTelemetry telemetry = HlsHudTelemetry();
      var notifications = 0;
      telemetry.session.addListener(() => notifications++);
      telemetry.session.addEvent(
        HlsFetchEvent(
          kind: HlsResourceKind.masterPlaylist,
          originUri: Uri.parse('https://cdn.example/master.m3u8'),
          byteLength: 1,
          occurredAt: DateTime.utc(2026, 1, 1),
          advertisedVariants: <HlsVariant>[
            HlsVariant(
              playlistUri: Uri.parse('https://cdn.example/a.m3u8'),
              bandwidth: 1,
            ),
          ],
        ),
      );
      expect(telemetry.session.variants, hasLength(1));
      expect(notifications, 1);
      telemetry.session.dispose();
    },
  );
}
