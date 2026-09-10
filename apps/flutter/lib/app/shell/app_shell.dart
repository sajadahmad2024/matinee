import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:matinee/core/assets/assets.dart';
import 'package:matinee/core/l10n/l10n.dart';
import 'package:matinee/core/widgets/app_bottom_nav.dart';

///
/// The signed-in skeleton: the four tabs and the bar that switches them. One
/// Navigator per tab, so a screen pushed inside one survives a trip away.
///
class AppShell extends StatelessWidget {
  const AppShell({required this.navigationShell, super.key});

  final StatefulNavigationShell navigationShell;

  ///
  /// Tapping the tab that is already selected pops it back to its first screen,
  /// which is what a tab bar does on every platform.
  ///
  void _onSelected(int index) {
    navigationShell.goBranch(index, initialLocation: index == navigationShell.currentIndex);
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return Scaffold(
      body: navigationShell,
      bottomNavigationBar: AppBottomNav(
        currentIndex: navigationShell.currentIndex,
        onSelected: _onSelected,
        destinations: [
          AppBottomNavDestination(
            icon: AppIconAssets.navHome,
            activeIcon: AppIconAssets.navHomeActive,
            label: l10n.navHome,
          ),
          AppBottomNavDestination(
            icon: AppIconAssets.navP2p,
            activeIcon: AppIconAssets.navP2pActive,
            label: l10n.navP2p,
          ),
          AppBottomNavDestination(
            icon: AppIconAssets.navRewards,
            activeIcon: AppIconAssets.navRewards,
            label: l10n.navRewards,
          ),
          AppBottomNavDestination(
            icon: AppIconAssets.navProfile,
            activeIcon: AppIconAssets.navProfile,
            label: l10n.navProfile,
          ),
        ],
      ),
    );
  }
}
