import 'package:flutter/material.dart';
import 'package:matinee/core/theme/app_palette.dart';

///
/// The nine gradients of the design system, built once from the primitives.
/// Widgets reach them through `context.appColors` roles (overlay, progress,
/// segmented, pill, calendar); stops are never rewritten at a call site.
///
abstract final class AppGradients {
  /// Over a full-bleed video or poster on Home.
  static final LinearGradient heroScrim = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [
      AppPalette.goldCta.a10,
      AppPalette.surface.a30,
      AppPalette.surface.withValues(alpha: 0),
      AppPalette.surface.a40,
      AppPalette.surface.a85,
      AppPalette.surface,
    ],
    stops: const [0, 0.2, 0.4, 0.6, 0.85, 1],
  );

  /// Behind the top bar that floats over the Home video.
  static final LinearGradient topBarScrim = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [
      AppPalette.surface,
      AppPalette.surface.a50,
      AppPalette.surface.withValues(alpha: 0),
    ],
    stops: const [0, 0.52, 1],
  );

  /// Base layer over game and reward card images.
  static final LinearGradient gameCardScrim = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [AppPalette.surface.a90, AppPalette.surface.a25],
    stops: const [0.3, 1],
  );

  /// Painted on top of [gameCardScrim] so the card's top edge stays legible.
  static final LinearGradient gameCardScrimTop = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [AppPalette.surface.a60, AppPalette.surface.withValues(alpha: 0)],
    stops: const [0, 0.5],
  );

  /// Onboarding background wash, painted under [onboardingVignette].
  static final LinearGradient onboardingScrim = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [
      AppPalette.authSurface.a30,
      AppPalette.authSurface.a50,
      AppPalette.authSurface,
    ],
    stops: const [0, 0.33, 0.56],
  );

  static final RadialGradient onboardingVignette = RadialGradient(
    colors: [
      AppPalette.authSurface.withValues(alpha: 0),
      AppPalette.authSurface.a70,
    ],
    stops: const [0.4, 1],
  );

  /// Progress fills, level-2 calendar tiles, the gradient nav indicator.
  static const LinearGradient progressGold = LinearGradient(
    colors: [AppPalette.gold, AppPalette.yellow],
  );

  /// Segmented-control active item, badge discs, gradient CTA variant.
  static const LinearGradient goldSegment = LinearGradient(
    colors: [AppPalette.goldLight, AppPalette.gold],
  );

  /// The 1px stroke of the points pill.
  static const LinearGradient pointsPillStroke = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [AppPalette.goldCta, AppPalette.goldLevel1],
  );

  /// Fill of the hero total-points numeral.
  static const LinearGradient goldNumeral = LinearGradient(
    colors: [AppPalette.yellow, AppPalette.gold],
  );

  /// Header block behind P2P, Rewards and Badges.
  static const LinearGradient headerFade = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [AppPalette.surfaceCard, AppPalette.surface],
  );

  /// Full-screen splash background. The design ramps 12 stops into gold, but
  /// only the first fifth of that ramp falls inside an 800dp frame, so the
  /// visible band is normalised onto the three dark surface tokens.
  static const LinearGradient splashBg = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [AppPalette.surface, AppPalette.surfaceCard, AppPalette.surfaceRaised],
    stops: [0, 0.62, 1],
  );
}
