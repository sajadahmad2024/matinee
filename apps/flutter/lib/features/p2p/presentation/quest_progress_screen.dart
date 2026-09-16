import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:matinee/app/router/app_routes.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/core/l10n/app_exception_l10n.dart';
import 'package:matinee/core/l10n/l10n.dart';
import 'package:matinee/core/responsive/responsive.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/widgets/back_app_bar.dart';
import 'package:matinee/core/widgets/error_view.dart';
import 'package:matinee/core/widgets/loading_view.dart';
import 'package:matinee/core/widgets/section_label.dart';
import 'package:matinee/di/service_locator.dart';
import 'package:matinee/features/p2p/data/models/weekly_quest.dart';
import 'package:matinee/features/p2p/data/p2p_repository.dart';
import 'package:matinee/features/p2p/presentation/cubit/quest_progress_cubit.dart';
import 'package:matinee/features/p2p/presentation/cubit/quest_progress_state.dart';
import 'package:matinee/features/p2p/presentation/widgets/action_card.dart';
import 'package:matinee/features/p2p/presentation/widgets/progress_summary_card.dart';
import 'package:matinee/features/p2p/presentation/widgets/quest_completion_sheet.dart';

///
/// One quest's tracker: how far along it is, the actions that finish it, and
/// the curated content each of those is completed with.
///
class QuestProgressScreen extends StatelessWidget {
  const QuestProgressScreen({required this.questId, super.key});

  final String questId;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) {
        final cubit = QuestProgressCubit(getIt<P2pRepository>(), questId);
        unawaited(cubit.load());
        return cubit;
      },
      child: const QuestProgressView(),
    );
  }
}

@visibleForTesting
class QuestProgressView extends StatelessWidget {
  const QuestProgressView({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return BlocConsumer<QuestProgressCubit, QuestProgressState>(
      listenWhen: _isWorthAnnouncing,
      listener: _announce,
      builder: (context, state) => Scaffold(
        appBar: BackAppBar(
          title: switch (state) {
            QuestProgressSuccess(:final quest) => quest.title,
            _ => l10n.questsTitle,
          },
        ),
        body: ContentContainer(
          maxWidth: ContentContainer.reading,
          child: switch (state) {
            QuestProgressInitial() => const SizedBox.shrink(),
            QuestProgressLoading() => const LoadingView(),
            QuestProgressFailure(:final error) => ErrorView(
              message: error.localizedMessage(l10n),
              onRetry: () => unawaited(context.read<QuestProgressCubit>().load()),
            ),
            final QuestProgressSuccess success => _Body(success: success),
          },
        ),
      ),
    );
  }

  ///
  /// A claim that landed, or an action that failed. The two never coincide: a
  /// failure leaves the quest's status where it was.
  ///
  static bool _isWorthAnnouncing(QuestProgressState previous, QuestProgressState current) {
    return _justClaimed(previous, current) || _actionError(current) != null;
  }

  static void _announce(BuildContext context, QuestProgressState state) {
    if (_actionError(state) case final error?) {
      // A snackbar rather than a screen: the tracker is still there, and the
      // tap is still worth repeating.
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(error.localizedMessage(context.l10n))));
      return;
    }
    unawaited(_announceClaim(context, state));
  }

  static AppException? _actionError(QuestProgressState state) {
    return switch (state) {
      QuestProgressSuccess(:final actionError) => actionError,
      _ => null,
    };
  }

  ///
  /// The claim landed on this build and not on the one before it. A load that
  /// arrives already claimed is not a claim: the modal would open every time
  /// the tracker for a finished quest is entered.
  ///
  static bool _justClaimed(QuestProgressState previous, QuestProgressState current) {
    return previous is QuestProgressSuccess && _isClaimed(current) && !_isClaimed(previous);
  }

  static bool _isClaimed(QuestProgressState state) {
    return switch (state) {
      QuestProgressSuccess(quest: WeeklyQuest(status: QuestStatus.claimed)) => true,
      _ => false,
    };
  }

  ///
  /// Shows the design's modal, then replaces the tracker with the receipt: the
  /// quest is finished, so backing into the tracker again would be a dead end.
  ///
  static Future<void> _announceClaim(BuildContext context, QuestProgressState state) async {
    if (state case QuestProgressSuccess(:final quest)) {
      await showQuestCompletionSheet(
        context,
        questTitle: quest.title,
        pointsLabel: context.decimalFormat.format(quest.points),
        badgeName: quest.badgeName,
      );
      if (context.mounted) {
        QuestClaimedRoute(questId: quest.id).pushReplacement(context);
      }
    }
  }
}

