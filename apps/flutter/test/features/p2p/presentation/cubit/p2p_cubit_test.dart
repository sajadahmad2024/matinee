import 'dart:async';

import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/features/p2p/data/p2p_repository.dart';
import 'package:matinee/features/p2p/presentation/cubit/p2p_cubit.dart';
import 'package:matinee/features/p2p/presentation/cubit/p2p_state.dart';
import 'package:mocktail/mocktail.dart';

import '../p2p_fixtures.dart';

class _MockP2pRepository extends Mock implements P2pRepository {}

void main() {
  group(P2pCubit, () {
    late _MockP2pRepository repository;
    late StreamController<int> points;

    setUp(() {
      repository = _MockP2pRepository();
      points = StreamController<int>.broadcast();
      when(() => repository.pointsChanges).thenAnswer((_) => points.stream);
    });

    tearDown(() => points.close());

    group('load', () {
      blocTest<P2pCubit, P2pState>(
        'emits [loading, success] with the overview the repository returns',
        setUp: () => when(repository.fetchOverview).thenAnswer((_) async => overview),
        build: () => P2pCubit(repository),
        act: (cubit) => cubit.load(),
        expect: () => const [P2pState.loading(), P2pState.success(overview)],
      );

      blocTest<P2pCubit, P2pState>(
        'emits [loading, failure] when the repository throws an $AppException',
        setUp: () => when(repository.fetchOverview).thenThrow(const NetworkException()),
        build: () => P2pCubit(repository),
        act: (cubit) => cubit.load(),
        expect: () => const [P2pState.loading(), P2pState.failure(NetworkException())],
      );
    });

    group('points changes', () {
      blocTest<P2pCubit, P2pState>(
        're-reads the overview when the balance moves, because the standing is derived',
        setUp: () {
          // Two answers, not one: an identical state is dropped by the cubit,
          // so the refetch is only visible if the figures actually moved.
          var calls = 0;
          when(repository.fetchOverview).thenAnswer(
            (_) async => calls++ == 0 ? overview : creditedOverview,
          );
        },
        build: () => P2pCubit(repository),
        act: (cubit) async {
          await cubit.load();
          points.add(7582);
          await Future<void>.delayed(Duration.zero);
        },
        expect: () => [
          const P2pState.loading(),
          const P2pState.success(overview),
          P2pState.success(creditedOverview),
        ],
        verify: (_) => verify(repository.fetchOverview).called(2),
      );

      blocTest<P2pCubit, P2pState>(
        'leaves the figures on screen when the background re-fetch fails',
        setUp: () {
          var calls = 0;
          when(repository.fetchOverview).thenAnswer((_) async {
            if (calls++ == 0) {
              return overview;
            }
            throw const NetworkException();
          });
        },
        build: () => P2pCubit(repository),
        act: (cubit) async {
          await cubit.load();
          points.add(7582);
          await Future<void>.delayed(Duration.zero);
        },
        expect: () => const [P2pState.loading(), P2pState.success(overview)],
      );

      blocTest<P2pCubit, P2pState>(
        'ignores the balance before the tab has loaded, so nothing is fetched twice',
        setUp: () => when(repository.fetchOverview).thenAnswer((_) async => overview),
        build: () => P2pCubit(repository),
        act: (cubit) async {
          points.add(7582);
          await Future<void>.delayed(Duration.zero);
        },
        expect: () => const <P2pState>[],
        verify: (_) => verifyNever(repository.fetchOverview),
      );
    });
  });
}
