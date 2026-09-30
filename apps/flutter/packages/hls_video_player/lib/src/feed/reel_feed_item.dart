import 'package:hls_video_player/src/feed/reel_source.dart';

/// One reel in a `ReelFeed`, describing itself. Your model implements it, and
/// your data layer fills it in, so the UI never computes these.
///
/// ```dart
/// @freezed
/// abstract class FeedReel with _$FeedReel implements ReelFeedItem {
///   const factory FeedReel({required String id, required ReelSource? source,
///       required bool isLocked, required Reel reel}) = _FeedReel;
/// }
/// ```
///
/// The feed reads these for every item, not only the ones on screen: the
/// player window opens and prefetches neighbours before their pages exist.
abstract interface class ReelFeedItem {
  /// Stable and unique; players, handles and focus are kept by it when the
  /// list changes.
  String get id;

  /// What plays. Null means no player and no cache.
  ReelSource? get source;

  /// Locked: no player, no cache, and the feed shows the curtain.
  bool get isLocked;
}
