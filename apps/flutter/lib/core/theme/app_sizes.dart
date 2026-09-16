import 'package:flutter/widgets.dart';

abstract final class AppBorderWidth {
  static const double hairline = 1;
  static const double focus = 1.5;
  static const double emphasis = 2;
}

abstract final class AppIconSize {
  static const double xs = 12;
  static const double sm = 16;
  static const double md = 20;
  static const double lg = 24;
  static const double xl = 32;
}

abstract final class AppAvatarSize {
  static const double profile = 80;
  static const double cast = 52;
  static const double comment = 36;
  static const double badgeDiscSm = 40;
  static const double badgeDiscMd = 48;
  static const double badgeDiscLg = 56;
  static const double badgeDiscXl = 64;
  static const double ring = AppBorderWidth.hairline;
  static const double ringEmphasis = AppBorderWidth.emphasis;
}

///
/// Fixed heights the design draws for controls, rows and bars. Text containers
/// never take one of these; they size to their content.
///
abstract final class AppControlHeight {
  static const double cta = 52;
  static const double button = 32;
  static const double buttonMini = 28;
  static const double input = 52;
  static const double otpBox = 64;
  static const double chip = 32;
  static const double tag = 20;
  static const double badge = 20;
  static const double pill = 28;
  static const double appBarContent = 56;
  static const double appBarWithStatus = 104;
  static const double bottomNav = 64;
  static const double listRow = 54;
  static const double statCard = 72;
  static const double gameCard = 144;
  static const double progressBar = 4;

  /// The taller bar the design draws on a hero card and in the P2P header.
  static const double progressBarHero = 5;

  static const double progressBarThick = 6;

  static const Size sheetHandle = Size(40, 4);
  static const Size navIndicator = Size(16, 2);
}
