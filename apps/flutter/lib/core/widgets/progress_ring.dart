import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';

/// The design's ring, and the arc inside it, which the frame draws 46 across.
const double _ringSize = 58;
const double _arcSize = 46;
const double _strokeWidth = 5;

///
/// The design's circular progress indicator: a gold arc over a track, with the
/// share written in its middle.
///
/// The label is excluded, because a ring beside a headline that already reads
/// '2 of 4 actions done' would otherwise announce the same thing twice; the
/// caller labels the card.
///
class ProgressRing extends StatelessWidget {
  const ProgressRing({required this.value, required this.label, super.key});

  /// Clamped rather than asserted: a share off the end is a data problem, not
  /// a reason to fail a build in release.
  final double value;

  final String label;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    return ExcludeSemantics(
      child: SizedBox.square(
        dimension: _ringSize,
        child: CustomPaint(
          painter: _RingPainter(
            value: value.clamp(0, 1),
            track: colors.progress.track,
            fill: colors.icon.accent,
          ),
          child: Center(
            child: Text(
              label,
              style: AppTextStyle.labelMedium.copyWith(color: colors.text.numeral),
            ),
          ),
        ),
      ),
    );
  }
}

class _RingPainter extends CustomPainter {
  const _RingPainter({required this.value, required this.track, required this.fill});

  final double value;
  final Color track;
  final Color fill;

  @override
  void paint(Canvas canvas, Size size) {
    // The arc is inset inside its frame, so the ring is measured off the arc
    // rather than the box the design draws it in.
    final bounds = Rect.fromCircle(
      center: size.center(Offset.zero),
      radius: (_arcSize - _strokeWidth) / 2,
    );
    final paint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = _strokeWidth
      ..strokeCap = StrokeCap.round
      ..color = track;
    canvas.drawCircle(bounds.center, bounds.width / 2, paint);
    if (value <= 0) {
      return;
    }
    canvas.drawArc(bounds, -math.pi / 2, value * 2 * math.pi, false, paint..color = fill);
  }

  @override
  bool shouldRepaint(_RingPainter oldDelegate) =>
      oldDelegate.value != value || oldDelegate.track != track || oldDelegate.fill != fill;
}
