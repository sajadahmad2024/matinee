import 'package:flutter/material.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/core/widgets/svg_icon.dart';

///
/// The tinted pill a history card carries to say how the entry went, and the
/// plain one that names an auction lot.
///
/// The design draws the badge a card earned as the same pill in gold, so that
/// chip is this widget rather than a second one.
///
class StatusBadge extends StatelessWidget {
  const StatusBadge({required this.label, required this.tone, super.key, this.icon});

  final String label;
  final StatusTone tone;

  /// A glyph from `AppIconAssets`. The lot names carry none.
  final String? icon;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    final (background, border, foreground) = switch (tone) {
      StatusTone.success => (
        colors.badge.successBackground,
        colors.badge.successBorder,
        colors.badge.successLabel,
      ),
      StatusTone.error => (
        colors.badge.errorBackground,
        colors.badge.errorBorder,
        colors.badge.errorLabel,
      ),
      StatusTone.gold => (
        colors.tag.goldSubtleBackground,
        colors.tag.goldSubtleBorder,
        colors.tag.goldSubtleLabel,
      ),
      StatusTone.neutral => (
        colors.badge.neutralBackground,
        colors.badge.neutralBorder,
        colors.badge.neutralLabel,
      ),
    };
    return DecoratedBox(
      decoration: BoxDecoration(
        color: background,
        border: Border.all(color: border),
        borderRadius: const BorderRadius.all(Radius.circular(AppRadius.pill)),
      ),
      child: Padding(
        // The design sets the naming pill tighter than the tinted ones.
        padding: tone == StatusTone.neutral
            ? const EdgeInsets.symmetric(horizontal: AppSpacing.sm, vertical: AppSpacing.xxs)
            : const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.xs),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          spacing: AppSpacing.xs,
          children: [
            if (icon case final glyph?) SvgIcon(glyph, size: AppIconSize.xs, color: foreground),
            Text(label, style: AppTextStyle.labelSmall.copyWith(color: foreground)),
          ],
        ),
      ),
    );
  }
}

enum StatusTone { success, error, gold, neutral }
