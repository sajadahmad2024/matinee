import 'package:flutter/material.dart';
import 'package:matinee/core/assets/assets.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/core/widgets/svg_icon.dart';

///
/// The tick the design puts beside anything finished. Three sizes, each with
/// its own fill, and no label: the row it sits in carries the meaning.
///
class CheckDisc extends StatelessWidget {
  /// Beside a title that is done — a filled green square with a white tick.
  const CheckDisc.inline({super.key}) : _variant = _Variant.inline;

  /// In a list of finished actions — a green ring over a green wash.
  const CheckDisc.outlined({super.key}) : _variant = _Variant.outlined;

  /// On a cleared rung of the streak ladder — a filled gold disc.
  const CheckDisc.level({super.key}) : _variant = _Variant.level;

  final _Variant _variant;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    final (size, glyph, radius) = switch (_variant) {
      _Variant.inline => (AppIconSize.sm, AppIconSize.xs, AppRadius.sm),
      _Variant.outlined => (_outlinedSize, AppIconSize.xs, AppRadius.full),
      _Variant.level => (AppIconSize.xl, AppIconSize.sm, AppRadius.full),
    };
    final (background, border, foreground) = switch (_variant) {
      _Variant.inline => (colors.status.success, null, colors.text.inverse),
      _Variant.outlined => (
        colors.badge.successBackground,
        colors.status.success,
        colors.status.success,
      ),
      _Variant.level => (colors.icon.accent, null, colors.text.inverse),
    };
    return Container(
      width: size,
      height: size,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: background,
        border: border == null ? null : Border.all(color: border),
        borderRadius: BorderRadius.all(Radius.circular(radius)),
      ),
      child: SvgIcon(AppIconAssets.check, size: glyph, color: foreground),
    );
  }
}

/// The one size on the disc scale the icon scale has no entry for.
const double _outlinedSize = 22;

enum _Variant { inline, outlined, level }
