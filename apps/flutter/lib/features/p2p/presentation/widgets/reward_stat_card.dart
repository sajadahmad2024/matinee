import 'package:flutter/material.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';

///
/// The small labelled card the reward screens set in a row: an eyebrow over a
/// figure, or over a name.
///
class RewardStatCard extends StatelessWidget {
  /// A figure and its unit, in the numeral face.
  const RewardStatCard.figure({
    required this.label,
    required this.value,
    required this.summary,
    super.key,
    this.unit,
    this.isHighlighted = false,
  }) : name = null;

  /// A name rather than a number, which the design sets in gold.
  const RewardStatCard.name({
    required this.label,
    required this.name,
    required this.summary,
    super.key,
  }) : value = null,
       unit = null,
       isHighlighted = false;

  final String label;
  final String? value;

  /// Null where the design writes the figure on its own.
  final String? unit;
  final String? name;

  /// The card as one sentence, because the eyebrow and figure read as two stops.
  final String summary;

  /// The design sets the streak's own figure in the level accent rather than white.
  final bool isHighlighted;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    return Semantics(
      label: summary,
      container: true,
      excludeSemantics: true,
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: colors.card.background,
          border: Border.all(color: colors.card.border),
          borderRadius: const BorderRadius.all(Radius.circular(AppRadius.md)),
        ),
        child: Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.md,
            vertical: AppSpacing.cardPaddingVertical,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: AppTextStyle.overline.copyWith(color: colors.text.muted)),
              Padding(
                padding: const EdgeInsets.only(top: AppSpacing.xs),
                child: switch ((name, value)) {
                  (final String label, _) => Text(
                    label,
                    style: AppTextStyle.labelMedium.copyWith(color: colors.text.link),
                  ),
                  (_, final String figure) => _Figure(
                    value: figure,
                    unit: unit,
                    isHighlighted: isHighlighted,
                  ),
                  _ => const SizedBox.shrink(),
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Figure extends StatelessWidget {
  const _Figure({required this.value, required this.unit, required this.isHighlighted});

  final String value;
  final String? unit;
  final bool isHighlighted;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors.text;
    return Wrap(
      crossAxisAlignment: WrapCrossAlignment.end,
      spacing: AppSpacing.xs,
      children: [
        Text(
          value,
          style: AppTextStyle.headlineSmall.copyWith(
            color: isHighlighted ? colors.warning : colors.primary,
          ),
        ),
        if (unit case final label?) Text(label, style: AppTextStyle.caption.copyWith(color: colors.muted)),
      ],
    );
  }
}
