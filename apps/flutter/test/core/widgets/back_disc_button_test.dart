import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/widgets/back_disc_button.dart';

import '../../helpers/helpers.dart';

void main() {
  group(BackDiscButton, () {
    /// The disc itself, which paints inside a tap target wider than it is.
    Rect disc(WidgetTester tester) => tester.getRect(
      find.descendant(of: find.byType(IconButton), matching: find.byType(Material)).first,
    );

    Future<void> pumpInPaddedRow(WidgetTester tester, TextDirection direction) {
      usePhoneSurface(tester);
      return tester.pumpApp(
        Directionality(
          textDirection: direction,
          child: Scaffold(
            body: Padding(
              padding: const EdgeInsets.symmetric(horizontal: AppScreenPadding.main),
              child: Column(
                children: [
                  Row(children: [BackDiscButton(tooltip: 'Back', onPressed: () {}), const Text('Title')]),
                  const SizedBox(width: double.infinity, height: 20, child: Placeholder()),
                ],
              ),
            ),
          ),
        ),
      );
    }

    group('paints on the margin its parent pads to', () {
      testWidgets('left to right', (tester) async {
        await pumpInPaddedRow(tester, TextDirection.ltr);

        // Not the tap target's edge, which reaches further into the margin:
        // the disc is what the eye lines up against the content below it.
        expect(disc(tester).left, tester.getRect(find.byType(Placeholder)).left);
      });

      testWidgets('right to left', (tester) async {
        await pumpInPaddedRow(tester, TextDirection.rtl);

        expect(disc(tester).right, tester.getRect(find.byType(Placeholder)).right);
      });
    });

    group('keeps a full tap target', () {
      testWidgets('of 48 around the smaller disc, and on screen', (tester) async {
        await pumpInPaddedRow(tester, TextDirection.ltr);
        final target = tester.getRect(find.byType(IconButton));

        expect(target.width, greaterThanOrEqualTo(kMinInteractiveDimension));
        expect(target.height, greaterThanOrEqualTo(kMinInteractiveDimension));
        // Pulled into the margin, not off the edge of the screen.
        expect(target.left, greaterThanOrEqualTo(0));
      });

      testWidgets('that meets the guidelines', (tester) async {
        await pumpInPaddedRow(tester, TextDirection.ltr);

        await expectMeetsGuidelines(tester);
      });
    });

    group('leaves the design gap to what follows', () {
      testWidgets('without the row adding one of its own', (tester) async {
        await pumpInPaddedRow(tester, TextDirection.ltr);

        // The trailing half of the overhang is that gap.
        expect(tester.getRect(find.text('Title')).left - disc(tester).right, 12);
      });
    });
  });
}
