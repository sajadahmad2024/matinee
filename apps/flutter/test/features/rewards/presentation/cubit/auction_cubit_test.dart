import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/features/rewards/data/models/auction.dart';
import 'package:matinee/features/rewards/data/rewards_repository.dart';
import 'package:matinee/features/rewards/presentation/cubit/auction_cubit.dart';
import 'package:matinee/features/rewards/presentation/cubit/auction_state.dart';
import 'package:mocktail/mocktail.dart';

class _MockRewardsRepository extends Mock implements RewardsRepository {}

void main() {
  group(AuctionCubit, () {
    late _MockRewardsRepository repository;

    final board = AuctionBoard(
      pointsBalance: 540,
      auction: Auction(
        id: 'auction-1',
        title: 'Exclusive Premiere Pass',
        description: 'A gala pass.',
        imageAsset: 'assets/images/auction-hero.jpg',
        currentBid: 10500,
        minimumIncrement: 100,
        watching: 1204,
        endsAt: DateTime.utc(2026, 9, 9, 12),
        bids: const [],
        quickIncrements: const [500],
      ),
    );

    setUp(() {
      repository = _MockRewardsRepository();
    });

    group('load', () {
      blocTest<AuctionCubit, AuctionState>(
        'emits [loading, success] with the lot and the balance',
        setUp: () => when(repository.fetchAuctionBoard).thenAnswer((_) async => board),
        build: () => AuctionCubit(repository),
        act: (cubit) => cubit.load(),
        expect: () => [const AuctionState.loading(), AuctionState.success(board)],
      );

      blocTest<AuctionCubit, AuctionState>(
        'emits [loading, failure] when the repository throws an $AppException',
        setUp: () => when(repository.fetchAuctionBoard).thenThrow(const NetworkException()),
        build: () => AuctionCubit(repository),
        act: (cubit) => cubit.load(),
        expect: () => const [AuctionState.loading(), AuctionState.failure(NetworkException())],
      );
    });

    group('placeBid', () {
      blocTest<AuctionCubit, AuctionState>(
        'emits [loading, success] with the board the bid produced',
        setUp: () => when(() => repository.placeBid(any())).thenAnswer((_) async => board),
        build: () => AuctionCubit(repository),
        act: (cubit) => cubit.placeBid(11000),
        expect: () => [const AuctionState.loading(), AuctionState.success(board)],
        verify: (_) => verify(() => repository.placeBid(11000)).called(1),
      );

      blocTest<AuctionCubit, AuctionState>(
        'emits [loading, failure] when the repository throws an $AppException',
        setUp: () => when(() => repository.placeBid(any())).thenThrow(const ServerException(500)),
        build: () => AuctionCubit(repository),
        act: (cubit) => cubit.placeBid(11000),
        expect: () => const [AuctionState.loading(), AuctionState.failure(ServerException(500))],
      );
    });
  });
}
