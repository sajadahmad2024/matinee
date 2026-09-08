import 'package:flutter/widgets.dart';
import 'package:matinee/core/responsive/window_size.dart';

///
/// Uses MediaQuery.sizeOf, which rebuilds only on size changes, not on every
/// MediaQuery change such as the keyboard appearing.
///
extension ResponsiveContext on BuildContext {
  WindowSize get windowSize => Breakpoints.fromWidth(MediaQuery.sizeOf(this).width);

  bool get isCompact => windowSize == WindowSize.compact;

  bool get isMedium => windowSize == WindowSize.medium;

  // Expanded means expanded or wider, so a two-way branch is isExpanded / else.
  bool get isExpanded => windowSize == WindowSize.expanded;

  ///
  /// Picks a value per tier. Only compact is required; missing tiers fall back
  /// to the nearest smaller one, so define only the tiers that differ.
  ///
  T responsive<T>({required T compact, T? medium, T? expanded}) {
    return switch (windowSize) {
      WindowSize.expanded => expanded ?? medium ?? compact,
      WindowSize.medium => medium ?? compact,
      WindowSize.compact => compact,
    };
  }
}
