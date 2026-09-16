import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:matinee/core/assets/assets.dart';
import 'package:matinee/core/l10n/app_exception_l10n.dart';
import 'package:matinee/core/l10n/l10n.dart';
import 'package:matinee/core/responsive/responsive.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/core/widgets/back_app_bar.dart';
import 'package:matinee/core/widgets/error_view.dart';
import 'package:matinee/core/widgets/loading_view.dart';
import 'package:matinee/core/widgets/section_label.dart';
import 'package:matinee/di/service_locator.dart';
import 'package:matinee/features/earns/data/earns_repository.dart';
import 'package:matinee/features/earns/data/models/auction_win.dart';
import 'package:matinee/features/earns/data/models/earn_detail.dart';
import 'package:matinee/features/earns/data/models/earn_source.dart';
import 'package:matinee/features/earns/data/models/prediction_result.dart';
import 'package:matinee/features/earns/data/models/quest_week.dart';
import 'package:matinee/features/earns/data/models/streak_day.dart';
import 'package:matinee/features/earns/presentation/cubit/earn_detail_cubit.dart';
import 'package:matinee/features/earns/presentation/cubit/earn_detail_state.dart';
import 'package:matinee/features/earns/presentation/widgets/activity_row.dart';
import 'package:matinee/features/earns/presentation/widgets/prediction_history_card.dart';
import 'package:matinee/features/earns/presentation/widgets/quest_history_card.dart';
import 'package:matinee/features/earns/presentation/widgets/streak_level_chips.dart';
import 'package:matinee/features/earns/presentation/widgets/summary_header.dart';
import 'package:matinee/features/earns/presentation/widgets/win_card.dart';
import 'package:matinee/l10n/gen/app_localizations.dart';

///
/// The history behind one My Earns row. One screen for all four sources: they
/// share the header, the section and the list, and differ only in the card.
///
class EarnDetailScreen extends StatelessWidget {
  const EarnDetailScreen({required this.kind, super.key});

  final EarnSourceKind kind;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) {
        final cubit = EarnDetailCubit(getIt<EarnsRepository>(), kind);
        unawaited(cubit.load());
        return cubit;
      },
      child: EarnDetailView(kind: kind),
    );
  }
}

@visibleForTesting
class EarnDetailView extends StatelessWidget {
  const EarnDetailView({required this.kind, super.key});

  final EarnSourceKind kind;

  /// The title the design gives this source's screen.
  static String title(AppLocalizations l10n, EarnSourceKind kind) {
    return switch (kind) {
      EarnSourceKind.dailyStreaks => l10n.earnsStreaksTitle,
      EarnSourceKind.auctionWins => l10n.earnsAuctionTitle,
      EarnSourceKind.predictionGames => l10n.earnsPredictionsTitle,
      EarnSourceKind.weeklyQuests => l10n.earnsQuestsTitle,
    };
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final screenTitle = title(l10n, kind);
    return Scaffold(
      appBar: BackAppBar(title: screenTitle),
      body: ContentContainer(
        maxWidth: ContentContainer.reading,
        child: BlocBuilder<EarnDetailCubit, EarnDetailState>(
          builder: (context, state) => switch (state) {
            EarnDetailInitial() => const SizedBox.shrink(),
            EarnDetailLoading() => const LoadingView(),
            EarnDetailFailure(:final error) => ErrorView(
              message: error.localizedMessage(l10n),
              onRetry: () => unawaited(context.read<EarnDetailCubit>().load()),
            ),
            EarnDetailSuccess(:final detail) => _Body(detail: detail, screenTitle: screenTitle),
          },
        ),
      ),
    );
  }
}

class _Body extends StatelessWidget {
  const _Body({required this.detail, required this.screenTitle});

