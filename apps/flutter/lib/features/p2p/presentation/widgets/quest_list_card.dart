import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:matinee/core/assets/assets.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/core/widgets/status_badge.dart';
import 'package:matinee/core/widgets/svg_icon.dart';

/// The still down the card's leading edge, which the design bleeds to its corners.
const double _stillWidth = 88;

///
/// One row of the all-quests list: the still, what the quest pays, and either
/// the button that starts it or the badge saying it is already paid.
///
class QuestListCard extends StatelessWidget {
  const QuestListCard({
    required this.title,
    required this.description,
    required this.imageAsset,
    required this.pointsLabel,
    required this.summary,
    required this.isClaimed,
    required this.actionLabel,
    required this.onTap,
    super.key,
  });

  final String title;
  final String description;
  final String imageAsset;
  final String pointsLabel;

  /// The row as one sentence, so its three lines read as one item.
  final String summary;

  final bool isClaimed;

  /// The button's label while the quest is open, or the badge's once it is paid.
  final String actionLabel;

  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    return Semantics(
      role: SemanticsRole.listItem,
      label: summary,
      button: true,
      // Excluding the subtree takes the InkWell's tap action with it, leaving a
      // row a screen reader can reach and cannot activate.
      onTap: onTap,
      container: true,
      excludeSemantics: true,
      child: DecoratedBox(
        // Behind the Material rather than on it, because a Material takes a
        // colour and the design washes this row down its height.
        decoration: BoxDecoration(
          gradient: colors.card.backgroundRow,
          borderRadius: const BorderRadius.all(Radius.circular(AppRadius.md)),
        ),
        child: Material(
          // Transparent, or its own fill would cover the wash underneath.
          type: MaterialType.transparency,
          shape: RoundedRectangleBorder(
            // The same stroke either way: the frame marks a claimed quest with
            // the wash over its still, not with a green edge.
            side: BorderSide(color: colors.card.border),
            borderRadius: const BorderRadius.all(Radius.circular(AppRadius.md)),
          ),
          clipBehavior: Clip.antiAlias,
          child: InkWell(
            onTap: onTap,
            // IntrinsicHeight, or stretching the children asks a Row inside a
            // Column to fill a height that has no bound.
            child: IntrinsicHeight(
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  _Still(imageAsset: imageAsset, isClaimed: isClaimed),
                  Expanded(
                    child: Padding(
                      padding: AppSpacing.cardPadding,
                      child: _Copy(
                        title: title,
                        description: description,
                        pointsLabel: pointsLabel,
                        isClaimed: isClaimed,
                        actionLabel: actionLabel,
                        onTap: onTap,
                      ),
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

class _Still extends StatelessWidget {
  const _Still({required this.imageAsset, required this.isClaimed});

  final String imageAsset;
  final bool isClaimed;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    return SizedBox(
      width: _stillWidth,
      child: Stack(
        fit: StackFit.expand,
        children: [
          Image.asset(
            imageAsset,
            fit: BoxFit.cover,
            excludeFromSemantics: true,
            // On the image rather than an `Opacity` above it, which would buy
            // an offscreen layer for every claimed row.
            opacity: AlwaysStoppedAnimation(
              isClaimed ? colors.overlay.imageDimClaimed : 1,
            ),
          ),
          if (isClaimed)
            ColoredBox(
              color: colors.badge.successBackground,
              child: Center(
                child: SvgIcon(
                  AppIconAssets.check,
                  size: AppIconSize.md,
                  color: colors.status.success,
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _Copy extends StatelessWidget {
  const _Copy({
    required this.title,
    required this.description,
    required this.pointsLabel,
    required this.isClaimed,
    required this.actionLabel,
    required this.onTap,
  });

  final String title;
  final String description;
  final String pointsLabel;
  final bool isClaimed;
  final String actionLabel;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          pointsLabel,
          style: AppTextStyle.numeralPill.copyWith(color: colors.text.link),
        ),
        Padding(
          padding: const EdgeInsets.only(top: AppSpacing.xs),
          child: Text(
            title,
            style: AppTextStyle.titleSmall.copyWith(
              // The design knocks a finished quest's name back to the tone of
              // its own description.
              color: isClaimed ? colors.text.muted : colors.text.primary,
            ),
          ),
        ),
        Padding(
          padding: const EdgeInsets.only(top: AppSpacing.xs),
          child: Text(
            description,
            style: AppTextStyle.caption.copyWith(color: colors.text.muted),
          ),
        ),
        Padding(
          padding: const EdgeInsets.only(top: AppSpacing.md),
          child: Align(
            alignment: AlignmentDirectional.centerStart,
            child: isClaimed
                ? StatusBadge(label: actionLabel, tone: StatusTone.successPlain)
                : OutlinedButton(
                    onPressed: onTap,
                    style: OutlinedButton.styleFrom(
                      backgroundColor: colors.button.secondaryBackground,
                      foregroundColor: colors.button.secondaryLabel,
                      side: BorderSide(color: colors.button.secondaryBorder),
                    ),
                    child: Text(actionLabel),
                  ),
          ),
        ),
      ],
    );
  }
}
