import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/features/reels/data/models/reel.dart';
import 'package:matinee/features/reels/data/models/reel_playback.dart';
import 'package:matinee/features/reels/data/reels_repository.dart';
import 'package:matinee/features/reels/data/services/reels_feed_api_service.dart';
import 'package:mocktail/mocktail.dart';

class _MockReelsFeedApiService extends Mock implements ReelsFeedApiService {}

const _clear = ReelPlayback(
  kind: ReelPlaybackKind.normal,
  drm: ReelDrmKind.none,
  authMode: ReelAuthMode.none,
  cachePolicy: ReelCachePolicy.liveSegmentCache,
  prefetchEnabled: true,
  substitutionEnabled: true,
  maxPrefetchSegments: 10,
  maxPrefetchHeight: 480,
);

Reel _reel(String id, {bool isExclusive = false, ReelPlayback playback = _clear}) => Reel(
  id: id,
  masterUri: 'https://cdn.example/$id/master.m3u8',
  title: 'Title $id',
  caption: 'Caption',
  author: const ReelAuthor(id: 'u1', handle: 'apexfilms', displayName: 'Apex Films'),
  likeCount: 1,
  commentCount: 1,
  shareCount: 1,
  durationMs: 30000,
  playback: playback,
  genres: const ['Drama'],
  isExclusive: isExclusive,
);

void main() {
  group(ReelsRepository, () {
    late ReelsFeedApiService service;
    late ReelsRepository repository;

    setUp(() {
      service = _MockReelsFeedApiService();
      repository = ReelsRepository(service);
    });

    group('fetchFeed', () {
      test('returns the playable reels ready for the feed', () async {
        when(service.fetchReelsFeed).thenAnswer(
          (_) async => [
            _reel('free'),
            _reel('paid', isExclusive: true),
            _reel('drm', playback: _clear.copyWith(drm: ReelDrmKind.fairplay)),
          ],
        );

        final feed = await repository.fetchFeed();

        expect(feed.map((f) => (f.id, f.isLocked)), [('free', false), ('paid', true)]);
      });

      test('throws a $NetworkException when the service cannot connect', () {
        when(service.fetchReelsFeed).thenThrow(DioException(requestOptions: RequestOptions()));

        expect(repository.fetchFeed(), throwsA(isA<NetworkException>()));
      });
    });
  });
}
