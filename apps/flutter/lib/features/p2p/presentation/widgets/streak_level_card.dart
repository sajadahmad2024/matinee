import 'package:flutter/material.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/core/widgets/glyph_box.dart';
import 'package:matinee/features/p2p/presentation/widgets/week_steps.dart';

/// The disc the design puts the level number in.
const double _levelDiscSize = 36;

///
/// The streak's current level: what it asks for daily, how much of the week is
/// cleared, and what the next level needs.
///
class StreakLevelCard extends StatelessWidget {
  const StreakLevelCard({
    required this.eyebrow,
    required this.level,
    required this.levelName,
    required this.requirement,
    required this.weekLabel,
    required this.weekFraction,
    required this.weekCaption,
    required this.daysDone,
    required this.daysTotal,
    required this.footnote,
    required this.summary,
    super.key,
  });

  final String eyebrow;
  final String level;
  final String levelName;
  final String requirement;
  final String weekLabel;
  final String weekFraction;
  final String weekCaption;
  final int daysDone;
  final int daysTotal;
  final String footnote;

  /// The card as one sentence; its disc, dots and fractions say none of it.
  final String summary;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    return Semantics(
      label: summary,
      container: true,
      excludeSemantics: true,
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: colors.card.backgroundGoldTint,
          border: Border.all(color: colors.tag.goldBorder),
          borderRadius: const BorderRadius.all(Radius.circular(AppRadius.lg)),
        ),
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                spacing: AppSpacing.md,
                children: [
                  Expanded(
                    child: _Level(
                      eyebrow: eyebrow,
                      level: level,
                      levelName: levelName,
                      requirement: requirement,
                    ),
                  ),
                  _Week(label: weekLabel, fraction: weekFraction, caption: weekCaption),
                ],
              ),
              Padding(
                padding: const EdgeInsets.only(top: AppSpacing.lg),
                child: WeekSteps(done: daysDone, total: daysTotal),
              ),
              Padding(
                padding: const EdgeInsets.only(top: AppSpacing.md),
                child: Text(
                  footnote,
                  style: AppTextStyle.caption.copyWith(color: colors.text.muted),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Level extends StatelessWidget {
  const _Level({
    required this.eyebrow,
    required this.level,
    required this.levelName,
    required this.requirement,
  });

  final String eyebrow;
  final String level;
  final String levelName;
  final String requirement;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(eyebrow, style: AppTextStyle.overline.copyWith(color: colors.text.muted)),
        Padding(
          padding: const EdgeInsets.only(top: AppSpacing.xs),
          child: Row(
            spacing: AppSpacing.md,
            children: [
              GlyphBox(
                glyph: level,
                size: _levelDiscSize,
                textStyle: AppTextStyle.titleMedium,
                color: colors.text.warning,
              ),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      levelName,
                      style: AppTextStyle.titleMedium.copyWith(color: colors.text.primary),
                    ),
                    Text(
                      requirement,
                      style: AppTextStyle.caption.copyWith(color: colors.text.link),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _Week extends StatelessWidget {
  const _Week({required this.label, required this.fraction, required this.caption});

  final String label;
  final String fraction;
  final String caption;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors.text;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Text(label, style: AppTextStyle.caption.copyWith(color: colors.muted)),
        Text(
          fraction,
          style: AppTextStyle.headlineSmall.copyWith(color: colors.warning),
        ),
        Text(caption, style: AppTextStyle.caption.copyWith(color: colors.muted)),
      ],
    );
  }
}
