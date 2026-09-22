import 'dart:async';
import 'dart:math' as math;

import 'package:matinee/core/assets/assets.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/features/p2p/data/models/p2p_overview.dart';
import 'package:matinee/features/p2p/data/models/prediction.dart';
import 'package:matinee/features/p2p/data/models/streak_status.dart';
import 'package:matinee/features/p2p/data/models/weekly_quest.dart';
import 'package:matinee/shared/points/data/services/points_service.dart';

///
/// Stands in for the P2P endpoints until the API exists. It answers after a
/// delay and holds the quests, streak and votes, so a claim or a vote made on
/// one screen is still there on the next.
///
class P2pApiService {
  P2pApiService(this._points);

  static const Duration mockLatency = Duration(milliseconds: 600);

  /// The design's rank and the week's climb, which no other screen derives.
  static const int rank = 294;
  static const int rankGainThisWeek = 12;

  static const List<StreakTier> streakTiers = [
    StreakTier(level: 1, minutesPerDay: 30),
    StreakTier(level: 2, minutesPerDay: 45),
    StreakTier(level: 3, minutesPerDay: 60),
    StreakTier(level: 4, minutesPerDay: 90),
  ];

  ///
  /// The balance and the badge ladder live in one place for every screen that
  /// shows them, so this holds neither.
  ///
  final PointsService _points;

  late List<WeeklyQuest> _quests = _seedQuests;

  late List<Prediction> _predictions = _seedPredictions;

  late StreakStatus _streak = _seedStreak;

  Stream<int> get pointsChanges => _points.pointsChanges;

  Future<P2pOverview> fetchOverview() async {
    await Future<void>.delayed(mockLatency);
    return P2pOverview(
      rank: rank,
      rankGainThisWeek: rankGainThisWeek,
      streakPoints: _streakPoints,
      bestStreakDays: _streak.bestStreakDays,
      standing: _points.standing,
      games: const [
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
        P2pGame(
          kind: P2pGameKind.predictionGames,
          category: 'PREDICT',
          title: 'Prediction Game',
          subtitle: 'Predict outcomes and earn big',
          imageAsset: AppImageAssets.p2pPredictionGame,
        ),
      ],
    );
  }

  Future<List<WeeklyQuest>> fetchQuests() async {
    await Future<void>.delayed(mockLatency);
    return _quests;
  }

  ///
  /// A 404 rather than a StateError: a stale link is a request that failed, and
  /// the cubits catch AppException only.
  ///
  Future<WeeklyQuest> fetchQuest(String id) async {
    await Future<void>.delayed(mockLatency);
    return _quest(id);
  }

  ///
  /// Marks one curated item watched and counts it towards its action. The
  /// design's 'Watch' button is what advances a quest, so this is what it does
  /// until a player exists to do it for real.
  ///
  Future<WeeklyQuest> watchCuratedItem(String questId, String actionId, String itemId) async {
    await Future<void>.delayed(mockLatency);
    final quest = _quest(questId);
    final actions = [
      for (final action in quest.actions)
        if (action.id == actionId) _withWatched(action, itemId) else action,
    ];
    final watched = quest.copyWith(actions: actions);
    _quests = [
      for (final entry in _quests)
        if (entry.id == questId) watched else entry,
    ];
    return watched;
  }

  ///
  /// Pays out a quest whose actions are all done. The points go through the
  /// shared balance, so every screen showing it moves together.
  ///
  Future<WeeklyQuest> claimQuest(String id) async {
    await Future<void>.delayed(mockLatency);
    final quest = _quest(id);
    if (!quest.isComplete) {
      throw const ValidationException(409);
    }
    // Already claimed is not an error: a retry after a dropped response has to
    // land on the same quest rather than pay twice.
    if (quest.status == QuestStatus.claimed) {
      return quest;
    }
    _points.credit(quest.points);
    final claimed = quest.copyWith(status: QuestStatus.claimed, completedInDays: 3);
    _quests = [
      for (final entry in _quests)
        if (entry.id == id) claimed else entry,
    ];
    return claimed;
  }

