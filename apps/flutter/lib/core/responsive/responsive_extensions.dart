import 'dart:math' as math;

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
  /// The clearance the last element on a screen needs above the bottom edge.
  ///
  /// The design's frames are the whole device screen and draw no separate home
  /// indicator, so the gap one leaves under a CTA already contains it. Wrapping
  /// the screen in a bottom SafeArea *and* keeping that gap stacks the two and
  /// lifts the content well off the bottom. A screen passes the design's gap
  /// here instead and drops `bottom` from its SafeArea: on a device with an
  /// indicator the inset wins when it is the larger of the two, and on one
  /// without, the design's gap still applies.
  ///
  /// Reads `padding`, not `viewPadding`, so an open keyboard — which consumes
  /// the inset itself — leaves only the design's gap.
  ///
  double bottomInset(double designGap) => math.max(designGap, MediaQuery.paddingOf(this).bottom);

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
