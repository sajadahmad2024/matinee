import 'package:flutter/animation.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hls_video_player/hls_video_player.dart' show HlsNativeBridge;
import 'package:hls_video_player/reels.dart';
import 'package:hls_video_player/src/feed/reel_analytics.dart';
import 'package:hls_video_player/src/feed/reel_feed_controller.dart';

import '../support/fakes.dart';

class _Clip implements ReelFeedItem {
  const _Clip(
    this.id, {
    this.locked = false,
    this.isLocked = false,
    this.version = 0,
  });

  @override
  final String id;

  /// No source at all, so no player; not the same as [isLocked].
  final bool locked;

  @override
  final bool isLocked;

  /// A new version is a new stream URL for the same reel.
  final int version;

  _Clip unlocked() => _Clip(id, version: version);

  _Clip withLock({required bool isLocked}) =>
      _Clip(id, locked: locked, isLocked: isLocked, version: version);

  Uri get url => Uri.parse('https://cdn.example/$id/v$version/master.m3u8');

  @override
  ReelSource? get source => locked ? null : ReelSource.hls(url);
}

/// Stands in for ReelFeed: page changes go straight to the controller.
class _FakeAttachment implements ReelFeedAttachment<_Clip> {
  _FakeAttachment(this.feed);

  final ReelFeedController<_Clip> feed;
  final List<ReelEvent<_Clip>> events = <ReelEvent<_Clip>>[];

  void swipeTo(int reel, {bool insert = false}) =>
      feed.focusPage(reelIndex: reel, isInsert: insert, pageIndex: reel);

  @override
  void jumpToReel(int index) => swipeTo(index);

  @override
  Future<void> animateToReel(int index, Duration d, Curve c) async =>
      swipeTo(index);

  @override
  Future<void> movePage(int delta, Duration d, Curve c) async =>
      swipeTo(feed.currentIndex + delta);

  @override
  void onEvent(ReelEvent<_Clip> event) => events.add(event);

  @override
  bool get isMounted => true;
}

