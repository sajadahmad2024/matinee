import 'package:freezed_annotation/freezed_annotation.dart';

part 'prediction_result.freezed.dart';

/// One settled prediction, as the prediction history lists it.
@freezed
abstract class PredictionResult with _$PredictionResult {
  const factory PredictionResult({
    required String id,
    required String title,
    required String question,
    required DateTime settledOn,
    required PredictionVote vote,
    required PredictionVote outcome,
    required int pointsAwarded,

    /// The stake the game ran at; the design shows it only where there was one.
    int? multiplier,
    String? badgeAwarded,
  }) = _PredictionResult;
}

enum PredictionVote { yes, no }

extension PredictionResultX on PredictionResult {
  /// The design says this with a tick or a cross, and colours the result by it.
  bool get isCorrect => vote == outcome;
}
