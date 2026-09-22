import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/features/p2p/data/p2p_repository.dart';
import 'package:matinee/features/p2p/presentation/cubit/quest_progress_cubit.dart';
import 'package:matinee/features/p2p/presentation/cubit/quest_progress_state.dart';
import 'package:mocktail/mocktail.dart';

import '../p2p_fixtures.dart';

class _MockP2pRepository extends Mock implements P2pRepository {}

void main() {
  group(QuestProgressCubit, () {
    late _MockP2pRepository repository;

    setUp(() => repository = _MockP2pRepository());

    QuestProgressCubit build() => QuestProgressCubit(repository, runningQuest.id);

    group('load', () {
      blocTest<QuestProgressCubit, QuestProgressState>(
        'emits [loading, success] with the quest the repository returns',
        setUp: () => when(() => repository.fetchQuest(any())).thenAnswer((_) async => runningQuest),
        build: build,
        act: (cubit) => cubit.load(),
        expect: () => const [
          QuestProgressState.loading(),
          QuestProgressState.success(runningQuest),
        ],
      );

      blocTest<QuestProgressCubit, QuestProgressState>(
        'emits [loading, failure] when the repository throws an $AppException',
        setUp: () => when(() => repository.fetchQuest(any())).thenThrow(const NetworkException()),
        build: build,
        act: (cubit) => cubit.load(),
        expect: () => const [
          QuestProgressState.loading(),
          QuestProgressState.failure(NetworkException()),
        ],
      );
    });

    group('claim', () {
      blocTest<QuestProgressCubit, QuestProgressState>(
        'holds the tracker on screen while the reward is paid, then reports it claimed',
        setUp: () {
          when(() => repository.fetchQuest(any())).thenAnswer((_) async => runningQuest);
          when(() => repository.claimQuest(any())).thenAnswer((_) async => claimedQuest);
        },
        build: build,
        act: (cubit) async {
          await cubit.load();
          await cubit.claim();
        },
        expect: () => [
          const QuestProgressState.loading(),
          const QuestProgressState.success(runningQuest),
          const QuestProgressState.success(runningQuest, isClaiming: true),
          QuestProgressState.success(claimedQuest),
        ],
      );

      blocTest<QuestProgressCubit, QuestProgressState>(
        'keeps the tracker and reports the failure beside it',
        setUp: () {
          when(() => repository.fetchQuest(any())).thenAnswer((_) async => runningQuest);
          when(() => repository.claimQuest(any())).thenThrow(const ValidationException(409));
        },
        build: build,
        act: (cubit) async {
          await cubit.load();
          await cubit.claim();
        },
        expect: () => const [
          QuestProgressState.loading(),
          QuestProgressState.success(runningQuest),
          QuestProgressState.success(runningQuest, isClaiming: true),
          QuestProgressState.success(runningQuest, actionError: ValidationException(409)),
        ],
      );

      blocTest<QuestProgressCubit, QuestProgressState>(
        'does nothing before the quest has loaded, so there is nothing to pay for',
        build: build,
        act: (cubit) => cubit.claim(),
        expect: () => const <QuestProgressState>[],
        verify: (_) => verifyNever(() => repository.claimQuest(any())),
      );
    });

    group('watch', () {
      blocTest<QuestProgressCubit, QuestProgressState>(
        'emits the quest the repository returns with the item counted',
        setUp: () {
          when(() => repository.fetchQuest(any())).thenAnswer((_) async => runningQuest);
          when(
            () => repository.watchCuratedItem(any(), any(), any()),
          ).thenAnswer((_) async => claimedQuest);
        },
        build: build,
        act: (cubit) async {
          await cubit.load();
          await cubit.watch('watch', 'silent-storm');
        },
        expect: () => [
          const QuestProgressState.loading(),
          const QuestProgressState.success(runningQuest),
          QuestProgressState.success(claimedQuest),
        ],
      );

      blocTest<QuestProgressCubit, QuestProgressState>(
        'keeps the quest and reports the failure beside it',
        setUp: () {
          when(() => repository.fetchQuest(any())).thenAnswer((_) async => runningQuest);
          when(
            () => repository.watchCuratedItem(any(), any(), any()),
          ).thenThrow(const NetworkException());
        },
        build: build,
        act: (cubit) async {
          await cubit.load();
          await cubit.watch('watch', 'silent-storm');
        },
        expect: () => const [
          QuestProgressState.loading(),
          QuestProgressState.success(runningQuest),
          QuestProgressState.success(runningQuest, actionError: NetworkException()),
        ],
      );
    });
  });
}
