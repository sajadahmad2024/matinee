import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hls_video_player/hls_video_player.dart' show HlsNativeBridge;
import 'package:hls_video_player/reels.dart';
import 'package:hls_video_player/reels_lab.dart';

import '../support/fakes.dart';

void main() {
  late RecordingNative native;

  setUp(() {
    native = RecordingNative();
    HlsEngine.debugReset();
    HlsEngine.debugInstall(nativeBridge: HlsNativeBridge(), playerFactory: FakePortFactory(native));
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

  Future<void> openPanel(WidgetTester t) async {
    await t.tap(find.byTooltip('ReelFeed controls'));
    await frames(t, 30);
  }

  testWidgets('the lab plays its feed and flips every panel switch without errors', (WidgetTester t) async {
    t.view.physicalSize = const Size(1080, 2400);
    t.view.devicePixelRatio = 3;
    addTearDown(t.view.reset);

    await t.pumpWidget(const ReelFeedLab());
    await frames(t);
    expect(find.text('Reel 1 · index 0'), findsOneWidget);
    expect(native.calls.where((String c) => c.startsWith('open:')), isNotEmpty);

    await openPanel(t);
    final Finder switches = find.byType(Switch);
    final int count = switches.evaluate().length;
    expect(count, greaterThan(20));
    for (var i = 0; i < count; i++) {
      final Finder one = switches.at(i);
      await t.ensureVisible(one);
      await frames(t, 2);
      await t.tap(one);
      await frames(t, 2);
      expect(t.takeException(), isNull, reason: 'switch $i');
    }

    Navigator.of(t.element(find.byType(ReelFeed<LabReel>))).pop();
    await frames(t, 30);
    await t.fling(find.byType(ReelFeed<LabReel>), const Offset(0, -600), 2000);
    await frames(t, 60);
    expect(t.takeException(), isNull);
  });

  testWidgets('a new window radius swaps the controller cleanly', (WidgetTester t) async {
    await t.pumpWidget(const ReelFeedLab());
    await frames(t);
    await openPanel(t);

    final Finder radius = find.byType(DropdownButton<int>).first;
    await t.ensureVisible(radius);
    await frames(t, 2);
    await t.tap(radius);
    await frames(t, 30);
    await t.tap(find.text('1').last);
    await frames(t, 60);

    expect(t.takeException(), isNull);
    expect(find.text('Reel 1 · index 0'), findsOneWidget);
  });
}
