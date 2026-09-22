import 'package:flutter/material.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';

///
/// The gold pill above each slide heading: a dot and an upper-case label. The
/// caller supplies the text already upper-cased, as the type scale does.
///
class OnboardingEyebrow extends StatelessWidget {
  const OnboardingEyebrow({required this.label, super.key});

  static const double _dotSize = 5;

  final String label;

  @override
  Widget build(BuildContext context) {
    final tag = context.appColors.tag;
    return DecoratedBox(
      decoration: BoxDecoration(
        color: tag.goldSubtleBackground,
        border: Border.all(color: tag.goldSubtleBorder),
        borderRadius: const BorderRadius.all(Radius.circular(AppRadius.pill)),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.xs),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          spacing: AppSpacing.sm,
          children: [
            Container(
              width: _dotSize,
              height: _dotSize,
              decoration: BoxDecoration(
                color: tag.goldSubtleLabel,
                borderRadius: const BorderRadius.all(Radius.circular(AppRadius.full)),
              ),
            ),
            Text(
              label,
              style: Theme.of(context).textTheme.labelSmall?.copyWith(color: tag.goldSubtleLabel),
            ),
          ],
        ),
      ),
    );
  }
}
