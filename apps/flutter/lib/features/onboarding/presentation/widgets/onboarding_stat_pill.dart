import 'package:flutter/material.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';

///
/// The gold-tinted figure under each paragraph: a headline number and the unit
/// it counts.
///
class OnboardingStatPill extends StatelessWidget {
  const OnboardingStatPill({required this.value, required this.caption, super.key});

  final String value;
  final String caption;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors.onboarding;
    final textTheme = Theme.of(context).textTheme;
    return DecoratedBox(
      decoration: BoxDecoration(
        color: colors.statPillBackground,
        borderRadius: const BorderRadius.all(Radius.circular(AppRadius.sm)),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.sm),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          spacing: AppSpacing.sm,
          children: [
            Text(value, style: textTheme.labelLarge?.copyWith(color: colors.statPillValue)),
            Flexible(
              child: Text(
                caption,
                style: AppTextStyle.caption.copyWith(color: colors.statPillCaption),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
