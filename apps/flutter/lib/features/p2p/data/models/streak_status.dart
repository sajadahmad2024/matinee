import 'package:freezed_annotation/freezed_annotation.dart';

part 'streak_status.freezed.dart';

///
/// The daily streak: which level it has reached, how today's session is going,
/// and the run it has built. Everything the screens show beyond these is
/// derived, so no two figures can contradict each other.
///
@freezed
abstract class StreakStatus with _$StreakStatus {
  const factory StreakStatus({
    /// False before the first day, which is the intro screen rather than a
    /// streak of zero.
    required bool hasStarted,

    required int level,
    required int daysPerLevel,
    required int daysDoneThisWeek,
    required int minutesToday,
    required int currentStreakDays,
    required int bestStreakDays,
    required int activeDays,
    required List<StreakTier> tiers,
  }) = _StreakStatus;
}

extension StreakStatusX on StreakStatus {
  ///
  /// Null only for a ladder that arrived empty, which a screen has to render
  /// rather than throw out of `build` and past the cubit's failure path.
  ///
  StreakTier? get currentTier => tiers.where((tier) => tier.level == level).firstOrNull ?? tiers.firstOrNull;

  /// The rung the intro quotes, which is the ladder's own first.
  StreakTier? get firstTier => tiers.firstOrNull;

  StreakTier? get nextTier => tiers.where((tier) => tier.level > level).firstOrNull;

  int get minutesPerDay => currentTier?.minutesPerDay ?? 0;

  int get minutesLeftToday {
    final target = minutesPerDay;
    return (target - minutesToday).clamp(0, target);
  }

  double get sessionProgress {
    final target = minutesPerDay;
    return target == 0 ? 0 : (minutesToday / target).clamp(0, 1);
  }

  int get daysToNextLevel => (daysPerLevel - daysDoneThisWeek).clamp(0, daysPerLevel);

  /// True on the day the week's last rung is cleared, which is what the
  /// level-complete drawer waits for.
  bool get isLevelComplete => daysDoneThisWeek >= daysPerLevel;

  /// The top rung's week is finished, so there is no day left to count.
  bool get isLadderComplete => isLevelComplete && nextTier == null;
}

/// One rung of the ladder: the daily minutes a level asks for.
@freezed
abstract class StreakTier with _$StreakTier {
  const factory StreakTier({required int level, required int minutesPerDay}) = _StreakTier;
}
