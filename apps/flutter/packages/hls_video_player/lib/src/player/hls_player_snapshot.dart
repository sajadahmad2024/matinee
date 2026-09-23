/// One contiguous range the native player has already buffered.
///
/// Lives in the engine so portrait UI never imports `video_player`'s
/// `DurationRange`. The seek bar paints these as the lighter track; the HUD
/// uses the last [end] minus playhead as "buffer ahead".
class HlsBufferedRange {
  /// Creates a range from [start] inclusive to [end] exclusive in media time.
  const HlsBufferedRange({required this.start, required this.end});

  /// Start of the buffered window.
  final Duration start;

  /// End of the buffered window.
  final Duration end;

  @override
  bool operator ==(Object other) {
    return other is HlsBufferedRange &&
        other.start == start &&
        other.end == end;
  }

  @override
  int get hashCode => Object.hash(start, end);
}

/// HUD-safe copy of what the native player is doing right now.
///
/// The app UI must not import `video_player`. This snapshot is the seam that
/// later lets a Cubit replace `setState` without changing the engine.
class HlsPlayerSnapshot {
  /// Creates an immutable view of player state.
  const HlsPlayerSnapshot({
    required this.isInitialized,
    required this.isPlaying,
    required this.isBuffering,
    required this.hasError,
    required this.duration,
    required this.position,
    required this.width,
    required this.height,
    required this.aspectRatio,
    this.buffered = const <HlsBufferedRange>[],
    this.errorDescription,
  });

  /// True after the native engine reported a duration and size.
  final bool isInitialized;

  /// Whether frames are advancing.
  final bool isPlaying;

  /// True while the engine is waiting on more media.
  final bool isBuffering;

  /// True when [errorDescription] is set.
  final bool hasError;

  /// Native duration, or zero if unknown.
  final Duration duration;

  /// Current playhead.
  final Duration position;

  /// Video width in pixels.
  final double width;

  /// Video height in pixels.
  final double height;

  /// Width / height used to size the texture.
  final double aspectRatio;

  /// Buffered windows copied from the native player. Empty before the first
  /// buffer report. Never holds a `video_player` type.
  final List<HlsBufferedRange> buffered;

  /// Native error text, when [hasError] is true.
  final String? errorDescription;

  /// Empty snapshot used before [HlsPlayerPort.open] completes.
  static const HlsPlayerSnapshot empty = HlsPlayerSnapshot(
    isInitialized: false,
    isPlaying: false,
    isBuffering: false,
    hasError: false,
    duration: Duration.zero,
    position: Duration.zero,
    width: 0,
    height: 0,
    aspectRatio: 1,
  );

  /// Media already past the playhead in the last buffered range, or zero.
  Duration get bufferedAhead {
    if (buffered.isEmpty) {
      return Duration.zero;
    }
    final Duration end = buffered.last.end;
    if (end <= position) {
      return Duration.zero;
    }
    return end - position;
  }

  @override
  bool operator ==(Object other) {
    return other is HlsPlayerSnapshot &&
        other.isInitialized == isInitialized &&
        other.isPlaying == isPlaying &&
        other.isBuffering == isBuffering &&
        other.hasError == hasError &&
        other.duration == duration &&
        other.position == position &&
        other.width == width &&
        other.height == height &&
        other.aspectRatio == aspectRatio &&
        other.errorDescription == errorDescription &&
        _sameRanges(other.buffered, buffered);
  }

  @override
  int get hashCode => Object.hash(
    isInitialized,
    isPlaying,
    isBuffering,
    hasError,
    duration,
    position,
    width,
    height,
    aspectRatio,
    errorDescription,
    Object.hashAll(buffered),
  );

  static bool _sameRanges(
    List<HlsBufferedRange> left,
    List<HlsBufferedRange> right,
  ) {
    if (identical(left, right)) {
      return true;
    }
    if (left.length != right.length) {
      return false;
    }
    for (int i = 0; i < left.length; i++) {
      if (left[i] != right[i]) {
        return false;
      }
    }
    return true;
  }
}
