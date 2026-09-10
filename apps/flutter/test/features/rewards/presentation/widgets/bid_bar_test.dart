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
                onBid: (_) {},
              ),
            ),
          ),
        ),
      );
    }

    group('accessibility', () {
      testWidgets('grows the bid value with the text scale', (tester) async {
        // Padding the editor out to the row's height enlarges the tap target,
        // but a constant inset comes out of a box that does not grow, so the
        // value ends up the same height at every scale and is clipped at 200%.
        // Nothing throws when that happens: the editor is simply given less
        // room than it asked for, so only a measurement catches it.
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
  });
}
