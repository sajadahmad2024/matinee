import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/core/l10n/app_exception_l10n.dart';
import 'package:matinee/core/l10n/l10n.dart';
import 'package:matinee/core/responsive/responsive.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/core/widgets/back_app_bar.dart';
import 'package:matinee/core/widgets/error_view.dart';
import 'package:matinee/core/widgets/loading_view.dart';
import 'package:matinee/core/widgets/section_label.dart';
import 'package:matinee/core/widgets/status_badge.dart';
import 'package:matinee/di/service_locator.dart';
import 'package:matinee/features/p2p/data/models/weekly_quest.dart';
import 'package:matinee/features/p2p/data/p2p_repository.dart';
import 'package:matinee/features/p2p/presentation/cubit/quest_progress_cubit.dart';
import 'package:matinee/features/p2p/presentation/cubit/quest_progress_state.dart';
import 'package:matinee/features/p2p/presentation/widgets/badge_unlocked_card.dart';
import 'package:matinee/features/p2p/presentation/widgets/completed_action_row.dart';
import 'package:matinee/features/p2p/presentation/widgets/reward_hero.dart';
import 'package:matinee/features/p2p/presentation/widgets/reward_stat_card.dart';

/// The emoji the design marks a finished quest with, until the icon font has it.
const String _trophyGlyph = '🏆';

/// And the one it marks the badge with.
const String _medalGlyph = '🎖️';

///
/// The receipt for a finished quest: what it paid, the badge it unlocked, and
/// the actions that got there.
///
class QuestClaimedScreen extends StatelessWidget {
  const QuestClaimedScreen({required this.questId, super.key});

  final String questId;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) {
        final cubit = QuestProgressCubit(getIt<P2pRepository>(), questId);
        unawaited(cubit.load());
        return cubit;
      },
      child: const QuestClaimedView(),
    );
  }
}

@visibleForTesting
class QuestClaimedView extends StatelessWidget {
  const QuestClaimedView({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return Scaffold(
      // Over the still rather than on a bar of its own, which is why the
      // header is stacked with the body instead of given to the Scaffold.
      extendBodyBehindAppBar: true,
      // No title in the bar: the hero carries the screen's own heading, which
      // is what the frame draws under the back button.
      appBar: BackAppBar(
        foregroundColor: context.appColors.text.primary,
        // The frame sets the badge level with the back button, which is the
        // bar's own trailing slot rather than a corner of the still.
        actions: [
          StatusBadge(
            label: l10n.questClaimedBadge,
            tone: StatusTone.successPlain,
            semanticLabel: l10n.questsRewardClaimedSpoken,
          ),
        ],
      ),
      body: ContentContainer(
        maxWidth: ContentContainer.reading,
        child: BlocBuilder<QuestProgressCubit, QuestProgressState>(
          builder: (context, state) => switch (state) {
            QuestProgressInitial() => const SizedBox.shrink(),
            QuestProgressLoading() => const LoadingView(),
            QuestProgressFailure(:final error) => ErrorView(
              message: error.localizedMessage(l10n),
              onRetry: () => unawaited(context.read<QuestProgressCubit>().load()),
            ),
            // A quest that was never paid has no receipt to draw, so a stale
            // link lands on the same failure a missing quest would.
            QuestProgressSuccess(quest: WeeklyQuest(status: != QuestStatus.claimed)) => ErrorView(
              message: const NotFoundException().localizedMessage(l10n),
              onRetry: () => unawaited(context.read<QuestProgressCubit>().load()),
            ),
            QuestProgressSuccess(:final quest) => _Body(quest: quest),
          },
        ),
      ),
    );
  }
}

class _Body extends StatelessWidget {
  const _Body({required this.quest});