  final EarnDetail detail;
  final String screenTitle;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final entries = _entries(context, l10n);
    return CustomScrollView(
      slivers: [
        SliverToBoxAdapter(child: _header(context, l10n)),
        SliverPadding(
          padding: const EdgeInsets.only(
            left: AppScreenPadding.main,
            right: AppScreenPadding.main,
            top: AppSpacing.lg,
            bottom: AppSpacing.md,
          ),
          sliver: SliverToBoxAdapter(child: SectionLabel(label: _sectionLabel(l10n), isMuted: true)),
        ),
        SliverPadding(
          padding: const EdgeInsets.symmetric(horizontal: AppScreenPadding.main),
          sliver: entries.isEmpty
              // A status, so a history with nothing in it is announced rather
              // than leaving the section silently empty under its heading.
              ? SliverToBoxAdapter(
                  child: Semantics(
                    role: SemanticsRole.status,
                    child: Text(
                      _emptyMessage(l10n),
                      style: AppTextStyle.caption.copyWith(color: context.appColors.text.muted),
                    ),
                  ),
                )
              // A list role, so the cards are read as a set with positions. A
              // sliver one, or the list collapses and loses its per-card indexes.
              : SliverSemantics(
                  role: SemanticsRole.list,
                  sliver: SliverList.separated(
                    itemCount: entries.length,
                    itemBuilder: (_, index) => entries[index],
                    separatorBuilder: (_, _) => SizedBox(height: _listGap),
                  ),
                ),
        ),
        SliverToBoxAdapter(
          child: SizedBox(height: context.bottomInset(AppSpacing.xxxl)),
        ),
      ],
    );
  }

  /// The design sets the streak and prediction lists tighter than the other two.
  double get _listGap {
    return switch (detail) {
      StreakDetail() || PredictionDetail() => AppSpacing.listGap,
      AuctionDetail() || QuestDetail() => AppSpacing.cardGap,
    };
  }

  String _emptyMessage(AppLocalizations l10n) {
    return switch (detail) {
      StreakDetail() => l10n.earnsNoStreakDays,
      AuctionDetail() => l10n.earnsNoWins,
      PredictionDetail() => l10n.earnsNoPredictions,
      QuestDetail() => l10n.earnsNoQuests,
    };
  }

  String _sectionLabel(AppLocalizations l10n) {
    return switch (detail) {
      StreakDetail() => l10n.earnsActivityLog,
      AuctionDetail() => l10n.earnsWinHistory,
      PredictionDetail() => l10n.earnsPredictionHistory,
      QuestDetail() => l10n.earnsQuestHistory,
    };
  }

  Widget _header(BuildContext context, AppLocalizations l10n) {
    final points = context.decimalFormat.format(detail.pointsEarned);
    final total = l10n.earnsDetailTotalSummary(screenTitle, points, l10n.rewardsPointsUnit);
    return switch (detail) {
      final StreakDetail streaks => SummaryHeader(
        eyebrow: l10n.earnsStreaksEyebrow,
        totalPoints: points,
        pointsCaption: l10n.earnsDetailPointsEarned,
        totalSummary: total,
        statLabel: l10n.earnsStreaksStatLabel,
        statValue: context.decimalFormat.format(streaks.activeDays),
        statTone: SummaryStatTone.warning,
        statSummary: l10n.earnsDetailStatSummary(
          l10n.earnsStreaksStatLabel,
          context.decimalFormat.format(streaks.activeDays),
          '',
        ),
        footer: StreakLevelChips(
          levels: streaks.levels,
          labelBuilder: (level) => StreakLevelLabel(
            text: l10n.earnsStreakLevelChip(level.level, level.minutes),
            semanticLabel: level.isReached
                ? l10n.earnsStreakLevelReached(level.level, level.minutes)
                : l10n.earnsStreakLevelLocked(level.level, level.minutes),
          ),
        ),
      ),
      final AuctionDetail auction => SummaryHeader(
        eyebrow: l10n.earnsAuctionEyebrow,
        totalPoints: points,
        pointsCaption: l10n.earnsDetailPointsEarned,
        totalSummary: total,
        statLabel: l10n.earnsAuctionStatLabel,
        statValue: context.decimalFormat.format(auction.wins.length),
        statTone: SummaryStatTone.warning,
        statSummary: l10n.earnsDetailStatSummary(
          l10n.earnsAuctionStatLabel,
          context.decimalFormat.format(auction.wins.length),
          '',
        ),
      ),
      final PredictionDetail predictions => SummaryHeader(
        eyebrow: l10n.earnsPredictionsEyebrow,
        totalPoints: points,
        pointsCaption: l10n.earnsDetailPointsEarned,
        totalSummary: total,
        statLabel: l10n.earnsPredictionsStatLabel,
        statValue: l10n.earnsPredictionsAccuracy(predictions.accuracyPercent),
        statTone: SummaryStatTone.success,
        statCaption: l10n.earnsPredictionsAccuracyCaption(
          predictions.correctCount,
          predictions.results.length,
        ),
        statSummary: l10n.earnsDetailStatSummary(
          l10n.earnsPredictionsStatLabel,
          l10n.earnsPredictionsAccuracy(predictions.accuracyPercent),
          l10n.earnsPredictionsAccuracyCaption(predictions.correctCount, predictions.results.length),
        ),
      ),
      // No eyebrow: the frame leaves the slot empty, as My Earns does above it.
      final QuestDetail quests => SummaryHeader(
        totalPoints: points,
        pointsCaption: l10n.earnsDetailPointsEarned,
        totalSummary: total,
        statLabel: l10n.earnsQuestsStatLabel,
        statValue: l10n.earnsQuestsCompleted(quests.claimedCount, quests.weeks.length),
        statTone: SummaryStatTone.success,
        statSummary: l10n.earnsDetailStatSummary(
          l10n.earnsQuestsStatLabel,
          l10n.earnsQuestsCompleted(quests.claimedCount, quests.weeks.length),
          '',
        ),
      ),
    };
  }

  List<Widget> _entries(BuildContext context, AppLocalizations l10n) {
    return switch (detail) {
      final StreakDetail streaks => [
        for (final day in streaks.days) _streakRow(context, l10n, day),
      ],
      final AuctionDetail auction => [
        for (final win in auction.wins) _winCard(context, l10n, win),
      ],
      final PredictionDetail predictions => [
        for (final result in predictions.results) _predictionCard(context, l10n, result),
      ],
      final QuestDetail quests => [
        for (final week in quests.weeks) _questCard(context, l10n, week),
      ],
    };
  }

  Widget _streakRow(BuildContext context, AppLocalizations l10n, StreakDay day) {
    final award = _points(context, l10n, day.points);
    final badge = day.badgeUnlocked;
    final level = day.level;
    return ActivityRow(
      day: day,
      date: _fullDate(context, day.date),
      dayCountLabel: l10n.earnsStreakDayCount(day.dayCount),
      levelLabel: level == null ? null : l10n.earnsStreakLevelBadge(level),
      minutesLabel: l10n.earnsStreakMinutes(day.minutesWatched),
      points: award.label,
      isAwarded: award.isAwarded,
      pointsUnit: l10n.rewardsPointsUnit,
      badgeLabel: badge == null ? null : l10n.earnsStreakBadgeUnlocked(badge),
      semanticLabel: l10n.earnsStreakDaySummary(
        _fullDate(context, day.date),
        day.dayCount,
        day.minutesWatched,
        _award(context, l10n, day.points),
        // Empty on a day that reached no rung, so the sentence skips it.
        level == null ? '' : l10n.earnsStreakLevelSummary(level),
        _badgeClause(l10n, badge),
      ),
    );
  }

  Widget _winCard(BuildContext context, AppLocalizations l10n, AuctionWin win) {
    final kind = _lotLabel(l10n, win.kind);
    final bid = l10n.earnsWinningBidValue(context.decimalFormat.format(win.winningBid));
    final award = _points(context, l10n, win.pointsAwarded);
    return WinCard(
      title: win.title,
      imageAsset: win.imageAsset,
      kindLabel: kind,
      statusLabel: l10n.earnsStatusWon,
      date: _fullDate(context, win.wonOn),
      bidLabel: l10n.earnsWinningBidLabel,
      bidValue: bid,
      points: award.label,
      isAwarded: award.isAwarded,
      pointsUnit: l10n.earnsPointsAwarded,
      badgeName: win.badgeAwarded,
      semanticLabel: l10n.earnsWinSummary(
        win.title,
        kind,
        _fullDate(context, win.wonOn),
        bid,
        _award(context, l10n, win.pointsAwarded),
        _badgeClause(l10n, win.badgeAwarded),
      ),
    );
  }

  Widget _predictionCard(BuildContext context, AppLocalizations l10n, PredictionResult result) {
    final isCorrect = result.isCorrect;
    final status = isCorrect ? l10n.earnsStatusCorrect : l10n.earnsStatusIncorrect;
    final vote = _voteLabel(l10n, result.vote);
    final outcome = _voteLabel(l10n, result.outcome);
    final multiplier = result.multiplier;
    final award = _points(context, l10n, result.pointsAwarded);
    return PredictionHistoryCard(
      title: result.title,
      question: result.question,
      date: _fullDate(context, result.settledOn),
      statusLabel: status,
      statusIcon: isCorrect ? AppIconAssets.check : AppIconAssets.close,
      isCorrect: isCorrect,
      voteLabel: l10n.earnsPredictionYourVote,
      voteValue: vote,
      outcomeLabel: l10n.earnsPredictionOutcome,
      outcomeValue: outcome,
      points: award.label,
      isAwarded: award.isAwarded,
      pointsUnit: l10n.earnsPointsAwarded,
      multiplierLabel: multiplier == null ? null : l10n.earnsPredictionMultiplier(multiplier),
      badgeName: result.badgeAwarded,
      semanticLabel: l10n.earnsPredictionSummary(
        result.title,
        status,
        result.question,
        vote,
        outcome,
        _award(context, l10n, result.pointsAwarded),
        _badgeClause(l10n, result.badgeAwarded),
      ),
    );
  }

  Widget _questCard(BuildContext context, AppLocalizations l10n, QuestWeek week) {
    final dates = MaterialLocalizations.of(context);
    final range = l10n.earnsQuestRange(
      dates.formatShortMonthDay(week.startsOn),
      dates.formatShortMonthDay(week.endsOn),
    );
    final progress = l10n.earnsQuestProgress(
      week.actionsCompleted,
      week.actionsTotal,
      dates.formatShortMonthDay(week.completedOn),
    );
    final status = week.isClaimed ? l10n.earnsStatusClaimed : l10n.earnsStatusPartial;
    final award = _points(context, l10n, week.pointsAwarded);
    return QuestHistoryCard(
      title: week.title,
      range: range,
      progress: progress,
      statusLabel: status,
      statusIcon: week.isClaimed ? AppIconAssets.check : AppIconAssets.star,
      isClaimed: week.isClaimed,
      points: award.label,
      isAwarded: award.isAwarded,
      pointsUnit: l10n.earnsPointsAwarded,
      badgeName: week.badgeAwarded,
      semanticLabel: l10n.earnsQuestSummary(
        week.title,
        status,
        range,
        progress,
        _award(context, l10n, week.pointsAwarded),
        _badgeClause(l10n, week.badgeAwarded),
      ),
    );
  }

  /// The design writes every date out, as 'Jun 30, 2026'.
  String _fullDate(BuildContext context, DateTime date) {
    return '${MaterialLocalizations.of(context).formatShortMonthDay(date)}, ${date.year}';
  }

  ///
  /// How an award is written and toned. An entry that paid nothing takes the
  /// dash the design draws rather than a signed zero in the numeral gold.
  ///
  ({String label, bool isAwarded}) _points(BuildContext context, AppLocalizations l10n, int points) {
    if (points <= 0) {
      return (label: l10n.earnsNoPoints, isAwarded: false);
    }
    return (label: l10n.earnsPointsAdded(context.decimalFormat.format(points)), isAwarded: true);
  }

  String _award(BuildContext context, AppLocalizations l10n, int points) {
    if (points <= 0) {
      return l10n.earnsNoAwardSummary;
    }
    return l10n.earnsAwardSummary(context.decimalFormat.format(points), l10n.rewardsPointsUnit);
  }

  /// Empty where there was no badge, so the sentence simply ends earlier.
  String _badgeClause(AppLocalizations l10n, String? badge) {
    return badge == null ? '' : l10n.earnsBadgeAwardSummary(badge);
  }

  String _lotLabel(AppLocalizations l10n, AuctionLotKind kind) {
    return switch (kind) {
      AuctionLotKind.memorabilia => l10n.earnsLotMemorabilia,
      AuctionLotKind.experience => l10n.earnsLotExperience,
      AuctionLotKind.ticket => l10n.earnsLotTicket,
      AuctionLotKind.content => l10n.earnsLotContent,
    };
  }

  String _voteLabel(AppLocalizations l10n, PredictionVote vote) {
    return switch (vote) {
      PredictionVote.yes => l10n.earnsVoteYes,
      PredictionVote.no => l10n.earnsVoteNo,
    };
  }
}
