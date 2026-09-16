import 'package:freezed_annotation/freezed_annotation.dart';

part 'weekly_quest.freezed.dart';

///
/// One weekly quest: a run of actions that pays points and, on the last one, a
/// badge. Progress is the action count, so the listing and the tracker cannot
/// disagree about how far along it is.
///
@freezed
abstract class WeeklyQuest with _$WeeklyQuest {
  const factory WeeklyQuest({
    required String id,
    required String title,
    required String description,
    required String imageAsset,
    required int points,
    required String badgeName,
    required QuestStatus status,
    required Duration timeLeft,
    required List<QuestAction> actions,

    /// How long the user took, shown once the reward is claimed.
    int? completedInDays,
  }) = _WeeklyQuest;
}

extension WeeklyQuestX on WeeklyQuest {
  int get actionsDone => actions.where((action) => action.isComplete).length;

  int get actionsTotal => actions.length;

  /// Zero rather than a division by zero: a quest with no actions is data the
  /// screen still has to draw.
  double get progress => actions.isEmpty ? 0 : actionsDone / actionsTotal;

  bool get isComplete => actions.isNotEmpty && actionsDone == actionsTotal;
}

///
/// Whether the quest is the one being tracked, one of the others, or finished
/// and paid out.
///
enum QuestStatus { active, available, claimed }

///
/// One step of a quest. [curated] is the admin-picked content that completes
/// it, which only some actions have.
///
@freezed
abstract class QuestAction with _$QuestAction {
  const factory QuestAction({
    required String id,
    required String title,
    required String description,
    required String imageAsset,
    required int done,
    required int target,
    required List<CuratedItem> curated,
  }) = _QuestAction;
}

extension QuestActionX on QuestAction {
  bool get isComplete => done >= target;

  double get progress => target == 0 ? 0 : (done / target).clamp(0, 1);
}

/// A trailer or BTS clip listed under an action, watched or still to watch.
@freezed
abstract class CuratedItem with _$CuratedItem {
  const factory CuratedItem({
    required String id,
    required String title,
    required String imageAsset,
    required bool isWatched,
  }) = _CuratedItem;
}
