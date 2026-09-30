import 'package:flutter/foundation.dart';
import 'package:hls_video_player/src/player/hls_player_snapshot.dart';

/// What a reel's player is doing, as one value to `switch` on.
enum ReelPlayerStatus {
  /// No player: the reel is outside the window, or its source is null.
  idle,

  /// A player is being created or is loading its first frames.
  opening,

  /// Playing and advancing.
  playing,

  /// Ready but not advancing.
  paused,

  /// Waiting for more media while it should be playing.
  buffering,

  /// The player or its open failed. See [ReelPlaybackState.error].
  error,
}

/// Live state of one reel. Read it from `ReelHandle.state`.
///
/// It is a view of the reel's current native player plus the feed's intents
/// (play, mute). It updates on every player tick, so listen to it with
/// `ReelStateBuilder` or `ValueListenableBuilder` close to the widget that
/// needs it.
@immutable
class ReelPlaybackState {
  const ReelPlaybackState({
    required this.status,
    required this.isFocused,
    required this.isPlayRequested,
    required this.isMuted,
    this.position = Duration.zero,
    this.duration = Duration.zero,
    this.buffered = const <HlsBufferedRange>[],
    this.aspectRatio = 0,
    this.videoWidth = 0,
    this.videoHeight = 0,
    this.error,
  });

  /// State of a reel with no player.
  const ReelPlaybackState.idle({
    this.isFocused = false,
    this.isPlayRequested = false,
    this.isMuted = true,
    this.error,
  }) : status = error == null ? ReelPlayerStatus.idle : ReelPlayerStatus.error,
       position = Duration.zero,
       duration = Duration.zero,
       buffered = const <HlsBufferedRange>[],
       aspectRatio = 0,
       videoWidth = 0,
       videoHeight = 0;

  final ReelPlayerStatus status;

  /// Whether this reel is the one the feed is showing.
  final bool isFocused;

  /// Play intent for the focused reel. False after the user or host paused.
  final bool isPlayRequested;

  /// Effective mute: the reel's override, or the feed's mute.
  final bool isMuted;

  final Duration position;

  /// Zero until the player knows it.
  final Duration duration;

  /// Ranges already buffered, for a seek bar.
  final List<HlsBufferedRange> buffered;

  /// Width / height of the video, or 0 before it is known.
  final double aspectRatio;

  final double videoWidth;
  final double videoHeight;

  /// Player or open error text when [status] is [ReelPlayerStatus.error].
  final String? error;

  bool get isPlaying => status == ReelPlayerStatus.playing;

  /// Loading the first frames, or stalled while playing.
  bool get isLoading =>
      status == ReelPlayerStatus.opening ||
      status == ReelPlayerStatus.buffering;

  /// 0..1 progress through the video, or 0 before the duration is known.
  double get progress => duration <= Duration.zero
      ? 0
      : (position.inMicroseconds / duration.inMicroseconds).clamp(0.0, 1.0);

  @override
  bool operator ==(Object other) {
    return other is ReelPlaybackState &&
        other.status == status &&
        other.isFocused == isFocused &&
        other.isPlayRequested == isPlayRequested &&
        other.isMuted == isMuted &&
        other.position == position &&
        other.duration == duration &&
        listEquals(other.buffered, buffered) &&
        other.aspectRatio == aspectRatio &&
        other.videoWidth == videoWidth &&
        other.videoHeight == videoHeight &&
        other.error == error;
  }

  @override
  int get hashCode => Object.hash(
    status,
    isFocused,
    isPlayRequested,
    isMuted,
    position,
    duration,
    Object.hashAll(buffered),
    aspectRatio,
    videoWidth,
    videoHeight,
    error,
  );

  @override
  String toString() =>
      'ReelPlaybackState($status, focused: $isFocused, '
      'position: $position / $duration, muted: $isMuted)';
}
