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

      blocTest<ExclusiveLibraryCubit, ExclusiveLibraryState>(
        'emits [loading, success] for the chosen filter',
        setUp: () => when(() => repository.fetchLibrary(filter: any(named: 'filter'))).thenAnswer((_) async => horror),
        build: () => ExclusiveLibraryCubit(repository),
        act: (cubit) => cubit.selectFilter('Horror'),
        expect: () => const [
          ExclusiveLibraryState.loading(),
          ExclusiveLibraryState.success(horror),
        ],
        verify: (_) => verify(() => repository.fetchLibrary(filter: 'Horror')).called(1),
      );

      blocTest<ExclusiveLibraryCubit, ExclusiveLibraryState>(
        'emits [loading, failure] when the repository throws an $AppException',
        setUp: () =>
            when(() => repository.fetchLibrary(filter: any(named: 'filter'))).thenThrow(const ServerException(500)),
        build: () => ExclusiveLibraryCubit(repository),
        act: (cubit) => cubit.selectFilter('Horror'),
        expect: () => const [
          ExclusiveLibraryState.loading(),
          ExclusiveLibraryState.failure(ServerException(500)),
        ],
      );
    });
  });
}
