import 'package:matinee/core/assets/assets.dart';
import 'package:matinee/features/p2p/data/models/p2p_overview.dart';
import 'package:matinee/features/p2p/data/models/prediction.dart';
import 'package:matinee/features/p2p/data/models/streak_status.dart';
import 'package:matinee/features/p2p/data/models/weekly_quest.dart';
import 'package:matinee/shared/points/data/models/points_standing.dart';

/// Where the shared ladder puts the seeded balance, as the header reads it.
const PointsStanding standing = PointsStanding(
  totalPoints: 7082,
  badgeName: 'Expert',
  pointsToNextBadge: 918,
  nextBadgeName: 'Cinematic Loyalist',
  progressToNextBadge: 0.694,
  pointsIntoBadge: 2082,
  badgeSpan: 3000,
);

const P2pOverview overview = P2pOverview(
  rank: 294,
  rankGainThisWeek: 12,
  streakPoints: 630,
  bestStreakDays: 21,
  standing: standing,
  games: [
    P2pGame(
      kind: P2pGameKind.weeklyQuests,
      category: 'QUEST',
      title: 'Weekly Quest',
      subtitle: 'Watch trailers & complete missions',
      imageAsset: AppImageAssets.p2pWeeklyQuest,
    ),
    P2pGame(
      kind: P2pGameKind.dailyStreaks,
      category: 'STREAK',
      title: 'Daily Streaks',
      subtitle: 'Engage daily to maintain your streak',
      imageAsset: AppImageAssets.p2pDailyStreaks,
    ),
  ],
);

/// A quest one action short of done, so the tracker has both states on screen.
const WeeklyQuest runningQuest = WeeklyQuest(
  id: 'trailer-marathon',
  title: 'Trailer Marathon',
  description: 'Watch 10 trailers in a single session.',
  imageAsset: AppImageAssets.questTrailerMarathon,
  points: 500,
  badgeName: 'Cinematic Visionary',
  status: QuestStatus.active,
  timeLeft: Duration(days: 2, hours: 14),
  actions: [
    QuestAction(
      id: 'watch',
      title: 'Watch 3 Trailers',
      description: 'Watch the curated trailers below.',
      imageAsset: AppImageAssets.questTrailerMarathon,
      done: 2,
      target: 3,
      curated: [
        CuratedItem(
          id: 'neon-noir',
          title: 'Neon Noir — Official Trailer',
          imageAsset: AppImageAssets.movieNeonNoir,
          isWatched: true,
        ),
        CuratedItem(
          id: 'silent-storm',
          title: 'The Silent Storm',
          imageAsset: AppImageAssets.movieSilentStorm,
          isWatched: false,
        ),
      ],
    ),
    QuestAction(
      id: 'like',
      title: 'Like 5 Videos',
      description: 'Like any 5 trailers.',
      imageAsset: AppImageAssets.questGenreExplorer,
      done: 5,
      target: 5,
      curated: [],
    ),
  ],
);

///
/// A second quest, finished and paid, which is what the receipt draws. Its own
/// id, so a list can hold it beside the running one.
///
final WeeklyQuest claimedQuest = runningQuest.copyWith(
  id: 'comment-connoisseur',
  title: 'Comment Connoisseur',
  status: QuestStatus.claimed,
  completedInDays: 3,
  actions: [
    for (final action in runningQuest.actions) action.copyWith(done: action.target),
  ],
);

const StreakStatus streakTiers = StreakStatus(
  hasStarted: true,
  level: 2,
  daysPerLevel: 7,
  daysDoneThisWeek: 2,
  minutesToday: 22,
  currentStreakDays: 14,
  bestStreakDays: 21,
  activeDays: 47,
  tiers: [
    StreakTier(level: 1, minutesPerDay: 30),
    StreakTier(level: 2, minutesPerDay: 45),
    StreakTier(level: 3, minutesPerDay: 60),
  ],
);

const Prediction openPrediction = Prediction(
  id: 'neon-noir-box-office',
  title: 'Neon Noir',
  question: 'Will Neon Noir cross 100 Crore in its opening week?',
  imageAsset: AppImageAssets.movieNeonNoir,
  points: 300,
  multiplier: 3,
  yesPercent: 62,
  turnoutPercent: 80,
  closesIn: Duration(hours: 6, minutes: 14, seconds: 22),
  status: PredictionStatus.open,
);

const Prediction resolvedPrediction = Prediction(
  id: 'midnight-requiem-cinematography',
  title: 'Midnight Requiem',
  question: 'Will Midnight Requiem win Best Cinematography?',
  imageAsset: AppImageAssets.movieMidnightRequiem,
  points: 500,
  multiplier: 2,
  yesPercent: 78,
  turnoutPercent: 100,
  closesIn: Duration.zero,
  status: PredictionStatus.resolved,
  vote: PredictionSide.yes,
);

///
/// The same header after a quest paid out, so a refetch produces a state the
/// cubit will actually emit.
///
final P2pOverview creditedOverview = P2pOverview(
  rank: 294,
  rankGainThisWeek: 12,
  streakPoints: 630,
  bestStreakDays: 21,
  standing: const PointsStanding(
    totalPoints: 7582,
    badgeName: 'Expert',
    pointsToNextBadge: 418,
    nextBadgeName: 'Cinematic Loyalist',
    progressToNextBadge: 0.861,
    pointsIntoBadge: 2582,
    badgeSpan: 3000,
  ),
  games: overview.games,
);
