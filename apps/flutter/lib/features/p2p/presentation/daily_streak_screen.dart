import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/core/l10n/app_exception_l10n.dart';
import 'package:matinee/core/l10n/l10n.dart';
import 'package:matinee/core/responsive/responsive.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/core/widgets/back_app_bar.dart';
import 'package:matinee/core/widgets/error_view.dart';
import 'package:matinee/core/widgets/loading_view.dart';
import 'package:matinee/di/service_locator.dart';
import 'package:matinee/features/p2p/data/models/streak_status.dart';
import 'package:matinee/features/p2p/data/p2p_repository.dart';
import 'package:matinee/features/p2p/presentation/cubit/daily_streak_cubit.dart';
import 'package:matinee/features/p2p/presentation/cubit/daily_streak_state.dart';
import 'package:matinee/features/p2p/presentation/widgets/level_track.dart';
import 'package:matinee/features/p2p/presentation/widgets/reward_stat_card.dart';
import 'package:matinee/features/p2p/presentation/widgets/session_card.dart';
import 'package:matinee/features/p2p/presentation/widgets/streak_intro_view.dart';
import 'package:matinee/features/p2p/presentation/widgets/streak_level_card.dart';
import 'package:matinee/features/p2p/presentation/widgets/streak_level_sheet.dart';
import 'package:matinee/l10n/gen/app_localizations.dart';

/// The emoji the design marks a running streak with, until the icon font has it.
const String _flameGlyph = '🔥';

///
/// The daily streak. Which of the design's two frames shows is the streak's own
/// state: the intro before it starts, the ladder and today's session after.
///
class DailyStreakScreen extends StatelessWidget {
  const DailyStreakScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) {
        final cubit = DailyStreakCubit(getIt<P2pRepository>());
        unawaited(cubit.load());
        return cubit;
      },
      child: const DailyStreakView(),
    );
  }
}

@visibleForTesting
class DailyStreakView extends StatelessWidget {
  const DailyStreakView({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return BlocConsumer<DailyStreakCubit, DailyStreakState>(
      listenWhen: _isWorthAnnouncing,
      listener: _announce,
      builder: (context, state) {
        final isIntro = switch (state) {
          DailyStreakSuccess(:final streak) => !streak.hasStarted,
          _ => false,
        };
        return Scaffold(
          // The intro is a full-bleed still with the header over it; the detail
          // has a bar of its own.
          extendBodyBehindAppBar: isIntro,
          appBar: BackAppBar(
            // Nothing in the bar on the intro: the hero carries the heading,
            // and a title over copy that scrolls under it collides with that
            // copy once the text is scaled up.
            title: isIntro ? null : l10n.streakTitle,
            // Over the still on the intro, on a bar of its own once the ladder
            // and the session cards are what sits under it.
            foregroundColor: isIntro ? context.appColors.text.primary : null,
          ),
          body: switch (state) {
            DailyStreakInitial() => const SizedBox.shrink(),
            DailyStreakLoading() => const LoadingView(),
            DailyStreakFailure(:final error) => ErrorView(
              message: error.localizedMessage(l10n),
              onRetry: () => unawaited(context.read<DailyStreakCubit>().load()),
            ),
            final DailyStreakSuccess success =>
              success.streak.hasStarted
                  ? _Detail(success: success)
                  : StreakIntroView(
                      minutesPerDay: success.streak.firstTier?.minutesPerDay ?? 0,
                      isStarting: success.isBusy,
                      onStart: () => unawaited(context.read<DailyStreakCubit>().start()),
                    ),
          },
        );
      },
    );
  }

  ///
  /// A week that just finished, or a day that failed to count. The two never
  /// coincide: a failure leaves the streak where it was.
  ///
  static bool _isWorthAnnouncing(DailyStreakState previous, DailyStreakState current) {
    return _justCompletedLevel(previous, current) || _actionError(current) != null;
  }

  static void _announce(BuildContext context, DailyStreakState state) {
    if (_actionError(state) case final error?) {
      // A snackbar rather than a screen: the ladder is still there, and the
      // tap is still worth repeating.
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(error.localizedMessage(context.l10n))));
      return;
    }
    unawaited(_announceLevel(context, state));
  }

  static AppException? _actionError(DailyStreakState state) {
    return switch (state) {
      DailyStreakSuccess(:final actionError) => actionError,
      _ => null,
    };
  }

  ///
  /// The week's last day landed on this build and not on the one before it. A
  /// load that arrives already complete is not a completion: the drawer would
  /// open every time the screen is entered.
  ///
  static bool _justCompletedLevel(DailyStreakState previous, DailyStreakState current) {
    return previous is DailyStreakSuccess && _isLevelComplete(current) && !_isLevelComplete(previous);
  }

  static bool _isLevelComplete(DailyStreakState state) {
    return switch (state) {
      DailyStreakSuccess(:final streak) => streak.hasStarted && streak.isLevelComplete,
      _ => false,
    };
  }

  static Future<void> _announceLevel(BuildContext context, DailyStreakState state) async {
    if (state case DailyStreakSuccess(:final streak)) {
      await showStreakLevelSheet(
        context,
        days: streak.daysPerLevel,
        // What the level pays is the run it asks for, at its own daily minutes.
        pointsLabel: context.decimalFormat.format(streak.daysPerLevel * streak.minutesPerDay),
      );
    }
  }
}

class _Detail extends StatelessWidget {
  const _Detail({required this.success});

  final DailyStreakSuccess success;

