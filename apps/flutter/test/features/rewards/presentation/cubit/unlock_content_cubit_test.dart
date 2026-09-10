import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/features/rewards/data/models/exclusive_content.dart';
import 'package:matinee/features/rewards/data/rewards_repository.dart';
import 'package:matinee/features/rewards/presentation/cubit/unlock_content_cubit.dart';
import 'package:matinee/features/rewards/presentation/cubit/unlock_content_state.dart';
import 'package:mocktail/mocktail.dart';

class _MockRewardsRepository extends Mock implements RewardsRepository {}

void main() {
  group(UnlockContentCubit, () {
    late _MockRewardsRepository repository;

    const itemId = 'ex-2';
    const locked = ExclusiveItem(
      id: itemId,
      title: 'BTS Video',
      category: 'Horror',
      unlockCost: 500,
      preview: 'Behind the scenes.',
      castAndCrew: 'Christopher Nolan',
      imageAsset: 'assets/images/exclusive-1.jpg',
    );
    const unlocked = ExclusiveItem(
      id: itemId,
      title: 'BTS Video',
      category: 'Horror',
      unlockCost: 500,
      preview: 'Behind the scenes.',
      castAndCrew: 'Christopher Nolan',
      imageAsset: 'assets/images/exclusive-1.jpg',
      isUnlocked: true,
    );

    setUp(() {
      repository = _MockRewardsRepository();
    });

    group('load', () {
      blocTest<UnlockContentCubit, UnlockContentState>(
        'emits [loading, success] with the locked item',
        setUp: () => when(() => repository.fetchItem(itemId)).thenAnswer((_) async => locked),
        build: () => UnlockContentCubit(repository, itemId),
        act: (cubit) => cubit.load(),
        expect: () => const [
          UnlockContentState.loading(),
          UnlockContentState.success(locked),
        ],
      );

      blocTest<UnlockContentCubit, UnlockContentState>(
        'leaves an already-open item unmarked, so it does not read as a fresh unlock',
        setUp: () => when(() => repository.fetchItem(itemId)).thenAnswer((_) async => unlocked),
        build: () => UnlockContentCubit(repository, itemId),
        act: (cubit) => cubit.load(),
        expect: () => const [
          UnlockContentState.loading(),
          UnlockContentState.success(unlocked),
        ],
      );

      blocTest<UnlockContentCubit, UnlockContentState>(
        'emits [loading, failure] when the repository throws an $AppException',
        setUp: () => when(() => repository.fetchItem(itemId)).thenThrow(const NotFoundException()),
        build: () => UnlockContentCubit(repository, itemId),
        act: (cubit) => cubit.load(),
        expect: () => const [
          UnlockContentState.loading(),
          UnlockContentState.failure(NotFoundException()),
        ],
      );
    });

    group('unlock', () {
      blocTest<UnlockContentCubit, UnlockContentState>(
        'emits [loading, success] with the item now open',
        setUp: () => when(() => repository.unlockItem(itemId)).thenAnswer((_) async => unlocked),
        build: () => UnlockContentCubit(repository, itemId),
        act: (cubit) => cubit.unlock(),
        expect: () => const [
          UnlockContentState.loading(),
          UnlockContentState.success(unlocked, justUnlocked: true),
        ],
      );

      blocTest<UnlockContentCubit, UnlockContentState>(
        'emits [loading, failure] when the repository throws an $AppException',
        setUp: () => when(() => repository.unlockItem(itemId)).thenThrow(const ServerException(500)),
        build: () => UnlockContentCubit(repository, itemId),
        act: (cubit) => cubit.unlock(),
        expect: () => const [
          UnlockContentState.loading(),
          UnlockContentState.failure(ServerException(500)),
        ],
      );
    });
  });
}