List<_Clip> _clips(int count, {Set<int> locked = const <int>{}}) =>
    List<_Clip>.generate(
      count,
      (int i) => _Clip('$i', locked: locked.contains(i)),
    );

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group(ReelFeedController, () {
    late RecordingNative native;
    late FakePortFactory factory;
    late Duration now;

    setUp(() {
      native = RecordingNative();
      factory = FakePortFactory(native);
      now = Duration.zero;
      ReelAnalytics.clock = () => now;
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

    Future<(ReelFeedController<_Clip>, _FakeAttachment)> start(
      List<_Clip> clips, {
      int radius = 2,
      bool muted = true,
      HlsConnectivity? connectivity,
    }) async {
      final ReelFeedController<_Clip> feed = ReelFeedController<_Clip>(
        window: ReelWindow(radius: radius),
        muted: muted,
        connectivity: connectivity,
      )..syncItems(clips);
      final _FakeAttachment attachment = _FakeAttachment(feed);
      feed.attach(attachment);
      await settle();
      return (feed, attachment);
    }

    group('players', () {
      test('opens the window around the first reel and plays it', () async {
        final (ReelFeedController<_Clip> feed, _) = await start(_clips(6));

        expect(factory.live.map((FakePort p) => p.id), <String>['0', '1', '2']);
        expect(factory.byId['0']!.isPlaying, isTrue);
        expect(factory.byId['1']!.isPlaying, isFalse);
        expect(feed.current!.hasPlayer, isTrue);
        expect(feed[5].hasPlayer, isFalse);
        feed.dispose();
      });

      test('never exceeds 2 * radius + 1 players while swiping', () async {
        final (ReelFeedController<_Clip> feed, _FakeAttachment a) = await start(
          _clips(12),
        );
        for (var i = 1; i < 12; i++) {
          a.swipeTo(i);
          await settle();
          expect(factory.live.length, lessThanOrEqualTo(5));
        }
        feed.dispose();
      });

      test('dispose closes every player', () async {
        final (ReelFeedController<_Clip> feed, _) = await start(_clips(4));
        feed.dispose();
        await settle();
        expect(factory.live, isEmpty);
      });
    });

    group('locked reels', () {
      test('get no player, openAsset or prefetch', () async {
        final (ReelFeedController<_Clip> feed, _) = await start(
          _clips(4, locked: <int>{1}),
        );

        expect(feed[1].isPlayable, isFalse);
        expect(feed[1].hasPlayer, isFalse);
        expect(native.calls.where((String c) => c.endsWith(':1')), isEmpty);
        expect(feed[1].state.value.status, ReelPlayerStatus.idle);
        feed.dispose();
      });

      test('unlocking with update opens the player and plays it', () async {
        final (ReelFeedController<_Clip> feed, _FakeAttachment a) = await start(
          _clips(4, locked: <int>{1}),
        );
        a.swipeTo(1);
        await settle();
        expect(feed.current!.hasPlayer, isFalse);

        feed.syncItems(<_Clip>[...feed.items]..[1] = feed[1].data.unlocked());
        await settle();

        expect(feed.current!.hasPlayer, isTrue);
        expect(factory.byId['1']!.isPlaying, isTrue);
        feed.dispose();
      });
    });

    group('locking', () {
      Future<(ReelFeedController<_Clip>, _FakeAttachment)> startLocked(
        List<_Clip> clips,
        Set<String> locked,
      ) async {
        final ReelFeedController<_Clip> feed = ReelFeedController<_Clip>()
          ..syncItems(<_Clip>[
            for (final _Clip c in clips)
              c.withLock(isLocked: locked.contains(c.id)),
          ]);
        final _FakeAttachment attachment = _FakeAttachment(feed);
        feed.attach(attachment);
        await settle();
        return (feed, attachment);
      }

      test('a locked reel gets no native calls and reports isLocked', () async {
        final (ReelFeedController<_Clip> feed, _) = await startLocked(
          _clips(3),
          <String>{'1'},
        );

        expect(feed[1].isLocked, isTrue);
        expect(feed[1].isPlayable, isFalse);
        expect(feed[0].isLocked, isFalse);
        expect(native.calls.where((String c) => c.endsWith(':1')), isEmpty);
        feed.dispose();
      });

      test('the reel arriving unlocked opens and plays it', () async {
        final (ReelFeedController<_Clip> feed, _FakeAttachment a) =
            await startLocked(_clips(3), <String>{'1'});
        a.swipeTo(1);
        await settle();
        expect(feed.current!.hasPlayer, isFalse);

        feed.syncItems(
          <_Clip>[...feed.items]..[1] = feed[1].data.withLock(isLocked: false),
        );
        await settle();

        expect(feed.current!.isLocked, isFalse);
        expect(factory.byId['1']!.isPlaying, isTrue);
        feed.dispose();
      });

      test('a list with every reel unlocked opens them all', () async {
        final (ReelFeedController<_Clip> feed, _) = await startLocked(
          _clips(3),
          <String>{'0', '1', '2'},
        );
        expect(factory.opened, isEmpty);

        feed.syncItems(<_Clip>[
          for (final _Clip c in feed.items) c.withLock(isLocked: false),
        ]);
        await settle();

        expect(factory.live.length, 3);
        expect(factory.byId['0']!.isPlaying, isTrue);
        feed.dispose();
      });

      test('the same items again make no native calls', () async {
        final (ReelFeedController<_Clip> feed, _) = await startLocked(
          _clips(3),
          <String>{},
        );
        final int before = native.calls.length;

        feed.syncItems(feed.items);
        await settle();

        expect(native.calls.length, before);
        feed.dispose();
      });

      test('a null source without locked is not locked', () async {
        final (ReelFeedController<_Clip> feed, _) = await start(
          _clips(2, locked: <int>{1}),
        );
        expect(feed[1].isPlayable, isFalse);
        expect(feed[1].isLocked, isFalse);
        feed.dispose();
      });
    });

    group('handles', () {
      test('are the same object for the same reel', () async {
        final (ReelFeedController<_Clip> feed, _) = await start(_clips(3));
        expect(identical(feed[1], feed.byId('1')), isTrue);
        feed.dispose();
      });

      test('removed reels detach and ignore commands', () async {
        final (ReelFeedController<_Clip> feed, _) = await start(_clips(3));
        final ReelHandle<_Clip> removed = feed[2];

        feed.syncItems(<_Clip>[...feed.items]..removeAt(2));
        await settle();

        expect(removed.index, -1);
        expect(removed.isInFeed, isFalse);
        expect(removed.seekTo(Duration.zero), isFalse);
        // Late analytics can still read the model it had.
        expect(removed.data.id, '2');
        feed.dispose();
      });

      test('state follows the player', () async {
        final (ReelFeedController<_Clip> feed, _) = await start(_clips(3));
        final ReelHandle<_Clip> reel = feed.current!;
        expect(reel.state.value.status, ReelPlayerStatus.playing);

        factory.byId['0']!.emit(isBuffering: true);
        expect(reel.state.value.status, ReelPlayerStatus.buffering);
        factory.byId['0']!.emit(
          isBuffering: false,
          position: const Duration(seconds: 3),
        );
        expect(reel.state.value.position, const Duration(seconds: 3));
        feed.dispose();
      });
    });

    group('commands', () {
      test('play and pause apply to the focused reel only', () async {
        final (ReelFeedController<_Clip> feed, _) = await start(_clips(3));

        expect(feed[1].play(), isFalse);
        expect(feed.current!.pause(), isTrue);
        await settle();
        expect(factory.byId['0']!.isPlaying, isFalse);
        expect(feed.current!.state.value.isPlayRequested, isFalse);

        expect(feed.current!.play(), isTrue);
        await settle();
        expect(factory.byId['0']!.isPlaying, isTrue);
        feed.dispose();
      });

      test('a new reel starts from autoplay after a pause', () async {
        final (ReelFeedController<_Clip> feed, _FakeAttachment a) = await start(
          _clips(3),
        );
        feed.current!.pause();
        a.swipeTo(1);
        await settle();

        expect(factory.byId['1']!.isPlaying, isTrue);
        expect(factory.byId['0']!.isPlaying, isFalse);
        feed.dispose();
      });

      test('seekTo works on any reel with a player', () async {
        final (ReelFeedController<_Clip> feed, _) = await start(_clips(6));

        expect(feed[2].seekTo(const Duration(seconds: 4)), isTrue);
        expect(factory.byId['2']!.seeks, <Duration>[
          const Duration(seconds: 4),
        ]);
        expect(feed[5].seekTo(const Duration(seconds: 1)), isFalse);
        feed.dispose();
      });

      test('a new URL for the same reel replaces the player', () async {
        final (ReelFeedController<_Clip> feed, _) = await start(_clips(3));
        final FakePort old = factory.byId['0']!;

        feed.syncItems(
          <_Clip>[...feed.items]..[0] = const _Clip('0', version: 1),
        );
        await settle(40);

        expect(old.disposed, isTrue);
        expect(factory.uriOf['0'], const _Clip('0', version: 1).url);
        expect(identical(feed.current!.port, factory.byId['0']), isTrue);
        expect(factory.byId['0']!.isPlaying, isTrue);
        feed.dispose();
      });

      test('retry replaces a player that failed while playing', () async {
        final (ReelFeedController<_Clip> feed, _) = await start(_clips(2));
        final FakePort failed = factory.byId['0']!..emit(error: 'decode');
        expect(feed.current!.state.value.status, ReelPlayerStatus.error);

        expect(feed.current!.retry(), isTrue);
        await settle(40);

        expect(failed.disposed, isTrue);
        expect(feed.current!.state.value.status, isNot(ReelPlayerStatus.error));
        feed.dispose();
      });

      test('retry reopens a reel whose player failed', () async {
        factory.failOpen.add('1');
        final (ReelFeedController<_Clip> feed, _) = await start(_clips(3));
        expect(feed[1].state.value.status, ReelPlayerStatus.error);

        factory.failOpen.clear();
        expect(feed[1].retry(), isTrue);
        await settle();

        expect(feed[1].hasPlayer, isTrue);
        expect(feed[0].retry(), isFalse);
        feed.dispose();
      });
    });

    group('mute', () {
      test('global mute and per-reel override set the volume', () async {
        final (ReelFeedController<_Clip> feed, _) = await start(_clips(3));
        final FakePort port = factory.byId['0']!;
        expect(port.volume, 0);

        feed.muted = false;
        await settle();
        expect(port.volume, 1);

        feed.current!.mutedOverride = true;
        await settle();
        expect(port.volume, 0);
        expect(feed.current!.isMuted, isTrue);
        expect(feed[1].isMuted, isFalse);

        feed.current!.mutedOverride = null;
        await settle();
        expect(port.volume, 1);
        feed.dispose();
      });

      test('an override set before attach is applied', () async {
        final ReelFeedController<_Clip> feed = ReelFeedController<_Clip>()
          ..syncItems(_clips(2));
        feed[0].mutedOverride = false;
        feed.attach(_FakeAttachment(feed));
        await settle();

        expect(factory.byId['0']!.volume, 1);
        feed.dispose();
      });
    });

    group('items', () {
      test('appending a page keeps the open players', () async {
        final (ReelFeedController<_Clip> feed, _) = await start(_clips(3));
        final List<FakePort> before = factory.live;

        feed.syncItems(<_Clip>[
          ...feed.items,
          const _Clip('3'),
          const _Clip('4'),
        ]);
        await settle();

        expect(before.every((FakePort p) => !p.disposed), isTrue);
        expect(feed.length, 5);
        feed.dispose();
      });

      test('a new list keeps the current reel by id', () async {
        final (ReelFeedController<_Clip> feed, _FakeAttachment a) = await start(
          _clips(4),
        );
        a.swipeTo(2);
        await settle();
        final FakePort playing = factory.byId['2']!;

        feed.syncItems(<_Clip>[
          const _Clip('new'),
          const _Clip('2'),
          const _Clip('3'),
        ]);
        await settle();

        expect(feed.currentIndex, 1);
        expect(feed.current!.id, '2');
        expect(playing.disposed, isFalse);
        expect(playing.isPlaying, isTrue);
        feed.dispose();
      });

      test('removing the current reel focuses its neighbour', () async {
        final (ReelFeedController<_Clip> feed, _FakeAttachment a) = await start(
          _clips(4),
        );
        a.swipeTo(3);
        await settle();

        feed.syncItems(<_Clip>[...feed.items]..removeAt(3));
        await settle();

        expect(feed.current!.id, '2');
        expect(factory.byId['2']!.isPlaying, isTrue);
        feed.dispose();
      });
    });

    group('active', () {
      test('inactive pauses without closing players', () async {
        final (ReelFeedController<_Clip> feed, _) = await start(_clips(3));
        final FakePort port = factory.byId['0']!;

        feed.setActive(active: false);
        await settle();
        expect(port.isPlaying, isFalse);
        expect(port.disposed, isFalse);

        feed.setActive(active: true);
        await settle();
        expect(port.isPlaying, isTrue);
        feed.dispose();
      });

      test('a user pause survives hiding and showing', () async {
        final (ReelFeedController<_Clip> feed, _) = await start(_clips(3));
        feed.current!.pause();

        feed
          ..setActive(active: false)
          ..setActive(active: true);
        await settle();

        expect(factory.byId['0']!.isPlaying, isFalse);
        feed.dispose();
      });
    });

    group('inserts', () {
      test('pause everything and keep the next reel ready', () async {
        final (ReelFeedController<_Clip> feed, _FakeAttachment a) = await start(
          _clips(5),
        );
        a.swipeTo(1);
        await settle();

        // Insert before reel 2.
        feed.focusPage(reelIndex: 2, isInsert: true, pageIndex: 2);
        await settle();

        expect(feed.current, isNull);
        expect(feed.isOnInsert, isTrue);
        expect(factory.live.every((FakePort p) => !p.isPlaying), isTrue);
        expect(feed[2].hasPlayer, isTrue);

        feed.focusPage(reelIndex: 2, isInsert: false, pageIndex: 3);
        await settle();
        expect(factory.byId['2']!.isPlaying, isTrue);
        feed.dispose();
      });
    });

    group('offline to online', () {
      test('handles follow rebuilt players at the same position', () async {
        final FakeConnectivity net = FakeConnectivity(connected: false);
        final (ReelFeedController<_Clip> feed, _) = await start(
          _clips(3),
          connectivity: net,
        );
        final ReelHandle<_Clip> reel = feed.current!;
        final FakePort before = factory.byId['0']!
          ..emit(position: const Duration(seconds: 7));

        native.flipNext = <Uri>[fakeMaster('0')];
        net.emit(true);
        await settle(40);

        final FakePort after = factory.byId['0']!;
        expect(identical(before, after), isFalse);
        expect(before.disposed, isTrue);
        expect(identical(reel.port, after), isTrue);
        expect(after.seeks, contains(const Duration(seconds: 7)));
        after.emit(position: const Duration(seconds: 8));
        expect(reel.state.value.position, const Duration(seconds: 8));
        feed.dispose();
      });
    });

    group('events', () {
      Future<List<ReelEvent<_Clip>>> flush(_FakeAttachment a) async {
        await settle();
        return a.events;
      }

      test('focus, first frame, watch time and leave', () async {
        final (ReelFeedController<_Clip> feed, _FakeAttachment a) = await start(
          _clips(3),
        );
        final FakePort port = factory.byId['0']!;

        now = const Duration(milliseconds: 120);
        port.emit(position: const Duration(milliseconds: 100));
        now = const Duration(seconds: 3);
        port.emit(position: const Duration(seconds: 3));
        a.swipeTo(1);

        final List<ReelEvent<_Clip>> events = await flush(a);
        expect(events.whereType<ReelFocused<_Clip>>().first.reel.id, '0');
        final ReelFirstFrame<_Clip> first = events
            .whereType<ReelFirstFrame<_Clip>>()
            .first;
        expect(first.timeToFirstFrame, const Duration(milliseconds: 120));
        final ReelLeft<_Clip> left = events.whereType<ReelLeft<_Clip>>().first;
        expect(left.reel.id, '0');
        expect(left.maxPosition, const Duration(seconds: 3));
        expect(left.watchTime, greaterThan(Duration.zero));
        expect(events.whereType<ReelFocused<_Clip>>().last.fromIndex, 0);
        feed.dispose();
      });

      test('watch time excludes buffering', () async {
        final (ReelFeedController<_Clip> feed, _FakeAttachment a) = await start(
          _clips(2),
        );
        final FakePort port = factory.byId['0']!;
        // Playing from 0 s to 2 s, stalled 2..5 s, playing 5..6 s.
        port.emit(position: const Duration(milliseconds: 1));
        now = const Duration(seconds: 2);
        port.emit(isBuffering: true);
        now = const Duration(seconds: 5);
        port.emit(isBuffering: false);
        now = const Duration(seconds: 6);
        a.swipeTo(1);

        final List<ReelEvent<_Clip>> events = await flush(a);
        final ReelLeft<_Clip> left = events.whereType<ReelLeft<_Clip>>().first;
        expect(left.watchTime, const Duration(seconds: 3));
        expect(events.whereType<ReelBufferingStarted<_Clip>>(), hasLength(1));
        expect(
          events.whereType<ReelBufferingEnded<_Clip>>().single.stallDuration,
          const Duration(seconds: 3),
        );
        feed.dispose();
      });

      test('a wrap from the end counts as a loop; a seek does not', () async {
        final (ReelFeedController<_Clip> feed, _FakeAttachment a) = await start(
          _clips(2),
        );
        final FakePort port = factory.byId['0']!
          ..emit(position: const Duration(seconds: 29, milliseconds: 500))
          ..emit(position: const Duration(milliseconds: 200));
        feed.current!.seekTo(const Duration(seconds: 1));
        port.emit(position: const Duration(seconds: 29, milliseconds: 600));
        feed.current!.seekTo(Duration.zero);
        a.swipeTo(1);

        final List<ReelEvent<_Clip>> events = await flush(a);
        expect(events.whereType<ReelLooped<_Clip>>(), hasLength(1));
        final ReelLeft<_Clip> left = events.whereType<ReelLeft<_Clip>>().first;
        expect(left.loops, 1);
        expect(left.completed, isTrue);
        feed.dispose();
      });

      test('a forward seek does not hide the next loop', () async {
        final (ReelFeedController<_Clip> feed, _FakeAttachment a) = await start(
          _clips(2),
        );
        final FakePort port = factory.byId['0']!
          ..emit(position: const Duration(seconds: 2));
        feed.current!.seekTo(const Duration(seconds: 10));
        port
          ..emit(position: const Duration(seconds: 10))
          ..emit(position: const Duration(seconds: 29, milliseconds: 500))
          ..emit(position: const Duration(milliseconds: 200));

        final List<ReelEvent<_Clip>> events = await flush(a);
        expect(events.whereType<ReelLooped<_Clip>>(), hasLength(1));
        feed.dispose();
      });

      test('removing the current reel binds its neighbour, not its old '
          'index', () async {
        final (ReelFeedController<_Clip> feed, _FakeAttachment a) = await start(
          _clips(3),
        );
        a.swipeTo(1);
        await settle();
        factory.byId['1']!.emit(position: const Duration(seconds: 12));
        await flush(a);
        a.events.clear();

        feed.syncItems(<_Clip>[...feed.items]..removeAt(1));
        final List<ReelEvent<_Clip>> events = await flush(a);

        expect(events.whereType<ReelFocused<_Clip>>().single.reel.id, '2');
        // Bound to reel 1's still-playing port, it would report a 0 ms first
        // frame for reel 2 at 12 s.
        expect(
          events.whereType<ReelFirstFrame<_Clip>>().where(
            (ReelFirstFrame<_Clip> e) => e.reel.id == '2',
          ),
          isEmpty,
        );
        final ReelLeft<_Clip> left = events.whereType<ReelLeft<_Clip>>().single;
        expect(left.reel.data.id, '1');
        expect(left.maxPosition, const Duration(seconds: 12));
        feed.dispose();
      });

      test('the last ReelLeft reaches the feed that detached', () async {
        final (ReelFeedController<_Clip> feed, _FakeAttachment a) = await start(
          _clips(2),
        );
        await flush(a);
        a.events.clear();

        feed.detach(a);
        await settle();

        expect(a.events.whereType<ReelLeft<_Clip>>(), hasLength(1));
        feed.dispose();
      });

      test('pause and play from the host are reported', () async {
        final (ReelFeedController<_Clip> feed, _FakeAttachment a) = await start(
          _clips(2),
        );
        feed.current!
          ..pause()
          ..play();

        final List<ReelEvent<_Clip>> events = await flush(a);
        expect(events.whereType<ReelPaused<_Clip>>(), hasLength(1));
        expect(events.whereType<ReelPlayed<_Clip>>(), hasLength(1));
        feed.dispose();
      });

      test('events also arrive on the stream', () async {
        final (ReelFeedController<_Clip> feed, _FakeAttachment a) = await start(
          _clips(2),
        );
        final List<ReelEvent<_Clip>> streamed = <ReelEvent<_Clip>>[];
        feed.events.listen(streamed.add);
        a.swipeTo(1);
        await settle();

        expect(streamed.whereType<ReelFocused<_Clip>>(), isNotEmpty);
        feed.dispose();
      });
    });
  });
}
