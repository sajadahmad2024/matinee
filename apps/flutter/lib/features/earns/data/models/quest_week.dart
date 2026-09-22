import 'package:freezed_annotation/freezed_annotation.dart';

part 'quest_week.freezed.dart';

/// One week of quests, as the quest history lists it.
@freezed
abstract class QuestWeek with _$QuestWeek {
  const factory QuestWeek({
    required String id,
    required String title,
    required DateTime startsOn,
    required DateTime endsOn,
    required DateTime completedOn,
    required int actionsCompleted,
    required int actionsTotal,
    required int pointsAwarded,
    String? badgeAwarded,
  }) = _QuestWeek;
}

extension QuestWeekX on QuestWeek {
  /// Claimed once every action landed; the design calls the rest partial.
  bool get isClaimed => actionsCompleted >= actionsTotal;
}
