import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hls_video_player/hls_video_player.dart';
import 'package:hls_video_player/reels_lab.dart';

import '../support/fakes.dart';

void main() {
  group(ReelPagerLab, () {
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

    Future<void> swipeUp(WidgetTester t) async {
      await t.fling(find.byType(PageView), const Offset(0, -500), 2000);
      await frames(t, 60);
    }

    testWidgets('plays the first reel with its pill and share', (WidgetTester t) async {
      await t.pumpWidget(const ReelPagerLab());
      await frames(t);

      expect(find.text('Reel 1'), findsOneWidget);
      expect(find.text('1,250 PTS'), findsOneWidget);
      expect(native.calls.where((String c) => c.startsWith('open:')), isNotEmpty);

      await t.tap(find.byTooltip('Share').first);
      await frames(t);
      expect(find.text('Share Reel 1: the host wires this'), findsOneWidget);
      expect(t.takeException(), isNull);
    });

    testWidgets('covers the locked reel with a curtain, keeps its player, and unlocks it', (WidgetTester t) async {
      await t.pumpWidget(const ReelPagerLab());
      await frames(t);
      for (var i = 0; i < 3; i++) {
        await swipeUp(t);
      }

      expect(find.text('Reel 4 is locked'), findsOneWidget);
      expect(find.text('1,250 PTS'), findsNothing, reason: 'the pill hides behind the curtain');
      expect(native.calls, contains('open:pts_shift'), reason: 'the pager still opens a locked reel');

      await t.tap(find.text('Unlock'));
      await frames(t);
      expect(find.text('Reel 4 is locked'), findsNothing);
      expect(find.text('1,250 PTS'), findsOneWidget);
      expect(t.takeException(), isNull);
    });

    testWidgets('passes a swipe on the curtain through to the next reel', (WidgetTester t) async {
      await t.pumpWidget(const ReelPagerLab());
      await frames(t);
      for (var i = 0; i < 3; i++) {
        await swipeUp(t);
      }
      expect(find.text('Reel 4 is locked'), findsOneWidget);

      await t.fling(find.text('Reel 4 is locked'), const Offset(0, -500), 2000);
      await frames(t, 60);

      expect(find.text('Reel 4 is locked'), findsNothing);
      expect(find.text('Reel 5'), findsOneWidget);
      expect(t.takeException(), isNull);
    });

    testWidgets('toggles the HUD from the header', (WidgetTester t) async {
      await t.pumpWidget(const ReelPagerLab());
      await frames(t);

      await t.tap(find.byTooltip('Show HUD'));
      await frames(t);

      expect(find.byTooltip('Hide HUD'), findsOneWidget);
      expect(t.takeException(), isNull);
    });
  });
}
