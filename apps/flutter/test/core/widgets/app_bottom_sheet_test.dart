import 'package:flutter_test/flutter_test.dart';
import 'package:material_ui/material_ui.dart';
import 'package:matinee/core/widgets/app_bottom_sheet.dart';
import 'package:matinee/core/widgets/sheet_surface.dart';

import '../../helpers/helpers.dart';

void main() {
  group(AppBottomSheet, () {
    const bodyKey = Key('body');
    const footerKey = Key('footer');

    Future<void> open(WidgetTester tester, AppBottomSheet sheet) async {
      usePhoneSurface(tester);
      await tester.pumpApp(
        Builder(
          builder: (context) => Scaffold(
            body: Center(
              child: TextButton(
                onPressed: () => showAppBottomSheet<void>(context, builder: (_) => sheet),
                child: const Text('Open'),
              ),
            ),
          ),
        ),
      );
      await tester.tap(find.text('Open'));
      await tester.pumpAndSettle();
    }

    double sheetHeight(WidgetTester tester) => tester.getSize(find.byType(SheetSurface)).height;

    group('sizes', () {
      testWidgets('to short content by default', (tester) async {
        await open(tester, const AppBottomSheet(body: SizedBox(key: bodyKey, height: 100)));

        expect(sheetHeight(tester), lessThan(200));
      });

      testWidgets('to a fixed height when given one', (tester) async {
        await open(tester, const AppBottomSheet(height: 300, body: SizedBox(key: bodyKey, height: 100)));

        expect(sheetHeight(tester), 300);
      });

      testWidgets('long content no taller than the max factor', (tester) async {
        await open(tester, const AppBottomSheet(body: SingleChildScrollView(child: SizedBox(height: 5000))));
        final screen = tester.view.physicalSize.height / tester.view.devicePixelRatio;

        expect(sheetHeight(tester), lessThan(screen));
      });
    });

    group('renders', () {
      testWidgets('the title, and a close button that dismisses the sheet', (tester) async {
        await open(
          tester,
          const AppBottomSheet(
            title: 'Comments',
            closeLabel: 'Close',
            body: SizedBox(key: bodyKey),
          ),
        );

        expect(find.text('Comments'), findsOneWidget);
        await tester.tap(find.byTooltip('Close'));
        await tester.pumpAndSettle();

        expect(find.byKey(bodyKey), findsNothing);
      });

      testWidgets('the footer at the bottom of a fixed-height sheet', (tester) async {
        await open(
          tester,
          const AppBottomSheet(
            height: 400,
            body: SizedBox(key: bodyKey, height: 50),
            footer: SizedBox(key: footerKey, height: 40),
          ),
        );

        expect(
          tester.getBottomLeft(find.byKey(footerKey)).dy,
          tester.getBottomLeft(find.byType(SheetSurface)).dy,
        );
      });

      testWidgets('meeting the guidelines', (tester) async {
        await open(
          tester,
          const AppBottomSheet(
            title: 'Comments',
            closeLabel: 'Close',
            body: SizedBox(key: bodyKey),
          ),
        );

        await expectMeetsGuidelines(tester);
      });
    });
  });
}
