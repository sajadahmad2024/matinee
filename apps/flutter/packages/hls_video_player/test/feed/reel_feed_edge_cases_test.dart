import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hls_video_player/hls_video_player.dart' show HlsNativeBridge;
import 'package:hls_video_player/reels.dart';

import '../support/fakes.dart';

// Counts how often the feed reads an item's source.
int _sourceReads = 0;

class _Clip implements ReelFeedItem {
  const _Clip(this.id, {this.version = 0, this.isLocked = false});

  @override
  final String id;
  final int version;

  @override
  final bool isLocked;

  Uri get url => Uri.parse('https://cdn.example/$id/v$version/master.m3u8');

  @override
  ReelSource? get source {
    _sourceReads++;
    return ReelSource.hls(url);
  }
}

List<_Clip> _clips(int count) =>
    List<_Clip>.generate(count, (int i) => _Clip('$i'));

void main() {
  group('ReelFeed edge cases', () {
    late RecordingNative native;
    late FakePortFactory factory;
    late List<ReelEvent<_Clip>> events;
    // The host's state: the feed follows it, as it would a cubit's.
    late ValueNotifier<List<_Clip>> items;
    ReelFeedController<_Clip>? feed;

    setUp(() {
      native = RecordingNative();
      factory = FakePortFactory(native);
      events = <ReelEvent<_Clip>>[];
      items = ValueNotifier<List<_Clip>>(<_Clip>[]);
      _sourceReads = 0;
      HlsEngine.debugReset();
      HlsEngine.debugInstall(
        nativeBridge: HlsNativeBridge(),
        playerFactory: factory,
      );
    });

    tearDown(() {
      feed?.dispose();
      feed = null;
      native.dispose();
      HlsEngine.debugReset();
    });

    ReelFeedController<_Clip> controller(List<_Clip> list) {
      items.value = list;
      return feed = ReelFeedController<_Clip>();
    }

    Future<void> frames(WidgetTester t, [int count = 20]) async {
      for (var i = 0; i < count; i++) {
        await t.pump(const Duration(milliseconds: 16));
      }
    }

    Future<void> pumpFeed(
      WidgetTester t, {
      bool tickers = true,
      VoidCallback? onEndReached,
      ReelItem<_Clip> builders = const ReelItem<_Clip>(),
    }) async {
      await t.pumpWidget(
        MaterialApp(
          home: TickerMode(
            enabled: tickers,
            child: ValueListenableBuilder<List<_Clip>>(
              valueListenable: items,
              builder: (BuildContext context, List<_Clip> list, _) =>
                  ReelFeed<_Clip>(
                    controller: feed!,
                    items: list,
                    itemBuilder: (BuildContext c, ReelSlot<_Clip> s) =>
                        builders,
                    onEvent: events.add,
                    onEndReached: onEndReached,
                  ),
            ),
          ),
        ),
      );
      await frames(t);
    }

    testWidgets('a new source for a reel whose open failed opens it again', (
      WidgetTester t,
    ) async {
      factory.failOpen.add('1');
      controller(_clips(3));
      await pumpFeed(t);
      expect(feed![1].state.value.status, ReelPlayerStatus.error);

      factory.failOpen.clear();
      items.value = <_Clip>[...items.value]..[1] = const _Clip('1', version: 1);
      await frames(t, 40);

      expect(feed![1].hasPlayer, isTrue);
      expect(factory.uriOf['1'], const _Clip('1', version: 1).url);
    });

    testWidgets(
      'a feed that starts empty starts analytics for its first reel',
      (WidgetTester t) async {
        controller(<_Clip>[]);
        await pumpFeed(t);

        items.value = <_Clip>[...items.value, ..._clips(2)];
        await frames(t);

        expect(
          events.whereType<ReelFocused<_Clip>>().map((e) => e.reel.id),
          <String>['0'],
        );
        expect(factory.byId['0']!.isPlaying, isTrue);
      },
    );

    testWidgets('onEndReached asks again when a short page arrives', (
      WidgetTester t,
    ) async {
      controller(<_Clip>[]);
      var loads = 0;
      await pumpFeed(t, onEndReached: () => loads++);
      expect(loads, 1);

      items.value = <_Clip>[...items.value, ..._clips(2)];
      await frames(t);
      expect(loads, 2);
    });

    testWidgets('a hidden tab never starts a player or a session', (
      WidgetTester t,
    ) async {
      controller(_clips(3));
      await pumpFeed(t, tickers: false);

      expect(factory.byId['0']?.playCalls ?? 0, 0);
      expect(events.whereType<ReelFocused<_Clip>>(), isEmpty);

      await pumpFeed(t);
      expect(factory.byId['0']!.isPlaying, isTrue);
      expect(events.whereType<ReelFocused<_Clip>>(), hasLength(1));
    });

    testWidgets('a horizontal carousel in the curtain does not change page', (
      WidgetTester t,
    ) async {
      controller(<_Clip>[
        const _Clip('0', isLocked: true),
        ..._clips(3).skip(1),
      ]);
      await pumpFeed(
        t,
        builders: ReelItem<_Clip>(
          curtain: (BuildContext context, ReelSlot<_Clip> slot) => Center(
            child: SizedBox(
              height: 100,
              child: ListView(
                scrollDirection: Axis.horizontal,
                children: const <Widget>[Text('cast')],
              ),
            ),
          ),
        ),
      );

      await t.drag(find.text('cast'), const Offset(-300, 0));
      await frames(t, 40);

      expect(feed!.currentIndex, 0);
    });

    testWidgets('the mute button follows a reel override', (
      WidgetTester t,
    ) async {
      controller(_clips(2));
      await pumpFeed(t);
      feed![0].mutedOverride = true;
      feed!.current!.pause();
      await frames(t);

      await t.tap(find.byType(ReelMuteButton));
      await frames(t);

      expect(feed![0].mutedOverride, isFalse);
      expect(feed!.muted, isTrue);
      expect(factory.byId['0']!.volume, 1);
    });

    testWidgets('fromIndex follows the reel after items are inserted', (
      WidgetTester t,
    ) async {
      controller(_clips(5));
      await pumpFeed(t);
      feed!.jumpTo(1);
      await frames(t);

      items.value = <_Clip>[const _Clip('x'), ...items.value];
      await frames(t);
      feed!.jumpTo(3);
      await frames(t);

      expect(events.whereType<ReelFocused<_Clip>>().last.fromIndex, 2);
    });

    testWidgets('a changed element or an appended page is all that is read', (
      WidgetTester t,
    ) async {
      controller(_clips(50));
      await pumpFeed(t);

      _sourceReads = 0;
      // A new instance of reel 3, as a cubit's copyWith would give.
      items.value = <_Clip>[...items.value]..[3] = const _Clip('3');
      await t.pump();
      expect(_sourceReads, 1);

      _sourceReads = 0;
      items.value = <_Clip>[...items.value, const _Clip('a'), const _Clip('b')];
      await t.pump();
      expect(_sourceReads, 2);
      expect(feed!.length, 52);
      expect(feed!.indexOf('b'), 51);
      await frames(t);
    });
  });
}