class _Body extends StatelessWidget {
  const _Body({required this.success});

  final QuestProgressSuccess success;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final quest = success.quest;
    final points = context.decimalFormat.format(quest.points);
    final percent = (quest.progress * 100).round();
    return CustomScrollView(
      slivers: [
        SliverPadding(
          padding: const EdgeInsets.symmetric(horizontal: AppScreenPadding.main),
          sliver: SliverToBoxAdapter(
            child: Semantics(
              container: true,
              child: ProgressSummaryCard(
                progress: quest.progress,
                ringLabel: l10n.questProgressPercent(percent),
                headline: l10n.questProgressActionsDone(quest.actionsDone, quest.actionsTotal),
                caption: l10n.questProgressEarnCaption(points),
              ),
            ),
          ),
        ),
        SliverPadding(
          padding: const EdgeInsets.symmetric(horizontal: AppScreenPadding.main),
          sliver: SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.only(top: AppSpacing.xl, bottom: AppSpacing.md),
              child: SectionLabel(label: l10n.questProgressYourActions),
            ),
          ),
        ),
        SliverPadding(
          padding: const EdgeInsets.symmetric(horizontal: AppScreenPadding.main),
          sliver: SliverSemantics(
            role: SemanticsRole.list,
            sliver: SliverList.separated(
              itemCount: quest.actions.length,
              itemBuilder: (context, index) => Semantics(
                role: SemanticsRole.listItem,
                child: _Action(action: quest.actions[index]),
              ),
              separatorBuilder: (_, _) => const SizedBox(height: AppSpacing.cardGap),
            ),
          ),
        ),
        if (quest.isComplete && quest.status != QuestStatus.claimed)
          SliverPadding(
            padding: const EdgeInsets.only(
              left: AppScreenPadding.main,
              right: AppScreenPadding.main,
              top: AppSpacing.xl,
            ),
            sliver: SliverToBoxAdapter(
              child: FilledButton(
                onPressed: success.isClaiming ? null : () => unawaited(context.read<QuestProgressCubit>().claim()),
                child: Text(l10n.questProgressClaim),
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

class _Action extends StatelessWidget {
  const _Action({required this.action});

  final QuestAction action;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return ActionCard(
      title: action.title,
      description: action.description,
      imageAsset: action.imageAsset,
      counterLabel: l10n.questProgressCounter(action.done, action.target),
      progress: action.progress,
      isComplete: action.isComplete,
      summary: l10n.questProgressActionSummary(
        action.title,
        action.description,
        action.done,
        action.target,
      ),
      curatedLabel: l10n.questProgressCuratedContent,
      curated: [
        for (final item in action.curated)
          CuratedRow(
            title: item.title,
            imageAsset: item.imageAsset,
            isWatched: item.isWatched,
            semanticLabel: item.isWatched ? l10n.questProgressItemWatched(item.title) : item.title,
            watchLabel: l10n.questProgressWatchItem(item.title),
            actionLabel: item.isWatched ? l10n.questProgressDone : l10n.questProgressWatch,
            // No player yet, so the button counts the item towards its
            // action, which is the whole of what the design asks it to do.
            onWatch: () => unawaited(context.read<QuestProgressCubit>().watch(action.id, item.id)),
          ),
      ],
    );
  }
}
