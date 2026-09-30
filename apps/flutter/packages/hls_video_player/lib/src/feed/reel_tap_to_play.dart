import 'package:flutter/widgets.dart';
import 'package:hls_video_player/src/feed/reel_feed_controller.dart';
import 'package:hls_video_player/src/feed/reel_feed_item.dart';

/// Toggles play when [child] is tapped, for the reel on screen only.
///
/// Buttons inside [child] still win their own taps.
class ReelTapToPlay extends StatelessWidget {
  const ReelTapToPlay({
    required this.reel,
    required this.child,
    this.semanticLabel,
    super.key,
  });

  final ReelHandle<ReelFeedItem> reel;
  final Widget child;

  /// Screen reader name for the toggle, e.g. "Play or pause". Without one
  /// the layer stays out of the semantics tree rather than add a nameless
  /// control.
  final String? semanticLabel;

  @override
  Widget build(BuildContext context) {
    final Widget layer = GestureDetector(
      behavior: HitTestBehavior.opaque,
      excludeFromSemantics: true,
      onTap: reel.togglePlay,
      child: child,
    );
    final String? label = semanticLabel;
    if (label == null) {
      return layer;
    }
    return Semantics(
      button: true,
      label: label,
      onTap: reel.togglePlay,
      child: layer,
    );
  }
}
