import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/features/rewards/data/models/exclusive_content.dart';

part 'unlock_content_state.freezed.dart';

@freezed
sealed class UnlockContentState with _$UnlockContentState {
  const factory UnlockContentState.initial() = UnlockContentInitial;
  const factory UnlockContentState.loading() = UnlockContentLoading;

  ///
  /// [justUnlocked] is set only by the unlock call, so opening an item that
  /// was already open does not read as a fresh unlock and navigate away.
  ///
  const factory UnlockContentState.success(
    ExclusiveItem item, {
    @Default(false) bool justUnlocked,
  }) = UnlockContentSuccess;
  const factory UnlockContentState.failure(AppException error) = UnlockContentFailure;
}
