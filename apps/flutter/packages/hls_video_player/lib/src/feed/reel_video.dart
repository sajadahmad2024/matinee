import 'package:flutter/material.dart';
import 'package:hls_video_player/src/feed/reel_feed_controller.dart';
import 'package:hls_video_player/src/feed/reel_playback_state.dart';
import 'package:hls_video_player/src/player/hls_player_port.dart';
import 'package:hls_video_player/src/player/hls_player_view.dart';
import 'package:hls_video_player/src/feed/reel_feed_item.dart';

/// The video surface of one reel: the picture and a loader, no gestures.
///
/// Stack your own controls over it, or use `ReelTapToPlay` and
/// `ReelControls`. `reel.video` is shorthand for `ReelVideo(reel)`.
class ReelVideo extends StatelessWidget {
  const ReelVideo(
    this.reel, {
    this.fit = BoxFit.contain,
    this.placeholder,
    this.showBufferLoader = true,
    this.backgroundColor = Colors.black,
    super.key,
  });

  final ReelHandle<ReelFeedItem> reel;

  /// [BoxFit.contain] letterboxes; [BoxFit.cover] fills and crops.
  final BoxFit fit;

  /// Shown until the first frame, e.g. a thumbnail. Also shown for a reel
  /// with no player, such as a locked one.
  final Widget? placeholder;

  /// Spinner while the reel on screen is loading or stalled.
  final bool showBufferLoader;

  final Color backgroundColor;

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<ReelPlaybackState>(
      valueListenable: reel.state,
      builder: (BuildContext context, ReelPlaybackState state, _) {
        final HlsPlayerPort? port = reel.port;
        final bool waiting =
            port == null || state.status == ReelPlayerStatus.opening;
        final bool loader =
            showBufferLoader &&
            state.isFocused &&
            (state.isLoading || (port == null && reel.isPlayable));
        return ColoredBox(
          color: backgroundColor,
          child: Stack(
            fit: StackFit.expand,
            children: <Widget>[
              if (port != null) _fitted(HlsPlayerView(port: port), state),
              if (waiting && placeholder != null) placeholder!,
              if (loader)
                const Center(
                  child: IgnorePointer(
                    child: CircularProgressIndicator(color: Colors.white),
                  ),
                ),
            ],
          ),
        );
      },
    );
  }

  Widget _fitted(Widget view, ReelPlaybackState state) {
    if (fit == BoxFit.contain ||
        state.videoWidth <= 0 ||
        state.videoHeight <= 0) {
      return Center(
        child: AspectRatio(
          aspectRatio: state.aspectRatio <= 0 ? 9 / 16 : state.aspectRatio,
          child: view,
        ),
      );
    }
    return ClipRect(
      child: FittedBox(
        fit: fit,
        child: SizedBox(
          width: state.videoWidth,
          height: state.videoHeight,
          child: view,
        ),
      ),
    );
  }
}
