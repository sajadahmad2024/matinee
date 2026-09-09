import 'package:flutter/material.dart';
import 'package:matinee/core/l10n/l10n.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/features/auth/presentation/widgets/subscribe_benefit_row.dart';
import 'package:matinee/features/auth/presentation/widgets/subscribe_feature_row.dart';

///
/// The gold 'PREMIUM ACCESS' line the paywall opens with.
///
/// Shared by the screen that closes sign-up and the sheet an upgrade action
/// opens later, which frame it differently: the screen sets a skip action
/// beside it, the sheet leaves the row to it alone.
///
class SubscribeEyebrow extends StatelessWidget {
  const SubscribeEyebrow({super.key});

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    return Row(
      mainAxisSize: MainAxisSize.min,
      spacing: AppSpacing.sm,
      children: [
        Icon(Icons.star, size: AppIconSize.sm, color: colors.icon.accent),
        Flexible(
          child: Text(
            context.l10n.subscribeEyebrow,
            overflow: TextOverflow.ellipsis,
            style: Theme.of(context).textTheme.labelSmall?.copyWith(color: colors.text.link),
          ),
        ),
      ],
    );
  }
}

///
/// The offer itself: the headline, the three feature cards and the reasons to
/// subscribe. Identical in the screen and the sheet, which differ only in the
/// chrome around it.
///
class SubscribeBody extends StatelessWidget {
  const SubscribeBody({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final colors = context.appColors.auth;
    final textTheme = Theme.of(context).textTheme;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Padding(
          padding: const EdgeInsets.only(bottom: AppSpacing.xl),
          child: Text(
            l10n.subscribeTitle,
            style: textTheme.headlineMedium?.copyWith(color: colors.onSurface),
          ),
        ),
        Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          spacing: AppSpacing.cardGap,
          children: [
            SubscribeFeatureRow(
              title: l10n.subscribeFeature1Title,
              subtitle: l10n.subscribeFeature1Subtitle,
              chipLabel: l10n.subscribeUnlockChip,
            ),
            SubscribeFeatureRow(
              title: l10n.subscribeFeature2Title,
              subtitle: l10n.subscribeFeature2Subtitle,
              chipLabel: l10n.subscribeUnlockChip,
            ),
            SubscribeFeatureRow(
              title: l10n.subscribeFeature3Title,
              subtitle: l10n.subscribeFeature3Subtitle,
              chipLabel: l10n.subscribeUnlockChip,
            ),
          ],
        ),
        Padding(
          padding: const EdgeInsets.only(top: AppSpacing.xxl),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            spacing: AppSpacing.lg,
            children: [
              Text(
                l10n.subscribeWhyTitle,
                style: AppTextStyle.overline.copyWith(color: colors.onSurfaceVariant),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                spacing: AppSpacing.md,
                children: [
                  SubscribeBenefitRow(label: l10n.subscribeBenefit1),
                  SubscribeBenefitRow(label: l10n.subscribeBenefit2),
                  SubscribeBenefitRow(label: l10n.subscribeBenefit3),
                  SubscribeBenefitRow(label: l10n.subscribeBenefit4),
                  SubscribeBenefitRow(label: l10n.subscribeBenefit5),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }
}
