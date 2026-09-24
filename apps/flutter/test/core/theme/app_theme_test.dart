import 'package:flutter_test/flutter_test.dart';
import 'package:material_ui/material_ui.dart';

import '../../helpers/helpers.dart';

void main() {
  group('AppTheme', () {
    group('filledButtonTheme', () {
      testWidgets('lays out beside other widgets without forcing an infinite width', (tester) async {
        await tester.pumpApp(
          Row(
            children: [FilledButton(onPressed: () {}, child: const Text('Go'))],
          ),
        );

        expect(tester.takeException(), isNull);
      });
    });
  });
}
