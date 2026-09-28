import 'package:flutter_test/flutter_test.dart';
import 'package:material_ui/material_ui.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
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
        await open(
          tester,
          const AppBottomSheet(
            closeLabel: 'Close',
            body: SizedBox(key: bodyKey, height: 100),
          ),
        );

        expect(sheetHeight(tester), lessThan(200));
      });

      testWidgets('to a fixed height when given one', (tester) async {
        await open(
          tester,
          const AppBottomSheet(
            closeLabel: 'Close',
            height: 300,
            body: SizedBox(key: bodyKey, height: 100),
          ),
        );

        expect(sheetHeight(tester), 300);
      });

      testWidgets('long content no taller than the max factor', (tester) async {
        await open(
          tester,
          const AppBottomSheet(
            closeLabel: 'Close',
            body: SingleChildScrollView(child: SizedBox(height: 5000)),
          ),
        );
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

      testWidgets('the title in the given style', (tester) async {
        await open(
          tester,
          const AppBottomSheet(
            closeLabel: 'Close',
            title: 'Neon Noir',
            titleStyle: AppTextStyle.headlineSmall,
            body: SizedBox(),
          ),
        );

        expect(tester.widget<Text>(find.text('Neon Noir')).style?.fontSize, AppTextStyle.headlineSmall.fontSize);
      });

      testWidgets('the footer at the bottom of a fixed-height sheet', (tester) async {
        await open(
          tester,
          const AppBottomSheet(
            closeLabel: 'Close',
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

      testWidgets('the eyebrow above the title', (tester) async {
        await open(
          tester,
          const AppBottomSheet(eyebrow: 'ANALYSIS', title: 'Will it rain?', closeLabel: 'Close', body: SizedBox()),
        );

        expect(
          tester.getTopLeft(find.text('ANALYSIS')).dy,
          lessThan(tester.getTopLeft(find.text('Will it rain?')).dy),
        );
        expect(find.byTooltip('Close'), findsOneWidget);
      });

      testWidgets('the close button level with the handle, above the title', (tester) async {
        await open(tester, const AppBottomSheet(title: 'Comments', closeLabel: 'Close', body: SizedBox()));
        final close = find.byTooltip('Close');
        final handle = find.descendant(
          of: find.byType(SheetSurface),
          matching: find.byWidgetPredicate(
            (widget) => widget is SizedBox && widget.width == AppControlHeight.sheetHandle.width,
          ),
        );

        expect(tester.getCenter(close).dy, tester.getCenter(handle).dy);
        expect(tester.getBottomLeft(close).dy, lessThanOrEqualTo(tester.getTopLeft(find.text('Comments')).dy));
      });

      testWidgets('the title as the top-level heading', (tester) async {
        final handle = tester.ensureSemantics();
        await open(tester, const AppBottomSheet(closeLabel: 'Close', title: 'Comments', body: SizedBox()));

        final node = tester.getSemantics(find.bySemanticsLabel('Comments'));
        expect(node.flagsCollection.isHeader, isTrue);
        expect(node.headingLevel, 1);
        handle.dispose();
      });

      testWidgets('the modal handle and the given surface colour', (tester) async {
        await open(
          tester,
          const AppBottomSheet(
            closeLabel: 'Close',
            isModal: true,
            surfaceColor: Color(0xFF000000),
            body: SizedBox(key: bodyKey),
          ),
        );
        final surface = tester.widget<SheetSurface>(find.byType(SheetSurface));

        expect(surface.isModal, isTrue);
        expect(surface.color, const Color(0xFF000000));
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

    group('hosts snackbars', () {
      Widget snackBarBody() => Builder(
        builder: (context) => TextButton(
          onPressed: () => ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Copied'))),
          child: const Text('Copy'),
        ),
      );

      testWidgets('over the sheet when asked to', (tester) async {
        await open(tester, AppBottomSheet(closeLabel: 'Close', hostsSnackBars: true, body: snackBarBody()));
        await tester.tap(find.text('Copy'));
        await tester.pump();

        expect(
          find.descendant(of: find.byType(AppBottomSheet), matching: find.text('Copied')),
          findsOneWidget,
        );
      });

      testWidgets('and still closes from a tap above the sheet', (tester) async {
        await open(tester, AppBottomSheet(closeLabel: 'Close', hostsSnackBars: true, body: snackBarBody()));
        await tester.tapAt(const Offset(10, 100));
        await tester.pumpAndSettle();

        expect(find.byType(AppBottomSheet), findsNothing);
      });
    });
  });
}
