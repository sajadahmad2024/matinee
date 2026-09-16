import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:matinee/core/assets/assets.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/core/widgets/status_badge.dart';
import 'package:matinee/features/earns/presentation/widgets/award_footer.dart';

/// The band the design gives the lot's still.
const double _imageHeight = 80;

///
/// One lot won at auction: the still and the lot's name over it, then what it
/// cost and what it paid.
///
class WinCard extends StatelessWidget {
  const WinCard({
    required this.title,
    required this.imageAsset,
    required this.kindLabel,
    required this.statusLabel,
    required this.date,
    required this.bidLabel,
    required this.bidValue,
    required this.points,
    required this.isAwarded,
    required this.pointsUnit,
    required this.semanticLabel,
    super.key,
    this.badgeName,
  });

  final String title;
  final String imageAsset;
  final String kindLabel;
  final String statusLabel;
  final String date;

  /// Split in two because the design colours the figure and not its label.
  final String bidLabel;
  final String bidValue;

  final String points;

  /// An entry that paid nothing steps its figure back to the caption grey.
  final bool isAwarded;

  final String pointsUnit;

  /// The card as one sentence; read apart, its seven texts say it seven times.
  final String semanticLabel;

  final String? badgeName;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    return Semantics(
      label: semanticLabel,
      // The list around these announces a position only if its children say
      // they are items in it.
      role: SemanticsRole.listItem,
      container: true,
      excludeSemantics: true,
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: colors.card.background,
          // The design rings the wins that earned a badge.
          border: Border.all(
            color: badgeName == null ? colors.card.border : colors.card.borderHighlight,
          ),
          borderRadius: const BorderRadius.all(Radius.circular(AppRadius.lg)),
        ),
        child: ClipRRect(
          borderRadius: const BorderRadius.all(Radius.circular(AppRadius.lg)),
          child: Column(
            children: [
              _Banner(
                title: title,
                imageAsset: imageAsset,
                kindLabel: kindLabel,
                statusLabel: statusLabel,
              ),
              Padding(
                padding: const EdgeInsets.only(
                  left: AppScreenPadding.main,
                  right: AppScreenPadding.main,
                  top: AppSpacing.md,
                  bottom: AppSpacing.md,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      spacing: AppSpacing.sm,
                      children: [
                        Flexible(
                          child: Text(
                            date,
                            style: AppTextStyle.caption.copyWith(color: colors.text.muted),
                          ),
                        ),
                        Flexible(
                          child: Text.rich(
                            TextSpan(
                              text: bidLabel,
                              style: AppTextStyle.caption.copyWith(color: colors.text.muted),
                              children: [
                                TextSpan(
                                  text: bidValue,
                                  style: AppTextStyle.caption.copyWith(color: colors.text.link),
                                ),
                              ],
                            ),
                            textAlign: TextAlign.end,
                          ),
                        ),
                      ],
                    ),
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
                      child: Divider(height: 0, color: colors.divider),
                    ),
                    AwardFooter(
                      points: points,
                      unitLabel: pointsUnit,
                      isAwarded: isAwarded,
                      badgeName: badgeName,
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

class _Banner extends StatelessWidget {
  const _Banner({
    required this.title,
    required this.imageAsset,
    required this.kindLabel,
    required this.statusLabel,
  });

  final String title;
  final String imageAsset;
  final String kindLabel;
  final String statusLabel;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    return Stack(
      children: [
        Positioned.fill(
          child: Image.asset(imageAsset, fit: BoxFit.cover, excludeFromSemantics: true),
        ),
        // One layer, running across rather than up: the design darkens the end
        // the name sits on and leaves the still visible at the other.
        Positioned.fill(
          child: DecoratedBox(decoration: BoxDecoration(gradient: colors.overlay.gameCard)),
        ),
        // A minimum rather than a fixed height: the band is the design's, but a
        // scaled-up name has to be able to push it taller instead of clipping.
        ConstrainedBox(
          constraints: const BoxConstraints(minHeight: _imageHeight, minWidth: double.infinity),
          child: Padding(
            padding: const EdgeInsets.symmetric(
              horizontal: AppScreenPadding.main,
              vertical: AppSpacing.md,
            ),
            child: Row(
              spacing: AppSpacing.sm,
              children: [
                Expanded(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    spacing: AppSpacing.xs,
                    children: [
                      StatusBadge(label: kindLabel, tone: StatusTone.neutral),
                      Text(
                        title,
                        style: Theme.of(context).textTheme.titleSmall?.copyWith(
                          color: colors.text.primary,
                        ),
                      ),
                    ],
                  ),
                ),
                StatusBadge(
                  label: statusLabel,
                  tone: StatusTone.success,
                  icon: AppIconAssets.check,
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
