import 'package:flutter/material.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';

///
/// One locked benefit on the paywall: what it is, what it gives, and the gold
/// UNLOCK pill that says it is behind the subscription.
///
class SubscribeFeatureRow extends StatelessWidget {
  const SubscribeFeatureRow({
    required this.title,
    required this.subtitle,
    required this.chipLabel,
    super.key,
  });

  final String title;
  final String subtitle;
  final String chipLabel;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors.auth;
    final textTheme = Theme.of(context).textTheme;
    return DecoratedBox(
      decoration: BoxDecoration(
        color: colors.surfaceContainer,
        border: Border.all(color: colors.outline),
        borderRadius: const BorderRadius.all(Radius.circular(AppRadius.lg)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Row(
          spacing: AppSpacing.md,
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                spacing: AppSpacing.xxs,
                children: [
                  Text(title, style: textTheme.titleSmall?.copyWith(color: colors.onSurface)),
                  Text(subtitle, style: AppTextStyle.caption.copyWith(color: colors.onSurfaceVariant)),
                ],
              ),
            ),
            _UnlockPill(label: chipLabel),
          ],
        ),
      ),
    );
  }
}

class _UnlockPill extends StatelessWidget {
  const _UnlockPill({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    return DecoratedBox(
      decoration: BoxDecoration(
        color: colors.tag.goldSubtleBackground,
        border: Border.all(color: colors.icon.accent),
        borderRadius: const BorderRadius.all(Radius.circular(AppRadius.pill)),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.sm),
        child: Text(
          label,
          style: Theme.of(context).textTheme.labelSmall?.copyWith(color: colors.tag.goldSubtleLabel),
        ),
      ),
    );
  }
}
