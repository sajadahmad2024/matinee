import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/features/rewards/presentation/widgets/bid_bar.dart';

import '../../../../helpers/helpers.dart';

void main() {
  group(BidBar, () {
    Future<void> pumpBar(WidgetTester tester, {double textScale = 1}) {
      tester.view.physicalSize = const Size(1170, 2532);
      tester.view.devicePixelRatio = 3;
      addTearDown(tester.view.reset);
      return tester.pumpApp(
        MediaQuery(
          data: MediaQueryData(textScaler: TextScaler.linear(textScale)),
          child: Scaffold(
            body: Align(
              alignment: Alignment.bottomCenter,
              child: BidBar(
                openingBid: 10600,
                increments: const [500, 1000, 1500, 2000],
                fieldLabel: 'Bid amount',
                actionLabel: 'BID',
                incrementLabel: (amount) => '+$amount',
                incrementSemanticLabel: (amount) => 'Raise the bid by +$amount',
                onBid: (_) {},
              ),
            ),
          ),
        ),
      );
    }

    group('accessibility', () {
      testWidgets('grows the bid value with the text scale', (tester) async {
        // A constant inset comes out of a box that does not grow, so the value
        // stays the same height at every scale. Only a measurement catches it.
        await pumpBar(tester);
        final atDefault = tester.getSize(find.byType(EditableText)).height;

        await pumpBar(tester, textScale: 2);
        final atDouble = tester.getSize(find.byType(EditableText)).height;

        expect(atDouble, greaterThan(atDefault));
        expect(atDouble, closeTo(atDefault * 2, 2));
      });

      testWidgets('lays out without overflow at a 2.0 text scale', (tester) async {
        await pumpBar(tester, textScale: 2);

        expect(tester.takeException(), isNull);
      });
    });

    ///
    /// The row stretches its children so the action fills the field's border,
    /// and a field stretched with them renders its value against the top.
    ///
    testWidgets('centres the value in the field, not against the top', (tester) async {
      await pumpBar(tester);

      final row = tester.renderObject<RenderBox>(
        find.ancestor(of: find.byType(TextField), matching: find.byType(Row)).first,
      );
      final editable = tester.renderObject<RenderBox>(find.byType(EditableText));
      final above = editable.localToGlobal(Offset.zero).dy - row.localToGlobal(Offset.zero).dy;
      final below = row.size.height - editable.size.height - above;

      expect(above, moreOrLessEquals(below, epsilon: 0.5));
    });

    testWidgets('keeps the action at a full tap target', (tester) async {
      await pumpBar(tester);

      final action = tester.getSize(find.byType(FilledButton));

      expect(action.height, greaterThanOrEqualTo(kMinInteractiveDimension));
    });
  });
}
