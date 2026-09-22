import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:matinee/core/assets/assets.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/core/widgets/progress_bar.dart';
import 'package:matinee/core/widgets/status_badge.dart';
import 'package:matinee/core/widgets/still_backdrop.dart';
import 'package:matinee/core/widgets/svg_icon.dart';
import 'package:matinee/features/p2p/presentation/widgets/over_image_pill.dart';

/// The still's height, which the design fixes while the body grows with its copy.
const double _imageHeight = 130;

///
/// One prediction in the listing: the title's still with the multiplier and
/// reward over it, the question, how the votes split, and the CTA or receipt.
///
class PredictionCard extends StatelessWidget {
  const PredictionCard({
    required this.title,
    required this.question,
    required this.imageAsset,
    required this.stateLabel,
    required this.stateSpokenLabel,
    required this.rewardLabel,
    required this.yesLabel,
    required this.noLabel,
    required this.yesShare,
    required this.turnoutLabel,
    required this.actionLabel,
    required this.summary,
    required this.isResolved,
    required this.onVote,
    super.key,
  });

  final String title;
  final String question;
  final String imageAsset;

  /// The multiplier while it is open, or that the result is in once settled.
  final String stateLabel;

  /// The settled pill's own name; the card's sentence does not carry it.
  final String stateSpokenLabel;

  final String rewardLabel;
  final String yesLabel;
  final String noLabel;
  final double yesShare;
  final String turnoutLabel;

  /// The button's label while it is open, or the receipt's once settled.
  final String actionLabel;

  /// The card as one sentence; its pills and bar announce none of it.
  final String summary;

  final bool isResolved;
  final VoidCallback onVote;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    return Semantics(
      role: SemanticsRole.listItem,
      container: true,
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: colors.card.background,
          border: Border.all(color: colors.card.border),
          borderRadius: const BorderRadius.all(Radius.circular(AppRadius.lg)),
        ),
        child: ClipRRect(
          borderRadius: const BorderRadius.all(Radius.circular(AppRadius.lg)),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _Still(
                imageAsset: imageAsset,
                title: title,
                stateLabel: stateLabel,
                stateSpokenLabel: stateSpokenLabel,
                rewardLabel: rewardLabel,
                isResolved: isResolved,
              ),
              Padding(
                padding: const EdgeInsets.all(AppSpacing.cardPaddingVertical),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Semantics(
                      label: summary,
                      container: true,
                      excludeSemantics: true,
                      child: _Copy(
                        question: question,
                        yesLabel: yesLabel,
                        noLabel: noLabel,
                        yesShare: yesShare,
                        turnoutLabel: turnoutLabel,
                        isResolved: isResolved,
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.only(top: AppSpacing.md),
                      child: isResolved
                          ? _ClaimedBanner(label: actionLabel)
                          : _VoteButton(label: actionLabel, onPressed: onVote),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Still extends StatelessWidget {
  const _Still({
    required this.imageAsset,
    required this.title,
    required this.stateLabel,
    required this.stateSpokenLabel,
    required this.rewardLabel,
    required this.isResolved,
  });

  final String imageAsset;
  final String title;
  final String stateLabel;
  final String stateSpokenLabel;
  final String rewardLabel;
  final bool isResolved;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    return StillBackdrop(
      imageAsset: imageAsset,
      // Washes the whole still, not just its foot: the multiplier and reward
      // pills sit on the top of the image and the title on its bottom.
      scrim: colors.overlay.predictionCard,
      minHeight: _imageHeight,
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Full width, or `spaceBetween` has nothing to spread the two
            // pills across and they sit together on the left.
            SizedBox(
              width: double.infinity,
              // Wrapped rather than a Row: both pills size to their text,
              // and at a large scale the reward drops below the state.
              child: Wrap(
                alignment: WrapAlignment.spaceBetween,
                spacing: AppSpacing.sm,
                runSpacing: AppSpacing.sm,
                children: [
                  // Settled, the design replaces the multiplier with the
                  // state, so the two never sit side by side.
                  if (isResolved)
                    StatusBadge(
                      label: stateLabel,
                      tone: StatusTone.success,
                      icon: AppIconAssets.check,
                      semanticLabel: stateSpokenLabel,
                    )
                  else
                    OverImagePill.multiplier(label: stateLabel),
                  OverImagePill.reward(label: rewardLabel),
                ],
              ),
            ),
            const Spacer(),
            Text(
              title,
              style: AppTextStyle.labelLarge.copyWith(color: colors.text.primary),
            ),
          ],
        ),
      ),
    );
  }
}

class _Copy extends StatelessWidget {
  const _Copy({
    required this.question,
    required this.yesLabel,
    required this.noLabel,
    required this.yesShare,
    required this.turnoutLabel,
    required this.isResolved,
  });

