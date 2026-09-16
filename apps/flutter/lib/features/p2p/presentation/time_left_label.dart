import 'package:matinee/l10n/gen/app_localizations.dart';

///
/// How long is left, the way the design writes it: days and hours while there
/// is a day to go, hours and minutes below that.
///
String timeLeftLabel(AppLocalizations l10n, Duration remaining) {
  final left = remaining.isNegative ? Duration.zero : remaining;
  final span = left.inDays > 0
      ? l10n.questsTimeLeftDays(left.inDays, left.inHours % Duration.hoursPerDay)
      : l10n.questsTimeLeftHours(left.inHours, left.inMinutes % Duration.minutesPerHour);
  return l10n.questsTimeLeft(span);
}
