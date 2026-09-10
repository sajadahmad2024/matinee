import 'package:matinee/core/bloc/safe_cubit.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/features/rewards/data/models/exclusive_content.dart';
import 'package:matinee/features/rewards/data/rewards_repository.dart';
import 'package:matinee/features/rewards/presentation/cubit/exclusive_library_state.dart';

class ExclusiveLibraryCubit extends SafeCubit<ExclusiveLibraryState> {
  ExclusiveLibraryCubit(this._repository) : super(const ExclusiveLibraryState.initial());

  final RewardsRepository _repository;

  Future<void> load() => _run(_repository.fetchLibrary);

  ///
  /// The chip moves at once and the grid follows. Going through loading would
  /// take the chips off screen and reset the grid's scroll position.
  ///
  Future<void> selectFilter(String filter) async {
    if (state case ExclusiveLibrarySuccess(:final library)) {
      emit(ExclusiveLibraryState.success(library.copyWith(selectedFilter: filter)));
    }
    try {
      emit(ExclusiveLibraryState.success(await _repository.fetchLibrary(filter: filter)));
    } on AppException catch (e) {
      emit(ExclusiveLibraryState.failure(e));
    }
  }

  Future<void> _run(Future<ExclusiveLibrary> Function() call) async {
    emit(const ExclusiveLibraryState.loading());
    try {
      emit(ExclusiveLibraryState.success(await call()));
    } on AppException catch (e) {
      emit(ExclusiveLibraryState.failure(e));
    }
  }
}
