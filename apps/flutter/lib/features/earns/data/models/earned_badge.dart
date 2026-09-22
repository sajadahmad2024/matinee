import 'package:freezed_annotation/freezed_annotation.dart';

part 'earned_badge.freezed.dart';

/// One tile of the badge grid.
@freezed
abstract class EarnedBadge with _$EarnedBadge {
  const factory EarnedBadge({
    required String id,
    required String name,
    required String requirement,
    required BadgeStatus status,
  }) = _EarnedBadge;
}

///
/// [current] is the badge the balance sits on: earned, and the one the design
/// singles out, so it is a status of its own rather than a flag beside one.
///
enum BadgeStatus {
  earned,
  current,
  locked;

  /// The Earned tab shows the badge the user is on alongside the ones behind it.
  bool get isEarned => this != BadgeStatus.locked;
}
