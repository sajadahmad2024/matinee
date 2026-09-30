import 'package:flutter/material.dart';
import 'package:hls_video_player/src/feed/builders/reel_labels.dart';
import 'package:hls_video_player/src/feed/builders/reel_slot.dart';
import 'package:hls_video_player/src/feed/reel_playback_state.dart';
import 'package:hls_video_player/src/player/hls_control_tap.dart';
import 'package:hls_video_player/src/player/hls_engine_seek_bar.dart';
import 'package:hls_video_player/src/player/hls_player_snapshot.dart';
import 'package:meta/meta.dart';
import 'package:hls_video_player/src/feed/reel_feed_item.dart';

// The package's control pieces. Use them inside a `ReelTickBuilder` to build
// your own controls; each keeps a 48 dp tap target and a screen reader name
// from `ReelScope`.

/// Seek track; a tap seeks the reel on screen. A screen reader gets it as a
/// slider that steps [step] at a time.
class ReelSeekBar extends StatelessWidget {
  const ReelSeekBar({
    required this.slot,
    required this.state,
    this.track,
    this.step = const Duration(seconds: 5),
    super.key,
  });

  final ReelSlot<ReelFeedItem> slot;
  final ReelPlaybackState state;

  /// Visual that replaces the painted track; taps on it still seek.
  final Widget? track;

  final Duration step;

  Duration _clamp(Duration position) => position < Duration.zero
      ? Duration.zero
      : position > state.duration
      ? state.duration
      : position;

  void _seek(Duration position) {
    if (slot.isFocused) {
      slot.reel.seekTo(_clamp(position));
    }
  }

