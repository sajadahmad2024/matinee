import 'package:freezed_annotation/freezed_annotation.dart';

part 'prediction.freezed.dart';

///
/// One prediction: a yes-or-no question on a title, the split of votes cast so
/// far, and what a correct call pays.
///
@freezed
abstract class Prediction with _$Prediction {
  const factory Prediction({
    required String id,
    required String title,
    required String question,
    required String imageAsset,
    required int points,
    required int multiplier,

    /// The yes share of votes cast. The no share is derived, so the two always
    /// add to a hundred.
    required int yesPercent,

    required int turnoutPercent,
    required Duration closesIn,
    required PredictionStatus status,

    /// Null until the user votes, which is what turns the CTA into a receipt.
    PredictionSide? vote,
  }) = _Prediction;
}

extension PredictionX on Prediction {
  int get noPercent => 100 - yesPercent;

  double get yesShare => yesPercent / 100;

  bool get isOpen => status == PredictionStatus.open;

  bool get hasVoted => vote != null;
}

/// Open for votes, or settled and paid out.
enum PredictionStatus { open, resolved }

enum PredictionSide { yes, no }
