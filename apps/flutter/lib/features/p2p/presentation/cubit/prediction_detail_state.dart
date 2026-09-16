import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/features/p2p/data/models/prediction.dart';

part 'prediction_detail_state.freezed.dart';

@freezed
sealed class PredictionDetailState with _$PredictionDetailState {
  const factory PredictionDetailState.initial() = PredictionDetailInitial;
  const factory PredictionDetailState.loading() = PredictionDetailLoading;

  ///
  /// [selection] is the side the user has picked but not sent; the vote on
  /// [prediction] is the one that has been cast.
  ///
  /// [actionError] is a vote that failed to send, which leaves the prediction
  /// and the pick on screen rather than discarding both.
  const factory PredictionDetailState.success(
    Prediction prediction, {
    PredictionSide? selection,
    @Default(false) bool isSubmitting,
    AppException? actionError,
  }) = PredictionDetailSuccess;

  const factory PredictionDetailState.failure(AppException error) = PredictionDetailFailure;
}

extension PredictionDetailSuccessX on PredictionDetailSuccess {
  /// The submit button is live once a side is picked and nothing is in flight.
  bool get canSubmit => selection != null && !isSubmitting && prediction.isOpen;
}
