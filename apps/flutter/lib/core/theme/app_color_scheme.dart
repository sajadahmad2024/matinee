import 'package:flutter/material.dart';

///
/// Selectable colour schemes. Adding one is a new value plus a branch in each
/// switch; the compiler enforces exhaustiveness. Seeds come from the design's
/// primary colour; ColorScheme.fromSeed derives the other roles.
///
enum AppColorScheme {
  standard,
  forest,
  sunset;

  ColorScheme light() => ColorScheme.fromSeed(seedColor: _seed);

  ColorScheme dark() => ColorScheme.fromSeed(seedColor: _seed, brightness: Brightness.dark);

  Color get _seed => switch (this) {
    AppColorScheme.standard => const Color(0xFF0061A4),
    AppColorScheme.forest => const Color(0xFF2E7D32),
    AppColorScheme.sunset => const Color(0xFFE65100),
  };
}
