import 'package:flutter/widgets.dart';

///
/// Every gap, padding and margin in the app is one of these. A value that is
/// not on the scale is a design question, not a new constant.
///
abstract final class AppSpacing {
  static const double xxs = 2;
  static const double xs = 4;
  static const double sm = 8;
  static const double md = 12;
  static const double lg = 16;
  static const double xl = 20;
  static const double xxl = 24;
  static const double xxxl = 32;

  ///
  /// The clearance below the last element on a screen, home indicator included,
  /// off the design's full-height frames (CTA 42, Subscribe 46, legal line 32).
  ///
  /// Applied through `context.bottomInset`, never stacked on a bottom SafeArea.
  ///
  static const double screenBottom = 40;

  static const double sectionGap = lg;
  static const double cardGap = md;
  static const double listGap = sm;
  static const double chipGap = sm;
  static const double inlineGap = sm;
  static const double labelToField = sm;
  static const double statCardPadding = md;

  ///
  /// Cards are tighter vertically than horizontally by design, which is the one
  /// gap on the scale's own steps and off them.
  ///
  static const double cardPaddingVertical = 14;

  static const EdgeInsets cardPadding = EdgeInsets.symmetric(
    horizontal: lg,
    vertical: cardPaddingVertical,
  );

  ///
  /// Centres a value inside a 52-tall input. A minHeight alone leaves it high,
  /// so this pads to nearly 52 and lets minHeight cover the last pixel.
  ///
  static const EdgeInsets inputContent = EdgeInsets.symmetric(horizontal: lg, vertical: 14);

  static const EdgeInsets sheetContent = EdgeInsets.only(left: xl, right: xl, bottom: xxxl);

  static const EdgeInsets modalContent = EdgeInsets.only(top: sm, left: xxl, right: xxl, bottom: 40);
}

///
/// The side padding a screen body sits in. Auth, onboarding, sheets and modals
/// each have their own value; everything else is main.
///
abstract final class AppScreenPadding {
  static const double main = AppSpacing.lg;
  static const double auth = AppSpacing.xxl;
  static const double onboarding = AppSpacing.xl;
  static const double sheet = AppSpacing.xl;
  static const double modal = AppSpacing.xxl;
}
