import 'package:flutter/material.dart';
import 'package:matinee/core/theme/app_spacing.dart';

///
/// Shown when pre-init throws, so it has no DI, router, theme or localisation.
/// AppSpacing is safe: constants with no dependencies.
///
class BootstrapErrorApp extends StatelessWidget {
  const BootstrapErrorApp({super.key});

  // Localisation is not available before DI, so this one string is literal.
  static const _message = 'Something went wrong while starting. Please restart the app.';

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(
      home: Scaffold(
        body: Center(
          child: Padding(
            padding: EdgeInsets.all(AppSpacing.xl),
            child: Text(_message, textAlign: TextAlign.center),
          ),
        ),
      ),
    );
  }
}
