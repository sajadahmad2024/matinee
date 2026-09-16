import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/features/p2p/data/models/weekly_quest.dart';

part 'quest_progress_state.freezed.dart';

@freezed
sealed class QuestProgressState with _$QuestProgressState {
  const factory QuestProgressState.initial() = QuestProgressInitial;
  const factory QuestProgressState.loading() = QuestProgressLoading;

  ///
  /// [isClaiming] keeps the tracker on screen while the reward is being paid,
  /// so the CTA can show a spinner instead of the whole screen reloading.
  ///
  /// [actionError] is a watch or a claim that failed. The quest is still here
  /// and still worth another tap, so it is reported beside the tracker rather
  /// than in place of it — [QuestProgressFailure] is for a load that failed.
  ///
  const factory QuestProgressState.success(
    WeeklyQuest quest, {
    @Default(false) bool isClaiming,
    AppException? actionError,
  }) = QuestProgressSuccess;

  const factory QuestProgressState.failure(AppException error) = QuestProgressFailure;
}
