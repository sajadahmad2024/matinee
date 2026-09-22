import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/features/earns/data/models/earn_detail.dart';
import 'package:matinee/features/earns/data/models/earn_source.dart';
import 'package:matinee/features/earns/data/models/quest_week.dart';
import 'package:matinee/features/earns/data/services/earns_api_service.dart';
import 'package:matinee/shared/points/data/services/points_service.dart';

void main() {
  group(EarnsApiService, () {
    late EarnsApiService service;

    setUp(() => service = EarnsApiService(PointsService()));

    test('gives every source the total its My Earns row carries', () async {
      final overview = await service.fetchOverview();
      for (final source in overview.sources) {
        final detail = await service.fetchDetail(source.kind);
        expect(
          detail.pointsEarned,
          source.points,
          reason: 'the two screens would show different totals for ${source.kind}',
        );
      }
    });

    test('returns the variant that belongs to the source asked for', () async {
      for (final kind in EarnSourceKind.values) {
        expect((await service.fetchDetail(kind)).kind, kind);
      }
    });

    group('daily streaks', () {
      late StreakDetail detail;

      setUp(() async {
        detail = await service.fetchDetail(EarnSourceKind.dailyStreaks) as StreakDetail;
      });

      test('lights the rungs the log has met and leaves the rest', () {
        expect(
          detail.levels.map((level) => (level.minutes, level.isReached)),
          // The longest day in the log is 52 minutes, so the hour rung is out.
          [(30, true), (45, true), (60, false)],
        );
      });

      test('gives each day the level its watch time reached', () {
        for (final day in detail.days) {
          final expected = day.minutesWatched >= 45 ? 2 : 1;
          expect(day.level, expected, reason: '${day.minutesWatched} min should be level $expected');
        }
      });

      test('counts the days without a gap, so the dates and the counts agree', () {
        for (var i = 1; i < detail.days.length; i++) {
          expect(detail.days[i].dayCount, detail.days[i - 1].dayCount - 1);
          expect(
            detail.days[i].date.add(const Duration(days: 1)),
            detail.days[i - 1].date,
          );
        }
      });

      test('unlocks a badge only on the days the streak reaches one', () {
        final unlocks = {
          for (final day in detail.days) day.dayCount: ?day.badgeUnlocked,
        };
        expect(unlocks, {15: 'Spark Keeper', 7: 'First Flame'});
      });

      test('reports the streak the newest day stands at', () {
        expect(detail.activeDays, 15);
      });
    });

    test('sums the auction wins to the total the source paid', () async {
      final detail = await service.fetchDetail(EarnSourceKind.auctionWins) as AuctionDetail;
      final awarded = detail.wins.fold(0, (sum, win) => sum + win.pointsAwarded);
      expect(awarded, detail.pointsEarned);
    });

    test('reads the prediction accuracy off the results', () async {
      final detail = await service.fetchDetail(EarnSourceKind.predictionGames) as PredictionDetail;
      expect(detail.correctCount, 2);
      expect(detail.results.length, 3);
      expect(detail.accuracyPercent, 67);
    });

    test('counts a quest week claimed only when every action landed', () async {
      final detail = await service.fetchDetail(EarnSourceKind.weeklyQuests) as QuestDetail;
      expect(detail.claimedCount, 4);
      expect(detail.weeks.length, 5);
      expect(
        detail.weeks.where((week) => !week.isClaimed).map((week) => week.actionsCompleted),
        [3],
      );
    });
  });
}
