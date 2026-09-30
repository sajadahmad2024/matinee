import 'package:bloc_test/bloc_test.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hls_video_player/hls_video_player.dart'
    show HlsCacheStats, HlsNativeBridge, HlsPlayerPort, HlsPlayerPortFactory, HlsPlayerSnapshot;
import 'package:hls_video_player/reels.dart';
import 'package:material_ui/material_ui.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/core/widgets/error_view.dart';
import 'package:matinee/core/widgets/points_pill.dart';
import 'package:matinee/features/reels/data/mappers/reel_feed_mapper.dart';
import 'package:matinee/features/reels/data/models/reel.dart';
import 'package:matinee/features/reels/data/models/reel_playback.dart';
import 'package:matinee/features/reels/domain/feed_reel.dart';
import 'package:matinee/features/reels/presentation/cubit/reels_feed_cubit.dart';
import 'package:matinee/features/reels/presentation/cubit/reels_feed_state.dart';
import 'package:matinee/features/reels/presentation/reels_screen.dart';
import 'package:matinee/features/reels/presentation/widgets/points_earned_sheet.dart';
import 'package:matinee/features/reels/presentation/widgets/unlock_overlay.dart';
import 'package:mocktail/mocktail.dart';

import '../../../helpers/helpers.dart';

class _MockReelsFeedCubit extends MockCubit<ReelsFeedState> implements ReelsFeedCubit {}

class _FakePort implements HlsPlayerPort {
  final ValueNotifier<HlsPlayerSnapshot> _snapshot = ValueNotifier(
    const HlsPlayerSnapshot(
      isInitialized: true,
      isPlaying: false,
      isBuffering: false,
      hasError: false,
      duration: Duration(seconds: 30),
      position: Duration.zero,
      width: 1080,
      height: 1920,
      aspectRatio: 9 / 16,
    ),
  );

  @override
  int get debugInstanceId => identityHashCode(this);

  @override
  String get debugIdentity => '$debugInstanceId';

  @override
  HlsPlayerSnapshot get snapshot => _snapshot.value;

  @override
  ValueListenable<HlsPlayerSnapshot> get snapshotListenable => _snapshot;

  @override
  Widget buildView() => const SizedBox.expand();

  @override
  Future<void> play() async {}

  @override
  Future<void> pause() async {}

  @override
  Future<void> seekTo(Duration position) async {}

  @override
  Future<void> setVolume(double volume) async {}

  @override
  Future<void> dispose() async {}
}

class _FakePortFactory implements HlsPlayerPortFactory {
  final opened = <Uri>[];

  @override
  Future<HlsPlayerPort> open({required Uri uri, required Map<String, String> httpHeaders}) async {
    opened.add(uri);
    return _FakePort();
  }
}

const _playback = ReelPlayback(
  kind: ReelPlaybackKind.normal,
  drm: ReelDrmKind.none,
  authMode: ReelAuthMode.none,
  cachePolicy: ReelCachePolicy.liveSegmentCache,
  prefetchEnabled: true,
  substitutionEnabled: true,
  maxPrefetchSegments: 10,
  maxPrefetchHeight: 480,
);

// The feed item as the repository prepares it.
FeedReel _feed(String id, {bool isExclusive = false}) => toFeedReel(_reel(id, isExclusive: isExclusive));

Reel _reel(String id, {bool isExclusive = false}) => Reel(
  id: id,
  masterUri: 'https://cdn.example/$id/master.m3u8',
  title: 'Title $id',
  caption: 'Caption',
  author: const ReelAuthor(id: 'u1', handle: 'apexfilms', displayName: 'Apex Films'),
  likeCount: 1,
  commentCount: 1,
  shareCount: 1,
  durationMs: 30000,
  playback: _playback,
  genres: const ['Drama'],
  isExclusive: isExclusive,
  unlockCost: isExclusive ? 50 : null,
);

