import 'package:freezed_annotation/freezed_annotation.dart';

part 'reel_playback.freezed.dart';

/// How the master is delivered. Picks the descriptor the player later builds.
enum ReelPlaybackKind { normal, signed, tokened, drm }

enum ReelDrmKind { none, fairplay, widevine }

enum ReelAuthMode { none, signedUrl, tokenHeader }

enum ReelCachePolicy { none, liveSegmentCache, fullDownload }

///
/// Signed-URL or header-token fields. The token on a signed URL stays on
/// [Reel.masterUri]; this only carries the refresh id and optional headers.
///
@freezed
abstract class ReelAuthConfig with _$ReelAuthConfig {
  const factory ReelAuthConfig({
    String? headerName,
    String? headerValue,
    String? tokenRefreshId,
  }) = _ReelAuthConfig;
}

/// License and certificate URLs. Required when [ReelPlayback.drm] is not none.
@freezed
abstract class ReelDrmConfig with _$ReelDrmConfig {
  const factory ReelDrmConfig({
    String? certificateUrl,
    String? licenseServerUrl,
    String? contentId,
  }) = _ReelDrmConfig;
}

///
/// Playback contract for one reel: DRM, auth, and cache. Clear HLS is
/// `drm: none` and `authMode: none`; anything else needs a descriptor.
///
@freezed
abstract class ReelPlayback with _$ReelPlayback {
  const factory ReelPlayback({
    required ReelPlaybackKind kind,
    required ReelDrmKind drm,
    required ReelAuthMode authMode,
    required ReelCachePolicy cachePolicy,
    required bool prefetchEnabled,
    required bool substitutionEnabled,
    required int maxPrefetchSegments,
    required int maxPrefetchHeight,
    ReelAuthConfig? authConfig,
    ReelDrmConfig? drmConfig,
  }) = _ReelPlayback;
}
