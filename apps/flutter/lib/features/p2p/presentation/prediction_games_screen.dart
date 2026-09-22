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
import 'package:matinee/core/widgets/status_badge.dart';
import 'package:matinee/di/service_locator.dart';
import 'package:matinee/features/p2p/data/models/prediction.dart';
import 'package:matinee/features/p2p/data/p2p_repository.dart';
import 'package:matinee/features/p2p/presentation/cubit/prediction_games_cubit.dart';
import 'package:matinee/features/p2p/presentation/cubit/prediction_games_state.dart';
import 'package:matinee/features/p2p/presentation/widgets/prediction_card.dart';

class PredictionGamesScreen extends StatelessWidget {
  const PredictionGamesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) {
        final cubit = PredictionGamesCubit(getIt<P2pRepository>());
        unawaited(cubit.load());
        return cubit;
      },
      child: const PredictionGamesView(),
    );
  }
}

@visibleForTesting
class PredictionGamesView extends StatelessWidget {
  const PredictionGamesView({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return Scaffold(
      appBar: BackAppBar(title: l10n.predictionsTitle),
      body: ContentContainer(
        maxWidth: ContentContainer.reading,
        child: BlocBuilder<PredictionGamesCubit, PredictionGamesState>(
          builder: (context, state) => switch (state) {
            PredictionGamesInitial() => const SizedBox.shrink(),
            PredictionGamesLoading() => const LoadingView(),
            PredictionGamesFailure(:final error) => ErrorView(
              message: error.localizedMessage(l10n),
              onRetry: () => unawaited(context.read<PredictionGamesCubit>().load()),
            ),
            final PredictionGamesSuccess success => _Body(success: success),
          },
        ),
      ),
    );
  }
}

class _Body extends StatelessWidget {
  const _Body({required this.success});

  final PredictionGamesSuccess success;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    // Read once: the getter parses the locale's number pattern on every read,
    // and the item builder runs per row per frame.
    final format = context.decimalFormat;
    return CustomScrollView(
      slivers: [
        SliverPadding(
          padding: const EdgeInsets.fromLTRB(
            AppScreenPadding.main,
            AppSpacing.lg,
            AppScreenPadding.main,
            AppSpacing.md,
          ),
          sliver: SliverToBoxAdapter(
            child: Row(
              spacing: AppSpacing.md,
              children: [
                // Flexible, so a scaled-up eyebrow wraps rather than pushing
                // the badge off the row.
                Flexible(child: SectionLabel(label: l10n.predictionsSection)),
                // The frame runs a hairline from the eyebrow to the badge, so
                // the two read as the ends of one rule.
                Expanded(child: Divider(height: 0, color: context.appColors.divider)),
                Flexible(
                  child: StatusBadge(
                    label: l10n.predictionsActiveBadge(success.activeCount),
                    tone: StatusTone.successPlain,
                    semanticLabel: l10n.predictionsActiveBadgeSpoken(success.activeCount),
                  ),
                ),
              ],
            ),
          ),
        ),
        if (success.predictions.isEmpty)
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: AppScreenPadding.main),
            sliver: SliverToBoxAdapter(
              child: Semantics(
                role: SemanticsRole.status,
                child: Text(
                  l10n.predictionsEmpty,
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
                itemCount: success.predictions.length,
                itemBuilder: (context, index) => _Card(prediction: success.predictions[index], format: format),
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

class _Card extends StatelessWidget {
  const _Card({required this.prediction, required this.format});

  final Prediction prediction;
  final NumberFormat format;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final points = format.format(prediction.points);
    final isResolved = !prediction.isOpen;
    return PredictionCard(
      title: prediction.title,
      question: prediction.question,
      imageAsset: prediction.imageAsset,
      stateLabel: isResolved ? l10n.predictionsResultIn : l10n.predictionsMultiplier(prediction.multiplier),
      stateSpokenLabel: l10n.predictionsResultInSpoken,
      rewardLabel: l10n.predictionsPointsReward(points),
      yesLabel: l10n.predictionsYesShare(prediction.yesPercent),
      noLabel: l10n.predictionsNoShare(prediction.noPercent),
      yesShare: prediction.yesShare,
      turnoutLabel: l10n.predictionsTurnout(prediction.turnoutPercent),
      // Three states, not two: a prediction still open can already carry the
      // user's vote, which 'Cast Your Vote' would invite them to repeat.
      actionLabel: switch (prediction) {
        Prediction(isOpen: false) => l10n.predictionsRewardClaimed,
        Prediction(hasVoted: true) => l10n.predictionVoteRecorded,
        _ => l10n.predictionsCastVote,
      },
      summary: l10n.predictionsCardSummary(
        prediction.title,
        prediction.question,
        prediction.yesPercent,
        prediction.noPercent,
        prediction.turnoutPercent,
        points,
        prediction.multiplier,
      ),
      isResolved: isResolved,
      onVote: () => unawaited(_open(context, prediction.id)),
    );
  }

  ///
  /// Pushed rather than gone to, and the list is re-read on the way back: the
  /// detail can cast a vote, which moves the turnout the card shows.
  ///
  static Future<void> _open(BuildContext context, String predictionId) async {
    final cubit = context.read<PredictionGamesCubit>();
    await PredictionDetailRoute(predictionId: predictionId).push<void>(context);
    await cubit.refresh();
  }
}
