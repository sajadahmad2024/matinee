import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/features/p2p/data/models/p2p_overview.dart';
import 'package:matinee/features/p2p/data/models/prediction.dart';
import 'package:matinee/features/p2p/data/models/streak_status.dart';
import 'package:matinee/features/p2p/data/models/weekly_quest.dart';
import 'package:matinee/features/p2p/data/services/p2p_api_service.dart';
import 'package:matinee/shared/points/data/services/points_service.dart';

void main() {
  group(P2pApiService, () {
    late PointsService points;
    late P2pApiService service;

    setUp(() {
      points = PointsService();
      service = P2pApiService(points);
    });

    group('fetchOverview', () {
      test('reads the balance and the badge off the shared ladder, not its own copy', () async {
        final overview = await service.fetchOverview();
        expect(overview.standing, points.standing);
        expect(overview.standing.totalPoints, points.balance);
      });

      test('offers one card per game, so the hub cannot list a route that is not there', () async {
        final overview = await service.fetchOverview();
        expect(
          overview.games.map((game) => game.kind),
          containsAll(P2pGameKind.values),
        );
      });

      test('derives the streak points from the run, so the two cannot disagree', () async {
        final overview = await service.fetchOverview();
        final streak = await service.fetchStreak();
        expect(overview.streakPoints, streak.currentStreakDays * streak.minutesPerDay);
        expect(overview.bestStreakDays, streak.bestStreakDays);
      });
    });

    group('fetchQuests', () {
      test('features exactly one running quest, which is what the hero draws', () async {
        final quests = await service.fetchQuests();
        expect(quests.where((quest) => quest.status == QuestStatus.active), hasLength(1));
      });

      test('gives every quest a badge, so a claim always has something to award', () async {
        final quests = await service.fetchQuests();
        expect(quests.every((quest) => quest.badgeName.isNotEmpty), isTrue);
      });

      test('counts a quest complete only when every action reached its target', () async {
        final quests = await service.fetchQuests();
        for (final quest in quests) {
          expect(
            quest.isComplete,
            quest.actions.every((action) => action.done >= action.target),
            reason: quest.id,
          );
        }
      });

      test('leaves the claimed quest complete, because it was paid for', () async {
        final quests = await service.fetchQuests();
        final claimed = quests.firstWhere((quest) => quest.status == QuestStatus.claimed);
        expect(claimed.isComplete, isTrue);
        expect(claimed.completedInDays, isNotNull);
      });
    });

    group('fetchQuest', () {
      test('throws a $NotFoundException for an id the seed does not hold', () {
        expect(() => service.fetchQuest('nope'), throwsA(isA<NotFoundException>()));
      });
    });

    group('watchCuratedItem', () {
      test('counts the item once and marks it watched', () async {
        const questId = 'trailer-marathon';
        final before = await service.fetchQuest(questId);
        final action = before.actions.firstWhere((entry) => entry.id == 'watch');
        final pending = action.curated.firstWhere((item) => !item.isWatched);

        final after = await service.watchCuratedItem(questId, action.id, pending.id);
        final watched = after.actions.firstWhere((entry) => entry.id == action.id);

        expect(watched.done, action.done + 1);
        expect(watched.curated.firstWhere((item) => item.id == pending.id).isWatched, isTrue);
      });

      test('does nothing on an item already counted, so a second tap cannot overshoot', () async {
        const questId = 'trailer-marathon';
        final before = await service.fetchQuest(questId);
        final action = before.actions.firstWhere((entry) => entry.id == 'watch');
        final done = action.curated.firstWhere((item) => item.isWatched);

        final after = await service.watchCuratedItem(questId, action.id, done.id);

        expect(after.actions.firstWhere((entry) => entry.id == action.id).done, action.done);
      });
    });

    group('claimQuest', () {
      test('throws a $ValidationException while the quest is unfinished', () {
        expect(
          () => service.claimQuest('trailer-marathon'),
          throwsA(isA<ValidationException>()),
        );
      });

      test('credits the shared balance once the quest is finished', () async {
        const questId = 'trailer-marathon';
        final quest = await service.fetchQuest(questId);
        for (final action in quest.actions) {
          for (final item in action.curated.where((entry) => !entry.isWatched)) {
            await service.watchCuratedItem(questId, action.id, item.id);
          }
        }
        final before = points.balance;

        final claimed = await service.claimQuest(questId);
        // Twice: a retry after a dropped response has to land on the same
        // quest rather than pay for it again.
        await service.claimQuest(questId);

        expect(claimed.status, QuestStatus.claimed);
        expect(points.balance, before + quest.points);
      });

      test('pays nothing for a quest the seed already settled', () async {
        final before = points.balance;

        await service.claimQuest('comment-connoisseur');

        expect(points.balance, before);
      });
    });

    group('fetchPredictions', () {
      test('splits every vote so the two shares add to a hundred', () async {
        final predictions = await service.fetchPredictions();
        for (final prediction in predictions) {
          expect(prediction.yesPercent + prediction.noPercent, 100, reason: prediction.id);
        }
      });

      test('settles only the predictions that carry a vote', () async {
        final predictions = await service.fetchPredictions();
        for (final prediction in predictions.where((entry) => !entry.isOpen)) {
          expect(prediction.hasVoted, isTrue, reason: prediction.id);
        }
      });
    });

    group('castVote', () {
      test('records the side and counts the voter into the turnout', () async {
        const id = 'neon-noir-box-office';
        final before = await service.fetchPrediction(id);

        final voted = await service.castVote(id, PredictionSide.no);

        expect(voted.vote, PredictionSide.no);
        expect(voted.turnoutPercent, before.turnoutPercent + 1);
      });

      test('throws a $ValidationException once the poll has closed', () {
        expect(
          () => service.castVote('midnight-requiem-cinematography', PredictionSide.yes),
          throwsA(isA<ValidationException>()),
        );
      });
    });

    group('fetchQuests', () {
      test('gives every unclaimed quest a way to advance in the app', () async {
        final quests = await service.fetchQuests();
        final startable = quests.where((quest) => quest.status != QuestStatus.claimed);

        expect(startable, isNotEmpty);
        for (final quest in startable) {
          // Without curated content there is no Watch button, so 'Start Quest'
          // opens a tracker with nothing on it to press.
          expect(
            quest.actions.any((action) => action.curated.isNotEmpty),
            isTrue,
            reason: '${quest.id} has no action that can be advanced',
          );
        }
      });
    });

    group('completeTodaysSession', () {
      test('refuses before the streak has started', () async {
        await expectLater(
          service.completeTodaysSession,
          throwsA(isA<ValidationException>()),
        );
      });

      test('counts today towards the week and the run', () async {
        await service.startStreak();
        final streak = await service.completeTodaysSession();

        expect(streak.daysDoneThisWeek, 1);
        expect(streak.currentStreakDays, 1);
        expect(streak.minutesToday, streak.minutesPerDay);
      });

      test('reaches a finished week, which is what the level drawer waits for', () async {
        var streak = await service.startStreak();
        for (var day = 0; day < streak.daysPerLevel; day++) {
          streak = await service.completeTodaysSession();
        }

        expect(streak.isLevelComplete, isTrue);
        expect(streak.daysDoneThisWeek, streak.daysPerLevel);
      });

      test('opens the level above once the week it finished is behind it', () async {
        var streak = await service.startStreak();
        final first = streak.level;
        for (var day = 0; day <= streak.daysPerLevel; day++) {
          streak = await service.completeTodaysSession();
        }

        expect(streak.level, greaterThan(first));
        expect(streak.daysDoneThisWeek, 1);
        expect(streak.isLevelComplete, isFalse);
      });

      test('keeps the longest run as the best once the current one passes it', () async {
        var streak = await service.startStreak();
        final best = streak.bestStreakDays;
        for (var day = 0; day <= best; day++) {
          streak = await service.completeTodaysSession();
        }

        expect(streak.bestStreakDays, streak.currentStreakDays);
      });
    });

    group('startStreak', () {
      test('pays no streak points for a run that has not begun', () async {
        final overview = await service.fetchOverview();

        expect(overview.streakPoints, isZero);
        // The run has lapsed rather than never happened, so the history stands.
        expect(overview.bestStreakDays, greaterThan(0));
      });

      test('begins on the rung the intro quotes, at day zero', () async {
        final before = await service.fetchStreak();
        expect(before.level, P2pApiService.streakTiers.first.level);

        final started = await service.startStreak();

        expect(started.minutesPerDay, P2pApiService.streakTiers.first.minutesPerDay);
        expect(started.currentStreakDays, isZero);
        expect(started.daysDoneThisWeek, isZero);
        expect(started.minutesToday, isZero);
      });

      test('starts on the intro and reports the ladder once the CTA is pressed', () async {
        expect((await service.fetchStreak()).hasStarted, isFalse);
        expect((await service.startStreak()).hasStarted, isTrue);
        expect((await service.fetchStreak()).hasStarted, isTrue);
      });

      test('holds the level the status names inside the ladder it ships', () async {
        final streak = await service.fetchStreak();
        expect(streak.tiers.map((tier) => tier.level), contains(streak.level));
        expect(streak.currentTier?.minutesPerDay, streak.minutesPerDay);
      });

      test('leaves what today still needs as the gap to the level target', () async {
        final streak = await service.fetchStreak();
        expect(streak.minutesLeftToday, streak.minutesPerDay - streak.minutesToday);
        expect(streak.daysToNextLevel, streak.daysPerLevel - streak.daysDoneThisWeek);
      });
    });
  });
}
