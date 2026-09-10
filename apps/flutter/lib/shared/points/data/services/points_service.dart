import 'dart:async';

import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/shared/points/data/models/badge_tier.dart';
import 'package:matinee/shared/points/data/models/points_standing.dart';

///
/// Owns the points balance and the badge ladder it is read against. Stands in
/// for the endpoints until the API exists; one instance, so every screen that
/// shows the balance shows the same number.
///
class PointsService {
  PointsService();

  static const Duration mockLatency = Duration(milliseconds: 600);

  ///
  /// The ladder the design's copy implies: a 7,082 balance sits on Expert with
  /// 918 to go, which puts the next rung at 8,000.
  ///
  static const List<BadgeTier> tiers = [
    BadgeTier(id: 'newbie', name: 'Cinematic Newbie', threshold: 0, requirement: '30 min streak for 15 days'),
    BadgeTier(id: 'tracker', name: 'Trailer Tracker', threshold: 1000, requirement: '45 min streak for 15 days'),
    BadgeTier(id: 'pundit', name: 'Prediction Pundit', threshold: 2500, requirement: '3 wins in Prediction game'),
    BadgeTier(id: 'expert', name: 'Expert', threshold: 5000, requirement: '5,000–7,999 pts'),
    BadgeTier(id: 'loyalist', name: 'Cinematic Loyalist', threshold: 8000, requirement: '8,000–11,999 pts'),
    BadgeTier(id: 'visionary', name: 'Visionary', threshold: 12000, requirement: '12,000+ pts'),
  ];

  ///
  /// The balance is the one value several screens show, so a change is
  /// broadcast. The service outlives them all, so this is never closed.
  ///
  final StreamController<int> _pointsChanges = StreamController<int>.broadcast();

  int _points = 7082;

  Stream<int> get pointsChanges => _pointsChanges.stream;

  int get balance => _points;

  ///
  /// Index into [tiers] of the badge the balance has earned. The first rung is
  /// at zero, so a balance always sits on one and this never misses.
  ///
  int get earnedTierIndex => tiers.lastIndexWhere((tier) => tier.threshold <= _points);

  Future<PointsStanding> fetchStanding() async {
    await Future<void>.delayed(mockLatency);
    return standing;
  }

  /// Read without a delay by the callers that already have the balance in hand.
  PointsStanding get standing {
    final earned = _earnedTier;
    final next = _nextTier;
    // The top of the ladder has nothing above it, so it reads as complete
    // rather than as progress towards a rung that does not exist.
    if (next == null) {
      return PointsStanding(
        totalPoints: _points,
        badgeName: earned.name,
        pointsToNextBadge: 0,
        nextBadgeName: earned.name,
        progressToNextBadge: 1,
      );
    }
    final span = next.threshold - earned.threshold;
    return PointsStanding(
      totalPoints: _points,
      badgeName: earned.name,
      pointsToNextBadge: next.threshold - _points,
      nextBadgeName: next.name,
      progressToNextBadge: (_points - earned.threshold) / span,
    );
  }

  void credit(int amount) => _setPoints(_points + amount);

  ///
  /// Spending more than the balance is a 402, not a StateError: the cubits
  /// catch AppException only, and everything else reaches the global net.
  ///
  void debit(int amount) {
    if (amount > _points) {
      throw const ValidationException(402);
    }
    _setPoints(_points - amount);
  }

  void _setPoints(int value) {
    _points = value;
    _pointsChanges.add(value);
  }

  BadgeTier get _earnedTier => tiers[earnedTierIndex];

  BadgeTier? get _nextTier {
    for (final tier in tiers) {
      if (tier.threshold > _points) {
        return tier;
      }
    }
    return null;
  }
}
