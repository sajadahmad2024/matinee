import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/features/reels/domain/feed_reel.dart';

part 'reels_feed_state.freezed.dart';

@freezed
sealed class ReelsFeedState with _$ReelsFeedState {
  const factory ReelsFeedState.initial() = ReelsFeedInitial;
  const factory ReelsFeedState.loading() = ReelsFeedLoading;
  const factory ReelsFeedState.success(List<FeedReel> feed, int pointsBalance) = ReelsFeedSuccess;
  const factory ReelsFeedState.failure(AppException error) = ReelsFeedFailure;
}
