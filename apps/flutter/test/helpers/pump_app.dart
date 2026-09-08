import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:template/core/theme/app_color_scheme.dart';
import 'package:template/core/theme/app_theme.dart';
import 'package:template/l10n/gen/app_localizations.dart';

extension PumpApp on WidgetTester {
  Future<void> pumpApp(Widget widget, {ThemeData? theme}) {
    return pumpWidget(
      MaterialApp(
        theme: theme ?? const AppTheme(AppColorScheme.standard).light(),
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        supportedLocales: AppLocalizations.supportedLocales,
        home: widget,
      ),
    );
  }
}
