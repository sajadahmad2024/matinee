import 'package:flutter/material.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';

///
/// The Rewards header: the balance on the left, the badge standing and the
/// distance to the next one on the right.
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

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      // The block's fade starts at the very top of the screen, so the header
      // takes the status bar inset itself instead of sitting in a SafeArea.
      decoration: BoxDecoration(gradient: context.appColors.overlay.header),
      child: SafeArea(
        bottom: false,
        child: Padding(
          // The design pads the block 50 from the frame top, leaving the
          // balance 35 below the status bar. The gap below is the screen's.
          padding: const EdgeInsets.only(
            left: AppScreenPadding.main,
            right: AppScreenPadding.main,
            top: AppSpacing.xxxl,
            bottom: AppSpacing.lg,
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Expanded(
                child: Semantics(
                  label: balanceSummary,
                  container: true,
                  excludeSemantics: true,
                  child: _Balance(label: totalPointsLabel, value: totalPoints, unit: pointsUnit),
                ),
              ),
              Semantics(
                label: badgeSummary,
                container: true,
                excludeSemantics: true,
                child: _Badge(label: badgeLabel, name: badgeName, caption: nextBadgeCaption),
              ),
            ],
          ),
        ),
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
