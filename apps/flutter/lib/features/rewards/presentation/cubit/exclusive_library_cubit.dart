import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/features/rewards/data/models/exclusive_content.dart';
import 'package:matinee/features/rewards/data/rewards_repository.dart';
import 'package:matinee/features/rewards/presentation/cubit/exclusive_library_state.dart';

class ExclusiveLibraryCubit extends Cubit<ExclusiveLibraryState> {
  ExclusiveLibraryCubit(this._repository) : super(const ExclusiveLibraryState.initial());

  final RewardsRepository _repository;

  Future<void> load() => _run(_repository.fetchLibrary);

  Future<void> selectFilter(String filter) => _run(() => _repository.fetchLibrary(filter: filter));

  Future<void> _run(Future<ExclusiveLibrary> Function() call) async {
    emit(const ExclusiveLibraryState.loading());
    try {
      emit(ExclusiveLibraryState.success(await call()));
    } on AppException catch (e) {
      emit(ExclusiveLibraryState.failure(e));
    }
  }
}
