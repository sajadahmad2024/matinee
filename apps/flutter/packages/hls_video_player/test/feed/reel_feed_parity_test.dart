import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hls_video_player/hls_video_player.dart';
import 'package:hls_video_player/reels.dart';

import '../support/fakes.dart';

/// Drives one feed implementation through the shared script.
abstract class _Driver {
  Future<void> mount(WidgetTester tester, List<String> ids);
  Future<void> goTo(WidgetTester tester, int index);
  Future<void> setItems(WidgetTester tester, List<String> ids);
  void dispose();
}

class _OldPager implements _Driver {
  _OldPager(this.net);

  final FakeConnectivity net;
  final PageController pages = PageController();

  Widget _build(List<String> ids) => MaterialApp(
    home: HlsReelPager(
      controller: pages,
      connectivity: net,
      items: <HlsReelItem>[
        for (final String id in ids)
          HlsReelItem(id: id, masterUri: fakeMaster(id)),
      ],
      itemBuilder: (BuildContext context, HlsReelSlot slot) => slot.video,
    ),
  );

  @override
  Future<void> mount(WidgetTester tester, List<String> ids) async {
    await tester.pumpWidget(_build(ids));
    await _frames(tester);
  }

  @override
  Future<void> goTo(WidgetTester tester, int index) async {
    pages.jumpToPage(index);
    await _frames(tester);
  }

  @override
  Future<void> setItems(WidgetTester tester, List<String> ids) async {
    await tester.pumpWidget(_build(ids));
    await _frames(tester);
  }

  @override
  void dispose() => pages.dispose();
}

/// A reel for the new feed: an id, with no source when it is in [noSource].
class _Reel implements ReelFeedItem {
  const _Reel(this.id, {this.noSource = false});

  @override
  final String id;
  final bool noSource;

  @override
  ReelSource? get source => noSource ? null : ReelSource.hls(fakeMaster(id));

  @override
  bool get isLocked => false;
}

class _NewFeed implements _Driver {
  _NewFeed(this.net, {this.locked = const <String>{}});

  final FakeConnectivity net;
  final Set<String> locked;
  late final ReelFeedController<_Reel> feed;

  Widget _build(List<String> ids) => MaterialApp(
    home: ReelFeed<_Reel>(
      controller: feed,
      items: <_Reel>[
        for (final String id in ids) _Reel(id, noSource: locked.contains(id)),
      ],
      itemBuilder: (BuildContext context, ReelSlot<_Reel> slot) =>
          ReelItem<_Reel>.custom(
            page: (BuildContext context, ReelSlot<_Reel> slot, _) =>
                slot.reel.video,
          ),
    ),
  );

  @override
  Future<void> mount(WidgetTester tester, List<String> ids) async {
    feed = ReelFeedController<_Reel>(connectivity: net);
    await tester.pumpWidget(_build(ids));
    await _frames(tester);
  }

  @override
  Future<void> goTo(WidgetTester tester, int index) async {
    feed.jumpTo(index);
    await _frames(tester);
  }

  @override
  Future<void> setItems(WidgetTester tester, List<String> ids) async {
    await tester.pumpWidget(_build(ids));
    await _frames(tester);
  }

  @override
  void dispose() => feed.dispose();
}

Future<void> _frames(WidgetTester tester) async {
  for (var i = 0; i < 20; i++) {
    await tester.pump(const Duration(milliseconds: 16));
  }
}

final List<String> _first = <String>['0', '1', '2', '3', '4', '5'];
final List<String> _more = <String>[..._first, '6', '7', '8'];

Future<List<String>> _run(
  WidgetTester tester,
  _Driver Function(FakeConnectivity net) create,
) async {
  final RecordingNative native = RecordingNative();
  final FakePortFactory factory = FakePortFactory(native);
  HlsEngine.debugReset();
  HlsEngine.debugInstall(
    nativeBridge: HlsNativeBridge(),
    playerFactory: factory,
  );
  final FakeConnectivity net = FakeConnectivity();
  final _Driver driver = create(net);

  await driver.mount(tester, _first);
  for (final int index in <int>[1, 2, 3, 2, 4]) {
    await driver.goTo(tester, index);
  }
  net.emit(false);
  await _frames(tester);
  native.flipNext = <Uri>[fakeMaster('3'), fakeMaster('4')];
  net.emit(true);
  await _frames(tester);
  await driver.setItems(tester, _more);
  await driver.goTo(tester, 5);
  await driver.goTo(tester, 6);

  await tester.pumpWidget(const SizedBox());
  await _frames(tester);
  driver.dispose();
  native.dispose();
  HlsEngine.debugReset();
  return List<String>.of(native.calls);
}

void main() {
  group('ReelFeed parity with HlsReelPager', () {
    testWidgets('makes the same native calls for the same session', (
      WidgetTester tester,
    ) async {
      final List<String> old = await _run(
        tester,
        (FakeConnectivity net) => _OldPager(net),
      );
      final List<String> next = await _run(
        tester,
        (FakeConnectivity net) => _NewFeed(net),
      );

      expect(old, isNotEmpty);
      expect(old.where((String c) => c.startsWith('dispose:')), isNotEmpty);
      expect(next, old);
    });

    testWidgets('with a locked reel, only that reel\'s calls are missing', (
      WidgetTester tester,
    ) async {
      final List<String> old = await _run(
        tester,
        (FakeConnectivity net) => _OldPager(net),
      );
      final List<String> next = await _run(
        tester,
        (FakeConnectivity net) => _NewFeed(net, locked: <String>{'2'}),
      );

      expect(next.where((String c) => c.endsWith(':2')), isEmpty);
      expect(next, _without(old, '2'));
    });
  });
}

// The old sequence minus every call for [id], and [id] dropped from lists.
List<String> _without(List<String> calls, String id) => <String>[
  for (final String call in calls)
    if (!call.endsWith(':$id'))
      if (call.startsWith('refreshReachability:'))
        'refreshReachability:${call.substring('refreshReachability:'.length).split(',').where((String s) => s != id).join(',')}'
      else
        call,
];
