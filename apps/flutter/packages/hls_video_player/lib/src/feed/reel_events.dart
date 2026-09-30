import 'package:hls_video_player/src/feed/reel_feed_controller.dart';
import 'package:hls_video_player/src/feed/reel_feed_item.dart';

/// Analytics event from a reel feed. `switch` on it to handle each kind.
///
/// ```dart
/// onEvent: (event) => switch (event) {
///   ReelLeft(:final reel, :final watchTime) => log(reel.id, watchTime),
///   _ => null,
/// },
/// ```
sealed class ReelEvent<T extends ReelFeedItem> {
  const ReelEvent();
}

/// Base for events about one reel.
sealed class ReelHandleEvent<T extends ReelFeedItem> extends ReelEvent<T> {
  const ReelHandleEvent(this.reel);

  final ReelHandle<T> reel;
}

/// A reel became the one on screen.
final class ReelFocused<T extends ReelFeedItem> extends ReelHandleEvent<T> {
  const ReelFocused(super.reel, {required this.fromIndex});

  /// Reel index focused before, or null for the first reel.
  final int? fromIndex;
}

/// The focused reel showed its first playing frame.
final class ReelFirstFrame<T extends ReelFeedItem> extends ReelHandleEvent<T> {
  const ReelFirstFrame(super.reel, {required this.timeToFirstFrame});

  /// Time from focus to the first playing frame.
  final Duration timeToFirstFrame;
}

/// The host or user asked the focused reel to play again after a pause.
final class ReelPlayed<T extends ReelFeedItem> extends ReelHandleEvent<T> {
  const ReelPlayed(super.reel, {required this.position});

  final Duration position;
}

/// The host or user paused the focused reel.
final class ReelPaused<T extends ReelFeedItem> extends ReelHandleEvent<T> {
  const ReelPaused(super.reel, {required this.position});

  final Duration position;
}

/// Playback stalled after the first frame.
final class ReelBufferingStarted<T extends ReelFeedItem>
    extends ReelHandleEvent<T> {
  const ReelBufferingStarted(super.reel, {required this.position});

  final Duration position;
}

/// A stall ended.
final class ReelBufferingEnded<T extends ReelFeedItem>
    extends ReelHandleEvent<T> {
  const ReelBufferingEnded(super.reel, {required this.stallDuration});

  final Duration stallDuration;
}

/// The reel reached its end and started again.
final class ReelLooped<T extends ReelFeedItem> extends ReelHandleEvent<T> {
  const ReelLooped(super.reel, {required this.loopCount});

  /// Completed loops so far in this focus.
  final int loopCount;
}

/// Sent every `progressInterval` of watch time on the focused reel.
final class ReelProgress<T extends ReelFeedItem> extends ReelHandleEvent<T> {
  const ReelProgress(
    super.reel, {
    required this.watchTime,
    required this.position,
  });

  final Duration watchTime;
  final Duration position;
}

/// The reel stopped being the one on screen, or the feed was hidden or closed.
final class ReelLeft<T extends ReelFeedItem> extends ReelHandleEvent<T> {
  const ReelLeft(
    super.reel, {
    required this.watchTime,
    required this.maxPosition,
    required this.loops,
    required this.completed,
  });

  /// Time spent actually playing: excludes buffering, pauses and hidden time.
  final Duration watchTime;

  /// Furthest position reached.
  final Duration maxPosition;

  final int loops;

  /// True when the reel was watched to its end at least once.
  final bool completed;
}

/// The reel's player failed or could not open.
final class ReelError<T extends ReelFeedItem> extends ReelHandleEvent<T> {
  const ReelError(super.reel, {required this.message});

  final String message;
}

/// An insert page (an ad, a promo) came on screen.
final class InsertShown<T extends ReelFeedItem> extends ReelEvent<T> {
  const InsertShown({required this.pageIndex, required this.beforeReel});

  final int pageIndex;

  /// Index of the reel the insert sits before.
  final int beforeReel;
}

/// An insert page left the screen.
final class InsertLeft<T extends ReelFeedItem> extends ReelEvent<T> {
  const InsertLeft({
    required this.pageIndex,
    required this.beforeReel,
    required this.shownFor,
  });

  final int pageIndex;
  final int beforeReel;
  final Duration shownFor;
}
