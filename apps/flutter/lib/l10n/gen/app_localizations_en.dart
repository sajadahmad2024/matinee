// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get appTitle => 'Matinee';

  @override
  String get homePlaceholder => 'Replace this screen with the first feature.';

  @override
  String get retry => 'Retry';

  @override
  String get goHome => 'Go to home';

  @override
  String get startupFailed => 'The app could not start. Check your connection and try again.';

  @override
  String pageNotFound(String path) {
    return 'There is nothing at $path.';
  }

  @override
  String get errorNetwork => 'You appear to be offline. Check your connection and try again.';

  @override
  String get errorCancelled => 'The request was cancelled.';

  @override
  String get errorAuth => 'You need to sign in again.';

  @override
  String get errorNotFound => 'We could not find what you were looking for.';

  @override
  String get errorValidation => 'Some of the information provided was not accepted.';

  @override
  String get errorServer => 'Something went wrong on our side. Please try again later.';
}
