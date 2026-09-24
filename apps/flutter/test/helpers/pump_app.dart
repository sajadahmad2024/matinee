import 'package:flutter_test/flutter_test.dart';
import 'package:material_ui/material_ui.dart';
import 'package:matinee/core/theme/app_theme.dart';
import 'package:matinee/l10n/gen/app_localizations.dart';

extension PumpApp on WidgetTester {
  Future<void> pumpApp(Widget widget, {ThemeData? theme}) {
    return pumpWidget(
      MaterialApp(
        theme: theme ?? AppTheme.dark,
        localizationsDelegates: const [AppLocalizations.delegate, ...GlobalMaterialLocalizations.delegates],
        supportedLocales: AppLocalizations.supportedLocales,
        home: widget,
      ),
    );
  }
}
