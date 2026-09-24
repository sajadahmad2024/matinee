import 'package:flutter/material.dart';
import 'package:hls_video_player/src/player/hls_control_tap.dart';
import 'package:hls_video_player/src/player/hls_player_bottom_bar.dart';
import 'package:hls_video_player/src/player/hls_player_controls.dart';
import 'package:hls_video_player/src/player/hls_player_port.dart';
import 'package:hls_video_player/src/player/hls_player_snapshot.dart';
import 'package:hls_video_player/src/player/hls_player_view.dart';

/// Standard package video surface shared by single player and pager.
class HlsPlayerChrome extends StatelessWidget {
  const HlsPlayerChrome({
    required this.port,
    required this.isFocused,
    required this.playRequested,
    required this.onSeek,
    this.muted = true,
    this.onTogglePlay,
    this.onToggleMute,
    this.onToggleFullscreen,
    this.isFullscreen = false,
    this.showSeekBar = true,
    this.showBufferLoader = true,
    this.controls = const HlsPlayerControls(),
    super.key,
  });

  final HlsPlayerPort? port;
  final bool isFocused;
  final bool playRequested;
  final bool muted;
  final ValueChanged<Duration> onSeek;
  final VoidCallback? onTogglePlay;
  final VoidCallback? onToggleMute;
  final VoidCallback? onToggleFullscreen;
  final bool isFullscreen;
  final bool showSeekBar;
  final bool showBufferLoader;
  final HlsPlayerControls controls;

  @override
  Widget build(BuildContext context) {
    final HlsPlayerPort? live = port;
    if (live == null) {
      return ColoredBox(
        color: Colors.black,
        child: Center(
          child: showBufferLoader && isFocused
              ? const CircularProgressIndicator(color: Colors.white)
              : const SizedBox.shrink(),
        ),
      );
    }
    return ValueListenableBuilder<HlsPlayerSnapshot>(
      valueListenable: live.snapshotListenable,
      builder: (BuildContext context, HlsPlayerSnapshot snapshot, _) {
        final HlsControlsState state = HlsControlsState(
          snapshot: snapshot,
          isFocused: isFocused,
          playRequested: playRequested,
          muted: muted,
          onSeek: onSeek,
          onTogglePlay: onTogglePlay,
          onToggleMute: onToggleMute,
          onToggleFullscreen: onToggleFullscreen,
          isFullscreen: isFullscreen,
        );
        return ColoredBox(
          color: Colors.black,
          child: Stack(
            fit: StackFit.expand,
            children: <Widget>[
              Center(
                child: AspectRatio(
                  aspectRatio: snapshot.aspectRatio == 0
                      ? 9 / 16
                      : snapshot.aspectRatio,
                  child: Stack(
                    alignment: Alignment.center,
                    children: <Widget>[
                      HlsPlayerView(port: live),
                      if (isFocused && onTogglePlay != null)
                        Positioned.fill(
                          child: GestureDetector(
                            behavior: HitTestBehavior.translucent,
                            onTap: onTogglePlay,
                          ),
                        ),
                      if (isFocused &&
                          showBufferLoader &&
                          (!snapshot.isInitialized || snapshot.isBuffering))
                        const IgnorePointer(
                          child: CircularProgressIndicator(color: Colors.white),
                        ),
                    ],
                  ),
                ),
              ),
              // Page-level so a letterboxed video still has room above centre.
              if (isFocused && !playRequested) _pausedControls(context, state),
              if (controls.embedBottomBar)
                HlsPlayerBottomBar(
                  port: live,
                  isFocused: isFocused,
                  playRequested: playRequested,
                  muted: muted,
                  onSeek: onSeek,
                  onTogglePlay: onTogglePlay,
                  onToggleMute: onToggleMute,
                  onToggleFullscreen: onToggleFullscreen,
                  isFullscreen: isFullscreen,
                  showSeekBar: showSeekBar,
                  controls: controls,
                ),
            ],
          ),
        );
      },
    );
  }

  // Play stays at the exact centre; mute sits directly above it. Empty space
  // does not hit-test, so taps there still reach the tap-to-toggle layer.
  Widget _pausedControls(BuildContext context, HlsControlsState state) {
    final bool showMute = controls.showMute && onToggleMute != null;
    return Column(
      children: <Widget>[
        Expanded(
          child: Align(
            alignment: Alignment.bottomCenter,
            child: showMute
                ? Padding(
                    padding: const EdgeInsets.only(bottom: 16),
                    child: HlsControlTap(
                      label: muted ? 'Unmute' : 'Mute',
                      onTap: onToggleMute,
                      child:
                          controls.muteBuilder?.call(context, state) ??
                          _DefaultMuteIcon(muted: muted),
                    ),
                  )
                : null,
          ),
        ),
        if (controls.showPlayPause)
          HlsControlTap(
            label: 'Play',
            onTap: onTogglePlay,
            child:
                controls.playPauseBuilder?.call(context, state) ??
                const _DefaultPlayIcon(),
          ),
        const Expanded(child: SizedBox.shrink()),
      ],
    );
  }
}

class _DefaultPlayIcon extends StatelessWidget {
  const _DefaultPlayIcon();

  @override
  Widget build(BuildContext context) {
    return const DecoratedBox(
      decoration: BoxDecoration(
        color: Color(0x88000000),
        shape: BoxShape.circle,
      ),
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Icon(Icons.play_arrow, color: Colors.white, size: 48),
      ),
    );
  }
}

class _DefaultMuteIcon extends StatelessWidget {
  const _DefaultMuteIcon({required this.muted});

  final bool muted;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: const BoxDecoration(
        color: Color(0x88000000),
        shape: BoxShape.circle,
      ),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Icon(
          muted ? Icons.volume_off : Icons.volume_up,
          color: Colors.white,
          size: 28,
        ),
      ),
    );
  }
}
