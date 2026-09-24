import 'package:material_ui/material_ui.dart';

///
/// Turns a drag that overscrolls past [child]'s own scroll bounds into a
/// swipe-through gesture.
///
/// While [child] can still scroll, the drag scrolls it normally and neither
/// callback fires; only the drag past its edge counts, so the two never compete.
///
class SwipeThroughOverscroll extends StatefulWidget {
  const SwipeThroughOverscroll({
    required this.onSwipeForward,
    required this.onSwipeBackward,
    required this.child,
    super.key,
  });

  /// The drag overscrolled past the threshold in the forward direction —
  /// content pulled up, the same motion as swiping to the next page.
  final VoidCallback onSwipeForward;

  /// The same gesture in the opposite direction.
  final VoidCallback onSwipeBackward;

  final Widget child;

  @override
  State<SwipeThroughOverscroll> createState() => _SwipeThroughOverscrollState();
}

class _SwipeThroughOverscrollState extends State<SwipeThroughOverscroll> {
  /// How far a drag has to overscroll past the child's own bounds before it
  /// counts as a swipe rather than noise.
  static const double _threshold = 60;

  double _overscroll = 0;

  bool _handleNotification(ScrollNotification notification) {
    if (notification is ScrollStartNotification) {
      _overscroll = 0;
    } else if (notification is OverscrollNotification) {
      _overscroll += notification.overscroll;
    } else if (notification is ScrollEndNotification) {
      if (_overscroll > _threshold) {
        widget.onSwipeForward();
      } else if (_overscroll < -_threshold) {
        widget.onSwipeBackward();
      }
      _overscroll = 0;
    }
    // Keeps bubbling, so the scroll view's own bounce still renders.
    return false;
  }

  @override
  Widget build(BuildContext context) {
    return NotificationListener<ScrollNotification>(
      onNotification: _handleNotification,
      child: widget.child,
    );
  }
}
