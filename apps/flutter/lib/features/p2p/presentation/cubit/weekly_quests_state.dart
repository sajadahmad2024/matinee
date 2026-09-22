import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/features/p2p/data/models/weekly_quest.dart';

part 'weekly_quests_state.freezed.dart';

@freezed
sealed class WeeklyQuestsState with _$WeeklyQuestsState {
  const factory WeeklyQuestsState.initial() = WeeklyQuestsInitial;
  const factory WeeklyQuestsState.loading() = WeeklyQuestsLoading;
  const factory WeeklyQuestsState.success(List<WeeklyQuest> quests) = WeeklyQuestsSuccess;
  const factory WeeklyQuestsState.failure(AppException error) = WeeklyQuestsFailure;
}

extension WeeklyQuestsSuccessX on WeeklyQuestsSuccess {
  ///
  /// The quest the design features at the top. Null when none is running, which
  /// is the list on its own rather than an empty hero.
  ///
  WeeklyQuest? get featured => quests.where((quest) => quest.status == QuestStatus.active).firstOrNull;

  ///
  /// What the list under the hero holds. The featured quest is already on the
  /// screen, and the frame's list does not repeat it.
  ///
  List<WeeklyQuest> get rest {
    final hero = featured;
    return quests.where((quest) => quest.id != hero?.id).toList();
  }
}
