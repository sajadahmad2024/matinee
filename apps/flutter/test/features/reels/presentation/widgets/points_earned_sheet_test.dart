import 'package:flutter_test/flutter_test.dart';
import 'package:material_ui/material_ui.dart';
import 'package:matinee/core/widgets/progress_bar.dart';
import 'package:matinee/features/reels/presentation/widgets/points_earned_sheet.dart';

import '../../../../helpers/helpers.dart';

void main() {
  group(PointsEarnedSheet, () {
    late List<bool> results;

    setUp(() => results = []);

    Future<void> open(WidgetTester tester, {int balance = 540}) async {
      usePhoneSurface(tester);
      await tester.pumpApp(
        Builder(
          builder: (context) => Scaffold(
            body: Center(
              child: TextButton(
                onPressed: () async => results.add(
                  await showPointsEarnedSheet(context, earnedPoints: 50, balance: balance, levelTarget: 1000),
                ),
                child: const Text('Share'),
              ),
            ),
          ),
        ),
      );
      await tester.tap(find.text('Share'));
      await tester.pumpAndSettle();
    }

    group('renders', () {
      testWidgets('what the share paid and the progress to the next level', (tester) async {
        await open(tester);

        expect(find.text('+50 PTS'), findsOneWidget);
        expect(find.text('Points Earned!'), findsOneWidget);
        expect(find.textContaining('You earned 50 points'), findsOneWidget);
        expect(find.text('Progress to Next Level'), findsOneWidget);
        expect(tester.widget<ProgressBar>(find.byType(ProgressBar)).value, 0.54);
      });

      testWidgets('meeting the guidelines', (tester) async {
        await open(tester);

        await expectMeetsGuidelines(tester);
      });
    });

    group('resolves', () {
      testWidgets('true from Subscribe Now', (tester) async {
        await open(tester);
        await tester.tap(find.text('Subscribe Now'));
        await tester.pumpAndSettle();

        expect(results, [true]);
      });

      testWidgets('false from the close button', (tester) async {
        await open(tester);
        await tester.tap(find.byTooltip('Close'));
        await tester.pumpAndSettle();

        expect(results, [false]);
      });
    });
  });
}