  final String question;
  final String yesLabel;
  final String noLabel;
  final double yesShare;
  final String turnoutLabel;
  final bool isResolved;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    // Settled, the yes share turns the colour of the result; the no share keeps
    // its own either way, which is how the frame draws both.
    final yesColor = isResolved ? colors.text.success : colors.text.warning;
    final noColor = colors.text.error;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          question,
          style: AppTextStyle.bodySmall.copyWith(color: colors.text.primary),
        ),
        Padding(
          padding: const EdgeInsets.only(top: AppSpacing.md),
          child: Row(
            children: [
              Expanded(
                child: Text(
                  yesLabel,
                  style: AppTextStyle.caption.copyWith(color: yesColor),
                ),
              ),
              Text(
                noLabel,
                style: AppTextStyle.caption.copyWith(color: noColor),
              ),
            ],
          ),
        ),
        Padding(
          padding: const EdgeInsets.only(top: AppSpacing.sm),
          // The two labels above it say the same shares in words, and
          // `ProgressBar` excludes itself.
          child: ProgressBar(
            value: yesShare,
            height: AppControlHeight.progressBarHero,
            // The design turns the bar green once the result is in, where an
            // open vote carries the warning accent.
            tone: isResolved ? ProgressTone.success : ProgressTone.warning,
          ),
        ),
        Padding(
          padding: const EdgeInsets.only(top: AppSpacing.xs),
          child: Text(
            turnoutLabel,
            style: AppTextStyle.caption.copyWith(color: colors.text.muted),
          ),
        ),
      ],
    );
  }
}

class _VoteButton extends StatelessWidget {
  const _VoteButton({required this.label, required this.onPressed});

  final String label;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors.button;
    return OutlinedButton.icon(
      onPressed: onPressed,
      style: OutlinedButton.styleFrom(
        backgroundColor: colors.tonalBackground,
        foregroundColor: colors.tonalLabel,
        side: BorderSide(color: colors.tonalBorder),
        minimumSize: const Size(0, AppControlHeight.cta),
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(AppRadius.md)),
        ),
        textStyle: AppTextStyle.labelLarge,
      ),
      iconAlignment: IconAlignment.end,
      icon: const Icon(Icons.chevron_right, size: AppIconSize.sm),
      label: Text(label),
    );
  }
}

class _ClaimedBanner extends StatelessWidget {
  const _ClaimedBanner({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    return DecoratedBox(
      decoration: BoxDecoration(
        color: colors.badge.successBackground,
        border: Border.all(color: colors.badge.successBorder),
        borderRadius: const BorderRadius.all(Radius.circular(AppRadius.md)),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.md),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          spacing: AppSpacing.sm,
          children: [
            SvgIcon(
              AppIconAssets.check,
              size: AppIconSize.sm,
              color: colors.status.success,
            ),
            // Flexible, or a scaled-up label runs past the banner.
            Flexible(
              child: Text(
                label,
                style: AppTextStyle.labelMedium.copyWith(color: colors.text.success),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
