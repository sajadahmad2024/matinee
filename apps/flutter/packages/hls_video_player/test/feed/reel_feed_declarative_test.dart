import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hls_video_player/hls_video_player.dart' show HlsNativeBridge;
import 'package:hls_video_player/reels.dart';

import '../support/fakes.dart';

class _Reel implements ReelFeedItem {
  const _Reel(this.id, {this.isLocked = false});

  @override
  final String id;

  @override
  final bool isLocked;

  @override
  ReelSource? get source => ReelSource.hls(fakeMaster(id));
}

List<_Reel> _reels(int count) =>
    List<_Reel>.generate(count, (int i) => _Reel('$i'));

void main() {
  group('ReelFeed with declarative items', () {
    late RecordingNative native;
    late FakePortFactory factory;

    setUp(() {
      native = RecordingNative();
      factory = FakePortFactory(native);
      HlsEngine.debugReset();
      HlsEngine.debugInstall(
        nativeBridge: HlsNativeBridge(),
        playerFactory: factory,
      );
    });

    tearDown(() {
      native.dispose();
      HlsEngine.debugReset();
    });

    Future<void> frames(WidgetTester t, [int count = 10]) async {
      for (var i = 0; i < count; i++) {
        await t.pump(const Duration(milliseconds: 16));
      }
    }

    testWidgets('opens neighbours before their pages are ever built', (
      WidgetTester t,
    ) async {
      // One ordered log: native opens and item-builder calls.
      ReelItem<_Reel> logged(BuildContext context, ReelSlot<_Reel> slot) {
        native.calls.add('build:${slot.id}');
        return ReelItem<_Reel>();
      }

      await t.pumpWidget(
        MaterialApp(
          home: ReelFeed<_Reel>(items: _reels(6), itemBuilder: logged),
        ),
      );
      await frames(t);

      for (final String id in <String>['1', '2']) {
        final int open = native.calls.indexOf('open:$id');
        final int build = native.calls.indexOf('build:$id');
        expect(open, isNonNegative, reason: 'reel $id player is open');
        expect(
          build == -1 || open < build,
          isTrue,
          reason: 'reel $id opened before its page was built',
        );
      }
    });

    testWidgets('a swipe plays the neighbour with its already-open player', (
      WidgetTester t,
    ) async {
      final ReelFeedController<_Reel> feed = ReelFeedController<_Reel>();
      await t.pumpWidget(
        MaterialApp(
          home: ReelFeed<_Reel>(controller: feed, items: _reels(5)),
        ),
      );
      await frames(t);
      final FakePort preloaded = factory.byId['1']!;
      expect(preloaded.isPlaying, isFalse);

      feed.jumpTo(1);
      await t.pump();

      // Same player, now playing: nothing was opened for the reel swiped to.
      expect(identical(factory.byId['1'], preloaded), isTrue);
      expect(preloaded.isPlaying, isTrue);
      expect(native.calls.where((String c) => c == 'open:1'), hasLength(1));
      await t.pumpWidget(const SizedBox());
      feed.dispose();
    });

    testWidgets('works without a controller', (WidgetTester t) async {
      await t.pumpWidget(MaterialApp(home: ReelFeed<_Reel>(items: _reels(3))));
      await frames(t);

      expect(factory.byId['0']!.isPlaying, isTrue);
      expect(find.byType(ReelSeekBar), findsOneWidget);

      await t.pumpWidget(const SizedBox());
      await frames(t);
      expect(factory.live, isEmpty);
    });

    test('a controller before any feed has no items', () {
      final ReelFeedController<_Reel> feed = ReelFeedController<_Reel>();
      expect(feed.length, 0);
      expect(feed.current, isNull);
      expect(feed.byId('0'), isNull);
      feed.dispose();
    });

    testWidgets('the same list again makes no window call', (
      WidgetTester t,
    ) async {
      final List<_Reel> items = _reels(3);
      Widget app() => MaterialApp(home: ReelFeed<_Reel>(items: items));
      await t.pumpWidget(app());
      await frames(t);
      final int calls = native.calls.length;

      await t.pumpWidget(app());
      await frames(t);

      expect(native.calls.length, calls);
    });

    testWidgets('an unlocked element from state opens and plays the reel', (
      WidgetTester t,
    ) async {
      final ValueNotifier<List<_Reel>> state = ValueNotifier<List<_Reel>>(
        <_Reel>[const _Reel('0', isLocked: true), ..._reels(3).skip(1)],
      );
      await t.pumpWidget(
        MaterialApp(
          home: ValueListenableBuilder<List<_Reel>>(
            valueListenable: state,
            builder: (BuildContext context, List<_Reel> list, _) =>
                ReelFeed<_Reel>(items: list),
          ),
        ),
      );
      await frames(t);
      expect(factory.byId['0'], isNull);

      state.value = <_Reel>[const _Reel('0'), ...state.value.skip(1)];
      await frames(t);

      expect(factory.byId['0']!.isPlaying, isTrue);
    });

    testWidgets('a per-item style applies to that page only', (
      WidgetTester t,
    ) async {
      final ReelFeedController<_Reel> feed = ReelFeedController<_Reel>();
      await t.pumpWidget(
        MaterialApp(
          home: ReelFeed<_Reel>(
            controller: feed,
            items: _reels(3),
            itemBuilder: (BuildContext context, ReelSlot<_Reel> slot) =>
                slot.index == 1
                ? const ReelItem<_Reel>(
                    style: ReelStyle(
                      fullscreenButton: ReelControlPosition.hidden,
                    ),
                  )
                : ReelItem<_Reel>(),
          ),
        ),
      );
      await frames(t);
      expect(find.byType(ReelFullscreenButton), findsOneWidget);

      feed.jumpTo(1);
      await frames(t);
      expect(find.byType(ReelFullscreenButton), findsNothing);

      feed.jumpTo(2);
      await frames(t);
      expect(find.byType(ReelFullscreenButton), findsOneWidget);
      await t.pumpWidget(const SizedBox());
      feed.dispose();
    });
  });
}
