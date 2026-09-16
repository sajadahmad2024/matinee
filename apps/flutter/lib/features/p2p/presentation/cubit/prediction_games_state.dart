import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/features/p2p/data/models/prediction.dart';

part 'prediction_games_state.freezed.dart';

@freezed
sealed class PredictionGamesState with _$PredictionGamesState {
  const factory PredictionGamesState.initial() = PredictionGamesInitial;
  const factory PredictionGamesState.loading() = PredictionGamesLoading;
  const factory PredictionGamesState.success(List<Prediction> predictions) = PredictionGamesSuccess;
  const factory PredictionGamesState.failure(AppException error) = PredictionGamesFailure;
}

extension PredictionGamesSuccessX on PredictionGamesSuccess {
  /// The count the design puts in the section's badge.
  int get activeCount => predictions.where((prediction) => prediction.isOpen).length;
}
