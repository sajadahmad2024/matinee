import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/main.dart' as app;
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('Auth Flow Integration', () {
    testWidgets('should complete login flow', (tester) async {
      // Start app
      app.main();
      await tester.pumpAndSettle();

      // Find and tap login button
      final loginButton = find.text('Login');
      expect(loginButton, findsOneWidget);
      await tester.tap(loginButton);
      await tester.pumpAndSettle();

      // Enter credentials
      final emailField = find.byKey(const Key('email_field'));
      final passwordField = find.byKey(const Key('password_field'));

      await tester.enterText(emailField, 'test@example.com');
      await tester.enterText(passwordField, 'password123');
      await tester.pumpAndSettle();

      // Submit
      final submitButton = find.byKey(const Key('submit_button'));
      await tester.tap(submitButton);
      await tester.pumpAndSettle(const Duration(seconds: 5));

      // Verify navigation to home
      expect(find.text('Home'), findsOneWidget);
    });
  });
}
