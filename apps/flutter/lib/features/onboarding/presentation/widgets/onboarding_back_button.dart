import 'package:flutter/material.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';

///
/// The bordered disc the design uses for back on every warm-palette screen.
/// The disc itself is 36, so the button keeps a 48 tap target around it.
///
class OnboardingBackButton extends StatelessWidget {
  const OnboardingBackButton({required this.tooltip, required this.onPressed, super.key});

  static const double _discSize = 36;

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
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(AppRadius.md)),
        ),
      ),
      icon: const Icon(Icons.chevron_left),
    );
  }
}
