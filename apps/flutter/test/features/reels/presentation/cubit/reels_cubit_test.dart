import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/features/reels/data/models/reel.dart';
import 'package:matinee/features/reels/data/models/reel_playback.dart';
import 'package:matinee/features/reels/data/reels_repository.dart';
import 'package:matinee/features/reels/presentation/cubit/reels_cubit.dart';
import 'package:matinee/features/reels/presentation/cubit/reels_state.dart';
import 'package:mocktail/mocktail.dart';

class _MockReelsRepository extends Mock implements ReelsRepository {}

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
  genres: ['Thriller'],
);

void main() {
  group(ReelsCubit, () {
    late ReelsRepository repository;

    setUp(() {
      repository = _MockReelsRepository();
    });

    ReelsCubit build() => ReelsCubit(repository);

    group('load', () {
      blocTest<ReelsCubit, ReelsState>(
        'emits [loading, success] carrying the feed and the points balance',
        setUp: () {
          when(repository.fetchReelsFeed).thenAnswer((_) async => [_reel]);
          when(repository.fetchPointsBalance).thenAnswer((_) async => 540);
        },
        build: build,
        act: (cubit) => cubit.load(),
        expect: () => const [
          ReelsState.loading(),
          ReelsState.success([_reel], 540),
        ],
      );

      blocTest<ReelsCubit, ReelsState>(
        'emits [loading, failure] when the repository throws an $AppException',
        setUp: () {
          when(repository.fetchReelsFeed).thenThrow(const NetworkException());
          when(repository.fetchPointsBalance).thenAnswer((_) async => 540);
        },
        build: build,
        act: (cubit) => cubit.load(),
        expect: () => const [ReelsState.loading(), ReelsState.failure(NetworkException())],
      );
    });
  });
}
