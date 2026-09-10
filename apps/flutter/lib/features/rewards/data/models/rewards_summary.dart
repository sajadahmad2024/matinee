import 'package:freezed_annotation/freezed_annotation.dart';

part 'rewards_summary.freezed.dart';

///
/// The Rewards tab: the points header and the cards under REDEEM REWARDS.
///
@freezed
abstract class RewardsSummary with _$RewardsSummary {
  const factory RewardsSummary({
    required int totalPoints,
    required String badgeName,
    required int pointsToNextBadge,
    required String nextBadgeName,
    required List<RedeemDestination> destinations,
  }) = _RewardsSummary;
}

///
/// One card in the redeem list. [kind] is what the card opens, so the screen
/// routes on a value from the data rather than on the card's position.
///
@freezed
abstract class RedeemDestination with _$RedeemDestination {
  const factory RedeemDestination({
    required RedeemKind kind,
    required String category,
    required String title,
    required String subtitle,
    required String imageAsset,
  }) = _RedeemDestination;
}

enum RedeemKind { liveAuction, exclusiveContent }
