import 'package:freezed_annotation/freezed_annotation.dart';

part 'points_standing.freezed.dart';

///
/// Where the user stands: the balance, the badge it has earned, and how far
/// the next one is. Shown by the Rewards tab and by My Earns.
///
@freezed
abstract class PointsStanding with _$PointsStanding {
  const factory PointsStanding({
    required int totalPoints,
    required String badgeName,
    required int pointsToNextBadge,
    required String nextBadgeName,
    required double progressToNextBadge,

    ///
    /// Where the balance sits inside the badge it has earned, and how wide that
    /// rung is. The P2P header writes them as a fraction, and deriving them
    /// from the progress share would not reproduce whole points.
    ///
    required int pointsIntoBadge,
    required int badgeSpan,
  }) = _PointsStanding;
}

extension PointsStandingX on PointsStanding {
  ///
  /// The ladder is finished. Below the top there is always at least one point
  /// to the next rung, because landing on a threshold earns it.
  ///
  bool get isTopBadge => pointsToNextBadge == 0;
}
