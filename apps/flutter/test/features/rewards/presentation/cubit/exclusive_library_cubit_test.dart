import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/features/rewards/data/models/exclusive_content.dart';
import 'package:matinee/features/rewards/data/rewards_repository.dart';
import 'package:matinee/features/rewards/presentation/cubit/exclusive_library_cubit.dart';
import 'package:matinee/features/rewards/presentation/cubit/exclusive_library_state.dart';
import 'package:mocktail/mocktail.dart';

class _MockRewardsRepository extends Mock implements RewardsRepository {}

void main() {
  group(ExclusiveLibraryCubit, () {
    late _MockRewardsRepository repository;

    const library = ExclusiveLibrary(
      filters: ['Recommended', 'Horror'],
      selectedFilter: 'Recommended',
      items: [],
    );

    setUp(() {
      repository = _MockRewardsRepository();
    });

    group('load', () {
      blocTest<ExclusiveLibraryCubit, ExclusiveLibraryState>(
        'emits [loading, success] with the library',
        setUp: () => when(() => repository.fetchLibrary()).thenAnswer((_) async => library),
        build: () => ExclusiveLibraryCubit(repository),
        act: (cubit) => cubit.load(),
        expect: () => const [
          ExclusiveLibraryState.loading(),
          ExclusiveLibraryState.success(library),
        ],
      );

      blocTest<ExclusiveLibraryCubit, ExclusiveLibraryState>(
        'emits [loading, failure] when the repository throws an $AppException',
        setUp: () => when(() => repository.fetchLibrary()).thenThrow(const NetworkException()),
        build: () => ExclusiveLibraryCubit(repository),
        act: (cubit) => cubit.load(),
        expect: () => const [
          ExclusiveLibraryState.loading(),
          ExclusiveLibraryState.failure(NetworkException()),
        ],
      );
    });

    group('selectFilter', () {
      const horror = ExclusiveLibrary(
        filters: ['Recommended', 'Horror'],
        selectedFilter: 'Horror',
        items: [],
      );

      const item = ExclusiveItem(
        id: 'ex-1',
        title: 'Night Shift',
        category: 'Horror',
        unlockCost: 500,
        preview: 'A preview.',
        castAndCrew: 'Someone',
        imageAsset: 'assets/images/exclusive-1.jpg',
      );
      const horrorItems = ExclusiveLibrary(
        filters: ['Recommended', 'Horror'],
        selectedFilter: 'Horror',
        items: [item],
      );

      blocTest<ExclusiveLibraryCubit, ExclusiveLibraryState>(
        'moves the chip before the fetch and swaps the grid when it lands',
        setUp: () {
          when(() => repository.fetchLibrary()).thenAnswer((_) async => library);
          when(() => repository.fetchLibrary(filter: 'Horror')).thenAnswer((_) async => horrorItems);
        },
        build: () => ExclusiveLibraryCubit(repository),
        act: (cubit) async {
          await cubit.load();
          await cubit.selectFilter('Horror');
        },
        // The chip moves on the second success and the grid follows on the
        // third, with no loading between them to reset the grid's scroll.
        expect: () => const [
          ExclusiveLibraryState.loading(),
          ExclusiveLibraryState.success(library),
          ExclusiveLibraryState.success(horror),
          ExclusiveLibraryState.success(horrorItems),
        ],
        verify: (_) => verify(() => repository.fetchLibrary(filter: 'Horror')).called(1),
      );

      blocTest<ExclusiveLibraryCubit, ExclusiveLibraryState>(
        'emits [success, failure] when the repository throws an $AppException',
        setUp: () =>
            when(() => repository.fetchLibrary(filter: any(named: 'filter'))).thenThrow(const ServerException(500)),
        build: () => ExclusiveLibraryCubit(repository),
        act: (cubit) => cubit.selectFilter('Horror'),
        expect: () => const [ExclusiveLibraryState.failure(ServerException(500))],
      );
    });
  });
}
