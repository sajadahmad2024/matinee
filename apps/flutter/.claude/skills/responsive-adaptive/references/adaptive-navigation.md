# Adaptive navigation shell

Bottom `NavigationBar` on compact and medium windows, `NavigationRail` on expanded. The router owns the selected destination through a shell route, so the shell is stateless and deep links land on the right tab.

| Window | Navigation |
|---|---|
| compact, medium | `NavigationBar` at the bottom |
| expanded | `NavigationRail`, extended labels when there is room |

## Routes

```dart
@TypedShellRoute<AppShellRoute>(
  routes: [
    TypedGoRoute<HomeRoute>(path: '/'),
    TypedGoRoute<SearchRoute>(path: '/search'),
    TypedGoRoute<SettingsRoute>(path: '/settings'),
  ],
)
class AppShellRoute extends ShellRouteData {
  const AppShellRoute();

  @override
  Widget builder(BuildContext context, GoRouterState state, Widget navigator) => AppShell(child: navigator);
}
```

## `lib/app/shell/app_shell.dart`

```dart
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:matinee/app/router/app_routes.dart';
import 'package:matinee/core/l10n/l10n.dart';
import 'package:matinee/core/responsive/responsive.dart';

class AppShell extends StatelessWidget {
  const AppShell({required this.child, super.key});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    final destinations = [
      _Destination(context.l10n.tabHome, Icons.home_outlined, Icons.home, const HomeRoute().location),
      _Destination(context.l10n.tabSearch, Icons.search_outlined, Icons.search, const SearchRoute().location),
      _Destination(context.l10n.tabSettings, Icons.settings_outlined, Icons.settings, const SettingsRoute().location),
    ];
    final location = GoRouterState.of(context).matchedLocation;
    final selected = destinations.indexWhere((d) => location.startsWith(d.location)).clamp(0, destinations.length - 1);

    void select(int index) => context.go(destinations[index].location);

    if (!context.isExpanded) {
      return Scaffold(
        body: child,
        bottomNavigationBar: NavigationBar(
          selectedIndex: selected,
          onDestinationSelected: select,
          destinations: [
            for (final d in destinations)
              NavigationDestination(icon: Icon(d.icon), selectedIcon: Icon(d.selectedIcon), label: d.label),
          ],
        ),
      );
    }

    return Scaffold(
      body: SafeArea(
        child: Row(
          children: [
            NavigationRail(
              selectedIndex: selected,
              onDestinationSelected: select,
              labelType: NavigationRailLabelType.all,
              destinations: [
                for (final d in destinations)
                  NavigationRailDestination(icon: Icon(d.icon), selectedIcon: Icon(d.selectedIcon), label: Text(d.label)),
              ],
            ),
            const VerticalDivider(width: 1, thickness: 1),
            Expanded(child: child),
          ],
        ),
      ),
    );
  }
}

class _Destination {
  const _Destination(this.label, this.icon, this.selectedIcon, this.location);

  final String label;
  final IconData icon;
  final IconData selectedIcon;
  final String location;
}
```

`context.go(location)` here is the one place a location string is used, and it comes from a typed route's `.location`; no literal paths.

## Details that matter

- `SafeArea` wraps the `Row` so rail and body both respect insets; the `VerticalDivider` is Material 3 convention.
- Body widgets never learn about the shell. A body that needs its own width uses `LayoutBuilder`.
- Tab state survives the bar-to-rail switch because the router keeps the navigator; scroll positions survive with `PageStorageKey` on the scrollables. `StatefulShellRoute` keeps every branch alive when tabs must retain state across switches.
- A `NavigationRail` inside a `Column` throws an unbounded-height error; it belongs in a `Row`.
- Resize the desktop window across 840 dp and check the switch is instant and nothing overflows.
