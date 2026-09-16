import 'package:flutter/material.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/widgets/back_disc_button.dart';
import 'package:matinee/core/widgets/screen_title.dart';

///
/// The design's back header: the bordered disc on the screen margin, then the
/// screen's title. Every pushed screen wears it.
///
class BackAppBar extends StatelessWidget implements PreferredSizeWidget {
  const BackAppBar({super.key, this.title, this.foregroundColor, this.actions});

  ///
  /// Read in place of the title text, which some screens set in a case a
  /// screen reader would spell out.
  ///
  /// Null on a screen whose heading is drawn into its own hero, where the
  /// frame leaves the bar carrying nothing but the back button.
  ///
  final String? title;

  /// Set only over a still, where the header has no bar of its own to sit on.
  final Color? foregroundColor;

  ///
  /// What the frame sets opposite the back button — a state badge, a control.
  /// Padded to the screen margin, which an `AppBar` does not do itself.
  ///
  final List<Widget>? actions;

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);

  @override
  Widget build(BuildContext context) {
    return AppBar(
      backgroundColor: foregroundColor == null ? null : Colors.transparent,
      foregroundColor: foregroundColor,
      leading: Padding(
        // The screen margin exactly: the button pulls its own overhang back,
        // so the disc lands on the margin the frame draws it against.
        padding: const EdgeInsets.only(left: AppScreenPadding.main),
        // Left, not centred: the slot is wider than the target, and the frame
        // sets the disc against the margin rather than in the middle.
        child: Align(
          alignment: Alignment.centerLeft,
          child: BackDiscButton(
            tooltip: MaterialLocalizations.of(context).backButtonTooltip,
            onPressed: () => Navigator.of(context).pop(),
          ),
        ),
      ),
      leadingWidth: AppScreenPadding.main + BackDiscButton.leadingWidth,
      // The frame leaves 12 between the disc and the title, which the slot
      // already ends on; the default 16 would stack on top of it.
      titleSpacing: 0,
      actions: switch (actions) {
        final widgets? => [
          ...widgets,
          const SizedBox(width: AppScreenPadding.main),
        ],
        null => null,
      },
      title: switch (title) {
        final label? => ScreenTitle(label: label, child: Text(label)),
        null => null,
      },
    );
  }
}
