import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/features/earns/data/earns_repository.dart';
import 'package:matinee/features/earns/data/models/earn_source.dart';
import 'package:matinee/features/earns/presentation/cubit/earn_detail_cubit.dart';
import 'package:matinee/features/earns/presentation/cubit/earn_detail_state.dart';
import 'package:mocktail/mocktail.dart';

import '../earn_detail_fixtures.dart' as fixtures;

class _MockEarnsRepository extends Mock implements EarnsRepository {}

void main() {
  group(EarnDetailCubit, () {
    late _MockEarnsRepository repository;

    setUpAll(() => registerFallbackValue(EarnSourceKind.dailyStreaks));

    setUp(() => repository = _MockEarnsRepository());

    group('load', () {
      blocTest<EarnDetailCubit, EarnDetailState>(
        'emits [loading, success] with the history the repository returns',
        setUp: () => when(() => repository.fetchDetail(any())).thenAnswer((_) async => fixtures.streaks),
        build: () => EarnDetailCubit(repository, EarnSourceKind.dailyStreaks),
        act: (cubit) => cubit.load(),
        expect: () => [const EarnDetailState.loading(), EarnDetailState.success(fixtures.streaks)],
      );

      blocTest<EarnDetailCubit, EarnDetailState>(
        'emits [loading, failure] when the repository throws an $AppException',
        setUp: () => when(() => repository.fetchDetail(any())).thenThrow(const NetworkException()),
        build: () => EarnDetailCubit(repository, EarnSourceKind.auctionWins),
        act: (cubit) => cubit.load(),
        expect: () => const [EarnDetailState.loading(), EarnDetailState.failure(NetworkException())],
      );

      for (final kind in EarnSourceKind.values) {
        blocTest<EarnDetailCubit, EarnDetailState>(
          'asks the repository for $kind, the source the screen was opened on',
          setUp: () => when(() => repository.fetchDetail(any())).thenAnswer((_) async => fixtures.auction),
          build: () => EarnDetailCubit(repository, kind),
          act: (cubit) => cubit.load(),
          verify: (_) => verify(() => repository.fetchDetail(kind)).called(1),
        );
      }
    });
  });
}
