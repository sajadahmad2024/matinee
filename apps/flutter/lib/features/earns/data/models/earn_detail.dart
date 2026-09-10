import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:matinee/features/earns/data/models/auction_win.dart';
import 'package:matinee/features/earns/data/models/earn_source.dart';
import 'package:matinee/features/earns/data/models/prediction_result.dart';
import 'package:matinee/features/earns/data/models/quest_week.dart';
import 'package:matinee/features/earns/data/models/streak_day.dart';

part 'earn_detail.freezed.dart';

///
/// What one earn source has paid and the history behind it. A variant per
/// source, because the four histories share no row shape.
///
/// [pointsEarned] is the source's lifetime total, the same figure its My Earns
/// row carries; the history holds the recent entries, which need not sum to it.
///
@freezed
sealed class EarnDetail with _$EarnDetail {
  const factory EarnDetail.streaks({
    required int pointsEarned,
    required List<StreakLevel> levels,
    required List<StreakDay> days,
  }) = StreakDetail;

  const factory EarnDetail.auction({
    required int pointsEarned,
    required List<AuctionWin> wins,
  }) = AuctionDetail;

  const factory EarnDetail.predictions({
    required int pointsEarned,
    required List<PredictionResult> results,
  }) = PredictionDetail;

  const factory EarnDetail.quests({
    required int pointsEarned,
    required List<QuestWeek> weeks,
  }) = QuestDetail;
}

extension EarnDetailX on EarnDetail {
  /// Which screen this is, for the strings the design sets per source.
  EarnSourceKind get kind {
    return switch (this) {
      StreakDetail() => EarnSourceKind.dailyStreaks,
      AuctionDetail() => EarnSourceKind.auctionWins,
      PredictionDetail() => EarnSourceKind.predictionGames,
      QuestDetail() => EarnSourceKind.weeklyQuests,
    };
  }
}

extension StreakDetailX on StreakDetail {
  /// The streak the log runs up to, which its newest day counts.
  int get activeDays => days.isEmpty ? 0 : days.first.dayCount;
}

extension PredictionDetailX on PredictionDetail {
  int get correctCount => results.where((result) => result.isCorrect).length;

  /// Rounded, as the design writes it: 2 of 3 reads 67%.
  int get accuracyPercent {
    if (results.isEmpty) {
      return 0;
    }
    return (correctCount * 100 / results.length).round();
  }
}

extension QuestDetailX on QuestDetail {
  int get claimedCount => weeks.where((week) => week.isClaimed).length;
}
