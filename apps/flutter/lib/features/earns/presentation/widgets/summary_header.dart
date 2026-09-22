import 'package:flutter/material.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';

///
/// The block under the app bar on every My Earns history screen: what the
/// source has paid on the left, one stat about it on the right.
///
class SummaryHeader extends StatelessWidget {
  const SummaryHeader({
    required this.totalPoints,
    required this.pointsCaption,
    required this.totalSummary,
    required this.statLabel,
    required this.statValue,
    required this.statTone,
    required this.statSummary,
    super.key,
    this.eyebrow,
    this.statCaption,
    this.footer,
  });

  /// Formatted by the caller, which owns the locale's thousands separator.
  final String totalPoints;

  final String pointsCaption;

  ///
  /// The total as one sentence. The figure is split across an eyebrow, a
  /// numeral and its unit, which otherwise read as three stops.
  ///
  final String totalSummary;

  final String statLabel;
  final String statValue;
  final SummaryStatTone statTone;

  /// The stat as one sentence, for the same reason.
  final String statSummary;

  /// Names the source. Weekly Quest leaves the slot empty, as the frame does.
  final String? eyebrow;

  /// Under the stat, where the design shows how it was reached.
  final String? statCaption;

  /// The streak ladder, the one screen that puts a row under the totals.
  final Widget? footer;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    return DecoratedBox(
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        border: Border(bottom: BorderSide(color: colors.divider)),
      ),
      child: Padding(
        padding: EdgeInsets.only(
          left: AppScreenPadding.main,
          right: AppScreenPadding.main,
          top: AppSpacing.md,
          // The frame leaves more under the ladder than under the totals alone.
          bottom: footer == null ? AppSpacing.lg : AppSpacing.xl,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              // Both blocks sit on the same bottom line, whatever their height.
              crossAxisAlignment: CrossAxisAlignment.end,
              // Flexible either side, so the leftover width falls between them
              // rather than being handed to the total.
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Flexible(
                  child: Semantics(
                    label: totalSummary,
                    container: true,
                    excludeSemantics: true,
                    child: _Total(
                      eyebrow: eyebrow,
                      points: totalPoints,
                      caption: pointsCaption,
                    ),
                  ),
                ),
                Flexible(
                  child: Semantics(
                    label: statSummary,
                    container: true,
                    excludeSemantics: true,
                    child: _Stat(
                      label: statLabel,
                      value: statValue,
                      tone: statTone,
                      caption: statCaption,
                    ),
                  ),
                ),
              ],
            ),
            if (footer case final ladder?)
              Padding(
                padding: const EdgeInsets.only(top: AppSpacing.md),
                child: ladder,
              ),
          ],
        ),
      ),
    );
  }
}

/// Which of the two accents the design gives the stat on this screen.
enum SummaryStatTone { warning, success }

class _Total extends StatelessWidget {
  const _Total({required this.eyebrow, required this.points, required this.caption});

  final String? eyebrow;
  final String points;
  final String caption;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors.text;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Not a SectionLabel: it repeats the screen title, so ranking it as a
        // heading would give a screen reader two of them to step through.
        if (eyebrow case final label?) Text(label, style: AppTextStyle.overline.copyWith(color: colors.muted)),
        Padding(
          padding: const EdgeInsets.only(top: AppSpacing.xs),
          // Scaling the whole row keeps the unit on the numeral's baseline,
          // which making the numeral alone flexible would break.
          child: FittedBox(
            fit: BoxFit.scaleDown,
            alignment: AlignmentDirectional.centerStart,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.baseline,
              textBaseline: TextBaseline.alphabetic,
              spacing: AppSpacing.sm,
              children: [
                Text(points, style: AppTextStyle.numeralXl.copyWith(color: colors.numeral)),
                Text(caption, style: AppTextStyle.caption.copyWith(color: colors.muted)),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _Stat extends StatelessWidget {
  const _Stat({required this.label, required this.value, required this.tone, required this.caption});

  final String label;
  final String value;
  final SummaryStatTone tone;
  final String? caption;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors.text;
    final valueColor = switch (tone) {
      SummaryStatTone.warning => colors.warning,
      SummaryStatTone.success => colors.success,
    };
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
            value,
            textAlign: TextAlign.end,
            style: AppTextStyle.numeralMd.copyWith(color: valueColor),
          ),
        ),
        if (caption case final sub?)
          Padding(
            padding: const EdgeInsets.only(top: AppSpacing.xxs),
            child: Text(
              sub,
              textAlign: TextAlign.end,
              style: AppTextStyle.caption.copyWith(color: colors.muted),
            ),
          ),
      ],
    );
  }
}