void main() {
  group(ReelsView, () {
    const control = MethodChannel(HlsNativeBridge.controlChannelName);
    // The HUD telemetry listens to native events for the feed's lifetime.
    const events = MethodChannel(HlsNativeBridge.eventChannelName);
    late _MockReelsFeedCubit cubit;
    late _FakePortFactory factory;

    setUp(() {
      cubit = _MockReelsFeedCubit();
      factory = _FakePortFactory();
      TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger.setMockMethodCallHandler(control, (call) async {
        final args = Map<Object?, Object?>.from(call.arguments as Map? ?? const <Object?, Object?>{});
        return switch (call.method) {
          'openAsset' => {'playerUri': args['originUrl']! as String, 'strategy': 'direct'},
          'prefetchMaster' => 1,
          'refreshReachability' => const <String>[],
          'cacheStats' => const HlsCacheStats(backendName: 'none', entryCount: 0, storedBytes: 0).toChannelMap(),
          'isCacheOnlyFor' => false,
          _ => null,
        };
      });
      TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger.setMockMethodCallHandler(
        events,
        (_) async => null,
      );
      HlsEngine.debugReset();
      HlsEngine.debugInstall(nativeBridge: HlsNativeBridge(), playerFactory: factory);
    });

    tearDown(() {
      HlsEngine.debugReset();
      TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger.setMockMethodCallHandler(control, null);
      TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger.setMockMethodCallHandler(events, null);
    });

    Future<void> pumpView(WidgetTester tester) async {
      await tester.pumpApp(BlocProvider<ReelsFeedCubit>.value(value: cubit, child: const ReelsView()));
      for (var i = 0; i < 10; i++) {
        await tester.pump(const Duration(milliseconds: 16));
      }
    }

    group('renders', () {
      testWidgets('the feed with the points pill on success', (tester) async {
        when(() => cubit.state).thenReturn(ReelsFeedState.success([_feed('a'), _feed('b')], 120));

        await pumpView(tester);

        expect(find.byType(ReelFeed<FeedReel>), findsOneWidget);
        expect(find.text('Title a'), findsOneWidget);
        expect(find.byType(PointsPill), findsOneWidget);
        expect(factory.opened, contains(Uri.parse('https://cdn.example/a/master.m3u8')));
      });

      testWidgets('a locked reel behind its curtain, with no player and no points pill', (tester) async {
        when(() => cubit.state).thenReturn(ReelsFeedState.success([_feed('x', isExclusive: true), _feed('b')], 120));

        await pumpView(tester);

        expect(find.byType(UnlockOverlay), findsOneWidget);
        expect(find.byType(PointsPill), findsNothing);
        expect(factory.opened, isNot(contains(Uri.parse('https://cdn.example/x/master.m3u8'))));
        expect(factory.opened, contains(Uri.parse('https://cdn.example/b/master.m3u8')));
      });

      testWidgets('a named play toggle over the video', (tester) async {
        when(() => cubit.state).thenReturn(ReelsFeedState.success([_feed('a'), _feed('b')], 120));

        await pumpView(tester);

        expect(find.bySemanticsLabel('Play or pause'), findsOneWidget);
      });

      testWidgets(
        'a feed that meets the accessibility guidelines',
        (tester) async {
          when(() => cubit.state).thenReturn(ReelsFeedState.success([_feed('a'), _feed('b')], 120));

          await pumpView(tester);

          await expectMeetsGuidelines(tester);
        },
      );

      testWidgets('the error view when loading fails', (tester) async {
        when(() => cubit.state).thenReturn(const ReelsFeedState.failure(NetworkException()));

        await pumpView(tester);

        expect(find.byType(ErrorView), findsOneWidget);
      });
    });

    group('calls share', () {
      const share = MethodChannel('dev.fluttercommunity.plus/share');
      final shared = <Map<Object?, Object?>>[];

      setUp(() {
        shared.clear();
        TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger.setMockMethodCallHandler(share, (call) async {
          shared.add(Map<Object?, Object?>.from(call.arguments as Map));
          return 'dev.fluttercommunity.plus/share/unavailable';
        });
      });

      tearDown(() {
        TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger.setMockMethodCallHandler(share, null);
      });

      testWidgets('with the reel link, then shows what the share paid', (tester) async {
        when(() => cubit.state).thenReturn(ReelsFeedState.success([_feed('a'), _feed('b')], 120));
        await pumpView(tester);

        await tester.tap(find.bySemanticsLabel('Share').first);
        for (var i = 0; i < 30; i++) {
          await tester.pump(const Duration(milliseconds: 16));
        }

        expect(shared, hasLength(1));
        expect(shared.single['text'], 'Watch Title a on Matinee: https://matinee.example.com/reels/a');
        expect(shared.single['subject'], 'Title a');
        expect(find.byType(PointsEarnedSheet), findsOneWidget);
      });
    });
  });
}
