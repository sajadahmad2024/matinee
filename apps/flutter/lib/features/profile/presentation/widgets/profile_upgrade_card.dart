import 'package:flutter/material.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';

/// The row between the counters and the menu that sells the paywall.
class ProfileUpgradeCard extends StatelessWidget {
  const ProfileUpgradeCard({
    required this.title,
    required this.subtitle,
    required this.actionLabel,
    required this.onUpgrade,
    super.key,
  });

  final String title;
  final String subtitle;
  final String actionLabel;
  final VoidCallback onUpgrade;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    return DecoratedBox(
      decoration: BoxDecoration(
        color: colors.card.backgroundRaised,
        borderRadius: const BorderRadius.all(Radius.circular(AppRadius.md)),
      ),
      child: Padding(
        padding: AppSpacing.cardPadding,
        child: Row(
          spacing: AppSpacing.md,
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                spacing: AppSpacing.xxs,
                children: [
                  Text(
                    title,
                    style: Theme.of(context).textTheme.titleSmall?.copyWith(color: colors.text.primary),
                  ),
                  Text(
                    subtitle,
                    style: AppTextStyle.caption.copyWith(color: colors.text.secondary),
                  ),
                ],
              ),
            ),
            FilledButton(
              onPressed: onUpgrade,
              style: FilledButton.styleFrom(
                minimumSize: const Size(0, AppControlHeight.button),
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                textStyle: AppTextStyle.labelMedium,
              ),
              child: Text(actionLabel),
            ),
          ],
        ),
      ),
    );
  }
}
