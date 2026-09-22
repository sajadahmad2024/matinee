import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:matinee/features/earns/data/models/earn_source.dart';
import 'package:matinee/features/earns/data/models/earned_badge.dart';
import 'package:matinee/shared/points/data/models/points_standing.dart';

part 'earns_overview.freezed.dart';

/// Everything both segments of My Earns show, fetched in one go.
@freezed
abstract class EarnsOverview with _$EarnsOverview {
  const factory EarnsOverview({
    required PointsStanding standing,
    required List<EarnSource> sources,
    required List<EarnedBadge> badges,
  }) = _EarnsOverview;
}

extension EarnsOverviewX on EarnsOverview {
  ///
  /// How much of the balance a row accounts for, which the design shows both
  /// as a percentage and as the width of the row's bar.
  ///
  double shareOf(EarnSource source) {
    if (standing.totalPoints <= 0) {
      return 0;
    }
    return source.points / standing.totalPoints;
  }

  List<EarnedBadge> badgesWhere({required bool earned}) {
    return [
      for (final badge in badges)
        if (badge.status.isEarned == earned) badge,
    ];
  }
}
