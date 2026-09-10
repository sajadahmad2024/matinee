import 'package:matinee/features/earns/data/models/earn_source.dart';
import 'package:matinee/features/earns/data/models/earned_badge.dart';
import 'package:matinee/features/earns/data/models/earns_overview.dart';
import 'package:matinee/shared/points/data/services/points_service.dart';

///
/// Stands in for the My Earns endpoints until the API exists. The balance and
/// the badge ladder come from [PointsService], so the totals here and on the
/// Rewards tab cannot drift apart.
///
class EarnsApiService {
  EarnsApiService(this._points);

  static const Duration mockLatency = Duration(milliseconds: 600);

  ///
  /// The four sources the design draws, seeded to sum to the starting balance
  /// so the shares come out as the percentages the frame shows.
  ///
  static const List<EarnSource> _sources = [
    EarnSource(
      kind: EarnSourceKind.dailyStreaks,
      title: 'Daily Streaks',
      activity: '+120 today',
      points: 2691,
    ),
    EarnSource(
      kind: EarnSourceKind.weeklyQuests,
      title: 'Weekly Quests',
      activity: '+500 this week',
      points: 2691,
    ),
    EarnSource(
      kind: EarnSourceKind.predictionGames,
      title: 'Prediction Games',
      activity: '+0 today',
      points: 1200,
    ),
    EarnSource(
      kind: EarnSourceKind.auctionWins,
      title: 'Live Auction Wins',
      activity: 'Last win 3d ago',
      points: 500,
    ),
  ];

  final PointsService _points;

  Future<EarnsOverview> fetchOverview() async {
    await Future<void>.delayed(mockLatency);
    return EarnsOverview(standing: _points.standing, sources: _sources, badges: _badges());
  }

  ///
  /// The grid is the ladder read against the balance: everything below the
  /// badge in hand is earned, that one is current, everything above is locked.
  ///
  /// Keyed on the rung's position, not its name: two rungs could be renamed to
  /// match and a name that matched none would draw every tile locked.
  ///
  List<EarnedBadge> _badges() {
    const tiers = PointsService.tiers;
    final current = _points.earnedTierIndex;
    return [
      for (var i = 0; i < tiers.length; i++)
        EarnedBadge(
          id: tiers[i].id,
          name: tiers[i].name,
          requirement: tiers[i].requirement,
          status: switch (i.compareTo(current)) {
            < 0 => BadgeStatus.earned,
            0 => BadgeStatus.current,
            _ => BadgeStatus.locked,
          },
        ),
    ];
  }
}
