import 'package:flutter/widgets.dart';
import 'package:hls_video_player/src/feed/reel_feed_controller.dart';
import 'package:hls_video_player/src/feed/reel_playback_state.dart';
import 'package:hls_video_player/src/feed/reel_feed_item.dart';

/// Rebuilds [builder] whenever [reel]'s playback state changes.
///
/// Keep it close to the widget that needs the state; it runs on every player
/// tick.
///
/// ```dart
/// ReelStateBuilder(
///   reel: reel,
///   builder: (context, state) => Icon(state.isMuted ? Icons.volume_off : Icons.volume_up),
/// )
/// ```
class ReelStateBuilder extends StatelessWidget {
  const ReelStateBuilder({
    required this.reel,
    required this.builder,
    super.key,
  });

  final ReelHandle<ReelFeedItem> reel;
  final Widget Function(BuildContext context, ReelPlaybackState state) builder;

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<ReelPlaybackState>(
      valueListenable: reel.state,
      builder: (BuildContext context, ReelPlaybackState state, _) =>
          builder(context, state),
    );
  }
}
