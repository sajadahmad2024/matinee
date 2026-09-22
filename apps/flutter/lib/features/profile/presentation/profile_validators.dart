import 'package:matinee/l10n/gen/app_localizations.dart';

///
/// The edit form's rules. Each returns null when the value passes and the
/// message to show when it does not.
///
abstract final class ProfileValidators {
  static const int nameMinLength = 2;
  static const int nameMaxLength = 50;

  static final RegExp _email = RegExp(r'^[\w.+-]+@[\w-]+\.[\w.-]+$');
  static final RegExp _phone = RegExp(r'^\+?[\d\s-]{8,18}$');

  static String? name(String value, AppLocalizations l10n) {
    final trimmed = value.trim();
    if (trimmed.length < nameMinLength || trimmed.length > nameMaxLength) {
      return l10n.editProfileNameError;
    }
    return null;
  }

  static String? email(String value, AppLocalizations l10n) {
    return _email.hasMatch(value.trim()) ? null : l10n.editProfileEmailError;
  }

  static String? phoneNumber(String value, AppLocalizations l10n) {
    return _phone.hasMatch(value.trim()) ? null : l10n.editProfilePhoneError;
  }
}
