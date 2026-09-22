import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';

///
/// The Earned / Locked pills over the badge grid. The design draws the active
/// one as an outline and the inactive one filled, which is the opposite of the
/// usual reading, so the selected flag carries it rather than the border.
///
class BadgeFilterTabs extends StatelessWidget {
  const BadgeFilterTabs({
    required this.earnedLabel,
    required this.lockedLabel,
    required this.showEarned,
    required this.onChanged,
    super.key,
  });

  final String earnedLabel;
  final String lockedLabel;
  final bool showEarned;

  /// Called with whether the earned tab is the one now chosen.
  final ValueChanged<bool> onChanged;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      role: SemanticsRole.tabBar,
      explicitChildNodes: true,
      child: Row(
        spacing: AppSpacing.sm,
        children: [
          _Pill(label: earnedLabel, selected: showEarned, onTap: () => onChanged(true)),
          _Pill(label: lockedLabel, selected: !showEarned, onTap: () => onChanged(false)),
        ],
      ),
    );
  }
}

class _Pill extends StatelessWidget {
  const _Pill({required this.label, required this.selected, required this.onTap});

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors.tab;
    return Semantics(
      role: SemanticsRole.tab,
      selected: selected,
      // Read from here, not the label below: the design sets these upper case
      // and a screen reader spells a short capitalised run out.
      label: label,
      onTap: onTap,
      excludeSemantics: true,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppRadius.full),
        // No ink: it would trace the 48 tap target rather than the pill drawn
        // inside it, washing over the gap above and below. Choosing a tab
        // moves the selection, which is feedback enough.
        splashFactory: NoSplash.splashFactory,
        overlayColor: const WidgetStatePropertyAll(Colors.transparent),
        // The design draws the pill 27 tall, too small to hit, so it keeps
        // that height and the tap target grows around it.
        child: ConstrainedBox(
          constraints: const BoxConstraints(minHeight: kMinInteractiveDimension),
          child: Center(
            widthFactor: 1,
            child: DecoratedBox(
              decoration: BoxDecoration(
                color: selected ? null : colors.inactiveBackground,
                border: Border.all(color: selected ? colors.activeBorder : colors.inactiveBorder),
                borderRadius: BorderRadius.circular(AppRadius.full),
              ),
              child: ConstrainedBox(
                constraints: const BoxConstraints(minHeight: AppControlHeight.buttonMini),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
                  child: Center(
                    child: Text(
                      label.toUpperCase(),
                      style: AppTextStyle.overline.copyWith(
                        color: selected ? colors.activeLabel : colors.inactiveLabel,
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
