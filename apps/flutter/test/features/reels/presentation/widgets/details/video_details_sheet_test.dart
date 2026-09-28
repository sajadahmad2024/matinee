import 'package:flutter_test/flutter_test.dart';
import 'package:material_ui/material_ui.dart';
import 'package:matinee/core/widgets/app_avatar.dart';
import 'package:matinee/core/widgets/genre_tag.dart';
import 'package:matinee/core/widgets/logo_tile.dart';
import 'package:matinee/features/reels/data/models/reel.dart';
import 'package:matinee/features/reels/data/models/reel_playback.dart';
import 'package:matinee/features/reels/presentation/widgets/details/cast_member.dart';
import 'package:matinee/features/reels/presentation/widgets/details/video_details_sheet.dart';

import '../../../../../helpers/helpers.dart';

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

const _netflix = ReelStreamingService(id: 'netflix', name: 'Netflix', logoUrl: 'https://example.com/netflix.png');
const _elena = ReelCastMember(name: 'Elena Cruz', imageUrl: 'https://example.com/elena.jpg');

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
  synopsis: 'A gripping neo-noir thriller.',
  cast: [
    _elena,
    ReelCastMember(name: 'Andy Brown'),
  ],
  streamingOn: [
    _netflix,
    ReelStreamingService(id: 'prime', name: 'Prime Video', logoUrl: ''),
  ],
);

void main() {
  group(VideoDetailsSheet, () {
    late List<ReelStreamingService> streamingTaps;
    late List<ReelCastMember> castTaps;

    setUp(() {
      streamingTaps = [];
      castTaps = [];
    });

    Future<void> open(WidgetTester tester, {Reel reel = _reel, bool tappable = false}) async {
      usePhoneSurface(tester);
      await tester.pumpApp(
        Builder(
          builder: (context) => Scaffold(
            body: Center(
              child: TextButton(
                onPressed: () => showVideoDetailsSheet(
                  context,
                  reel: reel,
                  onStreamingTap: tappable ? streamingTaps.add : null,
                  onCastTap: tappable ? castTaps.add : null,
                ),
                child: const Text('Open'),
              ),
            ),
          ),
        ),
      );
      await tester.tap(find.text('Open'));
      await tester.pumpAndSettle();
    }

    group('renders', () {
      testWidgets('the title, credits, synopsis, streaming logos and cast', (tester) async {
        await open(tester);

        expect(find.text('Neon Noir'), findsOneWidget);
        expect(find.text('Apex Films'), findsOneWidget);
        expect(find.byType(GenreTag), findsNWidgets(2));
        expect(find.text('A gripping neo-noir thriller.'), findsOneWidget);
        expect(find.text('STREAMING ON'), findsOneWidget);
        expect(find.byType(LogoTile), findsNWidgets(2));
        expect(find.text('CAST'), findsOneWidget);
        expect(find.byType(CastMember), findsNWidgets(2));
        expect(find.text('Elena Cruz'), findsOneWidget);
      });

      testWidgets('cast photos in the cast variant', (tester) async {
        await open(tester);

        final avatar = tester.widget<AppAvatar>(find.byType(AppAvatar).first);
        expect(avatar.variant, AppAvatarVariant.cast);
        expect(avatar.imageUrl, _elena.imageUrl);
      });

      testWidgets('the caption, and no empty sections, for a reel without details', (tester) async {
        await open(
          tester,
          reel: _reel.copyWith(synopsis: null, cast: const [], streamingOn: const []),
        );

        expect(find.text('A caption.'), findsOneWidget);
        expect(find.text('STREAMING ON'), findsNothing);
        expect(find.text('CAST'), findsNothing);
      });

      testWidgets('a long synopsis without overflowing', (tester) async {
        await open(tester, reel: _reel.copyWith(synopsis: 'Word ' * 2000));

        expect(tester.takeException(), isNull);
      });

      testWidgets('meeting the guidelines', (tester) async {
        await open(tester, tappable: true);

        await expectMeetsGuidelines(tester);
      });
    });

    group('calls', () {
      testWidgets('onStreamingTap and onCastTap with what was tapped', (tester) async {
        await open(tester, tappable: true);
        await tester.tap(find.byType(LogoTile).first);
        await tester.tap(find.text('Elena Cruz'));

        expect(streamingTaps, [_netflix]);
        expect(castTaps, [_elena]);
      });

      testWidgets('nothing when the rows are not tappable', (tester) async {
        await open(tester);
        await tester.tap(find.byType(LogoTile).first);
        await tester.tap(find.text('Elena Cruz'));

        expect(streamingTaps, isEmpty);
        expect(castTaps, isEmpty);
      });
    });

    testWidgets('closes from the close button', (tester) async {
      await open(tester);
      await tester.tap(find.byTooltip('Close details'));
      await tester.pumpAndSettle();

      expect(find.byType(VideoDetailsSheet), findsNothing);
    });
  });
}
