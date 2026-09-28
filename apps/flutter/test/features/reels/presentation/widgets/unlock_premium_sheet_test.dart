import 'dart:ui' show CheckedState;

import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_ui/material_ui.dart';
import 'package:matinee/features/reels/presentation/widgets/unlock_premium_sheet.dart';

import '../../../../helpers/helpers.dart';

void main() {
  group(UnlockPremiumSheet, () {
    Future<void> open(WidgetTester tester) async {
      usePhoneSurface(tester);
      await tester.pumpApp(
        Builder(
          builder: (context) => Scaffold(
            body: Center(
              child: TextButton(onPressed: () => showUnlockPremiumSheet(context), child: const Text('Open')),
            ),
          ),
        ),
      );
      await tester.tap(find.text('Open'));
      await tester.pumpAndSettle();
    }

    group('renders', () {
      testWidgets('the offer, the monthly plan and both actions', (tester) async {
        await open(tester);

        expect(find.text('Unlock Premium'), findsOneWidget);
        expect(find.text('Monthly Plan'), findsOneWidget);
        expect(find.text('Flexible, cancel anytime'), findsOneWidget);
        expect(find.text('Subscribe Now'), findsOneWidget);
        expect(find.text('MAYBE LATER'), findsOneWidget);
      });

      testWidgets('meeting the guidelines', (tester) async {
        await open(tester);

        await expectMeetsGuidelines(tester);
      });
    });

    group('updates', () {
      testWidgets('the plan to checked when tapped', (tester) async {
        final handle = tester.ensureSemantics();
        await open(tester);
        SemanticsNode plan() => tester.getSemantics(find.text('Monthly Plan'));

        expect(plan().flagsCollection.isChecked, CheckedState.isFalse);
        await tester.tap(find.text('Monthly Plan'));
        await tester.pump();

        expect(plan().flagsCollection.isChecked, CheckedState.isTrue);
        handle.dispose();
      });
    });

    group('closes', () {
      for (final action in ['Subscribe Now', 'MAYBE LATER']) {
        testWidgets('from $action', (tester) async {
          await open(tester);
          await tester.tap(find.text(action));
          await tester.pumpAndSettle();

          expect(find.byType(UnlockPremiumSheet), findsNothing);
        });
      }
    });
  });
}
