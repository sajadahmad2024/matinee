import 'package:matinee/features/earns/data/models/auction_win.dart';
import 'package:matinee/features/earns/data/models/earn_detail.dart';
import 'package:matinee/features/earns/data/models/prediction_result.dart';
import 'package:matinee/features/earns/data/models/quest_week.dart';
import 'package:matinee/features/earns/data/models/streak_day.dart';

/// One of each history, small enough that a test can name every card in it.
final streaks = EarnDetail.streaks(
  pointsEarned: 2691,
  levels: const [
    StreakLevel(level: 1, minutes: 30, isReached: true),
    StreakLevel(level: 2, minutes: 45, isReached: true),
    StreakLevel(level: 3, minutes: 60, isReached: false),
  ],
  days: [
    StreakDay(
      date: DateTime.utc(2026, 7, 9),
      dayCount: 15,
      minutesWatched: 47,
      points: 120,
      level: 2,
      badgeUnlocked: 'Spark Keeper',
    ),
    StreakDay(
      date: DateTime.utc(2026, 7, 8),
      dayCount: 14,
      minutesWatched: 34,
      points: 60,
      level: 1,
    ),
  ],
);

final auction = EarnDetail.auction(
  pointsEarned: 500,
  wins: [
    AuctionWin(
      id: 'poster',
      kind: AuctionLotKind.memorabilia,
      title: 'Signed Poster',
      imageAsset: 'assets/images/auction-win-1.jpg',
      wonOn: DateTime.utc(2026, 6, 30),
      winningBid: 12500,
      pointsAwarded: 200,
      badgeAwarded: 'High Roller',
    ),
    AuctionWin(
      id: 'pass',
      kind: AuctionLotKind.experience,
      title: 'Director Q&A Pass',
      imageAsset: 'assets/images/auction-win-2.jpg',
      wonOn: DateTime.utc(2026, 6, 18),
      winningBid: 9800,
      pointsAwarded: 150,
    ),
  ],
);

final predictions = EarnDetail.predictions(
  pointsEarned: 1200,
  results: [
    PredictionResult(
      id: 'neon',
      title: 'Neon Noir Opening Weekend',
      question: 'Will it cross a hundred crore in week 1?',
      settledOn: DateTime.utc(2026, 7, 6),
      vote: PredictionVote.yes,
      outcome: PredictionVote.yes,
      pointsAwarded: 250,
      multiplier: 2,
      badgeAwarded: 'Sharp Predictor',
    ),
    PredictionResult(
      id: 'storm',
      title: 'The Silent Storm Box Office',
      question: 'Top 5 worldwide opening weekend?',
      settledOn: DateTime.utc(2026, 7, 2),
      vote: PredictionVote.yes,
      outcome: PredictionVote.no,
      pointsAwarded: 0,
      multiplier: 3,
    ),
  ],
);

final quests = EarnDetail.quests(
  pointsEarned: 2691,
  weeks: [
    QuestWeek(
      id: 'blitz',
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
      id: 'indie',
      title: 'Indie Gems Spotlight',
      startsOn: DateTime.utc(2026, 6, 2),
      endsOn: DateTime.utc(2026, 6, 8),
      completedOn: DateTime.utc(2026, 6, 8),
      actionsCompleted: 3,
      actionsTotal: 4,
      pointsAwarded: 200,
    ),
  ],
);
