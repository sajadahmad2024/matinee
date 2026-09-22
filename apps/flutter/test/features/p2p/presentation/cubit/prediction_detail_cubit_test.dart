import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/features/p2p/data/models/prediction.dart';
import 'package:matinee/features/p2p/data/p2p_repository.dart';
import 'package:matinee/features/p2p/presentation/cubit/prediction_detail_cubit.dart';
import 'package:matinee/features/p2p/presentation/cubit/prediction_detail_state.dart';
import 'package:mocktail/mocktail.dart';

import '../p2p_fixtures.dart';

class _MockP2pRepository extends Mock implements P2pRepository {}

void main() {
  group(PredictionDetailCubit, () {
    late _MockP2pRepository repository;

    setUpAll(() => registerFallbackValue(PredictionSide.yes));

    setUp(() => repository = _MockP2pRepository());

    PredictionDetailCubit build() => PredictionDetailCubit(repository, openPrediction.id);

    final voted = openPrediction.copyWith(vote: PredictionSide.yes, turnoutPercent: 81);

    group('load', () {
      blocTest<PredictionDetailCubit, PredictionDetailState>(
        'emits [loading, success] with the prediction the repository returns',
        setUp: () => when(() => repository.fetchPrediction(any())).thenAnswer((_) async => openPrediction),
        build: build,
        act: (cubit) => cubit.load(),
        expect: () => const [
          PredictionDetailState.loading(),
          PredictionDetailState.success(openPrediction),
        ],
      );

      blocTest<PredictionDetailCubit, PredictionDetailState>(
        'takes a vote already cast as the selection, so returning shows the choice',
        setUp: () => when(
          () => repository.fetchPrediction(any()),
        ).thenAnswer((_) async => resolvedPrediction),
        build: build,
        act: (cubit) => cubit.load(),
        expect: () => const [
          PredictionDetailState.loading(),
          PredictionDetailState.success(resolvedPrediction, selection: PredictionSide.yes),
        ],
      );

      blocTest<PredictionDetailCubit, PredictionDetailState>(
        'emits [loading, failure] when the repository throws an $AppException',
        setUp: () => when(() => repository.fetchPrediction(any())).thenThrow(const NotFoundException()),
        build: build,
        act: (cubit) => cubit.load(),
        expect: () => const [
          PredictionDetailState.loading(),
          PredictionDetailState.failure(NotFoundException()),
        ],
      );
    });

    group('select', () {
      blocTest<PredictionDetailCubit, PredictionDetailState>(
        'keeps the pick local, so nothing is sent until it is submitted',
        setUp: () => when(() => repository.fetchPrediction(any())).thenAnswer((_) async => openPrediction),
        build: build,
        act: (cubit) async {
          await cubit.load();
          cubit.select(PredictionSide.no);
        },
        expect: () => const [
          PredictionDetailState.loading(),
          PredictionDetailState.success(openPrediction),
          PredictionDetailState.success(openPrediction, selection: PredictionSide.no),
        ],
        verify: (_) => verifyNever(() => repository.castVote(any(), any())),
      );
    });

    group('submit', () {
      blocTest<PredictionDetailCubit, PredictionDetailState>(
        'sends the picked side and folds the vote into the split',
        setUp: () {
          when(
            () => repository.fetchPrediction(any()),
          ).thenAnswer((_) async => openPrediction);
          when(() => repository.castVote(any(), any())).thenAnswer((_) async => voted);
        },
        build: build,
        act: (cubit) async {
          await cubit.load();
          cubit.select(PredictionSide.yes);
          await cubit.submit();
        },
        expect: () => [
          const PredictionDetailState.loading(),
          const PredictionDetailState.success(openPrediction),
          const PredictionDetailState.success(openPrediction, selection: PredictionSide.yes),
          const PredictionDetailState.success(
            openPrediction,
            selection: PredictionSide.yes,
            isSubmitting: true,
          ),
          PredictionDetailState.success(voted, selection: PredictionSide.yes),
        ],
        verify: (_) => verify(() => repository.castVote(openPrediction.id, PredictionSide.yes)),
      );

      blocTest<PredictionDetailCubit, PredictionDetailState>(
        'keeps the prediction and the pick, and reports the failure beside them',
        setUp: () {
          when(
            () => repository.fetchPrediction(any()),
          ).thenAnswer((_) async => openPrediction);
          when(() => repository.castVote(any(), any())).thenThrow(const ValidationException(409));
        },
        build: build,
        act: (cubit) async {
          await cubit.load();
          cubit.select(PredictionSide.yes);
          await cubit.submit();
        },
        expect: () => const [
          PredictionDetailState.loading(),
          PredictionDetailState.success(openPrediction),
          PredictionDetailState.success(openPrediction, selection: PredictionSide.yes),
          PredictionDetailState.success(
            openPrediction,
            selection: PredictionSide.yes,
            isSubmitting: true,
          ),
          PredictionDetailState.success(
            openPrediction,
            selection: PredictionSide.yes,
            actionError: ValidationException(409),
          ),
        ],
      );

      blocTest<PredictionDetailCubit, PredictionDetailState>(
        'does nothing with no side picked, because there is no vote to send',
        setUp: () => when(() => repository.fetchPrediction(any())).thenAnswer((_) async => openPrediction),
        build: build,
        act: (cubit) async {
          await cubit.load();
          await cubit.submit();
        },
        expect: () => const [
          PredictionDetailState.loading(),
          PredictionDetailState.success(openPrediction),
        ],
        verify: (_) => verifyNever(() => repository.castVote(any(), any())),
      );
    });
  });
}
