import 'package:flutter/material.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';

/// The disc itself is 36; a button keeps a 48 tap target around it.
const double _discSize = 36;

/// The tap target a button keeps around the disc, which is what the leading
/// slot has to hold rather than the disc itself.
const double _tapTarget = kMinInteractiveDimension;

/// How far the tap target reaches past the disc on each side.
const double _tapInset = (_tapTarget - _discSize) / 2;

const RoundedRectangleBorder _discShape = RoundedRectangleBorder(
  borderRadius: BorderRadius.all(Radius.circular(AppRadius.md)),
);

///
/// The bordered disc the design uses for back on every screen, warm palette or
/// navy.
///
class BackDiscButton extends StatelessWidget {
  const BackDiscButton({required this.tooltip, required this.onPressed, super.key});

  ///
  /// What an app bar's leading slot needs beyond the screen's side padding.
  /// It is the tap target, not the disc: the disc paints centred inside it.
  ///
  static const double leadingWidth = _tapTarget;

  ///
  /// How far the tap target overhangs the disc. An app bar wanting the disc on
  /// the screen margin starts its leading padding this much earlier.
  ///
  static const double tapInset = _tapInset;

  final String tooltip;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors.appBar;
    return IconButton(
      onPressed: onPressed,
      tooltip: tooltip,
      iconSize: AppIconSize.md,
      padding: EdgeInsets.zero,
      constraints: const BoxConstraints.tightFor(width: _discSize, height: _discSize),
      style: IconButton.styleFrom(
        backgroundColor: colors.backButtonBackground,
        foregroundColor: colors.backButtonIcon,
        side: BorderSide(color: colors.backButtonBorder),
        shape: _discShape,
      ),
      icon: const Icon(Icons.chevron_left),
    );
  }
}

///
/// The same disc turned round and stripped of its tap target, for the card
/// rows that read as one control and carry the tap themselves.
///
class ForwardDisc extends StatelessWidget {
  const ForwardDisc({super.key});

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors.appBar;
    return Container(
      width: _discSize,
      height: _discSize,
      alignment: Alignment.center,
      decoration: ShapeDecoration(
        color: colors.backButtonBackground,
        shape: _discShape.copyWith(side: BorderSide(color: colors.backButtonBorder)),
      ),
      child: Icon(
        Icons.chevron_right,
        size: AppIconSize.md,
        color: colors.backButtonIcon,
      ),
    );
  }
}