  Future<StreakStatus> fetchStreak() async {
    await Future<void>.delayed(mockLatency);
    return _streak;
  }

  ///
  /// The intro's CTA. The seed already sits at day zero of the first rung, so
  /// starting is the flag and nothing else.
  ///
  Future<StreakStatus> startStreak() async {
    await Future<void>.delayed(mockLatency);
    return _streak = _streak.copyWith(hasStarted: true);
  }

  ///
  /// Counts today as done, which is the only thing that advances the streak.
  /// A day that finishes the week leaves it finished, so the drawer fires off
  /// the state this returns; the next day opens the level above.
  ///
  Future<StreakStatus> completeTodaysSession() async {
    await Future<void>.delayed(mockLatency);
    var streak = _streak;
    if (!streak.hasStarted || streak.isLadderComplete) {
      throw const ValidationException(409);
    }
    if (streak.isLevelComplete) {
      streak = streak.copyWith(level: streak.nextTier!.level, daysDoneThisWeek: 0);
    }
    final run = streak.currentStreakDays + 1;
    return _streak = streak.copyWith(
      daysDoneThisWeek: streak.daysDoneThisWeek + 1,
      minutesToday: streak.minutesPerDay,
      currentStreakDays: run,
      activeDays: streak.activeDays + 1,
      bestStreakDays: math.max(run, streak.bestStreakDays),
    );
  }

  Future<List<Prediction>> fetchPredictions() async {
    await Future<void>.delayed(mockLatency);
    return _predictions;
  }

  Future<Prediction> fetchPrediction(String id) async {
    await Future<void>.delayed(mockLatency);
    return _prediction(id);
  }

  ///
  /// Records a vote and counts the voter into the turnout. The split itself
  /// cannot move without the vote totals behind it, which the API will hold
  /// and this does not.
  ///
  Future<Prediction> castVote(String id, PredictionSide side) async {
    await Future<void>.delayed(mockLatency);
    final prediction = _prediction(id);
    if (!prediction.isOpen) {
      throw const ValidationException(409);
    }
    final voted = prediction.copyWith(
      vote: side,
      turnoutPercent: (prediction.turnoutPercent + 1).clamp(0, 100),
    );
    _predictions = [
      for (final entry in _predictions)
        if (entry.id == id) voted else entry,
    ];
    return voted;
  }

  ///
  /// Watching an item the action has already counted changes nothing, so a
  /// second tap cannot push the count past its target.
  ///
  static QuestAction _withWatched(QuestAction action, String itemId) {
    final item = action.curated.where((entry) => entry.id == itemId).firstOrNull;
    if (item == null || item.isWatched) {
      return action;
    }
    return action.copyWith(
      done: (action.done + 1).clamp(0, action.target),
      curated: [
        for (final entry in action.curated)
          if (entry.id == itemId) entry.copyWith(isWatched: true) else entry,
      ],
    );
  }

  ///
  /// The design labels the streak column in points, and the streak is the only
  /// thing on that card that could pay them, so the figure is derived from the
  /// run rather than stored beside it.
  ///
  int get _streakPoints => _streak.currentStreakDays * _streak.minutesPerDay;

  WeeklyQuest _quest(String id) {
    final match = _quests.where((quest) => quest.id == id).firstOrNull;
    if (match == null) {
      throw const NotFoundException();
    }
    return match;
  }

  Prediction _prediction(String id) {
    final match = _predictions.where((prediction) => prediction.id == id).firstOrNull;
    if (match == null) {
      throw const NotFoundException();
    }
    return match;
  }

  ///
  /// A run that has lapsed rather than one that never was: the best run and the
  /// days already active are history, and nothing is going now. The intro
  /// quotes the first rung's minutes, so the run has to begin on that rung.
  ///
  static const StreakStatus _seedStreak = StreakStatus(
    hasStarted: false,
    level: 1,
    daysPerLevel: 7,
    daysDoneThisWeek: 0,
    minutesToday: 0,
    currentStreakDays: 0,
    bestStreakDays: 21,
    activeDays: 47,
    tiers: streakTiers,
  );

