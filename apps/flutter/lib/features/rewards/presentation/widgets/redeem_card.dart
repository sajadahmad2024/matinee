import 'package:flutter/material.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/core/widgets/back_disc_button.dart';
import 'package:matinee/features/rewards/presentation/widgets/category_tag.dart';

///
/// The image card the Rewards and P2P lists are built from: a still under two
/// scrims, a category tag, a title and a subtitle, and a disc that reads as
/// the forward chevron.
///
class RedeemCard extends StatelessWidget {
  const RedeemCard({
    required this.category,
    required this.title,
    required this.subtitle,
    required this.imageAsset,
    required this.onTap,
    super.key,
  });

  final String category;
  final String title;
  final String subtitle;
  final String imageAsset;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    // Merged, not excluded: excluding the subtree took the InkWell's tap action
    // with it and left a labelled node a screen reader could not activate.
    return MergeSemantics(
      child: Semantics(
        button: true,
        child: Material(
          color: Colors.transparent,
          shape: RoundedRectangleBorder(
            side: BorderSide(color: colors.card.border),
            borderRadius: const BorderRadius.all(Radius.circular(AppRadius.lg)),
          ),
          clipBehavior: Clip.antiAlias,
          child: InkWell(
            onTap: onTap,
            // A minimum, not a fixed height: the design draws 144, and a
            // user-scaled title has to grow the card rather than be clipped.
            child: ConstrainedBox(
              constraints: const BoxConstraints(minHeight: AppControlHeight.gameCard),
              child: Stack(
                // The copy is the child that sizes the stack, so it decides
                // where it sits once the minimum height makes the card taller
                // than it; without this it is pinned to the top corner.
                alignment: AlignmentDirectional.centerStart,
                children: [
                  // The still and its scrims fill whatever the copy sizes the
                  // card to, so the copy is the one unpositioned child.
                  Positioned.fill(
                    child: Image.asset(
                      imageAsset,
                      fit: BoxFit.cover,
                      excludeFromSemantics: true,
                    ),
                  ),
                  // Two scrims, not one: the first darkens the side the copy
                  // sits on, the second keeps the card's lower edge legible.
                  Positioned.fill(
                    child: Container(
                      decoration: BoxDecoration(gradient: colors.overlay.gameCard),
                      foregroundDecoration: BoxDecoration(
                        gradient: colors.overlay.gameCardBottom,
                      ),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppScreenPadding.main,
                      vertical: AppSpacing.lg,
                    ),
                    child: Row(
                      spacing: AppSpacing.md,
                      children: [
                        Expanded(
                          child: _Copy(category: category, title: title, body: subtitle),
                        ),
                        // The design reuses the back disc as the forward
                        // chevron; the row itself carries the tap.
                        const ForwardDisc(),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _Copy extends StatelessWidget {
  const _Copy({required this.category, required this.title, required this.body});

  final String category;
  final String title;
  final String body;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors.text;
    return Column(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // The design sets the tag in a taller line box than the pill, which
        // leaves a little air above it and closes the gap to the title.
        Padding(
          padding: const EdgeInsets.only(top: AppSpacing.xs),
          child: Align(
            alignment: AlignmentDirectional.centerStart,
            child: CategoryTag(label: category),
          ),
        ),
        Padding(
          padding: const EdgeInsets.only(top: AppSpacing.sm),
          child: Text(title, style: AppTextStyle.cardTitle.copyWith(color: colors.primary)),
        ),
        Padding(
          padding: const EdgeInsets.only(top: AppSpacing.xs),
          child: Text(
            body,
            style: AppTextStyle.caption.copyWith(color: colors.onImageSubtitle),
          ),
        ),
      ],
    );
  }
}
