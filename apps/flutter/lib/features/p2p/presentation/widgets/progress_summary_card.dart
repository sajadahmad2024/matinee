import 'package:flutter/material.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/core/widgets/progress_ring.dart';

///
/// The tracker's headline: the ring, how many actions are done, and what
/// finishing pays.
///
class ProgressSummaryCard extends StatelessWidget {
  const ProgressSummaryCard({
    required this.progress,
    required this.ringLabel,
    required this.headline,
    required this.caption,
    super.key,
  });

  final double progress;
  final String ringLabel;
  final String headline;
  final String caption;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    return DecoratedBox(
      decoration: BoxDecoration(
        color: colors.card.background,
        border: Border.all(color: colors.card.border),
        borderRadius: const BorderRadius.all(Radius.circular(AppRadius.lg)),
      ),
      child: Padding(
        padding: AppSpacing.cardPadding,
        child: Row(
          spacing: AppSpacing.lg,
          children: [
            ProgressRing(value: progress, label: ringLabel),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    headline,
                    style: AppTextStyle.labelLarge.copyWith(color: colors.text.primary),
                  ),
                  Padding(
                    padding: const EdgeInsets.only(top: AppSpacing.xs),
                    child: Text(
                      caption,
                      style: AppTextStyle.caption.copyWith(color: colors.text.muted),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
