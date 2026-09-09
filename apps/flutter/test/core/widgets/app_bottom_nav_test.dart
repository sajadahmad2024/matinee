import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/core/assets/app_icon_assets.dart';
import 'package:matinee/core/theme/app_colors.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/widgets/app_bottom_nav.dart';

import '../../helpers/helpers.dart';

void main() {
  const destinations = [
    AppBottomNavDestination(
      icon: AppIconAssets.navHome,
      activeIcon: AppIconAssets.navHomeActive,
      label: 'Home',
    ),
    AppBottomNavDestination(
      icon: AppIconAssets.navP2p,
      activeIcon: AppIconAssets.navP2pActive,
      label: 'P2P',
    ),
    AppBottomNavDestination(
      icon: AppIconAssets.navRewards,
      activeIcon: AppIconAssets.navRewards,
      label: 'Rewards',
    ),
    AppBottomNavDestination(
      icon: AppIconAssets.navProfile,
      activeIcon: AppIconAssets.navProfile,
      label: 'Profile',
    ),
  ];

  Widget bar({int currentIndex = 0, ValueChanged<int>? onSelected}) {
    return Scaffold(
      bottomNavigationBar: AppBottomNav(
        destinations: destinations,
        currentIndex: currentIndex,
        onSelected: onSelected ?? (_) {},
      ),
    );
  }

  group('AppBottomNav', () {
    testWidgets('renders every label in upper case', (tester) async {
      await tester.pumpApp(bar());

      for (final destination in destinations) {
        expect(find.text(destination.label.toUpperCase()), findsOneWidget);
      }
    });

    testWidgets('reports the tapped index', (tester) async {
      final tapped = <int>[];
      await tester.pumpApp(bar(onSelected: tapped.add));

      await tester.tap(find.text('REWARDS'));

      expect(tapped, [2]);
    });

    testWidgets('reports the index of the tab already selected', (tester) async {
      final tapped = <int>[];
      await tester.pumpApp(bar(currentIndex: 1, onSelected: tapped.add));

      await tester.tap(find.text('P2P'));

      expect(tapped, [1]);
    });

    testWidgets('paints the selected label gold and the rest muted', (tester) async {
      await tester.pumpApp(bar(currentIndex: 1));
      final colors = AppColors.dark.bottomNav;

      Color? colorOf(String label) => tester.widget<Text>(find.text(label)).style?.color;

      expect(colorOf('P2P'), colors.active);
      expect(colorOf('HOME'), colors.inactive);
    });

    testWidgets('draws the indicator under the selected tab only', (tester) async {
      await tester.pumpApp(bar(currentIndex: 3));

      final indicators = find.byWidgetPredicate(
        (widget) => widget is SizedBox && widget.width == AppControlHeight.navIndicator.width,
      );

      expect(indicators, findsOneWidget);
    });

    testWidgets('keeps a 48dp tap target at the default text scale', (tester) async {
      await tester.pumpApp(bar());

      for (final destination in destinations) {
        final size = tester.getSize(
          find.ancestor(of: find.text(destination.label.toUpperCase()), matching: find.byType(InkWell)),
        );
        expect(size.height, greaterThanOrEqualTo(48));
        expect(size.width, greaterThanOrEqualTo(48));
      }
    });

    testWidgets('grows instead of overflowing when text is scaled up', (tester) async {
      await tester.pumpApp(
        MediaQuery(
          data: const MediaQueryData(textScaler: TextScaler.linear(1.3)),
          child: bar(),
        ),
      );

      expect(tester.takeException(), isNull);
    });

    testWidgets('fits a narrow screen at the largest text scale', (tester) async {
      // A small phone at the accessibility maximum: the four labels cannot all
      // be drawn at full width, and the row has to absorb that rather than
      // running off the side.
      tester.view.physicalSize = const Size(360, 780);
      tester.view.devicePixelRatio = 1;
      addTearDown(tester.view.reset);

      await tester.pumpApp(
        MediaQuery(
          data: const MediaQueryData(textScaler: TextScaler.linear(2)),
          child: bar(),
        ),
      );

      expect(tester.takeException(), isNull);
    });
  });
}
