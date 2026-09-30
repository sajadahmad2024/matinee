import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hls_video_player/reels.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/features/reels/data/models/reel.dart';
import 'package:matinee/features/reels/data/models/reel_playback.dart';
import 'package:matinee/features/reels/data/reels_repository.dart';
import 'package:matinee/features/reels/domain/feed_reel.dart';
import 'package:matinee/features/reels/presentation/cubit/reels_feed_cubit.dart';
import 'package:matinee/features/reels/presentation/cubit/reels_feed_state.dart';
import 'package:mocktail/mocktail.dart';

class _MockReelsRepository extends Mock implements ReelsRepository {}

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

final Reel _free = _reel('free');
final Reel _exclusive = _reel('exclusive', isExclusive: true);

FeedReel _feed(Reel reel, {required bool isLocked}) =>
    FeedReel(reel: reel, source: ReelSource.hls(Uri.parse(reel.masterUri)), isLocked: isLocked);

void main() {
  group(ReelsFeedCubit, () {
    late ReelsRepository repository;

    setUp(() {
      repository = _MockReelsRepository();
    });

    ReelsFeedCubit build() => ReelsFeedCubit(repository);

    group('load', () {
      blocTest<ReelsFeedCubit, ReelsFeedState>(
        'emits [loading, success] carrying the ready feed and the points balance',
        setUp: () {
          when(
            repository.fetchFeed,
          ).thenAnswer((_) async => [_feed(_free, isLocked: false), _feed(_exclusive, isLocked: true)]);
          when(repository.fetchPointsBalance).thenAnswer((_) async => 540);
        },
        build: build,
        act: (cubit) => cubit.load(),
        expect: () => [
          const ReelsFeedState.loading(),
          ReelsFeedState.success([_feed(_free, isLocked: false), _feed(_exclusive, isLocked: true)], 540),
        ],
      );

      blocTest<ReelsFeedCubit, ReelsFeedState>(
        'emits [loading, failure] when the repository throws an $AppException',
        setUp: () {
          when(repository.fetchFeed).thenThrow(const NetworkException());
          when(repository.fetchPointsBalance).thenAnswer((_) async => 540);
        },
        build: build,
        act: (cubit) => cubit.load(),
        expect: () => const [ReelsFeedState.loading(), ReelsFeedState.failure(NetworkException())],
      );
    });

    group('unlock', () {
      late FeedReel loadedFree;

      blocTest<ReelsFeedCubit, ReelsFeedState>(
        'emits the feed with only that reel unlocked',
        setUp: () {
          loadedFree = _feed(_free, isLocked: false);
          when(repository.fetchFeed).thenAnswer((_) async => [loadedFree, _feed(_exclusive, isLocked: true)]);
          when(repository.fetchPointsBalance).thenAnswer((_) async => 540);
        },
        build: build,
        act: (cubit) async {
          await cubit.load();
          await cubit.unlock('exclusive');
        },
        skip: 2,
        expect: () => [
          ReelsFeedState.success([_feed(_free, isLocked: false), _feed(_exclusive, isLocked: false)], 540),
        ],
        verify: (cubit) {
          final feed = (cubit.state as ReelsFeedSuccess).feed;
          // The untouched element is the loaded object, so the feed skips it.
          expect(identical(feed.first, loadedFree), isTrue);
        },
      );

      blocTest<ReelsFeedCubit, ReelsFeedState>(
        'emits nothing for a reel that is not in the feed',
        setUp: () {
          when(repository.fetchFeed).thenAnswer((_) async => [_feed(_free, isLocked: false)]);
          when(repository.fetchPointsBalance).thenAnswer((_) async => 540);
        },
        build: build,
        act: (cubit) async {
          await cubit.load();
          await cubit.unlock('missing');
        },
        skip: 2,
        expect: () => const <ReelsFeedState>[],
      );

      blocTest<ReelsFeedCubit, ReelsFeedState>(
        'emits nothing before the feed has loaded',
        build: build,
        act: (cubit) => cubit.unlock('exclusive'),
        expect: () => const <ReelsFeedState>[],
      );
    });
  });
}
