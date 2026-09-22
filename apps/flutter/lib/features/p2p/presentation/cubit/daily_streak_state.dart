import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/features/p2p/data/models/streak_status.dart';

part 'daily_streak_state.freezed.dart';

@freezed
sealed class DailyStreakState with _$DailyStreakState {
  const factory DailyStreakState.initial() = DailyStreakInitial;
  const factory DailyStreakState.loading() = DailyStreakLoading;

  ///
  /// [isBusy] keeps the streak on screen while one of its CTAs is working, and
  /// [actionError] reports one that failed without discarding it.
  ///
  const factory DailyStreakState.success(
    StreakStatus streak, {
    @Default(false) bool isBusy,
    AppException? actionError,
  }) = DailyStreakSuccess;

  const factory DailyStreakState.failure(AppException error) = DailyStreakFailure;
}
