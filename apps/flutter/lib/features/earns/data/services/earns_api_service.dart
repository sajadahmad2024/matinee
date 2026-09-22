import 'package:matinee/core/assets/assets.dart';
import 'package:matinee/features/earns/data/models/auction_win.dart';
import 'package:matinee/features/earns/data/models/earn_detail.dart';
import 'package:matinee/features/earns/data/models/earn_source.dart';
import 'package:matinee/features/earns/data/models/earned_badge.dart';
import 'package:matinee/features/earns/data/models/earns_overview.dart';
import 'package:matinee/features/earns/data/models/prediction_result.dart';
import 'package:matinee/features/earns/data/models/quest_week.dart';
import 'package:matinee/features/earns/data/models/streak_day.dart';
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

  ///
  /// The streak log, newest day first. Dates are measured back from
  /// [_streakLogEnd] by the day counts, so the two can never disagree.
  ///
  static const List<({int dayCount, int minutes, int points})> _streakLog = [
    (dayCount: 15, minutes: 47, points: 120),
    (dayCount: 14, minutes: 52, points: 110),
    (dayCount: 13, minutes: 45, points: 100),
    (dayCount: 12, minutes: 48, points: 100),
    (dayCount: 11, minutes: 46, points: 100),
    (dayCount: 10, minutes: 50, points: 100),
    (dayCount: 9, minutes: 45, points: 100),
    (dayCount: 8, minutes: 47, points: 100),
    (dayCount: 7, minutes: 34, points: 60),
  ];

  static final DateTime _streakLogEnd = DateTime.utc(2026, 7, 9);

  /// The daily watch time each level asks for, as the streak header lists it.
  static const List<({int level, int minutes})> _streakLadder = [
    (level: 1, minutes: 30),
    (level: 2, minutes: 45),
    (level: 3, minutes: 60),
  ];

  /// The streak lengths that unlock a badge, which the log calls out on the day.
  static const Map<int, String> _streakBadges = {7: 'First Flame', 15: 'Spark Keeper'};

  static final List<AuctionWin> _wins = [
    AuctionWin(
      id: 'signed-poster-neon-noir',
      kind: AuctionLotKind.memorabilia,
      title: 'Signed Poster \u2014 Neon Noir',
      imageAsset: AppImageAssets.auctionWin1,
      wonOn: DateTime.utc(2026, 6, 30),
      winningBid: 12500,
      pointsAwarded: 200,
      badgeAwarded: 'High Roller',
    ),
    AuctionWin(
      id: 'director-qa-iron-horizon',
      kind: AuctionLotKind.experience,
      title: 'Director Q&A Pass \u2014 Iron Horizon',
      imageAsset: AppImageAssets.auctionWin2,
      wonOn: DateTime.utc(2026, 6, 18),
      winningBid: 9800,
      pointsAwarded: 150,
    ),
    AuctionWin(
      id: 'premiere-night-ticket',
      kind: AuctionLotKind.ticket,
      title: 'Premiere Night Ticket \u00d7 2',
      imageAsset: AppImageAssets.auctionWin3,
      wonOn: DateTime.utc(2026, 6, 5),
      winningBid: 7200,
      pointsAwarded: 100,
      badgeAwarded: 'Premiere Club',
    ),
    AuctionWin(
      id: 'exclusive-bts-reel',
      kind: AuctionLotKind.content,
      title: 'Exclusive BTS Reel Access',
      imageAsset: AppImageAssets.auctionWin4,
      wonOn: DateTime.utc(2026, 5, 22),
      winningBid: 4000,
      pointsAwarded: 50,
    ),
  ];

  static final List<PredictionResult> _predictions = [
    PredictionResult(
      id: 'neon-noir-opening',
      title: 'Neon Noir Opening Weekend',
      question: 'Will it cross \u20b9100Cr in week 1?',
      settledOn: DateTime.utc(2026, 7, 6),
      vote: PredictionVote.yes,
      outcome: PredictionVote.yes,
      pointsAwarded: 250,
      multiplier: 2,
      badgeAwarded: 'Sharp Predictor',
    ),
    PredictionResult(
      id: 'silent-storm-box-office',
      title: 'The Silent Storm Box Office',
      question: 'Top 5 worldwide opening weekend?',
      settledOn: DateTime.utc(2026, 7, 2),
      vote: PredictionVote.yes,
      outcome: PredictionVote.no,
      pointsAwarded: 0,
      multiplier: 3,
    ),
    PredictionResult(
      id: 'midnight-requiem-awards',
      title: 'Midnight Requiem Awards',
      question: 'Will it win Best Cinematography?',
      settledOn: DateTime.utc(2026, 6, 28),
      vote: PredictionVote.yes,
      outcome: PredictionVote.yes,
      pointsAwarded: 300,
    ),
  ];

  static final List<QuestWeek> _quests = [
    QuestWeek(
      id: 'summer-blockbuster-blitz',
      title: 'Summer Blockbuster Blitz',
      startsOn: DateTime.utc(2026, 6, 30),
      endsOn: DateTime.utc(2026, 7, 6),
      completedOn: DateTime.utc(2026, 7, 6),
      actionsCompleted: 4,
      actionsTotal: 4,
      pointsAwarded: 500,
      badgeAwarded: 'Quest Champion',
    ),
    QuestWeek(
      id: 'international-cinema-week',
      title: 'International Cinema Week',
      startsOn: DateTime.utc(2026, 6, 23),
      endsOn: DateTime.utc(2026, 6, 29),
      completedOn: DateTime.utc(2026, 6, 28),
      actionsCompleted: 4,
      actionsTotal: 4,
      pointsAwarded: 500,
    ),
    QuestWeek(
      id: 'thriller-suspense-focus',
      title: 'Thriller & Suspense Focus',
      startsOn: DateTime.utc(2026, 6, 16),
      endsOn: DateTime.utc(2026, 6, 22),
      completedOn: DateTime.utc(2026, 6, 22),
      actionsCompleted: 4,
      actionsTotal: 4,
      pointsAwarded: 500,
      badgeAwarded: 'Weekly Warrior',
    ),
    QuestWeek(
      id: 'directors-cut-discovery',
      title: "Director's Cut Discovery",
      startsOn: DateTime.utc(2026, 6, 9),
      endsOn: DateTime.utc(2026, 6, 15),
      completedOn: DateTime.utc(2026, 6, 14),
      actionsCompleted: 4,
      actionsTotal: 4,
      pointsAwarded: 400,
    ),
    QuestWeek(
      id: 'indie-gems-spotlight',
      title: 'Indie Gems Spotlight',
      startsOn: DateTime.utc(2026, 6, 2),
      endsOn: DateTime.utc(2026, 6, 8),
      completedOn: DateTime.utc(2026, 6, 8),
      actionsCompleted: 3,
      actionsTotal: 4,
      pointsAwarded: 200,
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

  ///
  /// One source's history. The total comes from the row in [_sources], so the
  /// figure here and the one on My Earns cannot drift apart.
  ///
  Future<EarnDetail> fetchDetail(EarnSourceKind kind) async {
    await Future<void>.delayed(mockLatency);
    final points = _sources.firstWhere((source) => source.kind == kind).points;
    return switch (kind) {
      EarnSourceKind.dailyStreaks => EarnDetail.streaks(
        pointsEarned: points,
        levels: _levels(),
        days: _days(),
      ),
      EarnSourceKind.auctionWins => EarnDetail.auction(pointsEarned: points, wins: _wins),
      EarnSourceKind.predictionGames => EarnDetail.predictions(
        pointsEarned: points,
        results: _predictions,
      ),
      EarnSourceKind.weeklyQuests => EarnDetail.quests(pointsEarned: points, weeks: _quests),
    };
  }

  ///
  /// A level counts as reached once one day in the log met its watch time, which
  /// is what the header's three chips light up from.
  ///
  List<StreakLevel> _levels() {
    return [
      for (final rung in _streakLadder)
        StreakLevel(
          level: rung.level,
          minutes: rung.minutes,
          isReached: _streakLog.any((day) => day.minutes >= rung.minutes),
        ),
    ];
  }

  List<StreakDay> _days() {
    return [
      for (final day in _streakLog)
        StreakDay(
          date: _streakLogEnd.subtract(Duration(days: _streakLog.first.dayCount - day.dayCount)),
          dayCount: day.dayCount,
          minutesWatched: day.minutes,
          points: day.points,
          level: _levelFor(day.minutes),
          badgeUnlocked: _streakBadges[day.dayCount],
        ),
    ];
  }

  ///
  /// The highest rung the day's watch time cleared, which its pill names, or
  /// null on a day that fell short of the first one.
  ///
  int? _levelFor(int minutes) {
    final cleared = _streakLadder.where((rung) => minutes >= rung.minutes);
    return cleared.isEmpty ? null : cleared.last.level;
  }
}
