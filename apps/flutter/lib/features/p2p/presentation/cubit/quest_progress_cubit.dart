import 'package:matinee/core/bloc/safe_cubit.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/features/p2p/data/p2p_repository.dart';
import 'package:matinee/features/p2p/presentation/cubit/quest_progress_state.dart';

///
/// One quest's tracker. The quest is fixed for the screen's life, so its id is
/// a constructor argument rather than an argument to [load].
///
class QuestProgressCubit extends SafeCubit<QuestProgressState> {
  QuestProgressCubit(this._repository, this.questId) : super(const QuestProgressState.initial());

  final P2pRepository _repository;

  final String questId;

  Future<void> load() async {
    emit(const QuestProgressState.loading());
    try {
      emit(QuestProgressState.success(await _repository.fetchQuest(questId)));
    } on AppException catch (e) {
      emit(QuestProgressState.failure(e));
    }
  }

  ///
  /// Counts one curated item towards its action, which is what the design's
  /// 'Watch' button does until there is a player behind it.
  ///
  Future<void> watch(String actionId, String itemId) async {
    if (state case QuestProgressSuccess(:final quest, isClaiming: false)) {
      try {
        emit(
          QuestProgressState.success(
            await _repository.watchCuratedItem(questId, actionId, itemId),
          ),
        );
      } on AppException catch (e) {
        emit(QuestProgressState.success(quest, actionError: e));
      }
    }
  }

  ///
  /// Claims the reward. A failure here leaves the tracker on screen rather than
  /// replacing it: the quest is still there to try again.
  ///
  Future<void> claim() async {
    if (state case QuestProgressSuccess(:final quest, isClaiming: false)) {
      emit(QuestProgressState.success(quest, isClaiming: true));
      try {
        emit(QuestProgressState.success(await _repository.claimQuest(questId)));
      } on AppException catch (e) {
        emit(QuestProgressState.success(quest, actionError: e));
      }
    }
  }
}
