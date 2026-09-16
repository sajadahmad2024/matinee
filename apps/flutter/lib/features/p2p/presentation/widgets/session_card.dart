import 'package:flutter/material.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/core/widgets/progress_bar.dart';
import 'package:matinee/features/p2p/presentation/widgets/time_chip.dart';

/// Today's minutes against the level's target, and what depends on meeting it.
class SessionCard extends StatelessWidget {
  const SessionCard({
    required this.eyebrow,
    required this.minutes,
    required this.target,
    required this.remainingLabel,
    required this.isMet,
    required this.progress,
    required this.caption,
    required this.summary,
    super.key,
  });

  final String eyebrow;
  final String minutes;
  final String target;
  final String remainingLabel;
  final bool isMet;
  final double progress;
  final String caption;

  /// The card as one sentence, because the figure and its target read apart.
  final String summary;

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
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Wrapped rather than a Row: the figure and the chip both size to
            // their text, and at a large scale the chip drops below it.
            Wrap(
              alignment: WrapAlignment.spaceBetween,
              crossAxisAlignment: WrapCrossAlignment.center,
              spacing: AppSpacing.sm,
              runSpacing: AppSpacing.sm,
              children: [
                Semantics(
                  label: summary,
                  container: true,
                  excludeSemantics: true,
                  child: _Figure(eyebrow: eyebrow, minutes: minutes, target: target),
                ),
                TimeChip(label: remainingLabel, isMet: isMet),
              ],
            ),
            Padding(
              padding: const EdgeInsets.only(top: AppSpacing.md),
              child: ProgressBar(
                value: progress,
                height: AppControlHeight.progressBarHero,
                tone: isMet ? ProgressTone.success : ProgressTone.bold,
              ),
            ),
            Padding(
              padding: const EdgeInsets.only(top: AppSpacing.sm),
              child: Text(
                caption,
                style: AppTextStyle.caption.copyWith(color: colors.text.muted),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Figure extends StatelessWidget {
  const _Figure({required this.eyebrow, required this.minutes, required this.target});

  final String eyebrow;
  final String minutes;
  final String target;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors.text;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(eyebrow, style: AppTextStyle.overline.copyWith(color: colors.muted)),
        Padding(
          padding: const EdgeInsets.only(top: AppSpacing.xs),
          child: Wrap(
            crossAxisAlignment: WrapCrossAlignment.end,
            spacing: AppSpacing.xs,
            children: [
              Text(
                minutes,
                style: AppTextStyle.headlineMedium.copyWith(color: colors.primary),
              ),
              Text(target, style: AppTextStyle.caption.copyWith(color: colors.muted)),
            ],
          ),
        ),
      ],
    );
  }
}
