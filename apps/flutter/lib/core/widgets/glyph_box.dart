import 'package:flutter/material.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';

///
/// The gold square the design sets a mark in: a trophy on a receipt, a medal
/// beside a badge, a level number on the streak card.
///
class GlyphBox extends StatelessWidget {
  const GlyphBox({
    required this.glyph,
    required this.size,
    super.key,
    this.textStyle = AppTextStyle.titleLarge,
    this.color,
  });

  /// An emoji where the icon font has no mark yet, or a plain numeral.
  final String glyph;

  final double size;
  final TextStyle textStyle;

  /// Null takes the glyph's own colour from the emoji it draws.
  final Color? color;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors.tag;
    return Container(
      width: size,
      height: size,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: colors.goldBackground,
        border: Border.all(color: colors.goldBorder),
        borderRadius: const BorderRadius.all(Radius.circular(AppRadius.md)),
      ),
      child: Text(glyph, style: color == null ? textStyle : textStyle.copyWith(color: color)),
    );
  }
}
