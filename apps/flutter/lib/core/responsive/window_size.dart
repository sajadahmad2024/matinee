///
/// Material 3 window size classes. Layout decisions switch on these, never on
/// the platform or device type: a tablet in split view is a compact window.
///
enum WindowSize {
  compact,
  medium,
  expanded,
}

///
/// The only breakpoint numbers in the app. Every responsive decision flows
/// through fromWidth so a change here propagates everywhere.
///
abstract final class Breakpoints {
  static const double medium = 600;
  static const double expanded = 840;

  static WindowSize fromWidth(double width) {
    if (width >= expanded) {
      return WindowSize.expanded;
    }
    if (width >= medium) {
      return WindowSize.medium;
    }
    return WindowSize.compact;
  }
}
