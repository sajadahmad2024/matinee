import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/features/reels/data/models/reel.dart';

part 'reels_state.freezed.dart';

@freezed
sealed class ReelsState with _$ReelsState {
  const factory ReelsState.initial() = ReelsInitial;
  const factory ReelsState.loading() = ReelsLoading;
  const factory ReelsState.success(List<Reel> reels) = ReelsSuccess;
  const factory ReelsState.failure(AppException error) = ReelsFailure;
}
