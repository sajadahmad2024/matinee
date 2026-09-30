import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hls_video_player/hls_video_player.dart';
import 'package:hls_video_player/reels.dart';
import 'package:hls_video_player/src/player/hls_hud_session.dart';

import 'support/fakes.dart';

HlsFetchEvent _segment(
  String asset,
  String file, {
  Duration start = const Duration(seconds: 8),
  HlsVariant? variant,
  bool fromCache = false,
  int bytes = 1000,
}) {
  return HlsFetchEvent(
    kind: HlsResourceKind.segment,
    originUri: Uri.parse('https://cdn.example/$asset/$file'),
    byteLength: bytes,
    occurredAt: DateTime.utc(2026),
    segmentStart: start,
    segmentDuration: const Duration(seconds: 4),
    servedFromCache: fromCache,
    variant: variant,
    assetId: asset,
  );
}

final HlsVariant _video = HlsVariant(
  playlistUri: Uri.parse('https://cdn.example/v.m3u8'),
  bandwidth: 1000000,
  width: 848,
  height: 480,
);

final HlsVariant _audio = HlsVariant(
  playlistUri: Uri.parse('https://cdn.example/a.m3u8'),
  bandwidth: 128000,
  codecs: 'mp4a.40.2',
);

class _Reel implements ReelFeedItem {
  const _Reel(this.id);

  @override
  final String id;

  @override
  ReelSource? get source => ReelSource.hls(fakeMaster(id));

  @override
  bool get isLocked => false;
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group(HlsFetchEvent, () {
    test('carries assetId through the channel map', () {
      final HlsFetchEvent event = _segment('bbb', 'seg-2.ts');
      final HlsFetchEvent back = HlsFetchEvent.fromChannelMap(
        event.toChannelMap(),
      );
      expect(back.assetId, 'bbb');
    });

    test('has no assetId from a native build that does not send it', () {
      final HlsFetchEvent event = HlsFetchEvent.fromChannelMap(<String, Object>{
        'kind': 'segment',
        'originUri': 'https://cdn.example/x.ts',
        'byteLength': 1,
      });
      expect(event.assetId, isNull);
    });

    test('classifies tracks like native HlsTrackClass', () {
      HlsTrackKind kind(HlsVariant? v) => HlsFetchEvent(
        kind: HlsResourceKind.segment,
        originUri: Uri.parse('https://cdn.example/x.ts'),
        byteLength: 1,
        occurredAt: DateTime.utc(2026),
        variant: v,
      ).trackKind;

      expect(kind(_video), HlsTrackKind.video);
      expect(kind(_audio), HlsTrackKind.audio);
      expect(
        kind(
          HlsVariant(
            playlistUri: Uri.parse('https://cdn.example/c.m3u8'),
            bandwidth: 1,
            codecs: 'avc1.64001f,mp4a.40.2',
          ),
        ),
        HlsTrackKind.video,
      );
      expect(kind(null), HlsTrackKind.unknown);
    });
  });

  group('$HlsHudSession per asset', () {
    late HlsHudSession session;

    setUp(() => session = HlsHudSession());
    tearDown(() => session.dispose());

    HlsHudModel modelFor(String? asset) => session.model(
      snapshot: HlsPlayerSnapshot.empty,
      playRequested: true,
      muted: true,
      assetId: asset,
    );

    test('shows only the asset asked for; the global view is unchanged', () {
      session
        ..addEvent(_segment('bbb', 'bbb-2.ts', bytes: 100))
        ..addEvent(_segment('tos', 'tos-2.ts', bytes: 900, fromCache: true));

      final HlsHudModel bbb = modelFor('bbb');
      expect(bbb.lastSegment!.displayName, 'bbb-2.ts');
      expect(bbb.segmentTimeline.map((e) => e.displayName), <String>[
        'bbb-2.ts',
      ]);
      expect(bbb.originBytes, 100);
      expect(bbb.cacheHits, 0);
      expect(bbb.nowPlayingByTrack, isTrue);

      final HlsHudModel all = modelFor(null);
      expect(all.lastSegment!.displayName, 'tos-2.ts');
      expect(all.segmentTimeline, hasLength(2));
      expect(all.originBytes, 100);
      expect(all.cacheHits, 1);
      expect(all.nowPlayingByTrack, isFalse);
    });

    test('events without an asset stay out of every asset view', () {
      session.addEvent(
        HlsFetchEvent(
          kind: HlsResourceKind.segment,
          originUri: Uri.parse('https://cdn.example/old.ts'),
          byteLength: 5,
          occurredAt: DateTime.utc(2026),
        ),
      );
      expect(modelFor('bbb').recentFetches, isEmpty);
      expect(modelFor(null).recentFetches, hasLength(1));
    });

    test('TTFF is per asset and measured again on each focus', () {
      const HlsPlayerSnapshot playing = HlsPlayerSnapshot(
        isInitialized: true,
        isPlaying: true,
        isBuffering: false,
        hasError: false,
        duration: Duration(seconds: 30),
        position: Duration.zero,
        width: 1,
        height: 1,
        aspectRatio: 1,
      );
      session.focusAsset('bbb');
      session.markFirstFrame(playing, assetId: 'bbb');
      expect(modelFor('bbb').ttffMs, isNotNull);
      expect(modelFor('tos').ttffMs, isNull);

      session.focusAsset('tos');
      session.focusAsset('bbb');
      expect(modelFor('bbb').ttffMs, isNull);
    });

    test('keeps the focused asset when evicting old ones', () {
      session.focusAsset('focused');
      session.addEvent(_segment('focused', 'f.ts'));
      for (var i = 0; i < 20; i++) {
        session.addEvent(_segment('other$i', 'o.ts'));
      }
      expect(modelFor('focused').lastSegment!.displayName, 'f.ts');
    });
  });

