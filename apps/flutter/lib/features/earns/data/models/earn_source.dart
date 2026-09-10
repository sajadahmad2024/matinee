import 'package:freezed_annotation/freezed_annotation.dart';

part 'earn_source.freezed.dart';

///
/// One row of My Earns: where points came from, and how many. The share of the
/// balance the row shows is derived, so nothing here can contradict the total.
///
@freezed
abstract class EarnSource with _$EarnSource {
  const factory EarnSource({
    required EarnSourceKind kind,
    required String title,
    required String activity,
    required int points,
  }) = _EarnSource;
}

/// Picks the row's glyph, so the design's icon is chosen from data.
enum EarnSourceKind { dailyStreaks, weeklyQuests, predictionGames, auctionWins }
