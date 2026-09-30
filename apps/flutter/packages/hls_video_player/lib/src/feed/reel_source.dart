import 'package:hls_video_player/src/domain/hls_content_descriptor.dart';

/// What a reel plays. Return one from `ReelFeedController.source`.
///
/// Return `null` instead for a reel that must not play or be cached yet, such
/// as a locked reel. It keeps its page but gets no player, no prefetch and no
/// cache until `source` returns a value for it.
///
/// ```dart
/// source: (reel) => reel.isLocked ? null : ReelSource.hls(reel.masterUri),
/// ```
///
/// Use the **same master URI** you prefetch with, so the native cache hits.
sealed class ReelSource {
  const ReelSource();

  /// Clear HLS with the package's default cache and prefetch policy.
  const factory ReelSource.hls(Uri masterUri) = HlsReelSource;

  /// HLS with a full [HlsContentDescriptor]: DRM, auth, cache policy and
  /// prefetch caps.
  const factory ReelSource.descriptor(HlsContentDescriptor descriptor) =
      DescriptorReelSource;

  /// Origin HLS master URI.
  Uri get masterUri;

  /// Descriptor handed to the native engine, or null for the default.
  HlsContentDescriptor? get descriptor;
}

/// Clear HLS. See [ReelSource.hls].
final class HlsReelSource extends ReelSource {
  const HlsReelSource(this.masterUri);

  @override
  final Uri masterUri;

  @override
  HlsContentDescriptor? get descriptor => null;

  @override
  bool operator ==(Object other) =>
      other is HlsReelSource && other.masterUri == masterUri;

  @override
  int get hashCode => masterUri.hashCode;
}

/// HLS with a custom descriptor. See [ReelSource.descriptor].
final class DescriptorReelSource extends ReelSource {
  const DescriptorReelSource(this.descriptor);

  @override
  final HlsContentDescriptor descriptor;

  @override
  Uri get masterUri => descriptor.originUrl;

  @override
  bool operator ==(Object other) =>
      other is DescriptorReelSource &&
      other.descriptor.assetId == descriptor.assetId &&
      other.descriptor.originUrl == descriptor.originUrl;

  @override
  int get hashCode => Object.hash(descriptor.assetId, descriptor.originUrl);
}
