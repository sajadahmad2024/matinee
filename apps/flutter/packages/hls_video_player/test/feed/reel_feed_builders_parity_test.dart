import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hls_video_player/hls_video_player.dart';
import 'package:hls_video_player/reels.dart';

import '../support/fakes.dart';

final List<String> _first = <String>['0', '1', '2', '3', '4', '5'];
final List<String> _more = <String>[..._first, '6', '7', '8'];

Future<void> _frames(WidgetTester tester) async {
  for (var i = 0; i < 20; i++) {
    await tester.pump(const Duration(milliseconds: 16));
  }
}

/// Runs one session; [mount], [goTo] and [grow] drive the feed under test.
Future<List<String>> _session(
  WidgetTester tester, {
  required Future<void> Function(FakeConnectivity net) mount,
  required Future<void> Function(int index) goTo,
  required Future<void> Function() grow,
  required VoidCallback dispose,
}) async {
  final RecordingNative native = RecordingNative();
  HlsEngine.debugReset();
  HlsEngine.debugInstall(
    nativeBridge: HlsNativeBridge(),
    playerFactory: FakePortFactory(native),
  );
  final FakeConnectivity net = FakeConnectivity();

  await mount(net);
  for (final int index in <int>[1, 2, 3, 2, 4]) {
    await goTo(index);
  }
  net.emit(false);
  await _frames(tester);
  native.flipNext = <Uri>[fakeMaster('3'), fakeMaster('4')];
  net.emit(true);
  await _frames(tester);
  await grow();
  await goTo(5);
  await goTo(6);

  await tester.pumpWidget(const SizedBox());
  await _frames(tester);
  dispose();
  native.dispose();
  HlsEngine.debugReset();
  return List<String>.of(native.calls);
}

Future<List<String>> _oldPager(WidgetTester tester) {
  final PageController pages = PageController();
  late FakeConnectivity connectivity;
  Widget build(List<String> ids) => MaterialApp(
    home: HlsReelPager(
      controller: pages,
      connectivity: connectivity,
      items: <HlsReelItem>[
        for (final String id in ids)
          HlsReelItem(id: id, masterUri: fakeMaster(id)),
      ],
      itemBuilder: (BuildContext context, HlsReelSlot slot) => slot.video,
    ),
  );
  return _session(
    tester,
    mount: (FakeConnectivity net) async {
      connectivity = net;
      await tester.pumpWidget(build(_first));
      await _frames(tester);
    },
    goTo: (int index) async {
      pages.jumpToPage(index);
      await _frames(tester);
    },
    grow: () async {
      await tester.pumpWidget(build(_more));
      await _frames(tester);
    },
    dispose: pages.dispose,
  );
}

class _Reel implements ReelFeedItem {
  const _Reel(this.id);

  @override
  final String id;

  @override
  ReelSource? get source => ReelSource.hls(fakeMaster(id));

  @override
  bool get isLocked => false;
}

Future<List<String>> _builderFeed(WidgetTester tester) {
  late ReelFeedController<_Reel> feed;
  Widget build(List<String> ids) => MaterialApp(
    home: ReelFeed<_Reel>(
      controller: feed,
      items: <_Reel>[for (final String id in ids) _Reel(id)],
      style: const ReelStyle(timer: ReelControlPosition.topEnd),
      onDoubleTap: (ReelSlot<_Reel> slot, Offset position) {},
      header: (BuildContext context, ReelSlot<_Reel>? current) =>
          const SizedBox.shrink(),
      itemBuilder: (BuildContext context, ReelSlot<_Reel> slot) =>
          ReelItem<_Reel>(
            thumbnail: (BuildContext context, ReelSlot<_Reel> slot) =>
                const ColoredBox(color: Colors.grey),
            overlay: (BuildContext context, ReelSlot<_Reel> slot) =>
                Text('reel ${slot.id}'),
          ),
    ),
  );
  return _session(
    tester,
    mount: (FakeConnectivity net) async {
      feed = ReelFeedController<_Reel>(connectivity: net);
      await tester.pumpWidget(build(_first));
      await _frames(tester);
    },
    goTo: (int index) async {
      feed.jumpTo(index);
      await _frames(tester);
    },
    grow: () async {
      await tester.pumpWidget(build(_more));
      await _frames(tester);
    },
    dispose: () => feed.dispose(),
  );
}

void main() {
  group('ReelFeed builders parity with HlsReelPager', () {
    testWidgets('makes the same native calls for the same session', (
      WidgetTester tester,
    ) async {
      final List<String> old = await _oldPager(tester);
      final List<String> next = await _builderFeed(tester);

      expect(old.where((String c) => c.startsWith('dispose:')), isNotEmpty);
      expect(next, old);
    });
  });
}
