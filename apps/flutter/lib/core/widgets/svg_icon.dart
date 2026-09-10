import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

///
/// A glyph exported from the design file, tinted at the call site. Stands in
/// for [Icon] until the icon font exists, so swapping to it later is a change
/// here rather than at every use.
///
/// Excluded from semantics: a glyph beside a label says nothing a screen
/// reader needs, and the rows it sits in carry their own label.
///
class SvgIcon extends StatelessWidget {
  const SvgIcon(this.asset, {required this.color, required this.size, super.key});

  /// A path from `AppIconAssets`.
  final String asset;

  final Color color;
  final double size;

  @override
  Widget build(BuildContext context) {
    return SvgPicture.asset(
      asset,
      width: size,
      height: size,
      excludeFromSemantics: true,
      // srcIn, so a stroked glyph and a filled one both take the tint.
      colorFilter: ColorFilter.mode(color, BlendMode.srcIn),
    );
  }
}
