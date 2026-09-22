import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/app_theme.dart';

///
/// The real UI font, because the alignment being asserted depends on its
/// metrics; the default test font would not reproduce it.
///
Future<void> loadUiFont() async {
  final loader = FontLoader('DM Sans')
    ..addFont(
      Future.value(File('assets/fonts/DMSans/DMSans-Regular.ttf').readAsBytesSync().buffer.asByteData()),
    );
  await loader.load();
}

void main() {
  group(AppTheme, () {
    ///
    /// A value sitting high in its box means the decorator anchored it by
    /// baseline, so the guard is that the space above and below stays equal.
    ///
    group('centres the value inside an input', () {
      const hint = 'Hint text';

      testWidgets('vertically, within half a pixel', (tester) async {
        await loadUiFont();

        await tester.pumpWidget(
          MaterialApp(
            theme: AppTheme.dark,
            home: const Scaffold(
              body: Center(
                child: SizedBox(
                  width: 300,
                  child: TextField(decoration: InputDecoration(hintText: hint)),
                ),
              ),
            ),
          ),
        );

        final field = tester.getRect(find.byType(TextField));
        final text = tester.getRect(find.text(hint));
        final above = text.top - field.top;
        final below = field.bottom - text.bottom;

        expect((above - below).abs(), lessThanOrEqualTo(1));
      });

      testWidgets('at the height the design draws', (tester) async {
        await loadUiFont();

        await tester.pumpWidget(
          MaterialApp(
            theme: AppTheme.dark,
            home: const Scaffold(
              body: Center(
                child: SizedBox(
                  width: 300,
                  child: TextField(decoration: InputDecoration(hintText: hint)),
                ),
              ),
            ),
          ),
        );

        expect(tester.getRect(find.byType(TextField)).height, AppControlHeight.input);
      });
    });
  });
}