  final WeeklyQuest quest;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return CustomScrollView(
      slivers: [
        SliverToBoxAdapter(
          child: RewardHero(
            imageAsset: quest.imageAsset,
            glyph: _trophyGlyph,
            eyebrow: l10n.questClaimedEyebrow,
            title: quest.title,
          ),
        ),
        SliverPadding(
          padding: const EdgeInsets.fromLTRB(
            AppScreenPadding.main,
            AppSpacing.xl,
            AppScreenPadding.main,
            0,
          ),
          sliver: SliverList.list(
            children: [
              const _Congratulations(),
              Padding(
                padding: const EdgeInsets.only(top: AppSpacing.lg),
                child: _Stats(quest: quest),
              ),
              Padding(
                padding: const EdgeInsets.only(top: AppSpacing.lg),
                child: BadgeUnlockedCard(
                  glyph: _medalGlyph,
                  label: l10n.questClaimedBadgeUnlocked,
                  name: quest.badgeName,
                  caption: l10n.questClaimedBadgeCaption(quest.title),
                  summary: l10n.questClaimedBadgeSummary(
                    quest.badgeName,
                    l10n.questClaimedBadgeCaption(quest.title),
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.only(top: AppSpacing.xl, bottom: AppSpacing.md),
                child: SectionLabel(label: l10n.questClaimedActionsSection),
              ),
            ],
          ),
        ),
        SliverPadding(
          padding: const EdgeInsets.symmetric(horizontal: AppScreenPadding.main),
          sliver: SliverSemantics(
            role: SemanticsRole.list,
            sliver: SliverList.separated(
              itemCount: quest.actions.length,
              itemBuilder: (context, index) => CompletedActionRow(
                title: quest.actions[index].title,
                doneLabel: l10n.questClaimedActionDone,
              ),
              separatorBuilder: (_, _) => const SizedBox(height: AppSpacing.listGap),
            ),
          ),
        ),
        SliverPadding(
          padding: const EdgeInsets.only(
            left: AppScreenPadding.main,
            right: AppScreenPadding.main,
            top: AppSpacing.xl,
          ),
          sliver: SliverToBoxAdapter(
            child: OutlinedButton.icon(
              // No share sheet yet, so the control draws as the design does it
              // and waits for one rather than opening nothing.
              onPressed: null,
              style: OutlinedButton.styleFrom(
                minimumSize: const Size(0, AppControlHeight.cta),
                shape: const RoundedRectangleBorder(
                  borderRadius: BorderRadius.all(Radius.circular(AppRadius.md)),
                ),
                textStyle: AppTextStyle.labelLarge,
              ),
              icon: const Icon(Icons.ios_share, size: AppIconSize.sm),
              label: Text(l10n.questClaimedShare),
            ),
          ),
        ),
        SliverToBoxAdapter(
          child: SizedBox(height: context.bottomInset(AppSpacing.xxxl)),
        ),
      ],
    );
  }
}

class _Congratulations extends StatelessWidget {
  const _Congratulations();

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final colors = context.appColors;
    return DecoratedBox(
      decoration: BoxDecoration(
        color: colors.badge.successBackground,
        border: Border.all(color: colors.card.borderSuccess),
        borderRadius: const BorderRadius.all(Radius.circular(AppRadius.lg)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          children: [
            Text(
              l10n.questClaimedTitle,
              textAlign: TextAlign.center,
              style: AppTextStyle.headlineSmall.copyWith(color: colors.text.primary),
            ),
            Padding(
              padding: const EdgeInsets.only(top: AppSpacing.sm),
              child: Text(
                l10n.questClaimedBody,
                textAlign: TextAlign.center,
                style: AppTextStyle.bodySmall.copyWith(color: colors.text.secondary),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Stats extends StatelessWidget {
  const _Stats({required this.quest});

  final WeeklyQuest quest;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final points = context.decimalFormat.format(quest.points);
    final days = quest.completedInDays;
    return // IntrinsicHeight, or stretching the children asks a Row inside a
    // Column to fill a height that has no bound.
    IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        spacing: AppSpacing.listGap,
        children: [
          Expanded(
            child: RewardStatCard.figure(
              label: l10n.questClaimedPointsLabel,
              value: points,
              unit: l10n.p2pPointsUnit,
              summary: l10n.p2pPointsSummary(points),
            ),
          ),
          // Only when the API reports it: how long a quest took is not something
          // the actions themselves carry.
          if (days != null)
            Expanded(
              child: RewardStatCard.figure(
                label: l10n.questClaimedDaysLabel,
                value: '$days',
                unit: l10n.questClaimedDaysUnit,
                summary: l10n.questClaimedDaysSummary(days),
              ),
            ),
          Expanded(
            child: RewardStatCard.figure(
              label: l10n.questClaimedActionsLabel,
              value: '${quest.actionsDone}',
              unit: l10n.questClaimedActionsOf(quest.actionsTotal),
              summary: l10n.questProgressActionsDone(quest.actionsDone, quest.actionsTotal),
            ),
          ),
        ],
      ),
    );
  }
}
