import 'package:flutter/widgets.dart';
import 'package:intl/intl.dart';
import 'package:matinee/l10n/gen/app_localizations.dart';

extension AppLocalizationsX on BuildContext {
  AppLocalizations get l10n => AppLocalizations.of(this);

  ///
  /// For the counters that are laid out rather than composed into a sentence:
  /// a widget takes the digits already formatted, so it needs no locale of its
  /// own. Numbers inside an ARB message are formatted by the message itself.
  ///
  NumberFormat get decimalFormat => NumberFormat.decimalPattern(Localizations.localeOf(this).toLanguageTag());
}
