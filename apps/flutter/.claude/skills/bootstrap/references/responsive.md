# Responsive: three window tiers

Copy these files exactly into `lib/core/responsive/`. Mobile and desktop are first-class, web is secondary, so the template uses three Material window-size tiers. Add `large` and `extraLarge` only when a project targets wide desktop layouts.

```
lib/core/responsive/
  responsive.dart              barrel
  window_size.dart             enum and thresholds
  responsive_extensions.dart   context.windowSize, context.responsive()
  content_container.dart       max-width wrapper
```

## `window_size.dart`

```dart
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
```

## `responsive_extensions.dart`

```dart
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
```

## `content_container.dart`

```dart
import 'package:flutter/widgets.dart';

///
/// Constrains content width on wide windows so pages do not stretch edge to
/// edge. Typical maxWidth: 560 for forms, 720 for reading, 1080 for general
/// content; dashboards pass double.infinity.
///
class ContentContainer extends StatelessWidget {
  const ContentContainer({
    required this.child,
    super.key,
    this.maxWidth = 1080,
    this.alignment = Alignment.topCenter,
  });

  final Widget child;
  final double maxWidth;
  final Alignment alignment;

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: alignment,
      child: ConstrainedBox(
        constraints: BoxConstraints(maxWidth: maxWidth),
        child: child,
      ),
    );
  }
}
```

## `responsive.dart`

```dart
export 'package:matinee/core/responsive/content_container.dart';
export 'package:matinee/core/responsive/responsive_extensions.dart';
export 'package:matinee/core/responsive/window_size.dart';
```

## How pages use it

Branch high, stay const low: decide layout once near the top of a page and keep the subtrees `const`.

```dart
@override
Widget build(BuildContext context) {
  return ContentContainer(
    child: Padding(
      padding: EdgeInsets.symmetric(
        horizontal: context.responsive(compact: AppSpacing.lg, expanded: AppSpacing.xxlg),
      ),
      child: context.isExpanded ? const _TwoPaneBody() : const _SinglePaneBody(),
    ),
  );
}
```

Grid column counts inside a panel use `LayoutBuilder` on the panel's own constraints, because next to a `NavigationRail` the window width is not the content width.
