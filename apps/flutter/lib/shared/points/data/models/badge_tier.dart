import 'package:freezed_annotation/freezed_annotation.dart';

part 'badge_tier.freezed.dart';

///
/// One rung of the badge ladder. [threshold] is the balance that earns it, so
/// the tiers are ordered by it and the standing is read off the list.
///
@freezed
abstract class BadgeTier with _$BadgeTier {
  const factory BadgeTier({
    required String id,
    required String name,
    required int threshold,
    required String requirement,
  }) = _BadgeTier;
}
