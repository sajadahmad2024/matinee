import 'package:hls_video_player/hls_video_player.dart';
import 'package:matinee/features/reels/data/models/reel.dart';
import 'package:matinee/features/reels/data/models/reel_playback.dart';

/// Maps a host reel to the package item. Clear HLS omits [HlsReelItem.descriptor].
HlsReelItem toHlsReelItem(Reel reel) {
  final masterUri = Uri.parse(reel.masterUri);
  return HlsReelItem(
    id: reel.id,
    masterUri: masterUri,
    data: reel,
    descriptor: _descriptorFor(reel, masterUri),
  );
}

bool isPlayableReel(Reel reel) {
  return reel.playback.drm == ReelDrmKind.none && reel.playback.authMode == ReelAuthMode.none;
}

HlsContentDescriptor? _descriptorFor(Reel reel, Uri masterUri) {
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
