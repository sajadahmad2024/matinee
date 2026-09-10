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
  }) = _PointsStanding;
}
