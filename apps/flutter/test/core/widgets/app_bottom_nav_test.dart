import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/core/assets/app_icon_assets.dart';
import 'package:matinee/core/theme/app_colors.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/app_spacing.dart';
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

  group('AppBottomNav accessibility', () {
    testWidgets('is a tab bar whose items are tabs', (tester) async {
      final handle = tester.ensureSemantics();
      await tester.pumpApp(bar(currentIndex: 2));

      // Four loose buttons say nothing about being one set, and the selected
      // one is drawn in gold under a rule, which no screen reader sees.
      expect(
        tester.getSemantics(find.bySemanticsLabel('Rewards')),
        isSemantics(isSelected: true, hasTapAction: true),
      );
      expect(
        tester.getSemantics(find.bySemanticsLabel('Home')),
        isSemantics(isSelected: false, hasTapAction: true),
      );
      handle.dispose();
    });

    testWidgets('announces each label as written, not in upper case', (tester) async {
      final handle = tester.ensureSemantics();
      await tester.pumpApp(bar());

      // 'P2P' upper case is spelled out letter by letter by several screen
      // readers, so the name is the label and the capitals stay a drawing.
      expect(find.bySemanticsLabel('P2P'), findsOne);
      expect(find.bySemanticsLabel('HOME'), findsNothing);
      handle.dispose();
    });

    testWidgets('meets the tap target and labelling guidelines', (tester) async {
      usePhoneSurface(tester);
      await tester.pumpApp(bar());

      await expectMeetsGuidelines(tester);
    });
  });

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

    testWidgets('absorbs its own bottom padding into the home indicator', (tester) async {
      // The design's 12 under the items and the indicator's strip are the same
      // gap, so the taller of the two wins rather than the pair stacking.
      await tester.pumpApp(
        MediaQuery(
          data: const MediaQueryData(padding: EdgeInsets.only(bottom: 34)),
          child: bar(),
        ),
      );

      final withIndicator = tester.getSize(find.byType(AppBottomNav)).height;

      await tester.pumpApp(bar());
      final plain = tester.getSize(find.byType(AppBottomNav)).height;

      expect(withIndicator - plain, 34 - AppSpacing.md);
    });

    testWidgets('keeps its designed height where there is no indicator', (tester) async {
      await tester.pumpApp(bar());

      final height = tester.getSize(find.byType(AppBottomNav)).height;

      expect(height, greaterThanOrEqualTo(AppControlHeight.bottomNav));
      expect(height, lessThan(AppControlHeight.bottomNav + AppSpacing.sm));
    });

    testWidgets('leaves the design gap above the glyphs', (tester) async {
      // The items used to be stretched over whatever the safe-area inset left
      // of the bar, which pinned the glyphs against its top border.
      await tester.pumpApp(
        MediaQuery(
          data: const MediaQueryData(padding: EdgeInsets.only(bottom: 34)),
          child: bar(),
        ),
      );

      final navTop = tester.getRect(find.byType(AppBottomNav)).top;
      final glyphTop = tester.getRect(find.byType(SvgPicture).first).top;

      expect(glyphTop - navTop, AppSpacing.md);
    });

    testWidgets('fits a narrow screen at the largest text scale', (tester) async {
      // A small phone at the accessibility maximum: the four labels cannot all
      // be drawn full width, and the row has to absorb that.
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
