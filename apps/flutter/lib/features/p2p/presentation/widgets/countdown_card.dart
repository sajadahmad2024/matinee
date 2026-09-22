import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';

/// The live dot beside the label, which the design draws 7 across.
const double _dotSize = 7;

///
/// How long a prediction is still open, as a clock. The whole card is the live
/// region, so the digits are read as one figure when they move.
///
class CountdownCard extends StatelessWidget {
  const CountdownCard({
    required this.label,
    required this.clock,
    required this.summary,
    super.key,
  });

  final String label;
  final String clock;

  /// The remaining span in words, because the digits read as one long number.
  final String summary;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    return Semantics(
      role: SemanticsRole.status,
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
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.md),
          // Wrapped rather than a Row: the label and the clock both size to
          // their text, and at a large scale the clock drops below the label.
          child: Wrap(
            alignment: WrapAlignment.spaceBetween,
            crossAxisAlignment: WrapCrossAlignment.center,
            spacing: AppSpacing.md,
            runSpacing: AppSpacing.sm,
            children: [
              Row(
                mainAxisSize: MainAxisSize.min,
                spacing: AppSpacing.md,
                children: [
                  DecoratedBox(
                    decoration: BoxDecoration(
                      color: colors.status.liveDot,
                      shape: BoxShape.circle,
                    ),
                    child: const SizedBox.square(dimension: _dotSize),
                  ),
                  // Flexible, or a scaled-up label runs past the card.
                  Flexible(
                    child: Text(
                      label,
                      style: AppTextStyle.caption.copyWith(color: colors.text.secondary),
                    ),
                  ),
                ],
              ),
              Text(
                clock,
                style: AppTextStyle.numeralMd.copyWith(color: colors.text.primary),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