  static const List<WeeklyQuest> _seedQuests = [
    WeeklyQuest(
      id: 'trailer-marathon',
      title: 'Trailer Marathon',
      description: 'Watch 10 trailers in a single session to earn your weekly bonus.',
      imageAsset: AppImageAssets.questTrailerMarathon,
      points: 500,
      badgeName: 'Cinematic Visionary',
      status: QuestStatus.active,
      timeLeft: Duration(days: 2, hours: 14),
      actions: [
        QuestAction(
          id: 'watch',
          title: 'Watch 3 Trailers',
          description: 'Watch admin-curated trailers below to complete this task',
          imageAsset: AppImageAssets.questTrailerMarathon,
          done: 2,
          target: 3,
          curated: [
            CuratedItem(
              id: 'neon-noir-trailer',
              title: 'Neon Noir — Official Trailer',
              imageAsset: AppImageAssets.movieNeonNoir,
              isWatched: true,
            ),
            CuratedItem(
              id: 'silent-storm-trailer',
              title: 'The Silent Storm',
              imageAsset: AppImageAssets.movieSilentStorm,
              isWatched: true,
            ),
            CuratedItem(
              id: 'midnight-requiem-trailer',
              title: 'Midnight Requiem',
              imageAsset: AppImageAssets.movieMidnightRequiem,
              isWatched: false,
            ),
          ],
        ),
        QuestAction(
          id: 'like',
          title: 'Like 5 Videos',
          description: 'Like any 5 trailers from the curated list',
          imageAsset: AppImageAssets.questGenreExplorer,
          done: 5,
          target: 5,
          curated: [],
        ),
        QuestAction(
          id: 'comment',
          title: 'Leave 2 Comments',
          description: 'Drop a comment on any trailer to engage with the community',
          imageAsset: AppImageAssets.questCommentConnoisseur,
          done: 1,
          target: 2,
          curated: [
            CuratedItem(
              id: 'neon-noir-bts',
              title: 'Neon Noir — BTS',
              imageAsset: AppImageAssets.movieNeonNoir,
              isWatched: true,
            ),
            CuratedItem(
              id: 'silent-storm-bts',
              title: 'The Silent Storm — BTS',
              imageAsset: AppImageAssets.movieSilentStorm,
              isWatched: false,
            ),
          ],
        ),
        QuestAction(
          id: 'share',
          title: 'Share 1 Trailer',
          description: 'Share a trailer with your network',
          imageAsset: AppImageAssets.p2pDailyStreaks,
          done: 1,
          target: 1,
          curated: [],
        ),
      ],
    ),
    WeeklyQuest(
      id: 'nolan-exclusive',
      title: 'Christopher Nolan Exclusive',
      description: 'Watch 3 curated Christopher Nolan features',
      imageAsset: AppImageAssets.questTrailerMarathon,
      points: 500,
      badgeName: 'Nolan Devotee',
      status: QuestStatus.available,
      timeLeft: Duration(days: 4),
      actions: [
        QuestAction(
          id: 'watch',
          title: 'Watch 3 videos',
          description: 'Watch the curated Nolan features below',
          imageAsset: AppImageAssets.questTrailerMarathon,
          done: 0,
          target: 3,
          curated: [
            CuratedItem(
              id: 'nolan-neon-noir',
              title: 'Neon Noir — Extended Cut',
              imageAsset: AppImageAssets.movieNeonNoir,
              isWatched: false,
            ),
            CuratedItem(
              id: 'nolan-silent-storm',
              title: 'The Silent Storm — Featurette',
              imageAsset: AppImageAssets.movieSilentStorm,
              isWatched: false,
            ),
            CuratedItem(
              id: 'nolan-midnight-requiem',
              title: 'Midnight Requiem — Making Of',
              imageAsset: AppImageAssets.movieMidnightRequiem,
              isWatched: false,
            ),
          ],
        ),
      ],
    ),
    WeeklyQuest(
      id: 'genre-explorer',
      title: 'Genre Explorer',
      description: 'Watch trailers from 3 different genres',
      imageAsset: AppImageAssets.questGenreExplorer,
      points: 750,
      badgeName: 'Genre Explorer',
      status: QuestStatus.available,
      timeLeft: Duration(days: 5),
      actions: [
        QuestAction(
          id: 'watch',
          title: 'Watch 3 genres',
          description: 'Watch the curated trailers below, one per genre',
          imageAsset: AppImageAssets.questGenreExplorer,
          done: 0,
          target: 3,
          curated: [
            CuratedItem(
              id: 'genre-neon-noir',
              title: 'Neon Noir — Thriller',
              imageAsset: AppImageAssets.movieNeonNoir,
              isWatched: false,
            ),
            CuratedItem(
              id: 'genre-silent-storm',
              title: 'The Silent Storm — Drama',
              imageAsset: AppImageAssets.movieSilentStorm,
              isWatched: false,
            ),
            CuratedItem(
              id: 'genre-midnight-requiem',
              title: 'Midnight Requiem — Mystery',
              imageAsset: AppImageAssets.movieMidnightRequiem,
              isWatched: false,
            ),
          ],
        ),
      ],
    ),
    WeeklyQuest(
      id: 'comment-connoisseur',
      title: 'Comment Connoisseur',
      description: 'Leave 10 meaningful comments',
      imageAsset: AppImageAssets.questCommentConnoisseur,
      points: 300,
      badgeName: 'Comment Connoisseur',
      status: QuestStatus.claimed,
      timeLeft: Duration.zero,
      completedInDays: 3,
      actions: [
        QuestAction(
          id: 'watch',
          title: 'Watch 3 Trailers',
          description: 'Watch admin-curated trailers to complete this task',
          imageAsset: AppImageAssets.questTrailerMarathon,
          done: 3,
          target: 3,
          curated: [],
        ),
        QuestAction(
          id: 'like',
          title: 'Like 5 Videos',
          description: 'Like any 5 trailers from the curated list',
          imageAsset: AppImageAssets.questGenreExplorer,
          done: 5,
          target: 5,
          curated: [],
        ),
        QuestAction(
          id: 'comment',
          title: 'Leave 2 Comments',
          description: 'Drop a comment on any trailer to engage with the community',
          imageAsset: AppImageAssets.questCommentConnoisseur,
          done: 2,
          target: 2,
          curated: [],
        ),
        QuestAction(
          id: 'share',
          title: 'Share 1 Trailer',
          description: 'Share a trailer with your network',
          imageAsset: AppImageAssets.p2pDailyStreaks,
          done: 1,
          target: 1,
          curated: [],
        ),
      ],
    ),
  ];

  static const List<Prediction> _seedPredictions = [
    Prediction(
      id: 'neon-noir-box-office',
      title: 'Neon Noir',
      question: 'Will Neon Noir cross ₹100 Crore in its opening week?',
      imageAsset: AppImageAssets.movieNeonNoir,
      points: 300,
      multiplier: 3,
      yesPercent: 62,
      turnoutPercent: 80,
      closesIn: Duration(hours: 6, minutes: 14, seconds: 22),
      status: PredictionStatus.open,
    ),
    Prediction(
      id: 'silent-storm-top-five',
      title: 'The Silent Storm',
      question: 'Will The Silent Storm land in the worldwide top 5 on its opening weekend?',
      imageAsset: AppImageAssets.movieSilentStorm,
      points: 500,
      multiplier: 2,
      yesPercent: 55,
      turnoutPercent: 60,
      closesIn: Duration(hours: 21, minutes: 40),
      status: PredictionStatus.open,
    ),
    Prediction(
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
    ),
  ];
}
