import 'package:flutter/material.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';

/// Which of the design's two progress fills a bar carries.
enum ProgressTone { bold, soft }

///
/// The design's linear progress bar. It is a bare bar with no label of its own,
/// so the caption beside it does the announcing and this is excluded.
///
class ProgressBar extends StatelessWidget {
  const ProgressBar({
    required this.value,
    super.key,
    this.height = AppControlHeight.progressBar,
    this.tone = ProgressTone.bold,
    this.isRaised = false,
    this.isSquare = false,
  });

  /// Clamped rather than asserted: a share off the end is a data problem, not
  /// a reason to fail a build in release.
  final double value;

  final double height;
  final ProgressTone tone;

  /// Inside a card, where the design lifts the track off the card's own fill.
  final bool isRaised;

  /// The header's full-width bar, the one bar the design leaves unrounded.
  final bool isSquare;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors.progress;
    final radius = isSquare ? BorderRadius.zero : BorderRadius.circular(height / 2);
    return ExcludeSemantics(
      child: ClipRRect(
        borderRadius: radius,
        // Full width, not the fill's width: under the loose constraints a
        // start-aligned column hands down, the bar would shrink to its own
        // fill and the pending stretch of track would never be drawn.
        child: SizedBox(
          width: double.infinity,
          height: height,
          child: ColoredBox(
            color: isRaised ? colors.trackRaised : colors.track,
            child: FractionallySizedBox(
              alignment: AlignmentDirectional.centerStart,
              widthFactor: value.clamp(0, 1),
              child: DecoratedBox(
                decoration: BoxDecoration(
                  gradient: switch (tone) {
                    ProgressTone.bold => colors.fill,
                    ProgressTone.soft => colors.fillSoft,
                  },
                  borderRadius: radius,
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
