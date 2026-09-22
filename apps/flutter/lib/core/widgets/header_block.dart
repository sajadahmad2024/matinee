import 'package:flutter/material.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';

///
/// The faded block the design puts at the top of P2P, Rewards, Badges and My
/// Earns, closed by a hairline.
///
class HeaderBlock extends StatelessWidget {
  const HeaderBlock({
    required this.child,
    super.key,
    this.topPadding = AppSpacing.sm,
    this.bottomPadding = AppSpacing.lg,
  });

  ///
  /// The gap above [child], measured below the status bar. The design draws it
  /// from the frame edge, so the 44 the inset already covers comes off first.
  ///
  final double topPadding;

  ///
  /// The gap below [child]. Zero for a block ending in a full-width bar, which
  /// the design draws sitting on the closing hairline.
  ///
  final double bottomPadding;

  final Widget child;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    return DecoratedBox(
      decoration: BoxDecoration(
        gradient: colors.overlay.header,
        border: Border(bottom: BorderSide(color: colors.divider)),
      ),
      // The fade starts at the very top of the screen, so the block takes the
      // status bar inset itself instead of sitting in the screen's SafeArea.
      child: SafeArea(
        bottom: false,
        child: Padding(
          padding: EdgeInsets.only(
            left: AppScreenPadding.main,
            right: AppScreenPadding.main,
            top: topPadding,
            bottom: bottomPadding,
          ),
          child: child,
        ),
      ),
    );
  }
}
