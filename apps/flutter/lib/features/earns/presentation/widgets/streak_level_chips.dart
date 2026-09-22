import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/features/earns/data/models/streak_day.dart';

/// The dot the design sets before each rung's label.
const double _dotSize = 6;

///
/// The watch-time ladder under the streak totals, one chip per rung, the ones
/// the log has reached lit.
///
class StreakLevelChips extends StatelessWidget {
  const StreakLevelChips({required this.levels, required this.labelBuilder, super.key});

  final List<StreakLevel> levels;

  /// Composes each chip's text and what a screen reader hears in its place.
  final StreakLevelLabel Function(StreakLevel level) labelBuilder;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      // A list, so the rungs are read as a set with positions rather than as
      // three loose scraps of text.
      role: SemanticsRole.list,
      container: true,
      explicitChildNodes: true,
      // A Wrap, not a Row: the three chips fill the width at the design's text
      // size, so a scaled-up label has to be able to drop to a second line.
      child: Wrap(
        spacing: AppSpacing.chipGap,
        runSpacing: AppSpacing.sm,
        children: [
          for (final level in levels) _Chip(level: level, label: labelBuilder(level)),
        ],
      ),
    );
  }
}

/// What one rung shows and what it says.
class StreakLevelLabel {
  const StreakLevelLabel({required this.text, required this.semanticLabel});

  final String text;

  /// The design carries 'reached' in the dot's colour alone.
  final String semanticLabel;
}

class _Chip extends StatelessWidget {
  const _Chip({required this.level, required this.label});

  final StreakLevel level;
  final StreakLevelLabel label;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    // Level 1 takes its own dimmer gold and every rung above it the streak
    // yellow; the design draws no third tint.
    final dotColor = switch ((level.isReached, level.level)) {
      (false, _) => colors.icon.muted,
      (true, 1) => colors.badge.level1Label,
      (true, _) => colors.text.warning,
    };
    return Semantics(
      role: SemanticsRole.listItem,
      label: label.semanticLabel,
      container: true,
      excludeSemantics: true,
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: colors.card.background,
          border: Border.all(color: colors.card.border),
          borderRadius: const BorderRadius.all(Radius.circular(AppRadius.pill)),
        ),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.xs),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            spacing: AppSpacing.xs,
            children: [
              Container(
                width: _dotSize,
                height: _dotSize,
                decoration: BoxDecoration(color: dotColor, shape: BoxShape.circle),
              ),
              Text(
                label.text,
                style: AppTextStyle.labelSmall.copyWith(
                  // The unreached rung steps back to the caption grey, where
                  // the design's own tone is too faint to read.
                  color: level.isReached ? colors.text.primary : colors.text.muted,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
