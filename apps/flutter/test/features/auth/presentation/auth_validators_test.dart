import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/features/auth/presentation/auth_validators.dart';
import 'package:matinee/l10n/gen/app_localizations_en.dart';

void main() {
  group(AuthValidators, () {
    final l10n = AppLocalizationsEn();

    group('phoneNumber', () {
      test("accepts a number of the chosen country's length", () {
        expect(AuthValidators.phoneNumber('9876543210', l10n, digits: 10), isNull);
      });

      test('rejects an empty value', () {
        expect(AuthValidators.phoneNumber('  ', l10n, digits: 10), isNotNull);
      });

      test('rejects a number that is too short for the chosen country', () {
        expect(AuthValidators.phoneNumber('98765', l10n, digits: 10), isNotNull);
      });

      test('accepts that same number where the country is shorter', () {
        expect(AuthValidators.phoneNumber('98765', l10n, digits: 5), isNull);
      });

      test('rejects a number carrying anything but digits', () {
        expect(AuthValidators.phoneNumber('98765 4321', l10n, digits: 10), isNotNull);
      });
    });

    group('otp', () {
      test('accepts a full code', () {
        expect(AuthValidators.otp('1234', l10n), isNull);
      });

      test('rejects a partial code', () {
        expect(AuthValidators.otp('12', l10n), isNotNull);
      });
    });

    group('name', () {
      test('accepts a plausible name', () {
        expect(AuthValidators.name('Dash', l10n), isNull);
      });

      test('rejects whitespace only', () {
        expect(AuthValidators.name('   ', l10n), isNotNull);
      });

      test('rejects a single character', () {
        expect(AuthValidators.name('D', l10n), isNotNull);
      });

      test('rejects a name past the maximum length', () {
        expect(AuthValidators.name('a' * (AuthValidators.nameMaxLength + 1), l10n), isNotNull);
      });
    });

    group('referralCode', () {
      test('accepts an empty value because the field is optional', () {
        expect(AuthValidators.referralCode('', l10n), isNull);
      });

      test('accepts an alphanumeric code', () {
        expect(AuthValidators.referralCode('CH8362', l10n), isNull);
      });

      test('rejects a code carrying punctuation', () {
        expect(AuthValidators.referralCode('CH-8362', l10n), isNotNull);
      });

      test('rejects a code that is too short', () {
        expect(AuthValidators.referralCode('CH', l10n), isNotNull);
      });
    });
  });
}
