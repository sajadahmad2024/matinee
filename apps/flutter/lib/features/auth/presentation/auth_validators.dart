import 'package:matinee/l10n/gen/app_localizations.dart';

///
/// The rules the mocked API would otherwise enforce. Each returns null when
/// the value is acceptable and a localised message when it is not, so the same
/// function drives both the field's error text and whether the CTA is enabled.
///
abstract final class AuthValidators {
  static const int otpLength = 4;
  static const int nameMinLength = 2;
  static const int nameMaxLength = 50;
  static const int referralCodeMinLength = 4;
  static const int referralCodeMaxLength = 12;

  static final RegExp _digits = RegExp(r'^\d+$');
  static final RegExp _referralCode = RegExp(r'^[A-Za-z0-9]+$');

  ///
  /// [digits] is the subscriber-number length of the chosen country, so the
  /// rule follows the dialling code rather than assuming one market.
  ///
  static String? phoneNumber(String value, AppLocalizations l10n, {required int digits}) {
    final trimmed = value.trim();
    if (trimmed.isEmpty) {
      return l10n.authPhoneRequired;
    }
    if (!_digits.hasMatch(trimmed) || trimmed.length != digits) {
      return l10n.authPhoneInvalid(digits);
    }
    return null;
  }

  static String? otp(String value, AppLocalizations l10n) {
    if (value.length != otpLength || !_digits.hasMatch(value)) {
      return l10n.authOtpIncomplete(otpLength);
    }
    return null;
  }

  static String? name(String value, AppLocalizations l10n) {
    final trimmed = value.trim();
    if (trimmed.isEmpty) {
      return l10n.authNameRequired;
    }
    if (trimmed.length < nameMinLength) {
      return l10n.authNameTooShort(nameMinLength);
    }
    if (trimmed.length > nameMaxLength) {
      return l10n.authNameTooLong(nameMaxLength);
    }
    return null;
  }

  ///
  /// The referral code is optional, so an empty field is valid; anything typed
  /// still has to look like a code.
  ///
  static String? referralCode(String value, AppLocalizations l10n) {
    final trimmed = value.trim();
    if (trimmed.isEmpty) {
      return null;
    }
    if (!_referralCode.hasMatch(trimmed) ||
        trimmed.length < referralCodeMinLength ||
        trimmed.length > referralCodeMaxLength) {
      return l10n.authReferralCodeInvalid;
    }
    return null;
  }
}
