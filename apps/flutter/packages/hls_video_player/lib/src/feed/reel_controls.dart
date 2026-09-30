import 'package:flutter/material.dart';
import 'package:hls_video_player/src/feed/builders/reel_control_pieces.dart';
import 'package:hls_video_player/src/feed/reel_feed_controller.dart';
import 'package:hls_video_player/src/feed/reel_playback_state.dart';
import 'package:hls_video_player/src/player/hls_control_tap.dart';
import 'package:hls_video_player/src/player/hls_player_bottom_bar.dart';
import 'package:hls_video_player/src/player/hls_player_controls.dart';
import 'package:hls_video_player/src/feed/reel_feed_item.dart';

/// The package's default controls for one reel, built only on the public
/// `ReelHandle` API.
///
/// Play and mute sit at the centre while paused; seek bar, timer and
/// fullscreen sit at the bottom. Hide any of them, or replace their visuals,
/// with [controls]. Place it over `reel.video`, filling the page.
class ReelControls extends StatelessWidget {
  const ReelControls({
    required this.reel,
    this.controls = const HlsPlayerControls(),
    this.isFullscreen = false,
    super.key,
  });

  final ReelHandle<ReelFeedItem> reel;

  /// Which controls show, and builders that replace their visuals.
  final HlsPlayerControls controls;

  /// True inside the fullscreen view, so the button shows "exit".
  final bool isFullscreen;

  /// Room the bottom bar takes above the bottom safe area; keep your own UI
  /// above it.
  static const double bottomBarHeight = HlsPlayerControls.bottomBarHeight;

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<ReelPlaybackState>(
      valueListenable: reel.state,
      builder: (BuildContext context, ReelPlaybackState state, _) {
        final bool focused = state.isFocused;
        final ReelFeedController<ReelFeedItem> feed = reel.feed;
        return Stack(
          fit: StackFit.expand,
          children: <Widget>[
            if (focused && !state.isPlayRequested)
              _PausedControls(reel: reel, state: state, controls: controls),
            HlsPlayerBottomBar(
              port: reel.port,
              isFocused: focused,
              playRequested: state.isPlayRequested,
              muted: state.isMuted,
              onSeek: (Duration position) {
                if (focused) {
                  reel.seekTo(position);
                }
              },
              onTogglePlay: focused ? reel.togglePlay : null,
              onToggleMute: focused ? reel.toggleMute : null,
              onToggleFullscreen: focused ? feed.toggleFullscreen : null,
              isFullscreen: isFullscreen,
              showSeekBar: controls.showSeekBar,
              controls: controls,
            ),
          ],
        );
      },
    );
  }
}

class _PausedControls extends StatelessWidget {
  const _PausedControls({
    required this.reel,
    required this.state,
    required this.controls,
  });

  final ReelHandle<ReelFeedItem> reel;
  final ReelPlaybackState state;
  final HlsPlayerControls controls;

  @override
  Widget build(BuildContext context) {
    final ReelFeedController<ReelFeedItem> feed = reel.feed;
    final HlsControlsState builderState = HlsControlsState(
      snapshot: snapshotOf(state),
      isFocused: state.isFocused,
      playRequested: state.isPlayRequested,
      muted: state.isMuted,
      onSeek: (Duration position) => reel.seekTo(position),
      onTogglePlay: reel.togglePlay,
      onToggleMute: reel.toggleMute,
      onToggleFullscreen: feed.toggleFullscreen,
    );
    // Play stays at the exact centre with mute above it; empty space does not
    // hit-test, so taps there still reach the layer below.
    return Column(
      children: <Widget>[
        Expanded(
          child: Align(
            alignment: Alignment.bottomCenter,
            child: controls.showMute
                ? Padding(
                    padding: const EdgeInsets.only(bottom: 16),
                    child: HlsControlTap(
                      label: state.isMuted ? 'Unmute' : 'Mute',
                      onTap: reel.toggleMute,
                      child:
                          controls.muteBuilder?.call(context, builderState) ??
                          ReelRoundIcon(
                            icon: state.isMuted
                                ? Icons.volume_off
                                : Icons.volume_up,
                            size: 28,
                            padding: 12,
                          ),
                    ),
                  )
                : null,
          ),
        ),
        if (controls.showPlayPause)
          HlsControlTap(
            label: 'Play',
            onTap: reel.togglePlay,
            child:
                controls.playPauseBuilder?.call(context, builderState) ??
                const ReelRoundIcon(
                  icon: Icons.play_arrow,
                  size: 48,
                  padding: 16,
                ),
          ),
        const Expanded(child: SizedBox.shrink()),
      ],
    );
  }
}
