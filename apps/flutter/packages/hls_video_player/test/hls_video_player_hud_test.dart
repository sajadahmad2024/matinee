import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hls_video_player/hls_video_player.dart';
import 'package:hls_video_player/src/player/hls_hud_binder.dart';
import 'package:hls_video_player/src/player/hls_hud_session.dart';

void main() {
  testWidgets('fromPort never mounts HUD or owns telemetry', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      MaterialApp(
        home: HlsVideoPlayer.fromPort(
          masterUri: Uri.parse('https://cdn.example/master.m3u8'),
          port: _FakePort(),
          isFocused: true,
          playRequested: true,
          showHud: true,
          onTogglePlay: () {},
          onSeek: (_) {},
        ),
      ),
    );

    expect(find.byType(HlsEngineHud), findsNothing);
    expect(find.byType(HlsHudBinder), findsNothing);
  });

  testWidgets('binder paints rungs and substituted NOW PLAYING from session', (
    WidgetTester tester,
  ) async {
    final HlsHudSession session = HlsHudSession();
    final Uri playlist = Uri.parse('https://cdn.example/720.m3u8');
    final HlsVariant rung = HlsVariant(
      playlistUri: playlist,
      bandwidth: 2000000,
      height: 720,
    );
    session.addEvent(
      HlsFetchEvent(
        kind: HlsResourceKind.masterPlaylist,
        originUri: Uri.parse('https://cdn.example/master.m3u8'),
        byteLength: 10,
        occurredAt: DateTime.utc(2026, 1, 1),
        advertisedVariants: <HlsVariant>[rung],
        variant: rung,
      ),
    );
    session.addEvent(
      HlsFetchEvent(
        kind: HlsResourceKind.segment,
        originUri: Uri.parse('https://cdn.example/seg0.ts'),
        byteLength: 80,
        occurredAt: DateTime.utc(2026, 1, 1),
        variant: rung,
        segmentStart: Duration.zero,
        segmentDuration: const Duration(seconds: 4),
        cacheSkipReason: 'substituted',
      ),
    );
    final _FakePort port = _FakePort()
      ..notifier.value = const HlsPlayerSnapshot(
        isInitialized: true,
        isPlaying: true,
        isBuffering: false,
        hasError: false,
        duration: Duration(seconds: 10),
        position: Duration(seconds: 1),
        width: 720,
        height: 1280,
        aspectRatio: 9 / 16,
      );

    await tester.pumpWidget(
      MaterialApp(
        home: HlsHudBinder(
          session: session,
          port: port,
          playRequested: true,
          muted: true,
          onTogglePlay: () {},
          onToggleMute: () {},
          onClearCache: () {},
        ),
      ),
    );

    expect(find.textContaining('Available rungs (1)'), findsOneWidget);
    expect(find.textContaining('720p'), findsWidgets);
    expect(find.textContaining('CACHE (substituted)'), findsWidgets);
    expect(find.textContaining('NOW PLAYING'), findsOneWidget);
    session.dispose();
  });
}

class _FakePort implements HlsPlayerPort {
  final ValueNotifier<HlsPlayerSnapshot> notifier =
      ValueNotifier<HlsPlayerSnapshot>(HlsPlayerSnapshot.empty);

  @override
  int get debugInstanceId => 1;

  @override
  String get debugIdentity => 'fake';

  @override
  HlsPlayerSnapshot get snapshot => notifier.value;

  @override
  ValueListenable<HlsPlayerSnapshot> get snapshotListenable => notifier;

  @override
  Widget buildView() => const SizedBox();

  @override
  Future<void> dispose() async {}

  @override
  Future<void> pause() async {}

  @override
  Future<void> play() async {}

  @override
  Future<void> seekTo(Duration position) async {}

  @override
  Future<void> setVolume(double volume) async {}
}
