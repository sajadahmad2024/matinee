import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/core/l10n/app_exception_l10n.dart';
import 'package:matinee/l10n/gen/app_localizations_en.dart';

void main() {
  group('AppExceptionL10n', () {
    final l10n = AppLocalizationsEn();

    test('uses the server message for a $ValidationException when present', () {
      const e = ValidationException(422, message: 'Email is taken');

      expect(e.localizedMessage(l10n), 'Email is taken');
    });

    test('falls back to the generic string when the server sent none', () {
      const e = ValidationException(422);

      expect(e.localizedMessage(l10n), l10n.errorValidation);
    });

    test('maps a $NetworkException to the offline string', () {
      expect(const NetworkException().localizedMessage(l10n), l10n.errorNetwork);
    });
  });
}
