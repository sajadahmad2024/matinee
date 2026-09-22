import 'dart:async';

import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/features/rewards/data/models/rewards_summary.dart';
import 'package:matinee/features/rewards/data/rewards_repository.dart';
import 'package:matinee/features/rewards/presentation/cubit/rewards_cubit.dart';
import 'package:matinee/features/rewards/presentation/cubit/rewards_state.dart';
import 'package:mocktail/mocktail.dart';

class _MockRewardsRepository extends Mock implements RewardsRepository {}

void main() {
  group(RewardsCubit, () {
    late _MockRewardsRepository repository;

    const summary = RewardsSummary(
      totalPoints: 7082,
      badgeName: 'Expert',
      pointsToNextBadge: 918,
      nextBadgeName: 'Loyalist',
      destinations: [],
    );

    setUp(() {
      repository = _MockRewardsRepository();
      when(() => repository.pointsChanges).thenAnswer((_) => const Stream<int>.empty());
    });

    group('pointsChanges', () {
      late StreamController<int> points;

      setUp(() {
        points = StreamController<int>.broadcast();
        when(() => repository.pointsChanges).thenAnswer((_) => points.stream);
        addTearDown(points.close);
      });

      blocTest<RewardsCubit, RewardsState>(
        'corrects the loaded balance when points are spent elsewhere',
        setUp: () => when(repository.fetchSummary).thenAnswer((_) async => summary),
        build: () => RewardsCubit(repository),
        act: (cubit) async {
          await cubit.load();
          points.add(6582);
        },
        skip: 2,
        expect: () => [RewardsState.success(summary.copyWith(totalPoints: 6582))],
      );

      blocTest<RewardsCubit, RewardsState>(
        'emits nothing before a summary has loaded',
        build: () => RewardsCubit(repository),
        act: (_) async => points.add(6582),
        expect: () => const <RewardsState>[],
      );
    });

    group('load', () {
      blocTest<RewardsCubit, RewardsState>(
        'emits [loading, success] with the summary',
        setUp: () => when(repository.fetchSummary).thenAnswer((_) async => summary),
        build: () => RewardsCubit(repository),
        act: (cubit) => cubit.load(),
        expect: () => const [RewardsState.loading(), RewardsState.success(summary)],
      );

      blocTest<RewardsCubit, RewardsState>(
        'emits [loading, failure] when the repository throws an $AppException',
        setUp: () => when(repository.fetchSummary).thenThrow(const NetworkException()),
        build: () => RewardsCubit(repository),
        act: (cubit) => cubit.load(),
        expect: () => const [RewardsState.loading(), RewardsState.failure(NetworkException())],
      );
    });
  });
}