  @override
  Widget build(BuildContext context) {
    final streak = success.streak;
    return ContentContainer(
      maxWidth: ContentContainer.reading,
      child: ListView(
        padding: EdgeInsets.only(
          left: AppScreenPadding.main,
          right: AppScreenPadding.main,
          top: AppSpacing.sm,
          bottom: context.bottomInset(AppSpacing.xxxl),
        ),
        children: [
          _LevelCard(streak: streak),
          Padding(
            padding: const EdgeInsets.only(top: AppSpacing.lg),
            child: _Track(streak: streak),
          ),
          Padding(
            padding: const EdgeInsets.only(top: AppSpacing.lg),
            child: _Session(streak: streak),
          ),
          Padding(
            padding: const EdgeInsets.only(top: AppSpacing.lg),
            child: _Stats(streak: streak),
          ),
          Padding(
            padding: const EdgeInsets.only(top: AppSpacing.xl),
            // No frame draws a session tracker, so nothing else advances a
            // day — and without a day advancing, the ladder never moves.
            child: FilledButton(
              onPressed: success.isBusy || streak.isLadderComplete
                  ? null
                  : () => unawaited(context.read<DailyStreakCubit>().completeToday()),
              child: Text(context.l10n.streakCompleteDay),
            ),
          ),
        ],
      ),
    );
  }
}

class _LevelCard extends StatelessWidget {
  const _LevelCard({required this.streak});

  final StreakStatus streak;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final next = streak.nextTier;
    return StreakLevelCard(
      eyebrow: l10n.streakCurrentLevel,
      level: '${streak.level}',
      levelName: l10n.streakLevelName(streak.level),
      requirement: l10n.streakLevelRequirement(streak.minutesPerDay, streak.daysPerLevel),
      weekLabel: l10n.streakThisWeek,
      weekFraction: l10n.streakWeekFraction(streak.daysDoneThisWeek, streak.daysPerLevel),
      weekCaption: l10n.streakDaysDone,
      daysDone: streak.daysDoneThisWeek,
      daysTotal: streak.daysPerLevel,
      // The top of the ladder has nothing above it, so it reads as a run to
      // keep rather than a level to unlock.
      footnote: next == null
          ? l10n.streakTopLevelCaption
          : l10n.streakUnlockCaption(streak.daysToNextLevel, next.level, next.minutesPerDay),
      summary: l10n.streakLevelCardSummary(
        streak.level,
        streak.minutesPerDay,
        streak.daysPerLevel,
        streak.daysDoneThisWeek,
      ),
    );
  }
}

class _Track extends StatelessWidget {
  const _Track({required this.streak});

  final StreakStatus streak;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return LevelTrack(
      label: l10n.streakLevelTrack,
      steps: [
        for (final tier in streak.tiers)
          // Decided once: two switches over the same comparison can drift, and
          // show a rung as current while speaking it as locked.
          _step(l10n, tier, switch (tier.level.compareTo(streak.level)) {
            < 0 => LevelStandard.done,
            0 => LevelStandard.current,
            _ => LevelStandard.locked,
          }),
      ],
    );
  }
}

LevelStep _step(AppLocalizations l10n, StreakTier tier, LevelStandard standing) {
  return LevelStep(
    level: '${tier.level}',
    label: l10n.streakTierLabel(tier.minutesPerDay),
    standing: standing,
    semanticLabel: switch (standing) {
      LevelStandard.done => l10n.streakTierSummaryDone(tier.level, tier.minutesPerDay),
      LevelStandard.current => l10n.streakTierSummaryCurrent(tier.level, tier.minutesPerDay),
      LevelStandard.locked => l10n.streakTierSummaryLocked(tier.level, tier.minutesPerDay),
    },
  );
}

class _Session extends StatelessWidget {
  const _Session({required this.streak});

  final StreakStatus streak;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final isMet = streak.minutesLeftToday == 0;
    return SessionCard(
      eyebrow: l10n.streakTodaySession,
      minutes: '${streak.minutesToday}',
      target: l10n.streakSessionTarget(streak.minutesPerDay),
      remainingLabel: isMet ? l10n.streakSessionMet : l10n.streakMinutesLeft(streak.minutesLeftToday),
      isMet: isMet,
      progress: streak.sessionProgress,
      caption: l10n.streakSessionCaption(streak.level, streak.minutesPerDay),
      summary: l10n.streakSessionSummary(streak.minutesToday, streak.minutesPerDay),
    );
  }
}

class _Stats extends StatelessWidget {
  const _Stats({required this.streak});

  final StreakStatus streak;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final days = l10n.streakDaysUnit;
    return // IntrinsicHeight, or stretching the children asks a Row inside a
    // Column to fill a height that has no bound.
    IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        spacing: AppSpacing.listGap,
        children: [
          Expanded(
            child: RewardStatCard.figure(
              label: l10n.streakNowLabel,
              value: '$_flameGlyph ${streak.currentStreakDays}',
              unit: days,
              isHighlighted: true,
              summary: l10n.streakNowSummary(streak.currentStreakDays),
            ),
          ),
          Expanded(
            child: RewardStatCard.figure(
              label: l10n.streakBestLabel,
              value: '${streak.bestStreakDays}',
              unit: days,
              summary: l10n.streakBestSummary(streak.bestStreakDays),
            ),
          ),
          Expanded(
            // No unit beside it: the design writes the count of active days on
            // its own, where the two streak figures are measured in days.
            child: RewardStatCard.figure(
              label: l10n.streakActiveLabel,
              value: '${streak.activeDays}',
              summary: l10n.streakActiveSummary(streak.activeDays),
            ),
          ),
        ],
      ),
    );
  }
}
