import 'package:flutter/widgets.dart';

/// Makes a control's visual tappable, so builders only draw the control.
///
/// A tappable widget inside [child] wins the gesture, so builders that wire
/// their own button do not fire [onTap] twice. Null [onTap] ignores pointers.
class HlsControlTap extends StatelessWidget {
  /// Wraps [child] with the package action for one control.
  const HlsControlTap({
    required this.label,
    required this.onTap,
    required this.child,
    super.key,
  });

  /// Accessible name announced for the control.
  final String label;

  final VoidCallback? onTap;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final VoidCallback? action = onTap;
    if (action == null) {
      return IgnorePointer(child: child);
    }
    return Semantics(
      button: true,
      label: label,
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: action,
        child: child,
      ),
    );
  }
}
