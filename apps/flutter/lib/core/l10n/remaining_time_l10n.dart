import 'package:matinee/l10n/gen/app_localizations.dart';

extension RemainingTimeL10n on AppLocalizations {
  ///
  /// A countdown in words, for a screen reader that reads a clock face as three
  /// numbers. To the minute, so it is not re-read every second.
  ///
  String spokenRemaining(Duration remaining) => switch (remaining) {
    // The last minute is worded, because rounding would announce zero.
    Duration(inMinutes: < 1) => auctionTimeRemainingUnderMinute,
    Duration(inHours: 0, inMinutes: final minutes) => auctionTimeRemainingMinutes(minutes),
    Duration(inHours: final hours, inMinutes: final minutes) => auctionTimeRemainingValue(
      hours,
      minutes % Duration.minutesPerHour,
    ),
  };
}
