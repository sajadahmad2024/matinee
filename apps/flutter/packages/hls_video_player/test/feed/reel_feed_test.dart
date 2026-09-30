import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hls_video_player/hls_video_player.dart'
    show HlsNativeBridge, PortraitPoolOverlay;
import 'package:hls_video_player/reels.dart';
import 'package:hls_video_player/src/player/hls_fullscreen_view.dart';

import '../support/fakes.dart';

class _Clip implements ReelFeedItem {
  const _Clip(this.id, {this.locked = false});

  @override
  final String id;

  /// No source, so no player.
  final bool locked;

  @override
  ReelSource? get source => locked ? null : ReelSource.hls(fakeMaster(id));

  @override
  bool get isLocked => false;
}

List<_Clip> _clips(int count, {Set<int> locked = const <int>{}}) =>
    List<_Clip>.generate(
      count,
      (int i) => _Clip('$i', locked: locked.contains(i)),
    );

void main() {
  group(ReelFeed, () {
    late RecordingNative native;
    late FakePortFactory factory;
    late ReelFeedController<_Clip> feed;
    late List<_Clip> items;
    late int builds;

    setUp(() {
      native = RecordingNative();
      factory = FakePortFactory(native);
      builds = 0;
      HlsEngine.debugReset();
      HlsEngine.debugInstall(
        nativeBridge: HlsNativeBridge(),
        playerFactory: factory,
      );
    });

    tearDown(() {
      feed.dispose();
      native.dispose();
      HlsEngine.debugReset();
    });

    ReelFeedController<_Clip> controller(List<_Clip> clips) {
      items = clips;
      return feed = ReelFeedController<_Clip>();
    }

    // A hand-built page from the public widgets, through ReelItem.custom.
    ReelItem<_Clip> page(BuildContext context, ReelSlot<_Clip> slot) {
      builds++;
      final ReelHandle<_Clip> reel = slot.reel;
      return ReelItem<_Clip>.custom(
        page: (BuildContext context, ReelSlot<_Clip> slot, _) => Stack(
          fit: StackFit.expand,
          children: <Widget>[
            ReelTapToPlay(reel: reel, child: reel.video),
            ReelControls(reel: reel),
            // Top-left, clear of the centre play button and the tap layer.
            Align(
              alignment: Alignment.topLeft,
              child: Text(
                reel.isPlayable ? 'reel ${reel.id}' : 'locked ${reel.id}',
              ),
            ),
          ],
        ),
      );
    }

    Future<void> pumpFeed(
      WidgetTester tester, {
      ReelInserts inserts = const ReelInserts.none(),
      VoidCallback? onEndReached,
      int endReachedThreshold = 3,
      bool tickers = true,
      bool showHud = false,
      ValueChanged<ReelEvent<_Clip>>? onEvent,
    }) async {
      await tester.pumpWidget(
        MaterialApp(
          home: TickerMode(
            enabled: tickers,
            child: ReelFeed<_Clip>(
              controller: feed,
              items: items,
              itemBuilder: page,
              inserts: inserts,
              onEndReached: onEndReached,
              endReachedThreshold: endReachedThreshold,
              showHud: showHud,
              onEvent: onEvent,
            ),
          ),
        ),
      );
      await settleFrames(tester);
    }

    group('renders', () {
      testWidgets('the current reel with its video', (WidgetTester t) async {
        controller(_clips(4));
        await pumpFeed(t);

        expect(find.text('reel 0'), findsOneWidget);
        expect(find.byKey(const ValueKey<String>('texture-0')), findsOneWidget);
        expect(factory.byId['0']!.isPlaying, isTrue);
      });

      testWidgets('a locked reel with no player', (WidgetTester t) async {
        controller(_clips(3, locked: <int>{0}));
        await pumpFeed(t);

        expect(find.text('locked 0'), findsOneWidget);
        expect(find.byKey(const ValueKey<String>('texture-0')), findsNothing);
        expect(factory.byId['0'], isNull);
      });

      testWidgets('the empty builder with no items', (WidgetTester t) async {
        controller(<_Clip>[]);
        await t.pumpWidget(
          MaterialApp(
            home: ReelFeed<_Clip>(
              controller: feed,
              items: items,
              itemBuilder: page,
              emptyBuilder: (_) => const Text('nothing'),
            ),
          ),
        );
        expect(find.text('nothing'), findsOneWidget);
      });

      testWidgets('the HUD when asked', (WidgetTester t) async {
        controller(_clips(3));
        await pumpFeed(t, showHud: true);
        expect(find.byType(PortraitPoolOverlay), findsOneWidget);
      });
    });

    group('updates', () {
      testWidgets('focus the moment the page changes', (WidgetTester t) async {
        controller(_clips(4));
        await pumpFeed(t);

        feed.jumpTo(1);
        // No pump: the controller knows before any window work finishes.
        expect(feed.current!.id, '1');
        expect(feed[1].isFocused, isTrue);
        await settleFrames(t);
        expect(factory.byId['1']!.isPlaying, isTrue);
        expect(factory.byId['0']!.isPlaying, isFalse);
      });

      testWidgets('without rebuilding pages on player ticks', (
        WidgetTester t,
      ) async {
        controller(_clips(3));
        await pumpFeed(t);
        final int before = builds;

        for (var i = 1; i <= 10; i++) {
          factory.byId['0']!.emit(position: Duration(milliseconds: i * 100));
          await t.pump();
        }

        expect(builds, before);
      });

      testWidgets('tap toggles play on the current reel', (
        WidgetTester t,
      ) async {
        controller(_clips(2));
        await pumpFeed(t);

        await t.tapAt(const Offset(200, 150));
        await settleFrames(t);
        expect(factory.byId['0']!.isPlaying, isFalse);
        expect(find.byIcon(Icons.play_arrow), findsOneWidget);

        await t.tap(find.byIcon(Icons.play_arrow));
        await settleFrames(t);
        expect(factory.byId['0']!.isPlaying, isTrue);
      });

      testWidgets('a hidden tab pauses and showing it resumes', (
        WidgetTester t,
      ) async {
        controller(_clips(2));
        await pumpFeed(t);
        expect(factory.byId['0']!.isPlaying, isTrue);

        await pumpFeed(t, tickers: false);
        expect(factory.byId['0']!.isPlaying, isFalse);
        expect(factory.byId['0']!.disposed, isFalse);

        await pumpFeed(t);
        expect(factory.byId['0']!.isPlaying, isTrue);
      });

      testWidgets('keeps the current reel on screen when items are inserted '
          'before it', (WidgetTester t) async {
        controller(_clips(4));
        await pumpFeed(t);
        feed.jumpTo(2);
        await settleFrames(t);

        items = <_Clip>[const _Clip('b'), const _Clip('a'), ...items];
        await pumpFeed(t);

        expect(feed.current!.id, '2');
        expect(feed.currentIndex, 4);
        expect(find.text('reel 2'), findsOneWidget);
        expect(factory.byId['2']!.isPlaying, isTrue);
      });
    });

    group('controllers', () {
      testWidgets('a controller swapped back in plays again', (
        WidgetTester t,
      ) async {
        final ReelFeedController<_Clip> other = ReelFeedController<_Clip>();
        final ReelFeedController<_Clip> first = controller(_clips(2));
        final List<_Clip> otherItems = <_Clip>[
          const _Clip('x'),
          const _Clip('y'),
        ];
        Future<void> show(ReelFeedController<_Clip> c, List<_Clip> list) async {
          await t.pumpWidget(
            MaterialApp(
              home: ReelFeed<_Clip>(
                controller: c,
                items: list,
                itemBuilder: page,
              ),
            ),
          );
          await settleFrames(t);
        }

        await show(first, items);
        await show(other, otherItems);
        expect(factory.byId['0']!.isPlaying, isFalse);
        expect(factory.byId['x']!.isPlaying, isTrue);

        await show(first, items);
        expect(first.isActive, isTrue);
        expect(factory.byId['0']!.isPlaying, isTrue);

        await t.pumpWidget(const SizedBox());
        other.dispose();
      });
    });

    group('inserts', () {
      Widget ad(BuildContext context, ReelInsertSlot slot) =>
          Center(child: Text('ad before ${slot.beforeReel}'));

      testWidgets('show between reels and pause playback', (
        WidgetTester t,
      ) async {
        controller(_clips(5));
        await pumpFeed(t, inserts: ReelInserts.every(2, ad));

        final Future<void> first = feed.next();
        await settleFrames(t, frames: 30);
        await first;
        final Future<void> second = feed.next();
        await settleFrames(t, frames: 30);
        await second;

        expect(find.text('ad before 2'), findsOneWidget);
        expect(feed.isOnInsert, isTrue);
        expect(feed.current, isNull);
        expect(factory.live.every((FakePort p) => !p.isPlaying), isTrue);
        expect(feed[2].hasPlayer, isTrue);

        final Future<void> third = feed.next();
        await settleFrames(t, frames: 30);
        await third;
        expect(feed.current!.id, '2');
        expect(factory.byId['2']!.isPlaying, isTrue);
      });
    });

    group('calls', () {
      testWidgets('onEndReached once near the end', (WidgetTester t) async {
        controller(_clips(6));
        var calls = 0;
        await pumpFeed(t, endReachedThreshold: 1, onEndReached: () => calls++);
        expect(calls, 0);

        feed.jumpTo(4);
        await settleFrames(t);
        feed.jumpTo(5);
        await settleFrames(t);
        expect(calls, 1);

        items = <_Clip>[...items, const _Clip('6'), const _Clip('7')];
        await pumpFeed(t, endReachedThreshold: 1, onEndReached: () => calls++);
        feed.jumpTo(6);
        await settleFrames(t);
        expect(calls, 2);
      });

      testWidgets('onEvent with focus events', (WidgetTester t) async {
        controller(_clips(3));
        final List<ReelEvent<_Clip>> events = <ReelEvent<_Clip>>[];
        await pumpFeed(t, onEvent: events.add);

        feed.jumpTo(1);
        await settleFrames(t);

        expect(
          events.whereType<ReelFocused<_Clip>>().map((e) => e.reel.id),
          <String>['0', '1'],
        );
        expect(events.whereType<ReelLeft<_Clip>>().single.reel.id, '0');
      });
    });

    group('fullscreen', () {
      testWidgets('shows the same player and back exits', (
        WidgetTester t,
      ) async {
        controller(_clips(2));
        await pumpFeed(t);
        final int opened = factory.opened.length;

        feed.enterFullscreen();
        await settleFrames(t);
        expect(find.byType(HlsFullscreenView), findsOneWidget);
        expect(factory.opened.length, opened);

        await t.binding.handlePopRoute();
        await settleFrames(t);
        expect(feed.isFullscreen, isFalse);
        expect(find.byType(HlsFullscreenView), findsNothing);
      });
    });
  });
}

/// Pumps frames so async window work and post-frame callbacks complete.
Future<void> settleFrames(WidgetTester tester, {int frames = 10}) async {
  for (var i = 0; i < frames; i++) {
    await tester.pump(const Duration(milliseconds: 16));
  }
}
