import 'dart:math' as math;

import 'package:flutter/material.dart';

/// Extensions on BuildContext for easier access to common properties
extension BuildContextExtensions on BuildContext {
  /// Base width used for responsive calculations.
  ///
  /// This should match the logical width of your primary design device
  /// (for example, a common choice is 390 for modern iPhones).
  static const double _designWidth = 390;

  /// Base height used for responsive calculations.
  ///
  /// This should match the logical height of your primary design device
  /// (for example, a common choice is 844 for modern iPhones).
  static const double _designHeight = 844;

  /// Width breakpoint for switching from phone to tablet layouts.
  ///
  /// Values below this are considered phones.
  static const double _tabletBreakpoint = 600;

  /// Width breakpoint for switching from tablet to desktop/laptop layouts.
  ///
  /// Values equal to or above this are considered desktop/laptop.
  static const double _desktopBreakpoint = 1024;

  /// Get MediaQuery data
  MediaQueryData get mediaQuery => MediaQuery.of(this);

  /// Get screen size
  Size get screenSize => mediaQuery.size;

  /// Get screen width
  double get screenWidth => screenSize.width;

  /// Get screen height
  double get screenHeight => screenSize.height;

  /// Whether the current device/window should be treated as a phone.
  bool get isMobile => screenWidth < _tabletBreakpoint;

  /// Whether the current device/window should be treated as a tablet.
  bool get isTablet =>
      screenWidth >= _tabletBreakpoint && screenWidth < _desktopBreakpoint;

  /// Whether the current device/window should be treated as a desktop/laptop.
  bool get isDesktop => screenWidth >= _desktopBreakpoint;

  /// Scale factor based on screen width compared to the design width.
  double get widthScale => screenWidth / _designWidth;

  /// Scale factor based on screen height compared to the design height.
  double get heightScale => screenHeight / _designHeight;

  /// General scale factor based on the smallest dimension scale.
  ///
  /// This keeps the overall scale consistent across portrait/landscape
  /// and avoids overly large UI on very tall or wide devices.
  double get scale => math.min(widthScale, heightScale);

  /// Get device pixel ratio
  double get devicePixelRatio => mediaQuery.devicePixelRatio;

  /// Get text scale factor
  double get textScaleFactor => mediaQuery.textScaleFactor;

  /// Convert a design-time font size to a responsive font size.
  ///
  /// Pass the size from your design (e.g. 16) and this will return
  /// a value scaled for the current device.
  double scalableFont(double designFontSize) => designFontSize * scale;

  /// A device-type-aware scale factor for text.
  ///
  /// - Phones: use the base [scale] directly.
  /// - Tablets: slightly boost the scale, but keep it reasonable.
  /// - Desktops/laptops: keep text closer to design size to avoid
  ///   excessively large typography on very wide screens.
  double get deviceTextScale {
    final base = scale;

    if (isDesktop) {
      // Keep desktop/laptop text near the design size.
      return base.clamp(0.9, 1.1);
    }

    if (isTablet) {
      // Slightly larger text on tablets for readability.
      return base.clamp(1.0, 1.2);
    }

    // Phones: use the base scale with a gentle clamp.
    return base.clamp(0.9, 1.1);
  }

  /// Convert a design-time horizontal size (padding, width) to a
  /// responsive value based on screen width.
  double scalableWidth(double designWidth) => designWidth * widthScale;

  /// Convert a design-time vertical size (padding, height) to a
  /// responsive value based on screen height.
  double scalableHeight(double designHeight) => designHeight * heightScale;

  /// Get theme data
  ThemeData get theme => Theme.of(this);

  /// Get text theme
  TextTheme get textTheme => theme.textTheme;

  /// Get color scheme
  ColorScheme get colorScheme => theme.colorScheme;

  /// Get primary color
  Color get primaryColor => colorScheme.primary;

  /// Get secondary color
  Color get secondaryColor => colorScheme.secondary;

  /// Get background color
  Color get backgroundColor => colorScheme.background;

  /// Get surface color
  Color get surfaceColor => colorScheme.surface;

  /// Get error color
  Color get errorColor => colorScheme.error;

  /// Check if dark mode is enabled
  bool get isDarkMode => theme.brightness == Brightness.dark;

  /// Get bottom padding (safe area)
  double get bottomPadding => mediaQuery.padding.bottom;

  /// Get top padding (safe area)
  double get topPadding => mediaQuery.padding.top;

  /// Get keyboard height
  double get keyboardHeight => mediaQuery.viewInsets.bottom;

  /// Check if keyboard is visible
  bool get isKeyboardVisible => keyboardHeight > 0;

  /// Get orientation
  Orientation get orientation => mediaQuery.orientation;

  /// Check if portrait orientation
  bool get isPortrait => orientation == Orientation.portrait;

  /// Check if landscape orientation
  bool get isLandscape => orientation == Orientation.landscape;

  /// Show snackbar
  void showSnackBar(
    String message, {
    Duration duration = const Duration(seconds: 3),
    SnackBarAction? action,
  }) {
    ScaffoldMessenger.of(this).showSnackBar(
      SnackBar(content: Text(message), duration: duration, action: action),
    );
  }

  /// Show error snackbar
  void showErrorSnackBar(String message) {
    ScaffoldMessenger.of(this).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: errorColor,
        duration: const Duration(seconds: 3),
      ),
    );
  }

  /// Show success snackbar
  void showSuccessSnackBar(String message) {
    ScaffoldMessenger.of(this).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.green,
        duration: const Duration(seconds: 3),
      ),
    );
  }

  /// Hide keyboard
  void hideKeyboard() {
    FocusScope.of(this).unfocus();
  }

  /// Pop navigation
  void pop<T>([T? result]) {
    Navigator.of(this).pop(result);
  }

  /// Push navigation
  Future<T?> push<T>(Widget page) {
    return Navigator.of(this).push<T>(MaterialPageRoute(builder: (_) => page));
  }

  /// Push replacement
  Future<T?> pushReplacement<T>(Widget page) {
    return Navigator.of(
      this,
    ).pushReplacement<T, void>(MaterialPageRoute(builder: (_) => page));
  }

  /// Push and remove until
  Future<T?> pushAndRemoveUntil<T>(
    Widget page, {
    bool Function(Route<dynamic>)? predicate,
  }) {
    return Navigator.of(this).pushAndRemoveUntil<T>(
      MaterialPageRoute(builder: (_) => page),
      predicate ?? (route) => false,
    );
  }
}
