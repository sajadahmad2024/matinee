import 'package:matinee/core/bloc/safe_cubit.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/features/reels/data/reels_repository.dart';
import 'package:matinee/features/reels/presentation/cubit/reels_state.dart';

class ReelsCubit extends SafeCubit<ReelsState> {
  ReelsCubit(this._repository) : super(const ReelsState.initial());

  final ReelsRepository _repository;

  Future<void> load() async {
    emit(const ReelsState.loading());
    try {
      emit(ReelsState.success(await _repository.fetchReelsFeed()));
    } on AppException catch (e) {
      emit(ReelsState.failure(e));
    }
  }
}
