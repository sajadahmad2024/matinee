import 'package:flutter/foundation.dart';
import 'package:hls_video_player/reels.dart';

/// Sends reel analytics. Pass it as `ReelFeed.onEvent`, or listen to
/// `feed.events`. `switch` lists every event kind.
void trackReel(ReelEvent<ReelFeedItem> event) {
  switch (event) {
    case ReelFocused(:final ReelHandle<ReelFeedItem> reel):
      debugPrint('view ${reel.id}');
    case ReelFirstFrame(
      :final ReelHandle<ReelFeedItem> reel,
      :final Duration timeToFirstFrame,
    ):
      debugPrint('ttff ${reel.id} ${timeToFirstFrame.inMilliseconds} ms');
    case ReelLeft(
      :final ReelHandle<ReelFeedItem> reel,
      :final Duration watchTime,
      :final bool completed,
    ):
      debugPrint(
        'watched ${reel.id} ${watchTime.inSeconds} s, done: $completed',
      );
    case ReelBufferingEnded(
      :final ReelHandle<ReelFeedItem> reel,
      :final Duration stallDuration,
    ):
      debugPrint('stall ${reel.id} ${stallDuration.inMilliseconds} ms');
    case ReelError(:final ReelHandle<ReelFeedItem> reel, :final String message):
      debugPrint('error ${reel.id}: $message');
    case InsertShown(:final int beforeReel):
      debugPrint('ad impression before $beforeReel');
    case ReelPlayed() ||
        ReelPaused() ||
        ReelBufferingStarted() ||
        ReelLooped() ||
        ReelProgress() ||
        InsertLeft():
      break;
  }
}
