import 'package:flutter/widgets.dart';

///
/// Corner radii: md for the CTA, inputs, card rows and OTP boxes, lg for cards,
/// sm for small buttons, pill for tags and badges, full for pills and avatars.
///
abstract final class AppRadius {
  static const double xs = 4;
  static const double sm = 8;
  static const double md = 12;
  static const double lg = 16;
  static const double pill = 20;
  static const double sheet = 24;
  static const double full = 9999;

  /// Bottom sheets and modals are rounded at the top only.
  static const BorderRadius sheetTop = BorderRadius.vertical(top: Radius.circular(sheet));
}
