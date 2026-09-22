import 'package:flutter/material.dart';
import 'package:matinee/core/theme/app_palette.dart';

///
/// The one ColorScheme of the app; the design is dark-only, so there is no
/// light scheme. Roles it never drew stay as fromSeed derives them from gold.
///
abstract final class AppColorScheme {
  static final ColorScheme dark =
      ColorScheme.fromSeed(
        seedColor: AppPalette.gold,
        brightness: Brightness.dark,
      ).copyWith(
        primary: AppPalette.goldCta,
        onPrimary: AppPalette.surface,
        primaryContainer: AppPalette.gold.a10,
        onPrimaryContainer: AppPalette.gold,
        secondary: AppPalette.gold,
        onSecondary: AppPalette.surface,
        secondaryContainer: AppPalette.surfaceRaised,
        onSecondaryContainer: AppPalette.textSecondary,
        tertiary: AppPalette.yellow,
        onTertiary: AppPalette.surface,
        tertiaryContainer: AppPalette.yellow.a10,
        onTertiaryContainer: AppPalette.yellow,
        error: AppPalette.error,
        onError: AppPalette.white,
        errorContainer: AppPalette.error.a10,
        onErrorContainer: AppPalette.error,
        surface: AppPalette.surface,
        onSurface: AppPalette.white,
        onSurfaceVariant: AppPalette.textSecondary,
        surfaceContainerLow: AppPalette.surface,
        surfaceContainer: AppPalette.surfaceCard,
        surfaceContainerHigh: AppPalette.surfaceRaised,
        surfaceContainerHighest: AppPalette.surfaceRaised,
        outline: AppPalette.outline,
        outlineVariant: AppPalette.outline,
        scrim: AppPalette.surface.a80,
        shadow: AppPalette.black,
        surfaceTint: AppPalette.gold,
      );
}
