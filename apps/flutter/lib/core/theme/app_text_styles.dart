import 'package:flutter/material.dart';

///
/// The type scale: 18 UI roles and 7 Oswald numeral roles, in four bundled
/// families (DM Sans for UI, Poppins for the display voice, Inter for small
/// print, Oswald for numerals). Widgets read the Material roles from
/// `Theme.of(context).textTheme`; the four roles Material has no slot for
/// (cardTitle, caption, overline, navLabel) and the numerals are read from
/// here. Styles carry no colour: it comes from the ColorScheme or an
/// AppColors role at the call site.
///
/// Roles marked upper-case in the design (labelSmall, overline, navLabel) are
/// not transformed here — the caller supplies upper-case text.
///
abstract final class AppTextStyle {
  static const String _dmSans = 'DM Sans';
  static const String _poppins = 'Poppins';
  static const String _inter = 'Inter';
  static const String _oswald = 'Oswald';

  static const TextStyle displayLarge = TextStyle(
    fontFamily: _poppins,
    fontWeight: FontWeight.w700,
    fontSize: 34,
    height: 1.2,
  );

  static const TextStyle displaySmall = TextStyle(
    fontFamily: _dmSans,
    fontWeight: FontWeight.w800,
    fontSize: 30,
    height: 1.2,
  );

  static const TextStyle headlineLarge = TextStyle(
    fontFamily: _poppins,
    fontWeight: FontWeight.w700,
    fontSize: 26,
    height: 1.5,
  );

  static const TextStyle headlineMedium = TextStyle(
    fontFamily: _dmSans,
    fontWeight: FontWeight.w700,
    fontSize: 24,
    height: 1.3,
  );

  static const TextStyle headlineSmall = TextStyle(
    fontFamily: _poppins,
    fontWeight: FontWeight.w700,
    fontSize: 22,
    height: 1.5,
  );

  static const TextStyle titleLarge = TextStyle(
    fontFamily: _dmSans,
    fontWeight: FontWeight.w700,
    fontSize: 20,
    height: 1.5,
  );

  static const TextStyle titleMedium = TextStyle(
    fontFamily: _dmSans,
    fontWeight: FontWeight.w600,
    fontSize: 18,
    height: 1.3333,
  );

  /// Game and reward card titles set over images.
  static const TextStyle cardTitle = TextStyle(
    fontFamily: _dmSans,
    fontWeight: FontWeight.w900,
    fontSize: 18,
    height: 1.3333,
  );

  static const TextStyle titleSmall = TextStyle(
    fontFamily: _dmSans,
    fontWeight: FontWeight.w600,
    fontSize: 14,
    height: 1.5,
  );

  static const TextStyle bodyLarge = TextStyle(
    fontFamily: _dmSans,
    fontWeight: FontWeight.w400,
    fontSize: 15,
    height: 1.5,
  );

  static const TextStyle bodyMedium = TextStyle(
    fontFamily: _dmSans,
    fontWeight: FontWeight.w400,
    fontSize: 14,
    height: 1.5,
  );

  static const TextStyle bodySmall = TextStyle(
    fontFamily: _dmSans,
    fontWeight: FontWeight.w400,
    fontSize: 13,
    height: 1.5,
  );

  static const TextStyle labelLarge = TextStyle(
    fontFamily: _poppins,
    fontWeight: FontWeight.w600,
    fontSize: 15,
    height: 1.5,
    letterSpacing: 0.6,
  );

  static const TextStyle labelMedium = TextStyle(
    fontFamily: _dmSans,
    fontWeight: FontWeight.w700,
    fontSize: 12,
    height: 1.5,
  );

  static const TextStyle labelSmall = TextStyle(
    fontFamily: _dmSans,
    fontWeight: FontWeight.w700,
    fontSize: 10,
    height: 1.5,
    letterSpacing: 1,
  );

  /// Captions, meta, timestamps, units and subtitles over images.
  static const TextStyle caption = TextStyle(
    fontFamily: _inter,
    fontWeight: FontWeight.w400,
    fontSize: 11,
    height: 1.5,
  );

  /// Section eyebrows.
  static const TextStyle overline = TextStyle(
    fontFamily: _inter,
    fontWeight: FontWeight.w700,
    fontSize: 10,
    height: 1.5,
    letterSpacing: 1.2,
  );

  /// Bottom-nav labels: Bold when active, SemiBold when inactive.
  static const TextStyle navLabel = TextStyle(
    fontFamily: _dmSans,
    fontWeight: FontWeight.w700,
    fontSize: 10,
    height: 1.35,
    letterSpacing: 0.7,
  );

  static const TextStyle numeralDisplay = TextStyle(
    fontFamily: _oswald,
    fontWeight: FontWeight.w600,
    fontSize: 38,
    height: 1,
  );

  static const TextStyle numeralXl = TextStyle(
    fontFamily: _oswald,
    fontWeight: FontWeight.w600,
    fontSize: 34,
    height: 1,
  );

  static const TextStyle numeralLg = TextStyle(
    fontFamily: _oswald,
    fontWeight: FontWeight.w600,
    fontSize: 26,
    height: 1.5,
  );

  static const TextStyle numeralMd = TextStyle(
    fontFamily: _oswald,
    fontWeight: FontWeight.w600,
    fontSize: 20,
    height: 1.5,
  );

  static const TextStyle numeralSm = TextStyle(
    fontFamily: _oswald,
    fontWeight: FontWeight.w600,
    fontSize: 18,
    height: 1,
  );

  static const TextStyle numeralPill = TextStyle(
    fontFamily: _oswald,
    fontWeight: FontWeight.w700,
    fontSize: 14,
    height: 1,
  );

  static const TextStyle numeralAction = TextStyle(
    fontFamily: _oswald,
    fontWeight: FontWeight.w500,
    fontSize: 11,
    height: 1.5,
  );

  /// displayMedium has no design role and is left at the Material default; a
  /// screen that needs it is a design gap to confirm, not a style to invent.
  static const TextTheme textTheme = TextTheme(
    displayLarge: displayLarge,
    displaySmall: displaySmall,
    headlineLarge: headlineLarge,
    headlineMedium: headlineMedium,
    headlineSmall: headlineSmall,
    titleLarge: titleLarge,
    titleMedium: titleMedium,
    titleSmall: titleSmall,
    bodyLarge: bodyLarge,
    bodyMedium: bodyMedium,
    bodySmall: bodySmall,
    labelLarge: labelLarge,
    labelMedium: labelMedium,
    labelSmall: labelSmall,
  );
}
