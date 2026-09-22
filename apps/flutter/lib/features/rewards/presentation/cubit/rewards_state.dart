import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/features/rewards/data/models/rewards_summary.dart';

part 'rewards_state.freezed.dart';

@freezed
sealed class RewardsState with _$RewardsState {
  const factory RewardsState.initial() = RewardsInitial;
  const factory RewardsState.loading() = RewardsLoading;
  const factory RewardsState.success(RewardsSummary summary) = RewardsSuccess;
  const factory RewardsState.failure(AppException error) = RewardsFailure;
}
