import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:matinee/features/reels/data/models/reel_playback.dart';

part 'reel.freezed.dart';

/// The studio or handle shown on the overlay. Not a signed-in user.
@freezed
abstract class ReelAuthor with _$ReelAuthor {
  const factory ReelAuthor({
    required String id,
    required String handle,
    required String displayName,
  }) = _ReelAuthor;
}

///
/// One vertical-feed item: the master URL the player opens, chrome counts,
/// and the playback contract that decides whether a descriptor is needed.
///
@freezed
abstract class Reel with _$Reel {
  const factory Reel({
    required String id,
    required String masterUri,
    required String title,
    required String caption,
    required ReelAuthor author,
    required int likeCount,
    required int commentCount,
    required int shareCount,
    required int durationMs,
    required ReelPlayback playback,
    required List<String> genres,
    String? thumbnailUrl,
    @Default(false) bool isExclusive,
    int? unlockCost,
    String? preview,
    String? castAndCrew,
  }) = _Reel;
}
