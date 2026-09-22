import 'package:flutter/material.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';

///
/// The tinted count beside an action, gold while it is running and green once
/// it is done. Excluded: the action card says the same thing in words.
///
class CounterChip extends StatelessWidget {
  const CounterChip({required this.label, required this.isComplete, super.key});

  final String label;
  final bool isComplete;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    final (background, border, foreground) = isComplete
        ? (
            colors.badge.successBackground,
            colors.badge.successBorder,
            colors.badge.successLabel,
          )
        : (
            colors.tag.goldSubtleBackground,
            colors.tag.goldSubtleBorder,
            colors.tag.goldSubtleLabel,
          );
    return ExcludeSemantics(
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: background,
          border: Border.all(color: border),
          borderRadius: const BorderRadius.all(Radius.circular(AppRadius.pill)),
        ),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.xs),
          child: Text(label, style: AppTextStyle.numeralPill.copyWith(color: foreground)),
        ),
      ),
    );
  }
}
