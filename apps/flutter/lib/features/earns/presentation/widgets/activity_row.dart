import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:matinee/core/assets/assets.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/core/widgets/svg_icon.dart';
import 'package:matinee/features/earns/data/models/streak_day.dart';

/// The square the design puts the flame and the day count in.
const double _tileSize = 42;

///
/// One day of the streak log: the day it was, what was watched, what it paid,
/// and the badge it reached.
///
class ActivityRow extends StatelessWidget {
  const ActivityRow({
    required this.day,
    required this.date,
    required this.dayCountLabel,
    required this.minutesLabel,
    required this.points,
    required this.isAwarded,
    required this.pointsUnit,
    required this.semanticLabel,
    super.key,
    this.levelLabel,
    this.badgeLabel,
  });

  final StreakDay day;

  final String date;
  final String dayCountLabel;
  final String minutesLabel;

  /// Signed by the caller, as the design writes every award.
  final String points;

  /// A day that paid nothing steps its figure back to the caption grey.
  final bool isAwarded;

  final String pointsUnit;

  /// Null on a day that reached no level, which the design gives no pill.
  final String? levelLabel;

  ///
  /// The row as one sentence. Five texts and a tile otherwise read as six
  /// stops, and the tile only repeats the day count.
  ///
  final String semanticLabel;

  /// The line the design adds where the day reached a badge.
  final String? badgeLabel;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    final text = Theme.of(context).textTheme;
    final isBadgeDay = badgeLabel != null;
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
          // The design rings the days that reached a badge.
          border: Border.all(
            color: isBadgeDay ? colors.card.borderHighlight : colors.card.border,
          ),
          borderRadius: const BorderRadius.all(Radius.circular(AppRadius.lg)),
        ),
        child: Padding(
          padding: AppSpacing.cardPadding,
          child: Row(
            spacing: AppSpacing.md,
            children: [
              _Tile(level: day.level, dayCountLabel: dayCountLabel),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // A Wrap, so a scaled-up date drops the pill to its own
                    // line instead of squeezing it off the row.
                    Wrap(
                      crossAxisAlignment: WrapCrossAlignment.center,
                      spacing: AppSpacing.sm,
                      runSpacing: AppSpacing.xs,
                      children: [
                        Text(date, style: text.titleSmall?.copyWith(color: colors.text.primary)),
                        if (levelLabel case final label?) _LevelBadge(level: day.level, label: label),
                      ],
                    ),
                    Padding(
                      padding: const EdgeInsets.only(top: AppSpacing.xxs),
                      child: Text(
                        minutesLabel,
                        style: AppTextStyle.caption.copyWith(color: colors.text.muted),
                      ),
                    ),
                    if (badgeLabel case final badge?)
                      Padding(
                        padding: const EdgeInsets.only(top: AppSpacing.xs),
                        child: Row(
                          spacing: AppSpacing.xs,
                          children: [
                            SvgIcon(
                              AppIconAssets.star,
                              size: AppIconSize.xs,
                              color: colors.icon.accent,
                            ),
                            Expanded(
                              child: Text(
                                badge,
                                style: AppTextStyle.labelSmall.copyWith(color: colors.text.link),
                              ),
                            ),
                          ],
                        ),
                      ),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    points,
                    style: AppTextStyle.numeralSm.copyWith(
                      color: isAwarded ? colors.text.numeral : colors.text.muted,
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.only(top: AppSpacing.xxs),
                    child: Text(
                      pointsUnit,
                      style: AppTextStyle.caption.copyWith(color: colors.text.muted),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Tile extends StatelessWidget {
  const _Tile({required this.level, required this.dayCountLabel});

  final int? level;
  final String dayCountLabel;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    final tints = _levelTints(context, level);
    return DecoratedBox(
      decoration: BoxDecoration(
        color: tints.background,
        border: Border.all(color: tints.border),
        borderRadius: const BorderRadius.all(Radius.circular(AppRadius.md)),
      ),
      // A minimum, not a fixed square: the design's 42 holds the glyph and the
      // day count, and at a large text scale the count has to push it wider.
      child: ConstrainedBox(
        constraints: const BoxConstraints(minWidth: _tileSize, minHeight: _tileSize),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xs),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            mainAxisSize: MainAxisSize.min,
            children: [
              SvgIcon(AppIconAssets.fire, size: AppIconSize.sm, color: colors.icon.accent),
              Text(
                dayCountLabel,
                style: AppTextStyle.labelSmall.copyWith(color: tints.label),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// The pill naming the level the day's watch time reached.
class _LevelBadge extends StatelessWidget {
  const _LevelBadge({required this.level, required this.label});

  final int? level;
  final String label;

  @override
  Widget build(BuildContext context) {
    final tints = _levelTints(context, level);
    return DecoratedBox(
      decoration: BoxDecoration(
        color: tints.background,
        border: Border.all(color: tints.border),
        borderRadius: const BorderRadius.all(Radius.circular(AppRadius.pill)),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm, vertical: AppSpacing.xxs),
        child: Text(label, style: AppTextStyle.labelSmall.copyWith(color: tints.label)),
      ),
    );
  }
}

///
/// Level 1 takes its own dimmer gold and every level above it the streak
/// yellow; the design draws no third tint.
///
/// A day that cleared no rung takes neither: it has no level, so painting it
/// in the level-1 gold would claim one the day did not reach.
///
({Color background, Color border, Color label}) _levelTints(BuildContext context, int? level) {
  final colors = context.appColors;
  if (level == null) {
    return (
      background: colors.card.backgroundRaised,
      border: colors.card.border,
      label: colors.text.muted,
    );
  }
  if (level <= 1) {
    return (
      background: colors.badge.level1Background,
      border: colors.badge.level1Border,
      label: colors.badge.level1Label,
    );
  }
  return (
    background: colors.badge.level2Background,
    border: colors.badge.level2Border,
    label: colors.badge.level2Label,
  );
}
