import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/features/p2p/data/p2p_repository.dart';
import 'package:matinee/features/p2p/presentation/cubit/daily_streak_cubit.dart';
import 'package:matinee/features/p2p/presentation/cubit/daily_streak_state.dart';
import 'package:mocktail/mocktail.dart';

import '../p2p_fixtures.dart';

class _MockP2pRepository extends Mock implements P2pRepository {}

void main() {
  group(DailyStreakCubit, () {
    late _MockP2pRepository repository;

    setUp(() => repository = _MockP2pRepository());

    final notStarted = streakTiers.copyWith(hasStarted: false);

    group('load', () {
      blocTest<DailyStreakCubit, DailyStreakState>(
        'emits [loading, success] with the streak the repository returns',
        setUp: () => when(repository.fetchStreak).thenAnswer((_) async => streakTiers),
        build: () => DailyStreakCubit(repository),
        act: (cubit) => cubit.load(),
        expect: () => const [
          DailyStreakState.loading(),
          DailyStreakState.success(streakTiers),
        ],
      );

      blocTest<DailyStreakCubit, DailyStreakState>(
        'emits [loading, failure] when the repository throws an $AppException',
        setUp: () => when(repository.fetchStreak).thenThrow(const NetworkException()),
        build: () => DailyStreakCubit(repository),
        act: (cubit) => cubit.load(),
        expect: () => const [
          DailyStreakState.loading(),
          DailyStreakState.failure(NetworkException()),
        ],
      );
    });

    group('start', () {
      blocTest<DailyStreakCubit, DailyStreakState>(
        'holds the intro on screen while it works, then reports the streak started',
        setUp: () {
          when(repository.fetchStreak).thenAnswer((_) async => notStarted);
          when(repository.startStreak).thenAnswer((_) async => streakTiers);
        },
        build: () => DailyStreakCubit(repository),
        act: (cubit) async {
          await cubit.load();
          await cubit.start();
        },
        expect: () => [
          const DailyStreakState.loading(),
          DailyStreakState.success(notStarted),
          DailyStreakState.success(notStarted, isBusy: true),
          const DailyStreakState.success(streakTiers),
        ],
      );

      blocTest<DailyStreakCubit, DailyStreakState>(
        'keeps the intro and reports the failure beside it',
        setUp: () {
          when(repository.fetchStreak).thenAnswer((_) async => notStarted);
          when(repository.startStreak).thenThrow(const NetworkException());
        },
        build: () => DailyStreakCubit(repository),
        act: (cubit) async {
          await cubit.load();
          await cubit.start();
        },
        expect: () => [
          const DailyStreakState.loading(),
          DailyStreakState.success(notStarted),
          DailyStreakState.success(notStarted, isBusy: true),
          DailyStreakState.success(notStarted, actionError: const NetworkException()),
        ],
      );
    });

    group('completeToday', () {
      blocTest<DailyStreakCubit, DailyStreakState>(
        'holds the ladder on screen while the day is counted',
        setUp: () {
          when(repository.fetchStreak).thenAnswer((_) async => streakTiers);
          when(
            repository.completeTodaysSession,
          ).thenAnswer((_) async => streakTiers.copyWith(daysDoneThisWeek: 3));
        },
        build: () => DailyStreakCubit(repository),
        act: (cubit) async {
          await cubit.load();
          await cubit.completeToday();
        },
        expect: () => [
          const DailyStreakState.loading(),
          const DailyStreakState.success(streakTiers),
          const DailyStreakState.success(streakTiers, isBusy: true),
          DailyStreakState.success(streakTiers.copyWith(daysDoneThisWeek: 3)),
        ],
      );

      blocTest<DailyStreakCubit, DailyStreakState>(
        'keeps the ladder and reports the failure beside it',
        setUp: () {
          when(repository.fetchStreak).thenAnswer((_) async => streakTiers);
          when(repository.completeTodaysSession).thenThrow(const NetworkException());
        },
        build: () => DailyStreakCubit(repository),
        act: (cubit) async {
          await cubit.load();
          await cubit.completeToday();
        },
        expect: () => const [
          DailyStreakState.loading(),
          DailyStreakState.success(streakTiers),
          DailyStreakState.success(streakTiers, isBusy: true),
          DailyStreakState.success(streakTiers, actionError: NetworkException()),
        ],
      );
    });
  });
}
