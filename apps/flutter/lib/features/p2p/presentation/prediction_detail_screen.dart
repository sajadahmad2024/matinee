import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/core/l10n/app_exception_l10n.dart';
import 'package:matinee/core/l10n/l10n.dart';
import 'package:matinee/core/responsive/responsive.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/core/utils/clock_label.dart';
import 'package:matinee/core/widgets/back_app_bar.dart';
import 'package:matinee/core/widgets/error_view.dart';
import 'package:matinee/core/widgets/loading_view.dart';
import 'package:matinee/core/widgets/screen_title.dart';
import 'package:matinee/core/widgets/section_label.dart';
import 'package:matinee/core/widgets/still_backdrop.dart';
import 'package:matinee/di/service_locator.dart';
import 'package:matinee/features/p2p/data/models/prediction.dart';
import 'package:matinee/features/p2p/data/p2p_repository.dart';
import 'package:matinee/features/p2p/presentation/cubit/prediction_detail_cubit.dart';
import 'package:matinee/features/p2p/presentation/cubit/prediction_detail_state.dart';
import 'package:matinee/features/p2p/presentation/widgets/countdown_card.dart';
import 'package:matinee/features/p2p/presentation/widgets/prediction_analysis_sheet.dart';
import 'package:matinee/features/p2p/presentation/widgets/vote_option_button.dart';

/// The still behind the header, which the design fixes at 256.
const double _heroHeight = 256;

///
/// The multiplier card beside the title. A minimum, not a fixed box: the design
/// draws 86 by 46 and a scaled-up figure has to grow it rather than be clipped.
///
const Size _multiplierCardMinSize = Size(86, 46);

///
/// One prediction: what is being asked, how long is left, and the two sides to
/// pick between.
///
class PredictionDetailScreen extends StatelessWidget {
  const PredictionDetailScreen({required this.predictionId, super.key});

  final String predictionId;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) {
        final cubit = PredictionDetailCubit(getIt<P2pRepository>(), predictionId);
        unawaited(cubit.load());
        return cubit;
      },
      child: const PredictionDetailView(),
    );
  }
}

@visibleForTesting
class PredictionDetailView extends StatelessWidget {
  const PredictionDetailView({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return Scaffold(
      // Over the still rather than on a bar of its own.
      extendBodyBehindAppBar: true,
      // No title in the bar: the hero carries the screen's own heading, which
      // is what the frame draws under the back button.
      appBar: BackAppBar(foregroundColor: context.appColors.text.primary),
      body: ContentContainer(
        maxWidth: ContentContainer.reading,
        child: BlocConsumer<PredictionDetailCubit, PredictionDetailState>(
          listenWhen: (previous, current) => _actionError(current) != null,
          listener: _announceFailure,
          builder: (context, state) => switch (state) {
            PredictionDetailInitial() => const SizedBox.shrink(),
            PredictionDetailLoading() => const LoadingView(),
            PredictionDetailFailure(:final error) => ErrorView(
              message: error.localizedMessage(l10n),
              onRetry: () => unawaited(context.read<PredictionDetailCubit>().load()),
            ),
            final PredictionDetailSuccess success => _Body(success: success),
          },
        ),
      ),
    );
  }

  static AppException? _actionError(PredictionDetailState state) {
    return switch (state) {
      PredictionDetailSuccess(:final actionError) => actionError,
      _ => null,
    };
  }

  ///
  /// A snackbar rather than a screen: the prediction and the side the user
  /// picked are both still there, so the vote can be sent again.
  ///
  static void _announceFailure(BuildContext context, PredictionDetailState state) {
    if (_actionError(state) case final error?) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(error.localizedMessage(context.l10n))));
    }
  }
}

class _Body extends StatelessWidget {
  const _Body({required this.success});

  final PredictionDetailSuccess success;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final prediction = success.prediction;
    final points = context.decimalFormat.format(prediction.points);
    final reward = l10n.predictionRewardPoints(points);
    return CustomScrollView(
      slivers: [
        SliverToBoxAdapter(child: _Hero(prediction: prediction)),
        SliverPadding(
          padding: const EdgeInsets.fromLTRB(
            AppScreenPadding.main,
            AppSpacing.lg,
            AppScreenPadding.main,
            0,
          ),
          sliver: SliverList.list(
            children: [
              _Countdown(prediction: prediction),
              Padding(
                padding: const EdgeInsets.only(top: AppSpacing.xxl, bottom: AppSpacing.md),
                child: SectionLabel(label: l10n.predictionQuestionLabel),
              ),
              Text(
                prediction.question,
                style: AppTextStyle.headlineSmall.copyWith(
                  color: context.appColors.text.primary,
                ),
              ),
              Padding(
                padding: const EdgeInsets.only(top: AppSpacing.xxl, bottom: AppSpacing.md),
                child: SectionLabel(
                  label: l10n.predictionCastVoteLabel(reward),
                  emphasis: reward,
                  headingLevel: 3,
                ),
              ),
              _Options(success: success),
              Padding(
                padding: const EdgeInsets.only(top: AppSpacing.xxl),
                child: _Submit(success: success),
              ),
              Padding(
                padding: const EdgeInsets.only(top: AppSpacing.sm),
                child: Center(
                  child: TextButton(
                    onPressed: () => unawaited(_openAnalysis(context, prediction)),
                    child: Text(l10n.predictionShowAnalysis),
                  ),
                ),
              ),
            ],
          ),
        ),
        SliverToBoxAdapter(
          child: SizedBox(height: context.bottomInset(AppSpacing.xxxl)),
        ),
      ],
    );
  }

  Future<void> _openAnalysis(BuildContext context, Prediction prediction) {
    final l10n = context.l10n;
    return showPredictionAnalysisSheet(
      context,
      question: prediction.question,
      shares: [
        AnalysisShare(label: l10n.predictionYes, percent: prediction.yesPercent),
        AnalysisShare(label: l10n.predictionNo, percent: prediction.noPercent),
      ],
    );
  }
}

