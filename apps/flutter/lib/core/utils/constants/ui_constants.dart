import 'package:flutter/material.dart';

class UiConstants {
  // Spacing
  static const double spacingXs = 4.0;
  static const double spacingS = 8.0;
  static const double spacingM = 16.0;
  static const double spacingL = 24.0;
  static const double spacingXl = 32.0;

  // Border radius
  static const double radiusS = 4.0;
  static const double radiusM = 8.0;
  static const double radiusL = 16.0;
  static const double radiusXl = 24.0;

  // Common paddings
  static const EdgeInsets paddingAll = EdgeInsets.all(spacingM);
  static const EdgeInsets paddingHorizontal = EdgeInsets.symmetric(
    horizontal: spacingM,
  );
  static const EdgeInsets paddingVertical = EdgeInsets.symmetric(
    vertical: spacingM,
  );

  // Common sizes
  static const Size buttonSize = Size(double.infinity, 48);
  static const double iconSize = 24.0;
  static const double avatarSize = 40.0;
}
