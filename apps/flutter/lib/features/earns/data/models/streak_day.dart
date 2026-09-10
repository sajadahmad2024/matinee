import 'package:freezed_annotation/freezed_annotation.dart';

part 'streak_day.freezed.dart';

/// One day of the streak log: what was watched, what it paid, what it crossed.
@freezed
abstract class StreakDay with _$StreakDay {
  const factory StreakDay({
    required DateTime date,
    required int dayCount,
    required int minutesWatched,
    required int points,

    /// Null on a day that fell short of the first rung, which draws no pill.
    required int? level,

    /// The badge the day's streak length reached; the design rings the card gold.
    String? badgeUnlocked,
  }) = _StreakDay;
}

///
/// One rung of the watch-time ladder the streak header lists. [minutes] is the
/// daily watch time that reaches it, so a day's level is read off the list.
///
@freezed
abstract class StreakLevel with _$StreakLevel {
  const factory StreakLevel({
    required int level,
    required int minutes,
    required bool isReached,
  }) = _StreakLevel;
}