class _Hero extends StatelessWidget {
  const _Hero({required this.prediction});

  final Prediction prediction;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final colors = context.appColors;
    return StillBackdrop(
      imageAsset: prediction.imageAsset,
      scrim: colors.overlay.auctionHero,
      minHeight: _heroHeight,
      child: Align(
        alignment: AlignmentDirectional.bottomStart,
        child: Padding(
          padding: const EdgeInsets.all(AppScreenPadding.main),
          child: Row(
            spacing: AppSpacing.md,
            children: [
              Expanded(
                child: Column(
                  // Hugging, or the column takes the whole hero and the
                  // copy is stranded at its top edge.
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      l10n.predictionEyebrow,
                      style: AppTextStyle.labelSmall.copyWith(color: colors.text.muted),
                    ),
                    Padding(
                      padding: const EdgeInsets.only(top: AppSpacing.xs),
                      child: ScreenTitle(
                        label: prediction.title,
                        child: Text(
                          prediction.title,
                          style: AppTextStyle.displaySmall.copyWith(
                            color: colors.text.primary,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              _Multiplier(multiplier: prediction.multiplier),
            ],
          ),
        ),
      ),
    );
  }
}

class _Multiplier extends StatelessWidget {
  const _Multiplier({required this.multiplier});

  final int multiplier;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final colors = context.appColors;
    return Semantics(
      label: l10n.predictionMultiplierSummary(multiplier),
      container: true,
      excludeSemantics: true,
      child: Container(
        constraints: BoxConstraints(
          minWidth: _multiplierCardMinSize.width,
          minHeight: _multiplierCardMinSize.height,
        ),
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.sm),
        decoration: BoxDecoration(
          color: colors.tag.goldSubtleBackground,
          border: Border.all(color: colors.tag.goldSubtleBorder),
          borderRadius: const BorderRadius.all(Radius.circular(AppRadius.sm)),
        ),
        child: Column(
          // Hugging, or the card takes the hero's whole height: a Row hands
          // its children loose cross-axis constraints.
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              l10n.predictionMultiplierValue(multiplier),
              style: AppTextStyle.titleMedium.copyWith(color: colors.text.numeral),
            ),
            Text(
              l10n.predictionMultiplierUnit,
              style: AppTextStyle.overline.copyWith(color: colors.text.numeral),
            ),
          ],
        ),
      ),
    );
  }
}

class _Countdown extends StatelessWidget {
  const _Countdown({required this.prediction});

  final Prediction prediction;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final remaining = prediction.closesIn;
    return CountdownCard(
      label: prediction.isOpen ? l10n.predictionClosesIn : l10n.predictionClosed,
      clock: clockLabel(remaining),
      summary: prediction.isOpen
          ? l10n.predictionCountdownSummary(
              remaining.inHours,
              remaining.inMinutes % Duration.minutesPerHour,
            )
          : l10n.predictionClosed,
    );
  }
}

class _Options extends StatelessWidget {
  const _Options({required this.success});

  final PredictionDetailSuccess success;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    // Voting is one call: once it is cast the pair reports the choice rather
    // than offering it again.
    final isLocked = success.prediction.hasVoted || !success.prediction.isOpen;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      spacing: AppSpacing.md,
      children: [
        for (final side in PredictionSide.values)
          VoteOptionButton(
            label: side == PredictionSide.yes ? l10n.predictionYes : l10n.predictionNo,
            // Sentence case for the name: 'YES' and 'NO' are short enough that
            // a screen reader spells them out letter by letter.
            semanticLabel: side == PredictionSide.yes ? l10n.predictionYesSpoken : l10n.predictionNoSpoken,
            isSelected: success.selection == side,
            onPressed: isLocked ? null : () => context.read<PredictionDetailCubit>().select(side),
          ),
      ],
    );
  }
}

class _Submit extends StatelessWidget {
  const _Submit({required this.success});

  final PredictionDetailSuccess success;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    if (success.prediction.hasVoted) {
      return FilledButton(onPressed: null, child: Text(l10n.predictionVoteRecorded));
    }
    return FilledButton(
      onPressed: success.canSubmit ? () => unawaited(context.read<PredictionDetailCubit>().submit()) : null,
      child: Text(l10n.predictionSubmit),
    );
  }
}
