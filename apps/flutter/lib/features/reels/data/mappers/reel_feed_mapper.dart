import 'package:hls_video_player/reel_data.dart';
import 'package:matinee/features/reels/data/models/reel.dart';
import 'package:matinee/features/reels/data/models/reel_playback.dart';
import 'package:matinee/features/reels/domain/feed_reel.dart';

///
/// The API reels as the feed plays them: unsupported reels dropped, each
/// reel's source and lock prepared. Pure data; no UI.
///
List<FeedReel> toFeedReels(List<Reel> reels) => [for (final reel in reels.where(isPlayableReel)) toFeedReel(reel)];

FeedReel toFeedReel(Reel reel) => FeedReel(reel: reel, source: toReelSource(reel), isLocked: reel.isExclusive);

/// Only clear HLS plays for now; DRM and auth reels are dropped.
bool isPlayableReel(Reel reel) {
  return reel.playback.drm == ReelDrmKind.none && reel.playback.authMode == ReelAuthMode.none;
}

ReelSource toReelSource(Reel reel) {
  final masterUri = Uri.parse(reel.masterUri);
  final descriptor = reelDescriptor(reel, masterUri);
  return descriptor == null ? ReelSource.hls(masterUri) : ReelSource.descriptor(descriptor);
}

///
/// Playback settings the native engine needs for [reel], or null for clear HLS.
///
HlsContentDescriptor? reelDescriptor(Reel reel, Uri masterUri) {
  final playback = reel.playback;
  if (playback.drm == ReelDrmKind.none && playback.authMode == ReelAuthMode.none) {
    return null;
  }

  return HlsContentDescriptor(
    assetId: masterUri,
    originUrl: masterUri,
    drm: switch (playback.drm) {
      ReelDrmKind.none => HlsDrmKind.none,
      ReelDrmKind.fairplay => HlsDrmKind.fairplay,
      ReelDrmKind.widevine => HlsDrmKind.widevine,
    },
    authMode: switch (playback.authMode) {
      ReelAuthMode.none => HlsAuthMode.none,
      ReelAuthMode.signedUrl => HlsAuthMode.signedUrl,
      ReelAuthMode.tokenHeader => HlsAuthMode.tokenHeader,
    },
    cachePolicy: switch (playback.cachePolicy) {
      ReelCachePolicy.none => HlsCachePolicy.none,
      ReelCachePolicy.liveSegmentCache => HlsCachePolicy.liveSegmentCache,
      ReelCachePolicy.fullDownload => HlsCachePolicy.fullDownload,
    },
    prefetchEnabled: playback.prefetchEnabled,
    substitutionEnabled: playback.substitutionEnabled,
    maxPrefetchSegments: playback.maxPrefetchSegments,
    maxPrefetchHeight: playback.maxPrefetchHeight,
    authConfig: _authConfig(playback.authConfig),
    drmConfig: _drmConfig(playback.drmConfig),
  );
}

HlsAuthConfig? _authConfig(ReelAuthConfig? config) {
  if (config == null) {
    return null;
  }
  return HlsAuthConfig(
    headerName: config.headerName,
    headerValue: config.headerValue,
    tokenRefreshId: config.tokenRefreshId,
  );
}

HlsDrmConfig? _drmConfig(ReelDrmConfig? config) {
  if (config == null) {
    return null;
  }
  return HlsDrmConfig(
    certificateUrl: _uriOrNull(config.certificateUrl),
    licenseServerUrl: _uriOrNull(config.licenseServerUrl),
    contentId: config.contentId,
  );
}

Uri? _uriOrNull(String? value) => value == null ? null : Uri.parse(value);
