import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:matinee/core/l10n/l10n.dart';
import 'package:matinee/core/responsive/responsive.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/core/widgets/progress_bar.dart';
import 'package:matinee/core/widgets/screen_title.dart';
import 'package:matinee/core/widgets/sheet_surface.dart';

/// One side's share, ready to draw.
@immutable
class AnalysisShare {
  const AnalysisShare({required this.label, required this.percent});

  final String label;

  /// Whole per cent, as the design writes it.
  final int percent;
}

/// Opens the breakdown of how the votes fell over the prediction.
Future<void> showPredictionAnalysisSheet(
  BuildContext context, {
  required String question,
  required List<AnalysisShare> shares,
}) {
  return showModalBottomSheet<void>(
    context: context,
    useRootNavigator: true,
    backgroundColor: context.appColors.sheet.routeBackground,
    showDragHandle: false,
    builder: (_) => PredictionAnalysisSheet(question: question, shares: shares),
  );
}

@visibleForTesting
class PredictionAnalysisSheet extends StatelessWidget {
  const PredictionAnalysisSheet({required this.question, required this.shares, super.key});

  final String question;
  final List<AnalysisShare> shares;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final colors = context.appColors;
    return SheetSurface(
      isModal: true,
      child: ContentContainer(
        maxWidth: ContentContainer.form,
        // Hugging, not filling: the sheet is as tall as the shares it lists.
        shrinkWrapHeight: true,
        child: SingleChildScrollView(
          padding: EdgeInsets.only(
            left: AppScreenPadding.sheet,
            right: AppScreenPadding.sheet,
            bottom: context.bottomInset(AppSpacing.xxxl),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Text(
                      l10n.predictionAnalysisEyebrow,
                      style: AppTextStyle.overline.copyWith(color: colors.text.muted),
                    ),
                  ),
                  IconButton(
                    onPressed: () => Navigator.of(context).pop(),
                    tooltip: l10n.predictionAnalysisClose,
                    icon: const Icon(Icons.close),
                  ),
                ],
              ),
              ScreenTitle(
                label: question,
                child: Text(
                  question,
                  style: AppTextStyle.headlineSmall.copyWith(color: colors.text.primary),
                ),
              ),
              Padding(
                padding: const EdgeInsets.only(top: AppSpacing.xl),
                child: Semantics(
                  role: SemanticsRole.list,
                  explicitChildNodes: true,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    spacing: AppSpacing.md,
                    children: [for (final share in shares) _Share(share: share)],
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.only(top: AppSpacing.xl),
                child: OutlinedButton(
                  onPressed: () => Navigator.of(context).pop(),
                  style: OutlinedButton.styleFrom(
                    minimumSize: const Size(0, AppControlHeight.cta),
                    shape: const RoundedRectangleBorder(
                      borderRadius: BorderRadius.all(Radius.circular(AppRadius.md)),
                    ),
                    textStyle: AppTextStyle.labelLarge,
                  ),
                  child: Text(l10n.predictionAnalysisClose),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Share extends StatelessWidget {
  const _Share({required this.share});

  final AnalysisShare share;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final colors = context.appColors;
    return Semantics(
      role: SemanticsRole.listItem,
      label: l10n.predictionAnalysisOptionSummary(share.label, share.percent),
      container: true,
      excludeSemantics: true,
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: colors.card.background,
          border: Border.all(color: colors.card.border),
          borderRadius: const BorderRadius.all(Radius.circular(AppRadius.md)),
        ),
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.md),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                share.label,
                style: AppTextStyle.overline.copyWith(color: colors.text.muted),
              ),
              Padding(
                padding: const EdgeInsets.only(top: AppSpacing.md),
                child: Row(
                  spacing: AppSpacing.md,
                  children: [
                    Expanded(
                      // The design draws 8 here, which the scale snaps to its
                      // documented thick bar.
                      child: ProgressBar(
                        value: share.percent / 100,
                        height: AppControlHeight.progressBarThick,
                        isRaised: true,
                      ),
                    ),
                    Text(
                      l10n.questProgressPercent(share.percent),
                      style: AppTextStyle.numeralPill.copyWith(color: colors.text.numeral),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
