import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/core/widgets/check_disc.dart';

/// The disc on each rung, which the design draws 32 across.
const double _discSize = AppIconSize.xl;

/// Where a rung stands relative to the streak's current level.
enum LevelStandard { done, current, locked }

/// One rung of the ladder, ready to draw.
@immutable
class LevelStep {
  const LevelStep({
    required this.level,
    required this.label,
    required this.standing,
    required this.semanticLabel,
  });

  final String level;
  final String label;
  final LevelStandard standing;

  /// The rung as one sentence, because its disc says nothing on its own.
  final String semanticLabel;
}

///
/// The streak ladder: the rungs, what each asks for daily, and the connectors
/// that fill in behind the level reached.
///
class LevelTrack extends StatelessWidget {
  const LevelTrack({required this.label, required this.steps, super.key});

  final String label;
  final List<LevelStep> steps;

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
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(label, style: AppTextStyle.overline.copyWith(color: colors.text.muted)),
            Padding(
              padding: const EdgeInsets.only(top: AppSpacing.lg),
              child: Semantics(
                role: SemanticsRole.list,
                explicitChildNodes: true,
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    for (var index = 0; index < steps.length; index++) ...[
                      if (index > 0) _Connector(isDone: steps[index].standing != LevelStandard.locked),
                      Expanded(child: _Step(step: steps[index])),
                    ],
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Step extends StatelessWidget {
  const _Step({required this.step});

  final LevelStep step;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    final labelColor = switch (step.standing) {
      LevelStandard.done => colors.text.muted,
      LevelStandard.current => colors.text.link,
      // The muted tone, not the disabled one: a locked rung is content, and
      // the disabled colour reads under 4.5:1 on every surface here.
      LevelStandard.locked => colors.text.muted,
    };
    return Semantics(
      role: SemanticsRole.listItem,
      label: step.semanticLabel,
      container: true,
      excludeSemantics: true,
      child: Column(
        spacing: AppSpacing.sm,
        children: [
          if (step.standing == LevelStandard.done) const CheckDisc.level() else _Disc(step: step),
          Text(
            step.label,
            textAlign: TextAlign.center,
            style: AppTextStyle.caption.copyWith(color: labelColor),
          ),
        ],
      ),
    );
  }
}

class _Disc extends StatelessWidget {
  const _Disc({required this.step});

  final LevelStep step;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    final isCurrent = step.standing == LevelStandard.current;
    return Container(
      width: _discSize,
      height: _discSize,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: isCurrent ? colors.tag.goldBackground : colors.card.backgroundRaised,
        border: Border.all(
          color: isCurrent ? colors.tag.goldBorder : colors.card.border,
          // The design puts a heavier ring on the rung the streak is on.
          width: isCurrent ? AppBorderWidth.emphasis : AppBorderWidth.hairline,
        ),
        shape: BoxShape.circle,
      ),
      child: Text(
        step.level,
        style: AppTextStyle.labelMedium.copyWith(
          color: isCurrent ? colors.text.warning : colors.text.muted,
        ),
      ),
    );
  }
}

class _Connector extends StatelessWidget {
  const _Connector({required this.isDone});

  final bool isDone;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    return Padding(
      // Level with the discs the connector runs between, not the labels below.
      padding: const EdgeInsets.only(top: _discSize / 2),
      child: SizedBox(
        width: AppSpacing.sm,
        height: AppBorderWidth.emphasis,
        child: ColoredBox(color: isDone ? colors.icon.accent : colors.card.border),
      ),
    );
  }
}
