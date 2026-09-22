import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:matinee/core/theme/app_elevation.dart';
import 'package:matinee/core/theme/app_palette.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';

/// One tab of the bottom bar.
@immutable
class AppBottomNavDestination {
  const AppBottomNavDestination({required this.icon, required this.activeIcon, required this.label});

  /// Asset path of the outline glyph shown while the tab is not selected.
  final String icon;

  ///
  /// Asset path of the glyph shown while the tab is selected. Tabs the design
  /// never drew a filled glyph for pass the same asset as [icon].
  ///
  final String activeIcon;

  final String label;
}

///
/// The app's persistent bottom bar: four tabs on the navy bar, the selected one
/// gold under a short glowing underline.
///
class AppBottomNav extends StatelessWidget {
  const AppBottomNav({required this.destinations, required this.currentIndex, required this.onSelected, super.key});

  final List<AppBottomNavDestination> destinations;
  final int currentIndex;
  final ValueChanged<int> onSelected;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors.bottomNav;
    return Semantics(
      // So a screen reader says which tab of how many, not four loose buttons.
      role: SemanticsRole.tabBar,
      // The role requires every child to be a tab; without this the items'
      // nodes can be folded into this one.
      explicitChildNodes: true,
      // A Material, not a DecoratedBox: the items' ink would otherwise splash
      // on the Scaffold's Material and be hidden by the opaque bar.
      child: Material(
        color: colors.background,
        shape: Border(top: BorderSide(color: colors.border)),
        // The design's lower 12 and the home indicator's strip are one gap, not
        // two, so `minimum` takes the larger rather than stacking them.
        child: SafeArea(
          top: false,
          minimum: const EdgeInsets.only(bottom: AppSpacing.md),
          // A minimum, not a fixed height: a scaled-up label has to grow the bar
          // rather than be clipped.
          child: ConstrainedBox(
            constraints: const BoxConstraints(minHeight: AppControlHeight.bottomNav - AppSpacing.md),
            // Every item is as tall as the bar, so the whole strip above a label
            // is tappable rather than just the glyph and the words.
            child: IntrinsicHeight(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xl),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    for (var index = 0; index < destinations.length; index++)
                      // Loose, so an item keeps its natural width until a scaled
                      // label would push the row off the screen.
                      Flexible(
                        child: _NavItem(
                          destination: destinations[index],
                          selected: index == currentIndex,
                          onTap: () => onSelected(index),
                        ),
                      ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  const _NavItem({required this.destination, required this.selected, required this.onTap});

  final AppBottomNavDestination destination;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors.bottomNav;
    final color = selected ? colors.active : colors.inactive;
    return Semantics(
      role: SemanticsRole.tab,
      selected: selected,
      // Read from here, not the glyphs below: the design sets nav labels upper
      // case, and screen readers spell a short run such as 'P2P' out.
      label: destination.label,
      // Excluding the subtree takes the InkWell's tap with it, and a tab
      // without one trips a framework assertion.
      onTap: onTap,
      excludeSemantics: true,
      child: InkWell(
        onTap: onTap,
        borderRadius: const BorderRadius.all(Radius.circular(AppRadius.sm)),
        overlayColor: WidgetStatePropertyAll(colors.active.a10),
        // The bar's 12 above its items sits inside the item, so the strip it
        // covers is part of the tap target rather than dead space above one.
        child: Padding(
          padding: const EdgeInsets.only(top: AppSpacing.md, left: AppSpacing.md, right: AppSpacing.md),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            spacing: AppSpacing.xxs,
            children: [
              SvgPicture.asset(
                selected ? destination.activeIcon : destination.icon,
                width: AppIconSize.lg,
                height: AppIconSize.lg,
                colorFilter: ColorFilter.mode(color, BlendMode.srcIn),
              ),
              Column(
                mainAxisSize: MainAxisSize.min,
                spacing: AppSpacing.xxs,
                children: [
                  Text(
                    destination.label.toUpperCase(),
                    textAlign: TextAlign.center,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: AppTextStyle.navLabel.copyWith(
                      color: color,
                      fontWeight: selected ? FontWeight.w700 : FontWeight.w600,
                    ),
                  ),
                  if (selected) const _NavIndicator(),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _NavIndicator extends StatelessWidget {
  const _NavIndicator();

  @override
  Widget build(BuildContext context) {
    return SizedBox.fromSize(
      size: AppControlHeight.navIndicator,
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: context.appColors.bottomNav.indicator,
          borderRadius: const BorderRadius.all(Radius.circular(AppRadius.full)),
          boxShadow: AppElevation.glowNavIndicator,
        ),
      ),
    );
  }
}
