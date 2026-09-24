import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/core/widgets/genre_tag.dart';
import 'package:matinee/features/reels/data/models/reel.dart';
import 'package:matinee/features/reels/data/models/reel_playback.dart';
import 'package:matinee/features/reels/presentation/widgets/reel_meta.dart';

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
  group(ReelMeta, () {
    testWidgets('renders the title, author and one genre tag per genre', (tester) async {
      await tester.pumpApp(const ReelMeta(reel: _reel));

      expect(find.text('Neon Noir'), findsOneWidget);
      expect(find.text('Apex Films'), findsOneWidget);
      expect(find.byType(GenreTag), findsNWidgets(2));
      expect(find.text('THRILLER'), findsOneWidget);
      expect(find.text('NEO-NOIR'), findsOneWidget);
    });

    testWidgets('ellipsizes a title too long for the row instead of overflowing', (tester) async {
      final longTitle = _reel.copyWith(title: 'A' * 200);

      await tester.pumpApp(ReelMeta(reel: longTitle));

      expect(tester.takeException(), isNull);
    });
  });
}
