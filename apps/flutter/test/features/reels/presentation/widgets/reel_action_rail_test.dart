import 'dart:ui';

import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_ui/material_ui.dart';
import 'package:matinee/features/reels/data/models/reel.dart';
import 'package:matinee/features/reels/data/models/reel_playback.dart';
import 'package:matinee/features/reels/presentation/widgets/details/video_details_sheet.dart';
import 'package:matinee/features/reels/presentation/widgets/reel_action_rail.dart';

import '../../../../helpers/helpers.dart';

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

const _reel = Reel(
  id: 'reel-1',
  masterUri: 'https://example.com/master.m3u8',
  title: 'Neon Noir',
  caption: 'A caption.',
  author: ReelAuthor(id: 'u1', handle: 'apexfilms', displayName: 'Apex Films'),
  likeCount: 12400,
  commentCount: 847,
  shareCount: 12,
  durationMs: 60000,
  playback: _playback,
  genres: ['Thriller', 'Neo-Noir'],
);

void main() {
  group(ReelActionRail, () {
    group('renders', () {
      testWidgets('the compact like and comment counts and the info/share labels', (tester) async {
        await tester.pumpApp(const Material(child: ReelActionRail(reel: _reel)));

        expect(find.text('12.4K'), findsOneWidget);
        expect(find.text('847'), findsOneWidget);
        expect(find.text('Info'), findsOneWidget);
        expect(find.text('Share'), findsOneWidget);
      });

      testWidgets('meets tap-target, labelling and contrast guidelines', (tester) async {
        usePhoneSurface(tester);
        await tester.pumpApp(const Material(child: ReelActionRail(reel: _reel)));

        await expectMeetsGuidelines(tester);
      });
    });

    group('share', () {
      testWidgets('calls onShare', (tester) async {
        var shares = 0;
        await tester.pumpApp(
          Material(
            child: ReelActionRail(reel: _reel, onShare: () => shares++),
          ),
        );
        await tester.tap(find.text('Share'));

        expect(shares, 1);
      });
    });

    group('info', () {
      testWidgets('opens the video details sheet', (tester) async {
        usePhoneSurface(tester);
        await tester.pumpApp(
          const Scaffold(
            body: Center(child: ReelActionRail(reel: _reel)),
          ),
        );
        await tester.tap(find.text('Info'));
        await tester.pumpAndSettle();

        expect(find.byType(VideoDetailsSheet), findsOneWidget);
      });
    });

    group('like', () {
      testWidgets('marks the button selected on tap', (tester) async {
        final handle = tester.ensureSemantics();
        await tester.pumpApp(const Material(child: ReelActionRail(reel: _reel)));

        SemanticsNode likeNode() => tester.getSemantics(find.bySemanticsLabel('Like, 12.4K'));
        expect(likeNode().flagsCollection.isSelected, Tristate.isFalse);

        await tester.tap(find.text('12.4K'));
        await tester.pump();

        expect(likeNode().flagsCollection.isSelected, Tristate.isTrue);
        handle.dispose();
      });
    });
  });
}
