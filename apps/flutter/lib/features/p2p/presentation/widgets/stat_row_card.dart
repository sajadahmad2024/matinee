import 'package:flutter/material.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/core/widgets/progress_bar.dart';

/// The vertical hairlines between the three columns, which the design draws 62 tall.
const double _dividerHeight = 62;

/// The emoji the design uses for the badge, until the icon font carries it.
const String _badgeGlyph = '🎖️';

///
/// The P2P header: rank, streak and points across the top of a card, with the
/// badge the balance has earned and the distance to the next one under it.
///
class StatRowCard extends StatelessWidget {
  const StatRowCard({
    required this.rank,
    required this.rankLabel,
    required this.rankCaption,
    required this.rankSummary,
    required this.streak,
    required this.streakLabel,
    required this.streakCaption,
    required this.streakSummary,
    required this.points,
    required this.pointsLabel,
    required this.pointsUnit,
    required this.pointsSummary,
    required this.badgeName,
    required this.badgeProgressLabel,
    required this.badgeProgress,
    required this.badgeCaption,
    required this.badgeSummary,
    super.key,
  });

  final String rank;
  final String rankLabel;
  final String rankCaption;
  final String rankSummary;
  final String streak;
  final String streakLabel;
  final String streakCaption;
  final String streakSummary;
  final String points;
  final String pointsLabel;
  final String pointsUnit;
  final String pointsSummary;
  final String badgeName;
  final String badgeProgressLabel;
  final double badgeProgress;
  final String badgeCaption;
  final String badgeSummary;

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
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.md,
          vertical: AppSpacing.cardPaddingVertical,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // IntrinsicHeight, or stretching the children asks a Row inside a
            // Column to fill a height that has no bound.
            IntrinsicHeight(
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Expanded(
                    child: _Column(
                      label: rankLabel,
                      summary: rankSummary,
                      value: Text(
                        rank,
                        style: AppTextStyle.numeralMd.copyWith(color: colors.text.numeral),
                      ),
                      // Wrapped, so a scaled-up caption drops its words rather than
                      // pushing the column past its third of the card.
                      caption: Wrap(
                        crossAxisAlignment: WrapCrossAlignment.center,
                        spacing: AppSpacing.xxs,
                        children: [
                          Icon(
                            Icons.arrow_upward,
                            size: AppIconSize.xs,
                            color: colors.text.success,
                          ),
                          Text(
                            rankCaption,
                            style: AppTextStyle.caption.copyWith(color: colors.text.success),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const _ColumnDivider(),
                  Expanded(
                    child: _Column(
                      label: streakLabel,
                      summary: streakSummary,
                      // Wrapped for the same reason: the flame, the figure and
                      // its unit are three pieces on a third of the width.
                      value: Wrap(
                        crossAxisAlignment: WrapCrossAlignment.center,
                        spacing: AppSpacing.xs,
                        children: [
                          Icon(
                            Icons.local_fire_department,
                            size: AppIconSize.sm,
                            color: colors.icon.accent,
                          ),
                          Text(
                            streak,
                            style: AppTextStyle.numeralPill.copyWith(color: colors.text.primary),
                          ),
                          Text(
                            pointsUnit,
                            style: AppTextStyle.labelSmall.copyWith(color: colors.text.primary),
                          ),
                        ],
                      ),
                      caption: Text(
                        streakCaption,
                        style: AppTextStyle.caption.copyWith(color: colors.text.muted),
                      ),
                    ),
                  ),
                  const _ColumnDivider(),
                  Expanded(
                    child: _Column(
                      label: pointsLabel,
                      summary: pointsSummary,
                      value: Text(
                        points,
                        style: AppTextStyle.numeralMd.copyWith(color: colors.text.numeral),
                      ),
                      caption: Text(
                        pointsUnit,
                        style: AppTextStyle.caption.copyWith(color: colors.text.muted),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(vertical: AppSpacing.cardPaddingVertical),
              child: Divider(height: 0, color: colors.divider),
            ),
            Semantics(
              label: badgeSummary,
              container: true,
              excludeSemantics: true,
              child: _BadgeRow(
                name: badgeName,
                progressLabel: badgeProgressLabel,
                progress: badgeProgress,
                caption: badgeCaption,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Column extends StatelessWidget {
  const _Column({
    required this.label,
    required this.summary,
    required this.value,
    required this.caption,
  });

  final String label;
  final String summary;
  final Widget value;
  final Widget caption;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors.text;
    return Semantics(
      label: summary,
      container: true,
      excludeSemantics: true,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: AppTextStyle.overline.copyWith(color: colors.muted)),
          Padding(
            padding: const EdgeInsets.only(top: AppSpacing.xs),
            child: value,
          ),
          Padding(
            padding: const EdgeInsets.only(top: AppSpacing.xs),
            child: caption,
          ),
        ],
      ),
    );
  }
}

class _ColumnDivider extends StatelessWidget {
  const _ColumnDivider();

  @override
  Widget build(BuildContext context) {
    // A minimum, not a fixed height: the row stretches its children, so a
    // scaled-up column has to carry the hairline with it.
    return ConstrainedBox(
      constraints: const BoxConstraints(minHeight: _dividerHeight),
      child: VerticalDivider(
        width: AppSpacing.md,
        color: context.appColors.divider,
      ),
    );
  }
}

class _BadgeRow extends StatelessWidget {
  const _BadgeRow({
    required this.name,
    required this.progressLabel,
    required this.progress,
    required this.caption,
  });

  final String name;
  final String progressLabel;
  final double progress;
  final String caption;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors.text;
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      spacing: AppSpacing.md,
      children: [
        const Text(_badgeGlyph, style: AppTextStyle.titleLarge),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Wrapped rather than a Row: the name and the fraction both size
              // to their text, and at a large scale the fraction drops below.
              Wrap(
                alignment: WrapAlignment.spaceBetween,
                crossAxisAlignment: WrapCrossAlignment.center,
                spacing: AppSpacing.sm,
                runSpacing: AppSpacing.xs,
                children: [
                  Text(
                    name,
                    style: AppTextStyle.labelMedium.copyWith(color: colors.primary),
                  ),
                  Text(
                    progressLabel,
                    style: AppTextStyle.numeralAction.copyWith(color: colors.onImageSubtitle),
                  ),
                ],
              ),
              Padding(
                padding: const EdgeInsets.only(top: AppSpacing.sm),
                child: ProgressBar(value: progress, height: AppControlHeight.progressBarHero),
              ),
              Padding(
                padding: const EdgeInsets.only(top: AppSpacing.xs),
                child: Text(
                  caption,
                  style: AppTextStyle.caption.copyWith(color: colors.muted),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
