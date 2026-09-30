import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:hls_video_player/reel_data.dart';
import 'package:matinee/features/reels/data/models/reel.dart';

part 'feed_reel.freezed.dart';

///
/// One reel as the feed plays it: the API model plus what to play and whether
/// it is locked, prepared by the cubit so the screen only reads fields.
///
@freezed
abstract class FeedReel with _$FeedReel implements ReelFeedItem {
  const factory FeedReel({
    required Reel reel,
    required ReelSource? source,
    required bool isLocked,
  }) = _FeedReel;

  const FeedReel._();

  @override
  String get id => reel.id;
}
