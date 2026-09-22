import 'package:flutter/material.dart';
import 'package:matinee/core/theme/app_elevation.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/core/widgets/progress_bar.dart';
import 'package:matinee/core/widgets/status_badge.dart';
import 'package:matinee/core/widgets/still_backdrop.dart';
import 'package:matinee/features/p2p/presentation/widgets/over_image_pill.dart';
import 'package:matinee/features/p2p/presentation/widgets/time_chip.dart';

/// The still's height, which the design fixes while the body grows with its copy.
const double _imageHeight = 140;

///
/// The quest the design features at the top of the listing: its still under a
/// scrim, the state and reward over it, and the run's progress and CTA below.
///
class HeroQuestCard extends StatelessWidget {
  const HeroQuestCard({
    required this.title,
    required this.description,
    required this.imageAsset,
    required this.activeLabel,
    required this.activeSpokenLabel,
    required this.rewardLabel,
    required this.timeLeftLabel,
    required this.progress,
    required this.progressLabel,
    required this.ctaLabel,
    required this.summary,
    required this.onTrack,
    super.key,
  });

  final String title;
  final String description;
  final String imageAsset;
  final String activeLabel;

  /// The state pill's own name; the card's sentence does not carry it.
  final String activeSpokenLabel;

  final String rewardLabel;
  final String timeLeftLabel;
  final double progress;
  final String progressLabel;
  final String ctaLabel;

  /// The whole card as one sentence; its pills and bar announce none of it.
  final String summary;

  final VoidCallback onTrack;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    return DecoratedBox(
      decoration: BoxDecoration(
        border: Border.all(color: colors.tag.goldBorder),
        borderRadius: const BorderRadius.all(Radius.circular(AppRadius.lg)),
        boxShadow: AppElevation.glowCard,
      ),
      child: ClipRRect(
        borderRadius: const BorderRadius.all(Radius.circular(AppRadius.lg)),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _Still(
              imageAsset: imageAsset,
              activeLabel: activeLabel,
              activeSpokenLabel: activeSpokenLabel,
              rewardLabel: rewardLabel,
            ),
            ColoredBox(
              color: colors.card.background,
              child: Padding(
                // The design closes the top a shade tighter than the sides.
                padding: const EdgeInsets.only(
                  left: AppSpacing.lg,
                  right: AppSpacing.lg,
                  top: AppSpacing.cardPaddingVertical,
                  bottom: AppSpacing.lg,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Semantics(
                      label: summary,
                      container: true,
                      excludeSemantics: true,
                      child: _Copy(
                        title: title,
                        description: description,
                        timeLeftLabel: timeLeftLabel,
                        progress: progress,
                        progressLabel: progressLabel,
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.only(top: AppSpacing.lg),
                      child: FilledButton(onPressed: onTrack, child: Text(ctaLabel)),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Still extends StatelessWidget {
  const _Still({
    required this.imageAsset,
    required this.activeLabel,
    required this.activeSpokenLabel,
    required this.rewardLabel,
  });

  final String imageAsset;
  final String activeLabel;
  final String activeSpokenLabel;
  final String rewardLabel;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    return StillBackdrop(
      imageAsset: imageAsset,
      // Washes the top so the pills laid on it hold their contrast, and falls
      // to the body it meets.
      scrim: colors.overlay.questCard,
      minHeight: _imageHeight,
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Align(
          alignment: AlignmentDirectional.topStart,
          // Full width, or `spaceBetween` has nothing to spread the two
          // pills across and they sit together on the left.
          child: SizedBox(
            width: double.infinity,
            // Wrapped rather than a Row: both pills size to their text,
            // and at a large scale the reward drops below the state.
            child: Wrap(
              alignment: WrapAlignment.spaceBetween,
              spacing: AppSpacing.sm,
              runSpacing: AppSpacing.sm,
              children: [
                StatusBadge(
                  label: activeLabel,
                  tone: StatusTone.active,
                  semanticLabel: activeSpokenLabel,
                ),
                OverImagePill.reward(label: rewardLabel),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _Copy extends StatelessWidget {
  const _Copy({
    required this.title,
    required this.description,
    required this.timeLeftLabel,
    required this.progress,
    required this.progressLabel,
  });

  final String title;
  final String description;
  final String timeLeftLabel;
  final double progress;
  final String progressLabel;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors.text;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Wrapped rather than a Row: a long title and the chip both size to
        // their text, and at a large scale the chip has to drop below it.
        Wrap(
          alignment: WrapAlignment.spaceBetween,
          crossAxisAlignment: WrapCrossAlignment.center,
          spacing: AppSpacing.sm,
          runSpacing: AppSpacing.sm,
          children: [
            Text(title, style: AppTextStyle.titleMedium.copyWith(color: colors.primary)),
            TimeChip(label: timeLeftLabel),
          ],
        ),
        Padding(
          padding: const EdgeInsets.only(top: AppSpacing.xs),
          child: Text(
            description,
            style: AppTextStyle.bodySmall.copyWith(color: colors.secondary),
          ),
        ),
        Padding(
          padding: const EdgeInsets.only(top: AppSpacing.md),
          child: Row(
            spacing: AppSpacing.md,
            children: [
              Expanded(
                child: ProgressBar(value: progress, height: AppControlHeight.progressBarHero),
              ),
              Text(
                progressLabel,
                style: AppTextStyle.numeralAction.copyWith(color: colors.link),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
