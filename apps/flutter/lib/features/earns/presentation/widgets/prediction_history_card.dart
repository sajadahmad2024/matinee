import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/features/earns/presentation/widgets/award_footer.dart';
import 'package:matinee/features/earns/presentation/widgets/status_badge.dart';

///
/// One settled prediction: what was asked, how it was called, how it went, and
/// what it paid.
///
class PredictionHistoryCard extends StatelessWidget {
  const PredictionHistoryCard({
    required this.title,
    required this.question,
    required this.date,
    required this.statusLabel,
    required this.statusIcon,
    required this.isCorrect,
    required this.voteLabel,
    required this.voteValue,
    required this.outcomeLabel,
    required this.outcomeValue,
    required this.points,
    required this.isAwarded,
    required this.pointsUnit,
    required this.semanticLabel,
    super.key,
    this.multiplierLabel,
    this.badgeName,
  });

  final String title;
  final String question;
  final String date;

  final String statusLabel;

  /// A glyph from `AppIconAssets`, the tick or the cross the design draws.
  final String statusIcon;

  final bool isCorrect;

  final String voteLabel;
  final String voteValue;
  final String outcomeLabel;
  final String outcomeValue;

  final String points;
  final bool isAwarded;
  final String pointsUnit;

  /// The card as one sentence; the two panels only make sense read together.
  final String semanticLabel;

  /// The stake, which the design shows only where the game ran at one.
  final String? multiplierLabel;

  final String? badgeName;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    return Semantics(
      label: semanticLabel,
      // The list around these announces a position only if its children say
      // they are items in it.
      role: SemanticsRole.listItem,
      container: true,
      excludeSemantics: true,
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: colors.card.background,
          // The design rings the predictions that earned a badge.
          border: Border.all(
            color: badgeName == null ? colors.card.border : colors.card.borderHighlight,
          ),
          borderRadius: const BorderRadius.all(Radius.circular(AppRadius.lg)),
        ),
        child: Padding(
          padding: AppSpacing.cardPadding,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                spacing: AppSpacing.sm,
                children: [
                  Flexible(
                    child: Text(
                      date,
                      style: AppTextStyle.caption.copyWith(color: colors.text.muted),
                    ),
                  ),
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    spacing: AppSpacing.sm,
                    children: [
                      if (multiplierLabel case final stake?)
                        Text(
                          stake,
                          style: AppTextStyle.labelSmall.copyWith(color: colors.text.numeral),
                        ),
                      StatusBadge(
                        label: statusLabel,
                        tone: isCorrect ? StatusTone.success : StatusTone.error,
                        icon: statusIcon,
                      ),
                    ],
                  ),
                ],
              ),
              Padding(
                padding: const EdgeInsets.only(top: AppSpacing.sm),
                child: Text(
                  title,
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                    color: colors.text.primary,
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.only(top: AppSpacing.xxs),
                child: Text(
                  question,
                  style: AppTextStyle.caption.copyWith(color: colors.text.muted),
                ),
              ),
              Padding(
                padding: const EdgeInsets.only(top: AppSpacing.md),
                // IntrinsicHeight, or stretching the panels asks a Row inside a
                // Column to fill a height that has no bound.
                child: IntrinsicHeight(
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    spacing: AppSpacing.sm,
                    children: [
                      Expanded(
                        child: _Panel(
                          label: voteLabel,
                          value: voteValue,
                          valueColor: colors.text.primary,
                        ),
                      ),
                      Expanded(
                        child: _Panel(
                          label: outcomeLabel,
                          value: outcomeValue,
                          // The result is the one place the design says right or
                          // wrong in colour as well as in the badge.
                          valueColor: isCorrect ? colors.text.success : colors.text.error,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.only(top: AppSpacing.md, bottom: AppSpacing.md),
                child: Divider(height: 0, color: colors.divider),
              ),
              AwardFooter(
                points: points,
                unitLabel: pointsUnit,
                isAwarded: isAwarded,
                badgeName: badgeName,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// One of the two sunken boxes holding the call and the result.
class _Panel extends StatelessWidget {
  const _Panel({required this.label, required this.value, required this.valueColor});

  final String label;
  final String value;
  final Color valueColor;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors.text;
    return DecoratedBox(
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: const BorderRadius.all(Radius.circular(AppRadius.sm)),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.sm),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: AppTextStyle.overline.copyWith(color: colors.muted)),
            Padding(
              padding: const EdgeInsets.only(top: AppSpacing.xxs),
              child: Text(
                value,
                style: Theme.of(context).textTheme.titleSmall?.copyWith(color: valueColor),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
