import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/features/rewards/data/models/auction.dart';
import 'package:matinee/features/rewards/data/rewards_repository.dart';
import 'package:matinee/features/rewards/presentation/cubit/top_up_cubit.dart';
import 'package:matinee/features/rewards/presentation/cubit/top_up_state.dart';
import 'package:mocktail/mocktail.dart';

class _MockRewardsRepository extends Mock implements RewardsRepository {}

void main() {
  group(TopUpCubit, () {
    late _MockRewardsRepository repository;

    const small = PointsPack(id: 'pack-500', points: 500, priceLabel: '₹79');
    const large = PointsPack(id: 'pack-1500', points: 1500, priceLabel: '₹199');
    const packs = [small, large];

    setUpAll(() {
      registerFallbackValue(small);
    });

    setUp(() {
      repository = _MockRewardsRepository();
      when(repository.fetchPointsPacks).thenAnswer((_) async => packs);
    });

    group('load', () {
      blocTest<TopUpCubit, TopUpState>(
        'emits [loading, success] selecting the first pack',
        build: () => TopUpCubit(repository),
        act: (cubit) => cubit.load(),
        expect: () => const [
          TopUpState.loading(),
          TopUpState.success(TopUpData(packs: packs, selected: small)),
        ],
      );

      blocTest<TopUpCubit, TopUpState>(
        'emits [loading, failure] when the repository throws an $AppException',
        setUp: () => when(repository.fetchPointsPacks).thenThrow(const NetworkException()),
        build: () => TopUpCubit(repository),
        act: (cubit) => cubit.load(),
        expect: () => const [TopUpState.loading(), TopUpState.failure(NetworkException())],
      );
    });

    group('selectPack', () {
      blocTest<TopUpCubit, TopUpState>(
        'swaps the selection without a loading state in between',
        build: () => TopUpCubit(repository),
        act: (cubit) async {
          await cubit.load();
          await cubit.selectPack(large);
        },
        skip: 2,
        expect: () => const [TopUpState.success(TopUpData(packs: packs, selected: large))],
      );

      blocTest<TopUpCubit, TopUpState>(
        'emits nothing before the packs have loaded',
        build: () => TopUpCubit(repository),
        act: (cubit) => cubit.selectPack(large),
        expect: () => const <TopUpState>[],
      );
    });

    group('purchase', () {
      blocTest<TopUpCubit, TopUpState>(
        'emits [loading, success] with the points it credited',
        setUp: () => when(() => repository.purchasePointsPack(any())).thenAnswer((_) async => 7582),
        build: () => TopUpCubit(repository),
        act: (cubit) async {
          await cubit.load();
          await cubit.purchase();
        },
        skip: 2,
        expect: () => const [
          TopUpState.loading(),
          TopUpState.success(TopUpData(packs: packs, selected: small, purchased: true)),
        ],
        verify: (_) => verify(() => repository.purchasePointsPack(small)).called(1),
      );

      blocTest<TopUpCubit, TopUpState>(
        'emits [loading, failure] when the repository throws an $AppException',
        setUp: () => when(() => repository.purchasePointsPack(any())).thenThrow(const ServerException(500)),
        build: () => TopUpCubit(repository),
        act: (cubit) async {
          await cubit.load();
          await cubit.purchase();
        },
        skip: 2,
        expect: () => const [TopUpState.loading(), TopUpState.failure(ServerException(500))],
      );
    });
  });
}
