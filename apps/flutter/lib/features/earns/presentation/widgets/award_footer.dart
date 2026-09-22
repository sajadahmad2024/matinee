import 'package:flutter/material.dart';
import 'package:matinee/core/assets/assets.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/core/widgets/status_badge.dart';

///
/// The row that closes a history card: what the entry paid, and the badge it
/// earned where there was one.
///
class AwardFooter extends StatelessWidget {
  const AwardFooter({
    required this.points,
    required this.unitLabel,
    required this.isAwarded,
    super.key,
    this.badgeName,
  });

  /// Signed by the caller, or the dash the design draws for an entry that paid nothing.
  final String points;

  final String unitLabel;

  ///
  /// Whether the entry paid at all. An unpaid one steps the figure back to the
  /// caption grey, where the design uses a tone too faint to read.
  ///
  final bool isAwarded;

  final String? badgeName;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors.text;
    // A Wrap, not a Row: the figure and the chip fill the card at the design's
    // text size, so a longer badge name has to drop to its own line rather
    // than be squeezed past the card's edge.
    return Wrap(
      alignment: WrapAlignment.spaceBetween,
      crossAxisAlignment: WrapCrossAlignment.center,
      spacing: AppSpacing.sm,
      runSpacing: AppSpacing.sm,
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.baseline,
          textBaseline: TextBaseline.alphabetic,
          mainAxisSize: MainAxisSize.min,
          spacing: AppSpacing.xs,
          children: [
            Text(
              points,
              style: AppTextStyle.numeralSm.copyWith(
                color: isAwarded ? colors.numeral : colors.muted,
              ),
            ),
            Text(unitLabel, style: AppTextStyle.caption.copyWith(color: colors.muted)),
          ],
        ),
        if (badgeName case final name?) StatusBadge(label: name, tone: StatusTone.gold, icon: AppIconAssets.star),
      ],
    );
  }
}