  @override
  Widget build(BuildContext context) {
    final ReelLabels labels = ReelScope.labelsOf(context);
    return LayoutBuilder(
      builder: (BuildContext context, BoxConstraints constraints) => Semantics(
        slider: true,
        label: labels.seek,
        value: formatReelTime(state.position, state.duration),
        increasedValue: formatReelTime(
          _clamp(state.position + step),
          state.duration,
        ),
        decreasedValue: formatReelTime(
          _clamp(state.position - step),
          state.duration,
        ),
        onIncrease: () => _seek(state.position + step),
        onDecrease: () => _seek(state.position - step),
        child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          excludeFromSemantics: true,
          onTapDown: (TapDownDetails details) => _seek(
            hlsSeekPositionFromTap(
              dx: details.localPosition.dx,
              width: constraints.maxWidth,
              duration: state.duration,
            ),
          ),
          // The engine bar paints; this box owns the 48 dp hit area.
          child: SizedBox(
            height: kMinInteractiveDimension,
            child: Center(
              // Center loosens the width, and the engine bar's painter has
              // no child to size it, so it needs the row's width given back.
              child: SizedBox(
                width: constraints.maxWidth,
                child: ExcludeSemantics(
                  child: IgnorePointer(
                    child: HlsEngineSeekBar(
                      snapshot: snapshotOf(state),
                      track: track,
                      onSeek: (_) {},
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

/// `m:ss / m:ss`, or [child] in its place.
class ReelTimer extends StatelessWidget {
  const ReelTimer({required this.state, this.child, super.key});

  final ReelPlaybackState state;
  final Widget? child;

  @override
  Widget build(BuildContext context) {
    return Center(
      widthFactor: 1,
      child: child ?? HlsEngineTimer(snapshot: snapshotOf(state)),
    );
  }
}

/// Toggles play; shown at the centre while paused by default.
class ReelPlayPauseButton extends StatelessWidget {
  const ReelPlayPauseButton({
    required this.slot,
    required this.state,
    this.icon,
    super.key,
  });

  final ReelSlot<ReelFeedItem> slot;
  final ReelPlaybackState state;
  final Widget? icon;

  @override
  Widget build(BuildContext context) {
    final ReelLabels labels = ReelScope.labelsOf(context);
    return ReelTapTarget(
      label: state.isPlayRequested ? labels.pause : labels.play,
      onTap: slot.reel.togglePlay,
      child:
          icon ??
          ReelRoundIcon(
            icon: state.isPlayRequested ? Icons.pause : Icons.play_arrow,
            size: 48,
            padding: 16,
          ),
    );
  }
}

/// Toggles mute for this reel: its override if it has one, else the feed's.
class ReelMuteButton extends StatelessWidget {
  const ReelMuteButton({
    required this.slot,
    required this.state,
    this.icon,
    super.key,
  });

  final ReelSlot<ReelFeedItem> slot;
  final ReelPlaybackState state;
  final Widget? icon;

  @override
  Widget build(BuildContext context) {
    final ReelLabels labels = ReelScope.labelsOf(context);
    return ReelTapTarget(
      label: state.isMuted ? labels.unmute : labels.mute,
      onTap: slot.reel.toggleMute,
      child:
          icon ??
          ReelRoundIcon(
            icon: state.isMuted ? Icons.volume_off : Icons.volume_up,
            size: 28,
            padding: 12,
          ),
    );
  }
}

/// Enters or leaves fullscreen for the reel on screen.
class ReelFullscreenButton extends StatelessWidget {
  const ReelFullscreenButton({required this.slot, this.icon, super.key});

  final ReelSlot<ReelFeedItem> slot;
  final Widget? icon;

  @override
  Widget build(BuildContext context) {
    final ReelLabels labels = ReelScope.labelsOf(context);
    final bool fullscreen = slot.isFullscreen;
    return ReelTapTarget(
      label: fullscreen ? labels.exitFullscreen : labels.fullscreen,
      onTap: slot.isFocused ? slot.feed.toggleFullscreen : null,
      child:
          icon ??
          Icon(
            fullscreen ? Icons.fullscreen_exit : Icons.fullscreen,
            color: Colors.white,
            size: 24,
            shadows: const <Shadow>[Shadow(blurRadius: 3)],
          ),
    );
  }
}

/// A named, tappable control at least 48 dp square, whatever [child]'s size.
class ReelTapTarget extends StatelessWidget {
  const ReelTapTarget({
    required this.label,
    required this.onTap,
    required this.child,
    super.key,
  });

  final String label;
  final VoidCallback? onTap;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return HlsControlTap(
      label: label,
      onTap: onTap,
      child: ConstrainedBox(
        constraints: const BoxConstraints(
          minWidth: kMinInteractiveDimension,
          minHeight: kMinInteractiveDimension,
        ),
        child: Center(widthFactor: 1, heightFactor: 1, child: child),
      ),
    );
  }
}

/// Translucent round icon, the package's default control visual.
class ReelRoundIcon extends StatelessWidget {
  const ReelRoundIcon({
    required this.icon,
    this.size = 28,
    this.padding = 12,
    super.key,
  });

  final IconData icon;
  final double size;
  final double padding;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: const BoxDecoration(
        color: Color(0x88000000),
        shape: BoxShape.circle,
      ),
      child: Padding(
        padding: EdgeInsets.all(padding),
        child: Icon(icon, color: Colors.white, size: size),
      ),
    );
  }
}

/// `m:ss / m:ss`, as the timer shows it.
String formatReelTime(Duration position, Duration duration) {
  String format(Duration d) =>
      '${d.inMinutes}:${d.inSeconds.remainder(60).toString().padLeft(2, '0')}';
  return '${format(position)} / ${format(duration)}';
}

/// The engine snapshot a [ReelPlaybackState] was built from, for the seek bar
/// and timer, which paint from snapshots.
@internal
HlsPlayerSnapshot snapshotOf(ReelPlaybackState state) {
  return HlsPlayerSnapshot(
    isInitialized: state.duration > Duration.zero,
    isPlaying: state.isPlaying,
    isBuffering: state.status == ReelPlayerStatus.buffering,
    hasError: state.status == ReelPlayerStatus.error,
    duration: state.duration,
    position: state.position,
    width: state.videoWidth,
    height: state.videoHeight,
    aspectRatio: state.aspectRatio,
    buffered: state.buffered,
    errorDescription: state.error,
  );
}
