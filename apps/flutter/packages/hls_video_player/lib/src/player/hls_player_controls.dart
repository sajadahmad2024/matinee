import 'package:flutter/widgets.dart';
import 'package:hls_video_player/src/player/hls_engine_seek_bar.dart';
import 'package:hls_video_player/src/player/hls_player_snapshot.dart';

/// Live player state handed to control builders.
///
/// Builders draw only; the package wraps them with the tap and its action.
/// The actions stay here for builders that wire their own button.
class HlsControlsState {
  /// Creates a state for one build of the player chrome.
  const HlsControlsState({
    required this.snapshot,
    required this.isFocused,
    required this.playRequested,
    required this.muted,
    required this.onSeek,
    this.onTogglePlay,
    this.onToggleMute,
    this.onToggleFullscreen,
    this.isFullscreen = false,
  });

  /// Latest native player state. Builders rebuild on every snapshot tick.
  final HlsPlayerSnapshot snapshot;

  /// Whether this player is the focused reel.
  final bool isFocused;

  /// Last user play/pause intent for this reel.
  final bool playRequested;

  /// Shared mute state across all reels.
  final bool muted;

  /// Seeks the focused player. Ignored when not focused.
  final ValueChanged<Duration> onSeek;

  /// Null when tap-to-toggle is disabled or the player is not focused.
  final VoidCallback? onTogglePlay;

  /// Null when mute is not wired for this surface.
  final VoidCallback? onToggleMute;

  /// Enters or leaves fullscreen. Null when fullscreen is not wired.
  final VoidCallback? onToggleFullscreen;

  /// Whether this surface is the rotated fullscreen view.
  final bool isFullscreen;
}

/// Builds one control from [HlsControlsState]. Called on every snapshot tick.
typedef HlsControlBuilder =
    Widget Function(BuildContext context, HlsControlsState state);

/// Which package controls show, and optional builders that replace them.
///
/// Play/pause and mute sit at the video centre and show only while paused.
/// Seek bar and timer sit at the bottom of the player surface.
class HlsPlayerControls {
  /// Creates a controls configuration. Defaults show every control.
  const HlsPlayerControls({
    this.showPlayPause = true,
    this.showMute = true,
    this.showSeekBar = true,
    this.showTimer = true,
    this.showFullscreen = true,
    this.embedBottomBar = true,
    this.playPauseBuilder,
    this.muteBuilder,
    this.seekBarBuilder,
    this.timerBuilder,
    this.fullscreenBuilder,
  });

  /// Height the default bottom bar occupies above the bottom safe area.
  static const double bottomBarHeight = HlsEngineSeekBar.hitHeight;

  final bool showPlayPause;
  final bool showMute;
  final bool showSeekBar;
  final bool showTimer;

  /// Button after the timer that rotates the video into fullscreen and back.
  final bool showFullscreen;

  /// False moves seek bar and timer out of `slot.video` into
  /// `HlsReelSlot.bottomBar`, so the host can paint them above its overlays.
  final bool embedBottomBar;

  /// Visual for the paused play icon; the package toggles play on tap.
  final HlsControlBuilder? playPauseBuilder;

  /// Visual for the mute button above play; the package toggles mute on tap.
  final HlsControlBuilder? muteBuilder;

  /// Visual that fills the seek hit area; the package seeks to the tap point.
  final HlsControlBuilder? seekBarBuilder;

  /// Visual for the `m:ss / m:ss` label. Display only.
  final HlsControlBuilder? timerBuilder;

  /// Visual for the button after the timer; the package toggles fullscreen.
  final HlsControlBuilder? fullscreenBuilder;

  /// This configuration with the bar embedded, for the fullscreen view.
  HlsPlayerControls get embedded => HlsPlayerControls(
    showPlayPause: showPlayPause,
    showMute: showMute,
    showSeekBar: showSeekBar,
    showTimer: showTimer,
    showFullscreen: showFullscreen,
    playPauseBuilder: playPauseBuilder,
    muteBuilder: muteBuilder,
    seekBarBuilder: seekBarBuilder,
    timerBuilder: timerBuilder,
    fullscreenBuilder: fullscreenBuilder,
  );
}
