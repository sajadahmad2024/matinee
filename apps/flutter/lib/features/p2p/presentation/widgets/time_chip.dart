import 'package:flutter/material.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';

///
/// The gold clock chip: how long a quest is still open, or how much of today's
/// streak session is left.
///
class TimeChip extends StatelessWidget {
  const TimeChip({required this.label, super.key, this.isMet = false});

  final String label;

  ///
  /// The session is already over its target, which the design has no state for
  /// and which the gold 'left' tone would misreport.
  ///
  final bool isMet;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    final (background, border, foreground) = isMet
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
    return Semantics(
      // Grouped, not a live region: the label only moves when the screen
      // reloads, and the chip is read where it sits.
      container: true,
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: background,
          border: Border.all(color: border),
          borderRadius: const BorderRadius.all(Radius.circular(AppRadius.pill)),
        ),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.xs),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            spacing: AppSpacing.xs,
            children: [
              Icon(Icons.schedule, size: AppIconSize.xs, color: foreground),
              Text(label, style: AppTextStyle.labelSmall.copyWith(color: foreground)),
            ],
          ),
        ),
      ),
    );
  }
}
