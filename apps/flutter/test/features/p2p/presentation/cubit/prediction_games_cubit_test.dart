import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/features/p2p/data/p2p_repository.dart';
import 'package:matinee/features/p2p/presentation/cubit/prediction_games_cubit.dart';
import 'package:matinee/features/p2p/presentation/cubit/prediction_games_state.dart';
import 'package:mocktail/mocktail.dart';

import '../p2p_fixtures.dart';

class _MockP2pRepository extends Mock implements P2pRepository {}

void main() {
  group(PredictionGamesCubit, () {
    late _MockP2pRepository repository;

    setUp(() => repository = _MockP2pRepository());

    group('load', () {
      blocTest<PredictionGamesCubit, PredictionGamesState>(
        'emits [loading, success] with the predictions the repository returns',
        setUp: () => when(
          repository.fetchPredictions,
        ).thenAnswer((_) async => [openPrediction, resolvedPrediction]),
        build: () => PredictionGamesCubit(repository),
        act: (cubit) => cubit.load(),
        expect: () => const [
          PredictionGamesState.loading(),
          PredictionGamesState.success([openPrediction, resolvedPrediction]),
        ],
      );

      blocTest<PredictionGamesCubit, PredictionGamesState>(
        'emits [loading, failure] when the repository throws an $AppException',
        setUp: () => when(repository.fetchPredictions).thenThrow(const NetworkException()),
        build: () => PredictionGamesCubit(repository),
        act: (cubit) => cubit.load(),
        expect: () => const [
          PredictionGamesState.loading(),
          PredictionGamesState.failure(NetworkException()),
        ],
      );
    });

    group('refresh', () {
      blocTest<PredictionGamesCubit, PredictionGamesState>(
        're-reads the predictions without blanking the list',
        setUp: () {
          var calls = 0;
          when(repository.fetchPredictions).thenAnswer(
            (_) async => calls++ == 0 ? [openPrediction] : [resolvedPrediction],
          );
        },
        build: () => PredictionGamesCubit(repository),
        act: (cubit) async {
          await cubit.load();
          await cubit.refresh();
        },
        expect: () => const [
          PredictionGamesState.loading(),
          PredictionGamesState.success([openPrediction]),
          PredictionGamesState.success([resolvedPrediction]),
        ],
      );

      blocTest<PredictionGamesCubit, PredictionGamesState>(
        'leaves the list on screen when the re-read fails',
        setUp: () {
          var calls = 0;
          when(repository.fetchPredictions).thenAnswer((_) async {
            if (calls++ == 0) {
              return [openPrediction];
            }
            throw const NetworkException();
          });
        },
        build: () => PredictionGamesCubit(repository),
        act: (cubit) async {
          await cubit.load();
          await cubit.refresh();
        },
        expect: () => const [
          PredictionGamesState.loading(),
          PredictionGamesState.success([openPrediction]),
        ],
      );
    });

    group('activeCount', () {
      test('counts only the predictions still open, which is what the badge says', () {
        const state = PredictionGamesSuccess([openPrediction, resolvedPrediction]);
        expect(state.activeCount, 1);
      });
    });
  });
}
