import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/widgets/points_header.dart';

import '../../helpers/helpers.dart';

void main() {
  group(PointsHeader, () {
    ///
    /// A deliberately short caption, so the badge block cannot fill the half
    /// of the row it is capped at.
    ///
    /// The defect this guards was invisible with a long one: the block filled
    /// its half and looked flush, and it only stranded short of the margin
    /// once the text was narrower. Widget tests render with stub font metrics,
    /// so a long string proves nothing here.
    Future<void> pumpHeader(WidgetTester tester, {String caption = '5 to go'}) {
      usePhoneSurface(tester);
      return tester.pumpApp(
        Scaffold(
          body: PointsHeader(
            totalPointsLabel: 'Total Points',
            totalPoints: '7,082',
            pointsUnit: 'pts',
            badgeLabel: 'Badge',
            badgeName: 'Expert',
            nextBadgeCaption: caption,
            balanceSummary: 'Total Points: 7,082 pts',
            badgeSummary: 'Badge: Expert. $caption',
          ),
        ),
      );
    }

    group('spreads the row to both margins', () {
      testWidgets('the badge block ends on the content margin, not short of it', (tester) async {
        await pumpHeader(tester);
        final margin = tester.getRect(find.byType(PointsHeader)).right - AppScreenPadding.main;

        for (final line in ['Badge', 'Expert', '5 to go']) {
          expect(
            tester.getRect(find.text(line)).right,
            moreOrLessEquals(margin, epsilon: 0.01),
            reason: '"$line" should be flush with the screen margin',
          );
        }
      });

      testWidgets('the balance starts on the opposite margin', (tester) async {
        await pumpHeader(tester);
        final margin = tester.getRect(find.byType(PointsHeader)).left + AppScreenPadding.main;

        expect(tester.getRect(find.text('Total Points')).left, moreOrLessEquals(margin, epsilon: 0.01));
      });
    });

    group('neither block crowds the other out', () {
      for (final scale in <double>[1, 1.5, 2]) {
        testWidgets('at ${scale}x text, with a long caption and no overflow', (tester) async {
          usePhoneSurface(tester);
          await tester.pumpApp(
            MediaQuery(
              data: MediaQueryData(textScaler: TextScaler.linear(scale)),
              child: const Scaffold(
                body: PointsHeader(
                  totalPointsLabel: 'Total Points',
                  totalPoints: '7,082',
                  pointsUnit: 'pts',
                  badgeLabel: 'Badge',
                  badgeName: 'Expert',
                  nextBadgeCaption: '918 pts to Cinematic Loyalist',
                  balanceSummary: 'Total Points: 7,082 pts',
                  badgeSummary: 'Badge: Expert. 918 pts to Cinematic Loyalist',
                ),
              ),
            ),
          );

          expect(tester.takeException(), isNull);
        });
      }
    });
  });
}
