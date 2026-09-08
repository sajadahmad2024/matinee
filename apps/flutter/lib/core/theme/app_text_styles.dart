import 'package:flutter/material.dart';

///
/// The TextTheme roles the app overrides. fontFamily is set once here when the
/// design specifies a font; widgets only ever read Theme.of(context).textTheme.
///
abstract final class AppTextStyle {
  static const _base = TextStyle(fontWeight: FontWeight.w400);

  static final TextStyle displayLarge = _base.copyWith(fontSize: 57, height: 1.12);
  static final TextStyle headlineMedium = _base.copyWith(fontSize: 28, height: 1.29);
  static final TextStyle titleLarge = _base.copyWith(fontSize: 20, height: 1.3, fontWeight: FontWeight.w500);
  static final TextStyle bodyLarge = _base.copyWith(fontSize: 16, height: 1.5);
  static final TextStyle labelLarge = _base.copyWith(fontSize: 14, height: 1.43, fontWeight: FontWeight.w500);
}