  group('$HlsEngineHud NOW PLAYING', () {
    HlsHudModel model({required bool byTrack}) => HlsHudModel(
      snapshot: const HlsPlayerSnapshot(
        isInitialized: true,
        isPlaying: true,
        isBuffering: false,
        hasError: false,
        duration: Duration(seconds: 30),
        position: Duration(seconds: 9),
        width: 1,
        height: 1,
        aspectRatio: 1,
      ),
      isCacheOnly: false,
      playRequested: true,
      muted: true,
      originBytes: 0,
      cacheServedBytes: 0,
      cacheHits: 0,
      cacheBackendName: 'disk',
      cacheEntryCount: 0,
      cacheStoredBytes: 0,
      variants: const <HlsVariant>[],
      recentFetches: const <HlsFetchEvent>[],
      segmentTimeline: <HlsFetchEvent>[
        _segment('bbb', 'bbb-audio-2.aac', variant: _audio),
        _segment('bbb', 'bbb-480p-2.ts', variant: _video, fromCache: true),
      ],
      nowPlayingByTrack: byTrack,
    );

    Future<void> pumpHud(WidgetTester t, HlsHudModel m) {
      return t.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: HlsEngineHud(
              model: m,
              onTogglePlay: () {},
              onToggleMute: () {},
              onClearCache: () {},
            ),
          ),
        ),
      );
    }

    testWidgets('shows a row per track for a per-reel HUD', (
      WidgetTester t,
    ) async {
      await pumpHud(t, model(byTrack: true));

      expect(
        find.textContaining('NOW PLAYING  video · bbb-480p-2.ts'),
        findsOneWidget,
      );
      expect(
        find.textContaining('NOW PLAYING  audio · bbb-audio-2.aac'),
        findsOneWidget,
      );
    });

    testWidgets('keeps the single newest row otherwise', (
      WidgetTester t,
    ) async {
      await pumpHud(t, model(byTrack: false));

      expect(
        find.textContaining('NOW PLAYING  bbb-audio-2.aac'),
        findsOneWidget,
      );
      expect(find.textContaining('NOW PLAYING  video'), findsNothing);
    });
  });

  group('ReelFeed HUD', () {
    const MethodChannel eventsControl = MethodChannel(
      HlsNativeBridge.eventChannelName,
    );
    late RecordingNative native;
    late ReelFeedController<_Reel> feed;

    setUp(() {
      native = RecordingNative();
      TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
          .setMockMethodCallHandler(eventsControl, (_) async => null);
      HlsEngine.debugReset();
      HlsEngine.debugInstall(
        nativeBridge: HlsNativeBridge(),
        playerFactory: FakePortFactory(native),
      );
      feed = ReelFeedController<_Reel>();
    });

    tearDown(() {
      feed.dispose();
      native.dispose();
      TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
          .setMockMethodCallHandler(eventsControl, null);
      HlsEngine.debugReset();
    });

    // Delivers an event the way native does, over the event channel.
    Future<void> nativeSends(HlsFetchEvent event) async {
      await TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
          .handlePlatformMessage(
            HlsNativeBridge.eventChannelName,
            const StandardMethodCodec().encodeSuccessEnvelope(
              event.toChannelMap(),
            ),
            (_) {},
          );
    }

    Future<void> frames(WidgetTester t) async {
      for (var i = 0; i < 10; i++) {
        await t.pump(const Duration(milliseconds: 16));
      }
    }

    testWidgets('shows the focused reel, not a neighbour fetched later', (
      WidgetTester t,
    ) async {
      final String bbb = fakeMaster('bbb').toString();
      final String tos = fakeMaster('tos').toString();
      await t.pumpWidget(
        MaterialApp(
          home: ReelFeed<_Reel>(
            controller: feed,
            items: const <_Reel>[_Reel('bbb'), _Reel('tos')],
            showHud: true,
          ),
        ),
      );
      await frames(t);

      // Both cover the playhead (0:00); the neighbour's arrives last, as in
      // the reported screen.
      await nativeSends(
        _segment(bbb, 'bbb-video-0.ts', start: Duration.zero, variant: _video),
      );
      await nativeSends(
        _segment(tos, 'tos-video-0.ts', start: Duration.zero, variant: _video),
      );
      await frames(t);

      expect(
        find.textContaining('NOW PLAYING  video · bbb-video-0.ts'),
        findsOneWidget,
      );
      expect(find.textContaining('tos-video-0.ts'), findsNothing);

      feed.jumpTo(1);
      await frames(t);

      expect(
        find.textContaining('NOW PLAYING  video · tos-video-0.ts'),
        findsOneWidget,
      );
      expect(find.textContaining('bbb-video-0.ts'), findsNothing);
    });
  });
}
