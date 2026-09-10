import 'dart:async';

import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/features/earns/data/earns_repository.dart';
import 'package:matinee/features/earns/data/models/earn_source.dart';
import 'package:matinee/features/earns/data/models/earned_badge.dart';
import 'package:matinee/features/earns/data/models/earns_overview.dart';
import 'package:matinee/features/earns/presentation/cubit/earns_cubit.dart';
import 'package:matinee/features/earns/presentation/cubit/earns_state.dart';
import 'package:matinee/shared/points/data/models/points_standing.dart';
import 'package:matinee/shared/points/data/points_repository.dart';
import 'package:mocktail/mocktail.dart';

class _MockEarnsRepository extends Mock implements EarnsRepository {}

class _MockPointsRepository extends Mock implements PointsRepository {}

void main() {
  group(EarnsCubit, () {
    late _MockEarnsRepository repository;
    late _MockPointsRepository points;

    const standing = PointsStanding(
      totalPoints: 7082,
      badgeName: 'Expert',
      pointsToNextBadge: 918,
      nextBadgeName: 'Cinematic Loyalist',
      progressToNextBadge: 0.694,
    );

    const overview = EarnsOverview(
      standing: standing,
      sources: [
        EarnSource(
          kind: EarnSourceKind.dailyStreaks,
          title: 'Daily Streaks',
          activity: '+120 today',
          points: 2691,
        ),
      ],
      badges: [
        EarnedBadge(
          id: 'expert',
          name: 'Expert',
          requirement: '5,000–7,999 pts',
          status: BadgeStatus.current,
        ),
      ],
    );

    setUp(() {
      repository = _MockEarnsRepository();
      points = _MockPointsRepository();
      when(() => points.pointsChanges).thenAnswer((_) => const Stream<int>.empty());
    });

    group('load', () {
      blocTest<EarnsCubit, EarnsState>(
        'emits [loading, success] with the overview the repository returns',
        setUp: () => when(repository.fetchOverview).thenAnswer((_) async => overview),
        build: () => EarnsCubit(repository, points),
        act: (cubit) => cubit.load(),
        expect: () => const [EarnsState.loading(), EarnsState.success(overview)],
      );

      blocTest<EarnsCubit, EarnsState>(
        'emits [loading, failure] when the repository throws an $AppException',
        setUp: () => when(repository.fetchOverview).thenThrow(const NetworkException()),
        build: () => EarnsCubit(repository, points),
        act: (cubit) => cubit.load(),
        expect: () => const [EarnsState.loading(), EarnsState.failure(NetworkException())],
      );
    });

    group('pointsChanges', () {
      late StreamController<int> balance;

      setUp(() {
        balance = StreamController<int>.broadcast();
        when(() => points.pointsChanges).thenAnswer((_) => balance.stream);
        addTearDown(balance.close);
      });

      blocTest<EarnsCubit, EarnsState>(
        'refetches when points are spent elsewhere, because every share is read off the balance',
        setUp: () => when(repository.fetchOverview).thenAnswer((_) async => overview),
        build: () => EarnsCubit(repository, points),
        act: (cubit) async {
          await cubit.load();
          balance.add(6582);
        },
        skip: 2,
        expect: () => const [EarnsState.loading(), EarnsState.success(overview)],
        verify: (_) => verify(repository.fetchOverview).called(2),
      );

      blocTest<EarnsCubit, EarnsState>(
        'emits nothing when the balance is unchanged, so a spend elsewhere costs one fetch',
        setUp: () => when(repository.fetchOverview).thenAnswer((_) async => overview),
        build: () => EarnsCubit(repository, points),
        act: (cubit) async {
          await cubit.load();
          balance.add(standing.totalPoints);
        },
        skip: 2,
        expect: () => const <EarnsState>[],
      );

      blocTest<EarnsCubit, EarnsState>(
        'emits nothing before an overview has loaded',
        build: () => EarnsCubit(repository, points),
        act: (_) async => balance.add(6582),
        expect: () => const <EarnsState>[],
      );
    });
  });
}
