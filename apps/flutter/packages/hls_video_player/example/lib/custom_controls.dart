import 'package:flutter/material.dart';
import 'package:hls_video_player/reels.dart';

/// Fully custom controls from the handle alone: no package controls at all.
///
/// Everything a control needs is on `reel` (commands) and `reel.state`
/// (live values), plus `reel.feed` for feed-wide actions like mute.
class CustomControls extends StatelessWidget {
  const CustomControls({required this.reel, super.key});

  final ReelHandle<ReelFeedItem> reel;

  @override
  Widget build(BuildContext context) {
    return ReelStateBuilder(
      reel: reel,
      builder: (BuildContext context, ReelPlaybackState state) => Stack(
        children: <Widget>[
          if (state.isLoading) const Center(child: CircularProgressIndicator()),
          if (state.status == ReelPlayerStatus.error)
            Center(
              child: TextButton(
                onPressed: reel.retry,
                child: const Text('Retry'),
              ),
            ),
          Positioned(
            right: 12,
            bottom: 96,
            child: Column(
              children: <Widget>[
                IconButton(
                  icon: Icon(
                    state.isPlayRequested ? Icons.pause : Icons.play_arrow,
                  ),
                  onPressed: reel.togglePlay,
                ),
                IconButton(
                  icon: Icon(
                    state.isMuted ? Icons.volume_off : Icons.volume_up,
                  ),
                  // Feed-wide mute; `reel.mutedOverride = false` unmutes only
                  // this reel.
                  onPressed: reel.feed.toggleMute,
                ),
                IconButton(
                  icon: const Icon(Icons.replay_10),
                  onPressed: () =>
                      reel.seekTo(state.position - const Duration(seconds: 10)),
                ),
                IconButton(
                  icon: const Icon(Icons.fullscreen),
                  onPressed: reel.feed.enterFullscreen,
                ),
              ],
            ),
          ),
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: LinearProgressIndicator(value: state.progress),
          ),
        ],
      ),
    );
  }
}

/// Using it: a custom page with only the video, gestures and your controls.
ReelItem<T> customItem<T extends ReelFeedItem>() {
  return ReelItem<T>.custom(
    page: (BuildContext context, ReelSlot<T> slot, ReelLayers<T> layers) =>
        Stack(
          fit: StackFit.expand,
          children: <Widget>[
            layers.video,
            layers.gestures,
            CustomControls(reel: slot.reel),
          ],
        ),
  );
}
