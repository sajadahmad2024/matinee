import 'package:flutter/widgets.dart';
import 'package:intl/intl.dart';
import 'package:matinee/l10n/gen/app_localizations.dart';

extension AppLocalizationsX on BuildContext {
  AppLocalizations get l10n => AppLocalizations.of(this);

  ///
  /// For counters that are laid out rather than composed into a sentence, so a
  /// widget takes the digits already formatted. ARB messages format their own.
  ///
  NumberFormat get decimalFormat => NumberFormat.decimalPattern(Localizations.localeOf(this).toLanguageTag());
}
