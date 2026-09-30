import 'package:hls_video_player/src/domain/hls_content_descriptor.dart';

/// One HLS item displayed by a player or reel pager.
class HlsReelItem {
  /// Creates an item with a stable host-provided [id].
  const HlsReelItem({
    required this.id,
    required this.masterUri,
    this.data,
    this.descriptor,
    this.playable = true,
  });

  /// Stable identity used to retain a native port as the list grows.
  final String id;

  /// Origin HLS master URI.
  final Uri masterUri;

  /// Opaque host model available from `HlsReelSlot`.
  final Object? data;

  /// Optional custom DRM/auth/cache descriptor.
  ///
  /// Clear HLS defaults to [HlsContentDescriptor.liveSegmentFixture].
  final HlsContentDescriptor? descriptor;

  /// False keeps this item's page but gives it no player, `openAsset` or
  /// prefetch. It still counts toward the window radius.
  final bool playable;

  /// Descriptor registered before native prefetch or player open.
  HlsContentDescriptor get effectiveDescriptor =>
      descriptor ??
      HlsContentDescriptor.liveSegmentFixture(originUrl: masterUri);

  /// Feed identity used by [HlsReelPager] to skip no-op [updateItems].
  bool sameFeedIdentity(HlsReelItem other) {
    if (id != other.id ||
        masterUri != other.masterUri ||
        playable != other.playable) {
      return false;
    }
    final HlsContentDescriptor left = effectiveDescriptor;
    final HlsContentDescriptor right = other.effectiveDescriptor;
    return left.assetId == right.assetId && left.originUrl == right.originUrl;
  }
}

/// Whether two feed lists are the same reels in the same order.
bool sameHlsReelFeed(List<HlsReelItem> left, List<HlsReelItem> right) {
  if (identical(left, right)) {
    return true;
  }
  if (left.length != right.length) {
    return false;
  }
  for (var index = 0; index < left.length; index++) {
    if (!left[index].sameFeedIdentity(right[index])) {
      return false;
    }
  }
  return true;
}
