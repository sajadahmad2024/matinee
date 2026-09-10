import 'package:flutter/material.dart';

///
/// The 27 colour primitives of the design system. Only the theme reads these;
/// a hex that is not here does not exist in the app.
///
abstract final class AppPalette {
  static const Color surface = Color(0xFF0C0F16);
  static const Color surfaceCard = Color(0xFF13171F);
  static const Color surfaceRaised = Color(0xFF1A1F2B);
  static const Color outline = Color(0xFF1F2535);
  static const Color navBar = Color(0xFF0D1C25);
  static const Color navBarOutline = Color(0xFF112532);
  static const Color navInactive = Color(0xFF67899E);
  static const Color pointsPillBg = Color(0xFF0F2D44);
  static const Color authSurface = Color(0xFF0D0B08);
  static const Color authContainer = Color(0xFF141008);
  static const Color authOutline = Color(0xFF2A2018);
  static const Color white = Color(0xFFFFFFFF);
  static const Color textSecondary = Color(0xFF8FA0B3);
  static const Color textMuted = Color(0xFF7A93AB);
  static const Color textDisabled = Color(0xFF4A5568);
  static const Color authTextSecondary = Color(0xFFA8998A);
  static const Color authTextMuted = Color(0xFF7A6A58);
  static const Color gold = Color(0xFFC9A24B);
  static const Color goldCta = Color(0xFFFFDC78);
  static const Color goldLight = Color(0xFFE6CB86);
  static const Color goldDeep = Color(0xFFB99C48);
  static const Color goldLevel1 = Color(0xFFA8874A);
  static const Color yellow = Color(0xFFFFD700);
  static const Color success = Color(0xFF2ECC71);
  static const Color error = Color(0xFFEB5757);

  /// `error` taken down until white body text on it clears 4.5:1; the frame's
  /// own red carries the 10pt LIVE label at only 3.5:1.
  static const Color errorDeep = Color(0xFFC43A3A);
  static const Color black = Color(0xFF000000);
}

///
/// Third-party brand colours. They belong to the services they stand for, not
/// to the theme, so they take no part in the alpha scale and never change.
///
abstract final class AppBrandColors {
  static const Color whatsapp = Color(0xFF25D366);
  static const Color telegram = Color(0xFF0088CC);
  static const Color instagram = Color(0xFFE1306C);
  static const Color messages = Color(0xFF34B7F1);
  static const Color twitter = Color(0xFF1DA1F2);
  static const Color googleBlue = Color(0xFF4285F4);
  static const Color googleGreen = Color(0xFF34A853);
  static const Color googleYellow = Color(0xFFFBBC05);
  static const Color googleRed = Color(0xFFEA4335);
}

///
/// Opacity is applied in 10% steps, never as a new hex: `{gold@30%}` is
/// `AppPalette.gold.a30`. The 25% and 85% steps carry stops off that grid.
///
extension AppAlpha on Color {
  Color get a10 => withValues(alpha: 0.10);

  Color get a20 => withValues(alpha: 0.20);

  Color get a25 => withValues(alpha: 0.25);

  Color get a30 => withValues(alpha: 0.30);

  Color get a40 => withValues(alpha: 0.40);

  Color get a50 => withValues(alpha: 0.50);

  Color get a60 => withValues(alpha: 0.60);

  Color get a70 => withValues(alpha: 0.70);

  Color get a80 => withValues(alpha: 0.80);

  Color get a85 => withValues(alpha: 0.85);

  Color get a90 => withValues(alpha: 0.90);
}
