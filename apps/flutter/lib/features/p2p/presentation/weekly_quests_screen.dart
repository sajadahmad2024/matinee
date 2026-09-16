import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';
import 'package:matinee/app/router/app_routes.dart';
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
import 'package:matinee/features/p2p/data/models/weekly_quest.dart';
import 'package:matinee/features/p2p/data/p2p_repository.dart';
import 'package:matinee/features/p2p/presentation/cubit/weekly_quests_cubit.dart';
import 'package:matinee/features/p2p/presentation/cubit/weekly_quests_state.dart';
import 'package:matinee/features/p2p/presentation/time_left_label.dart';
import 'package:matinee/features/p2p/presentation/widgets/hero_quest_card.dart';
import 'package:matinee/features/p2p/presentation/widgets/quest_list_card.dart';

class WeeklyQuestsScreen extends StatelessWidget {
  const WeeklyQuestsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) {
        final cubit = WeeklyQuestsCubit(getIt<P2pRepository>());
        unawaited(cubit.load());
        return cubit;
      },
      child: const WeeklyQuestsView(),
    );
  }
}

@visibleForTesting
class WeeklyQuestsView extends StatelessWidget {
  const WeeklyQuestsView({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return Scaffold(
      appBar: BackAppBar(title: l10n.questsTitle),
      body: ContentContainer(
        maxWidth: ContentContainer.reading,
        child: BlocBuilder<WeeklyQuestsCubit, WeeklyQuestsState>(
          builder: (context, state) => switch (state) {
            WeeklyQuestsInitial() => const SizedBox.shrink(),
            WeeklyQuestsLoading() => const LoadingView(),
            WeeklyQuestsFailure(:final error) => ErrorView(
              message: error.localizedMessage(l10n),
              onRetry: () => unawaited(context.read<WeeklyQuestsCubit>().load()),
            ),
            final WeeklyQuestsSuccess success => _Body(success: success),
          },
        ),
      ),
    );
  }
}

class _Body extends StatelessWidget {
  const _Body({required this.success});

  final WeeklyQuestsSuccess success;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final featured = success.featured;
    // Read once: the getter parses the locale's number pattern on every read,
    // and the item builder runs per row per frame.
    final format = context.decimalFormat;
    // Read once: the item builder runs per row per frame, and each read walks
    // the whole list to find the hero again.
    final rows = success.rest;
    return CustomScrollView(
      slivers: [
        if (featured case final quest?)
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: AppScreenPadding.main),
            sliver: SliverToBoxAdapter(
              child: _Featured(quest: quest, format: format),
            ),
          ),
        SliverPadding(
          padding: const EdgeInsets.symmetric(horizontal: AppScreenPadding.main),
          sliver: SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.only(top: AppSpacing.xl, bottom: AppSpacing.md),
              child: SectionLabel(label: l10n.questsAllSection),
            ),
          ),
        ),
        if (rows.isEmpty)
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: AppScreenPadding.main),
            sliver: SliverToBoxAdapter(
              child: Semantics(
                role: SemanticsRole.status,
                child: Text(
                  l10n.questsEmpty,
                  style: AppTextStyle.bodyMedium.copyWith(color: context.appColors.text.muted),
                ),
              ),
            ),
          )
        else
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: AppScreenPadding.main),
            sliver: SliverSemantics(
              role: SemanticsRole.list,
              sliver: SliverList.separated(
                itemCount: rows.length,
                itemBuilder: (context, index) => _Row(quest: rows[index], format: format),
                separatorBuilder: (_, _) => const SizedBox(height: AppSpacing.cardGap),
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

class _Featured extends StatelessWidget {
  const _Featured({required this.quest, required this.format});

  final WeeklyQuest quest;
  final NumberFormat format;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final points = format.format(quest.points);
    final timeLeft = timeLeftLabel(l10n, quest.timeLeft);
    return HeroQuestCard(
      title: quest.title,
      description: quest.description,
      imageAsset: quest.imageAsset,
      activeLabel: l10n.questsActiveBadge,
      activeSpokenLabel: l10n.questsActiveBadgeSpoken,
      rewardLabel: l10n.questsPointsReward(points),
      timeLeftLabel: timeLeft,
      progress: quest.progress,
      progressLabel: l10n.questsProgressFraction(quest.actionsDone, quest.actionsTotal),
      ctaLabel: l10n.questsTrackProgress,
      summary: l10n.questsHeroSummary(
        quest.title,
        quest.description,
        quest.actionsDone,
        quest.actionsTotal,
        points,
        timeLeft,
      ),
      onTrack: () => unawaited(_openTracker(context, quest.id)),
    );
  }

  ///
  /// Pushed rather than gone to, and the list is re-read on the way back: the
  /// tracker can advance an action or claim the quest outright.
  ///
  static Future<void> _openTracker(BuildContext context, String questId) async {
    final cubit = context.read<WeeklyQuestsCubit>();
    await QuestProgressRoute(questId: questId).push<void>(context);
    await cubit.refresh();
  }
}

class _Row extends StatelessWidget {
  const _Row({required this.quest, required this.format});

  final WeeklyQuest quest;
  final NumberFormat format;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final points = format.format(quest.points);
    final isClaimed = quest.status == QuestStatus.claimed;
    return QuestListCard(
      title: quest.title,
      description: quest.description,
      imageAsset: quest.imageAsset,
      pointsLabel: l10n.questsPointsValue(points),
      // The row is one button, so its name has to carry the words drawn on
      // it or a voice-control user has nothing to say.
      summary: l10n.questsRowSummary(
        quest.title,
        quest.description,
        points,
        isClaimed ? l10n.questsRewardClaimedSpoken : l10n.questsStartQuest,
      ),
      isClaimed: isClaimed,
      actionLabel: isClaimed ? l10n.questsRewardClaimed : l10n.questsStartQuest,
      onTap: () => unawaited(_open(context, quest.id, isClaimed: isClaimed)),
    );
  }

  ///
  /// A claimed quest opens its receipt; anything else opens its tracker, which
  /// is where a quest is started from as well as followed. Either way the list
  /// is re-read on the way back.
  ///
  static Future<void> _open(
    BuildContext context,
    String questId, {
    required bool isClaimed,
  }) async {
    final cubit = context.read<WeeklyQuestsCubit>();
    await (isClaimed
        ? QuestClaimedRoute(questId: questId).push<void>(context)
        : QuestProgressRoute(questId: questId).push<void>(context));
    await cubit.refresh();
  }
}
