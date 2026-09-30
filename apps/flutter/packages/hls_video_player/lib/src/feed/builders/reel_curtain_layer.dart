import 'dart:async';

import 'package:flutter/widgets.dart';
import 'package:hls_video_player/src/feed/builders/reel_slot.dart';
import 'package:meta/meta.dart';
import 'package:hls_video_player/src/feed/reel_feed_item.dart';

/// Holds the curtain of a locked reel and turns an overscroll past its own
/// scroll edge into a page change, so a scrollable curtain never traps the
/// feed.
@internal
class ReelCurtainLayer extends StatefulWidget {
  const ReelCurtainLayer({required this.slot, required this.child, super.key});

  final ReelSlot<ReelFeedItem> slot;
  final Widget child;

  /// How far a drag has to overscroll before it counts as a swipe.
  static const double swipeThreshold = 60;

  @override
  State<ReelCurtainLayer> createState() => _ReelCurtainLayerState();
}

class _ReelCurtainLayerState extends State<ReelCurtainLayer> {
  double _overscroll = 0;

  bool _onScroll(ScrollNotification notification) {
    // A horizontal carousel inside the curtain must not change the page.
    if (notification.metrics.axis != Axis.vertical) {
      return false;
    }
    if (notification is ScrollStartNotification) {
      _overscroll = 0;
    } else if (notification is OverscrollNotification) {
      _overscroll += notification.overscroll;
    } else if (notification is ScrollEndNotification) {
      if (_overscroll > ReelCurtainLayer.swipeThreshold) {
        unawaited(widget.slot.feed.next());
      } else if (_overscroll < -ReelCurtainLayer.swipeThreshold) {
        unawaited(widget.slot.feed.previous());
      }
      _overscroll = 0;
    }
    // Keeps bubbling, so the curtain's own bounce still renders.
    return false;
  }

  @override
  Widget build(BuildContext context) {
    return NotificationListener<ScrollNotification>(
      onNotification: _onScroll,
      child: widget.child,
    );
  }
}
