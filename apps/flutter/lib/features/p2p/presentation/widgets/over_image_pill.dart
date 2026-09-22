import 'package:flutter/material.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';

///
/// The two pills the design lays over a still: the reward a card pays, in gold,
/// and the multiplier a prediction carries, in white.
///
/// Both are excluded, because the card composes them into its own sentence.
///
class OverImagePill extends StatelessWidget {
  /// The reward, which the design writes in the numeral face.
  const OverImagePill.reward({required this.label, super.key}) : _isReward = true;

  /// The multiplier, which is a plain upper-case label.
  const OverImagePill.multiplier({required this.label, super.key}) : _isReward = false;

  final String label;

  final bool _isReward;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    final pill = colors.pill;
    return ExcludeSemantics(
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: pill.overImageBackground,
          // The multiplier's hairline is the on-image convention rather than
          // the gold the reward pill takes.
          border: Border.all(
            color: _isReward ? pill.overImageBorder : colors.card.imageHairline,
          ),
          borderRadius: const BorderRadius.all(Radius.circular(AppRadius.pill)),
        ),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.xs),
          child: Text(
            label,
            style: _isReward
                ? AppTextStyle.numeralPill.copyWith(color: pill.overImageLabel)
                : AppTextStyle.labelSmall.copyWith(color: colors.text.primary),
          ),
        ),
      ),
    );
  }
}
