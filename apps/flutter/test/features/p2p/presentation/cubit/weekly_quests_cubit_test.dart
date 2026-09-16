import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/features/p2p/data/p2p_repository.dart';
import 'package:matinee/features/p2p/presentation/cubit/weekly_quests_cubit.dart';
import 'package:matinee/features/p2p/presentation/cubit/weekly_quests_state.dart';
import 'package:mocktail/mocktail.dart';

import '../p2p_fixtures.dart';

class _MockP2pRepository extends Mock implements P2pRepository {}

void main() {
  group(WeeklyQuestsCubit, () {
    late _MockP2pRepository repository;

    setUp(() => repository = _MockP2pRepository());

    group('load', () {
      blocTest<WeeklyQuestsCubit, WeeklyQuestsState>(
        'emits [loading, success] with the quests the repository returns',
        setUp: () => when(repository.fetchQuests).thenAnswer((_) async => [runningQuest]),
        build: () => WeeklyQuestsCubit(repository),
        act: (cubit) => cubit.load(),
        expect: () => [
          const WeeklyQuestsState.loading(),
          const WeeklyQuestsState.success([runningQuest]),
        ],
      );

      blocTest<WeeklyQuestsCubit, WeeklyQuestsState>(
        'emits [loading, failure] when the repository throws an $AppException',
        setUp: () => when(repository.fetchQuests).thenThrow(const NetworkException()),
        build: () => WeeklyQuestsCubit(repository),
        act: (cubit) => cubit.load(),
        expect: () => const [
          WeeklyQuestsState.loading(),
          WeeklyQuestsState.failure(NetworkException()),
        ],
      );
    });

    group('refresh', () {
      blocTest<WeeklyQuestsCubit, WeeklyQuestsState>(
        're-reads the quests without blanking the list',
        setUp: () {
          var calls = 0;
          when(repository.fetchQuests).thenAnswer(
            (_) async => calls++ == 0 ? [runningQuest] : [claimedQuest],
          );
        },
        build: () => WeeklyQuestsCubit(repository),
        act: (cubit) async {
          await cubit.load();
          await cubit.refresh();
        },
        expect: () => [
          const WeeklyQuestsState.loading(),
          const WeeklyQuestsState.success([runningQuest]),
          WeeklyQuestsState.success([claimedQuest]),
        ],
      );

      blocTest<WeeklyQuestsCubit, WeeklyQuestsState>(
        'leaves the list on screen when the re-read fails',
        setUp: () {
          var calls = 0;
          when(repository.fetchQuests).thenAnswer((_) async {
            if (calls++ == 0) {
              return [runningQuest];
            }
            throw const NetworkException();
          });
        },
        build: () => WeeklyQuestsCubit(repository),
        act: (cubit) async {
          await cubit.load();
          await cubit.refresh();
        },
        expect: () => const [
          WeeklyQuestsState.loading(),
          WeeklyQuestsState.success([runningQuest]),
        ],
      );

      blocTest<WeeklyQuestsCubit, WeeklyQuestsState>(
        'does nothing before the list has loaded',
        build: () => WeeklyQuestsCubit(repository),
        act: (cubit) => cubit.refresh(),
        expect: () => const <WeeklyQuestsState>[],
        verify: (_) => verifyNever(repository.fetchQuests),
      );
    });

    group('featured', () {
      test('picks the running quest and leaves it out of the list under it', () {
        final state = WeeklyQuestsSuccess([runningQuest, claimedQuest]);
        expect(state.featured, runningQuest);
        expect(state.rest, [claimedQuest]);
      });

      test('is null when nothing is running, so the hero is not drawn empty', () {
        final state = WeeklyQuestsSuccess([claimedQuest]);
        expect(state.featured, isNull);
        expect(state.rest, [claimedQuest]);
      });
    });
  });
}
