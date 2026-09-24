import 'package:flutter/material.dart';
import 'package:hls_video_player/src/player/hls_control_tap.dart';
import 'package:hls_video_player/src/player/hls_engine_seek_bar.dart';
import 'package:hls_video_player/src/player/hls_player_controls.dart';
import 'package:hls_video_player/src/player/hls_player_port.dart';
import 'package:hls_video_player/src/player/hls_player_snapshot.dart';

/// Seek bar and timer pinned to the bottom of its box, inside the safe area.
///
/// The chrome embeds it by default; with `embedBottomBar: false` the pager
/// hands it to the host as `HlsReelSlot.bottomBar` to place above its own UI.
class HlsPlayerBottomBar extends StatelessWidget {
  /// Creates the bar for [port]. Paints nothing until duration is known.
  const HlsPlayerBottomBar({
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
  final HlsPlayerControls controls;

  @override
  Widget build(BuildContext context) {
    final HlsPlayerPort? live = port;
    if (live == null) {
      return const SizedBox.shrink();
    }
    return ValueListenableBuilder<HlsPlayerSnapshot>(
      valueListenable: live.snapshotListenable,
      builder: (BuildContext context, HlsPlayerSnapshot snapshot, _) {
        if (!snapshot.isInitialized || snapshot.duration <= Duration.zero) {
          return const SizedBox.shrink();
        }
        final bool seekBar = showSeekBar && controls.showSeekBar;
        final bool timer = controls.showTimer;
        final bool fullscreen =
            controls.showFullscreen && onToggleFullscreen != null;
        if (!seekBar && !timer && !fullscreen) {
          return const SizedBox.shrink();
        }
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
        return Align(
          alignment: Alignment.bottomCenter,
          child: SafeArea(
            top: false,
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              child: SizedBox(
                height: HlsPlayerControls.bottomBarHeight,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: <Widget>[
                    if (seekBar)
                      Expanded(
                        child: HlsEngineSeekBar(
                          snapshot: snapshot,
                          onSeek: onSeek,
                          track: controls.seekBarBuilder?.call(context, state),
                        ),
                      ),
                    if (seekBar && timer) const SizedBox(width: 8),
                    if (timer)
                      controls.timerBuilder?.call(context, state) ??
                          HlsEngineTimer(snapshot: snapshot),
                    if (fullscreen)
                      HlsControlTap(
                        label: isFullscreen
                            ? 'Exit full screen'
                            : 'Full screen',
                        onTap: onToggleFullscreen,
                        child:
                            controls.fullscreenBuilder?.call(context, state) ??
                            _DefaultFullscreenIcon(isFullscreen: isFullscreen),
                      ),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}

class _DefaultFullscreenIcon extends StatelessWidget {
  const _DefaultFullscreenIcon({required this.isFullscreen});

  final bool isFullscreen;

  @override
  Widget build(BuildContext context) {
    return SizedBox.square(
      dimension: HlsPlayerControls.bottomBarHeight,
      child: Icon(
        isFullscreen ? Icons.fullscreen_exit : Icons.fullscreen,
        color: Colors.white,
        size: 24,
        shadows: const <Shadow>[Shadow(blurRadius: 3)],
      ),
    );
  }
}
