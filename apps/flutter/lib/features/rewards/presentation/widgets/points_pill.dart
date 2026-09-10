import 'package:flutter/material.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';

///
/// The navy points pill from the app-bar family: a flame glyph, the balance
/// and its unit. Given [onTap] and no [value] it becomes the top-up control
/// the auction draws beside the balance, which is the same pill with a plus.
///
class PointsPill extends StatelessWidget {
  ///
  /// The balance, as the app bar shows it.
  ///
  const PointsPill({required this.tooltip, required this.value, required this.unit, super.key})
    : onTap = null,
      showsAdd = false;

  ///
  /// The same pill with a plus and no figure: the control that opens top-up.
  ///
  const PointsPill.topUp({required this.tooltip, required this.onTap, super.key})
    : value = null,
      unit = null,
      showsAdd = true;

  /// Formatted by the caller, which owns the locale's thousands separator.
  final String? value;

  final String? unit;
  final String tooltip;
  final VoidCallback? onTap;

  /// Draws the leading plus that marks the pill as the top-up control.
  final bool showsAdd;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors.pill;
    // The stroke is a gradient, which BoxBorder cannot paint. It is stroked
    // over the fill rather than laid under it: the fill is translucent, so a
    // gradient-filled stadium behind it tinted the whole pill gold instead of
    // just its edge.
    final pill = CustomPaint(
      foregroundPainter: _GradientRing(colors.pointsBorder),
      child: Container(
        height: AppControlHeight.pill,
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
        decoration: ShapeDecoration(color: colors.pointsBackground, shape: const StadiumBorder()),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          spacing: AppSpacing.sm,
          children: [
            if (showsAdd) Icon(Icons.add, size: AppIconSize.sm, color: colors.pointsValue),
            Icon(Icons.local_fire_department, size: AppIconSize.xs, color: colors.pointsIcon),
            if (value != null) Text(value!, style: AppTextStyle.numeralPill.copyWith(color: colors.pointsValue)),
            if (unit != null) Text(unit!, style: AppTextStyle.labelSmall.copyWith(color: colors.pointsIcon)),
          ],
        ),
      ),
    );
    if (onTap == null) {
      return Semantics(label: tooltip, child: pill);
    }
    // The design draws the pill 28 tall, which is too small to hit. The disc
    // keeps that height and the target grows around it, the way a button's own
    // tap target does.
    return Tooltip(
      message: tooltip,
      child: InkWell(
        onTap: onTap,
        customBorder: const StadiumBorder(),
        child: SizedBox(
          height: kMinInteractiveDimension,
          // widthFactor, so the target is only as wide as the pill; without a
          // bounded height Center would take the whole column it sits in.
          child: Center(widthFactor: 1, child: pill),
        ),
      ),
    );
  }
}

///
/// Strokes the pill's stadium edge with a gradient, which no BoxBorder can do.
///
class _GradientRing extends CustomPainter {
  const _GradientRing(this.gradient);

  final LinearGradient gradient;

  @override
  void paint(Canvas canvas, Size size) {
    final bounds = Offset.zero & size;
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        bounds.deflate(AppBorderWidth.hairline / 2),
        Radius.circular(size.height),
      ),
      Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = AppBorderWidth.hairline
        ..shader = gradient.createShader(bounds),
    );
  }

  @override
  bool shouldRepaint(_GradientRing oldDelegate) => oldDelegate.gradient != gradient;
}
