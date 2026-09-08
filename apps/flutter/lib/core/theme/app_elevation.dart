import 'package:flutter/material.dart';
import 'package:matinee/core/theme/app_palette.dart';

///
/// The design has no Material elevation: depth is a coloured glow around gold
/// controls plus one upward shadow under sheets.
///
abstract final class AppElevation {
  static final List<BoxShadow> glowCta = [
    BoxShadow(color: AppPalette.gold.a40, offset: const Offset(0, 6), blurRadius: 24),
  ];

  static final List<BoxShadow> glowFocus = [
    BoxShadow(color: AppPalette.gold.a20, blurRadius: 16),
  ];

  static final List<BoxShadow> glowNavIndicator = [
    BoxShadow(color: AppPalette.goldCta.a50, offset: const Offset(0, 1), blurRadius: 6),
  ];

  static final List<BoxShadow> glowCard = [
    BoxShadow(color: AppPalette.gold.a10, offset: const Offset(0, 4), blurRadius: 24),
  ];

  static final List<BoxShadow> glowSmallButton = [
    BoxShadow(color: AppPalette.gold.a10, offset: const Offset(0, 2), blurRadius: 8),
  ];

  static final List<BoxShadow> sheet = [
    BoxShadow(color: AppPalette.black.a60, offset: const Offset(0, -18), blurRadius: 28),
  ];

  /// Sigma for the blur behind sheets and overlays.
  static const double backdropBlur = 4;
}
