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

/// Someone in the video's cast, as the details sheet lists them.
@freezed
abstract class ReelCastMember with _$ReelCastMember {
  const factory ReelCastMember({
    required String name,
    String? imageUrl,
  }) = _ReelCastMember;
}

/// A service the full title streams on, shown by its logo.
@freezed
abstract class ReelStreamingService with _$ReelStreamingService {
  const factory ReelStreamingService({
    required String id,
    required String name,
    required String logoUrl,
  }) = _ReelStreamingService;
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

    /// The details sheet's paragraph, longer than [caption].
    String? synopsis,
    @Default([]) List<ReelCastMember> cast,
    @Default([]) List<ReelStreamingService> streamingOn,
  }) = _Reel;
}
