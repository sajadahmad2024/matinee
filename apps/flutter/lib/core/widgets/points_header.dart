import 'package:flutter/material.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/core/widgets/header_block.dart';

///
/// The Rewards and Badges header: the balance on the left, the badge standing
/// and the distance to the next one on the right.
///
class PointsHeader extends StatelessWidget {
  const PointsHeader({
    required this.totalPointsLabel,
    required this.totalPoints,
    required this.pointsUnit,
    required this.badgeLabel,
    required this.badgeName,
    required this.nextBadgeCaption,
    required this.balanceSummary,
    required this.badgeSummary,
    super.key,
    this.top,
    this.bottom,
  });

  final String totalPointsLabel;

  /// Formatted by the caller, which owns the locale's thousands separator.
  final String totalPoints;

  final String pointsUnit;
  final String badgeLabel;
  final String badgeName;
  final String nextBadgeCaption;

  ///
  /// The balance as one sentence. The figure is split across a caption, a
  /// masked numeral and its unit, which otherwise read as three stops.
  ///
  final String balanceSummary;

  /// The badge standing as one sentence, for the same reason.
  final String badgeSummary;

  ///
  /// Sits above the balance: an eyebrow, a title, a segmented control. Rewards
  /// draws an empty slot there, which is why the gap below is its own.
  ///
  final Widget? top;

  /// The bar Badges runs the full width of the block, under the balance.
  final Widget? bottom;

  @override
  Widget build(BuildContext context) {
    return HeaderBlock(
      // With nothing above it the balance stands where the design's empty
      // eyebrow slot leaves it; a real top row starts at the frame's own 50.
      topPadding: top == null ? AppSpacing.xxxl : AppSpacing.sm,
      // The bar is drawn on the closing hairline, so it takes the gap that
      // would otherwise sit under it.
      bottomPadding: bottom == null ? AppSpacing.lg : 0,
      child: Column(
        // Stretched, or the full-width bar below shrinks to its own fill and
        // sits centred, with no track either side of it.
        crossAxisAlignment: CrossAxisAlignment.stretch,
        spacing: AppSpacing.xl,
        children: [
          ?top,
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            // The frame spreads the two blocks to the margins. Both are
            // flexible and sized to their text, so what is left over goes
            // between them: sized tight, the balance would eat its whole half
            // and strand the badge short of the right margin.
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Capped at half the row so neither block can push the other
              // off the screen once the text scales up; loose, so each keeps
              // its own width and the gap sits in the middle.
              Flexible(
                child: Semantics(
                  label: balanceSummary,
                  container: true,
                  excludeSemantics: true,
                  child: _Balance(label: totalPointsLabel, value: totalPoints, unit: pointsUnit),
                ),
              ),
              Flexible(
                child: Semantics(
                  label: badgeSummary,
                  container: true,
                  excludeSemantics: true,
                  child: _Badge(label: badgeLabel, name: badgeName, caption: nextBadgeCaption),
                ),
              ),
            ],
          ),
          // On top of the column's own gap, which together make the 34 the
          // design leaves between the balance and the bar.
          if (bottom case final bar?)
            Padding(
              padding: const EdgeInsets.only(top: AppSpacing.md),
              child: bar,
            ),
        ],
      ),
    );
  }
}

class _Balance extends StatelessWidget {
  const _Balance({required this.label, required this.value, required this.unit});

  final String label;
  final String value;
  final String unit;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors.text;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: AppTextStyle.caption.copyWith(color: colors.muted)),
        Padding(
          padding: const EdgeInsets.only(top: AppSpacing.xs),
          // Scaling the whole row keeps 'pts' on the numeral's baseline, which
          // making the numeral alone flexible would break.
          child: FittedBox(
            fit: BoxFit.scaleDown,
            alignment: AlignmentDirectional.centerStart,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.baseline,
              textBaseline: TextBaseline.alphabetic,
              spacing: AppSpacing.xs,
              children: [
                // The one gradient-filled text role in the system, so the
                // numeral is masked rather than given a colour.
                ShaderMask(
                  shaderCallback: (bounds) => colors.numeralGradient.createShader(Offset.zero & bounds.size),
                  child: Text(
                    value,
                    style: AppTextStyle.numeralDisplay.copyWith(color: colors.primary),
                  ),
                ),
                Text(unit, style: AppTextStyle.caption.copyWith(color: colors.muted)),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _Badge extends StatelessWidget {
  const _Badge({required this.label, required this.name, required this.caption});

  final String label;
  final String name;
  final String caption;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors.text;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Text(
          label,
          textAlign: TextAlign.end,
          style: AppTextStyle.caption.copyWith(color: colors.muted),
        ),
        Padding(
          padding: const EdgeInsets.only(top: AppSpacing.xxs),
          child: Text(
            name,
            textAlign: TextAlign.end,
            style: Theme.of(context).textTheme.titleSmall?.copyWith(color: colors.link),
          ),
        ),
        Padding(
          padding: const EdgeInsets.only(top: AppSpacing.xxs),
          child: Text(
            caption,
            textAlign: TextAlign.end,
            style: AppTextStyle.caption.copyWith(color: colors.muted),
          ),
        ),
      ],
    );
  }
}
