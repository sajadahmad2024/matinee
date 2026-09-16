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
/// The design draws the badge a card earned as the same pill in gold, and the
/// 'ACTIVE' state pill over a quest still in the points pill's navy, so both
/// are tones here rather than widgets of their own.
///
class StatusBadge extends StatelessWidget {
  const StatusBadge({
    required this.label,
    required this.tone,
    super.key,
    this.icon,
    this.semanticLabel,
  });

  final String label;
  final StatusTone tone;

  /// A glyph from `AppIconAssets`. The lot names carry none.
  final String? icon;

  ///
  /// Spoken in place of [label] where the pill reaches a screen reader, because
  /// the design sets every pill in upper case and a short run is spelled out.
  ///
  final String? semanticLabel;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    final (background, Color? border, foreground) = switch (tone) {
      StatusTone.successPlain => (
        colors.badge.successBackground,
        null,
        colors.badge.successLabel,
      ),
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
      StatusTone.active => (
        colors.pill.pointsBackground,
        colors.pill.pointsBackground,
        colors.text.primary,
      ),
    };
    final badge = DecoratedBox(
      decoration: BoxDecoration(
        color: background,
        border: border == null ? null : Border.all(color: border),
        borderRadius: const BorderRadius.all(Radius.circular(AppRadius.pill)),
      ),
      child: Padding(
        // The design sets the naming pill tighter than the tinted ones.
        padding: switch (tone) {
          // The plain pill has no stroke to sit inside, so the design closes
          // it up the way it does the naming one.
          StatusTone.successPlain || StatusTone.neutral || StatusTone.active => const EdgeInsets.symmetric(
            horizontal: AppSpacing.sm,
            vertical: AppSpacing.xxs,
          ),
          _ => const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.xs),
        },
        child: Row(
          mainAxisSize: MainAxisSize.min,
          spacing: AppSpacing.xs,
          children: [
            if (icon case final glyph?) SvgIcon(glyph, size: AppIconSize.xs, color: foreground),
            // Flexible, or a scaled-up label runs past the pill rather than
            // wrapping inside it.
            Flexible(
              child: Text(label, style: AppTextStyle.labelSmall.copyWith(color: foreground)),
            ),
          ],
        ),
      ),
    );
    return switch (semanticLabel) {
      final spoken? => Semantics(
        label: spoken,
        container: true,
        excludeSemantics: true,
        child: badge,
      ),
      null => badge,
    };
  }
}

enum StatusTone {
  success,

  /// The same wash with no stroke, which is how the frames draw a plain
  /// 'done': DONE, REWARD CLAIMED and the open-prediction count.
  successPlain,
  error,
  gold,

  /// Names a thing rather than a state — an auction lot's category.
  neutral,

  /// Says a thing is running, over a still: the navy pill of the points family.
  active,
}
