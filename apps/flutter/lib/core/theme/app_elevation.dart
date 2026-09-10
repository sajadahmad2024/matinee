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

  ///
  /// The focus glow in the error colour. The design draws no input error state,
  /// so this reuses the focus geometry rather than inventing a shape.
  ///
  static final List<BoxShadow> glowError = [
    BoxShadow(color: AppPalette.error.a20, blurRadius: 16),
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

  ///
  /// Cast upward from the auction bid bar. It sits over content, not the screen
  /// background, so it needs the gold glow that [sheet] would swallow.
  ///
  static final List<BoxShadow> glowBidBar = [
    BoxShadow(color: AppPalette.gold.a20, offset: const Offset(0, -3), blurRadius: 30),
  ];

  static final List<BoxShadow> sheet = [
    BoxShadow(color: AppPalette.black.a60, offset: const Offset(0, -18), blurRadius: 28),
  ];

  /// Sigma for the blur behind sheets and overlays.
  static const double backdropBlur = 4;
}
