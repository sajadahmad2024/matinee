import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/features/profile/presentation/widgets/profile_menu_row.dart';

import '../../../../helpers/helpers.dart';

void main() {
  group(ProfileMenuRow, () {
    Future<void> pumpRow(WidgetTester tester, String label, {double textScale = 1}) {
      return tester.pumpApp(
        MediaQuery(
          data: MediaQueryData(textScaler: TextScaler.linear(textScale)),
          child: Scaffold(body: ProfileMenuRow(label: label, onTap: null)),
        ),
      );
    }

    group('accessibility', () {
      testWidgets('grows for a label that wraps at a 2.0 text scale', (tester) async {
        // A fixed row height clips a wrapped label silently: the overflow is
        // vertical inside a Row, so nothing throws.
        const label = 'Allgemeine Geschaftsbedingungen';
        await pumpRow(tester, label, textScale: 2);

        final row = tester.getSize(find.byType(ProfileMenuRow)).height;
        expect(row, greaterThanOrEqualTo(tester.getSize(find.text(label)).height));
        expect(row, greaterThan(54));
      });

      testWidgets('keeps the height the frame draws when the label fits', (tester) async {
        await pumpRow(tester, 'Terms & Conditions');

        expect(tester.getSize(find.byType(ProfileMenuRow)).height, 54);
      });
    });
  });
}
