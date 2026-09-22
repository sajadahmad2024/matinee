import 'package:matinee/core/bloc/safe_cubit.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/features/p2p/data/p2p_repository.dart';
import 'package:matinee/features/p2p/presentation/cubit/weekly_quests_state.dart';

class WeeklyQuestsCubit extends SafeCubit<WeeklyQuestsState> {
  WeeklyQuestsCubit(this._repository) : super(const WeeklyQuestsState.initial());

  final P2pRepository _repository;

  Future<void> load() async {
    emit(const WeeklyQuestsState.loading());
    try {
      emit(WeeklyQuestsState.success(await _repository.fetchQuests()));
    } on AppException catch (e) {
      emit(WeeklyQuestsState.failure(e));
    }
  }

  ///
  /// Re-reads the quests after a trip to a tracker, which can advance an action
  /// or claim the whole quest. Silently, in both directions: the list is
  /// already on screen, so it neither blanks nor turns into an error.
  ///
  Future<void> refresh() async {
    if (state is! WeeklyQuestsSuccess) {
      return;
    }
    try {
      emit(WeeklyQuestsState.success(await _repository.fetchQuests()));
    } on AppException catch (_) {
      return;
    }
  }
}
