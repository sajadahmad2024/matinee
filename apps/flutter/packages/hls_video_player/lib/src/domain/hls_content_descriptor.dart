/// DRM system named by a content descriptor.
enum HlsDrmKind {
  /// Clear HLS. No license exchange.
  none,

  /// Apple FairPlay Streaming.
  fairplay,

  /// Google Widevine.
  widevine,
}

/// How origin requests carry credentials.
enum HlsAuthMode {
  /// No extra auth beyond the URL itself.
  none,

  /// Tokens live in the query string and may rotate.
  signedUrl,

  /// A named HTTP header carries the token.
  tokenHeader,
}

/// Whether native should cache this asset, and how.
enum HlsCachePolicy {
  /// AVPlayer/ExoPlayer talk to the CDN with no engine cache.
  none,

  /// Opportunistic per-segment cache (Android DataSource / iOS loopback).
  liveSegmentCache,

  /// Whole-rendition download (iOS `AVAssetDownloadTask`).
  fullDownload,
}

/// How native chose to deliver [HlsOpenAssetResult.playerUri].
enum HlsDeliveryStrategy {
  /// Origin HTTPS (or file) given straight to the stock player.
  direct,

  /// iOS loopback HTTP URL.
  loopback,

  /// Local `.movpkg` (or equivalent) after download.
  download,
}

/// License / certificate endpoints when [HlsContentDescriptor.drm] is not none.
class HlsDrmConfig {
  /// Creates DRM endpoints for one asset.
  const HlsDrmConfig({
    this.certificateUrl,
    this.licenseServerUrl,
    this.contentId,
  });

  /// FairPlay application certificate URL.
  final Uri? certificateUrl;

  /// License server that accepts SPC / Widevine challenge.
  final Uri? licenseServerUrl;

  /// Optional content id sent with the license request.
  final String? contentId;

  /// Channel map. Omits null fields.
  Map<String, Object> toChannelMap() {
    return <String, Object>{
      if (certificateUrl != null) 'certificateUrl': certificateUrl.toString(),
      if (licenseServerUrl != null)
        'licenseServerUrl': licenseServerUrl.toString(),
      if (contentId != null) 'contentId': contentId!,
    };
  }

  /// Reads a channel map. Unknown keys are ignored.
  factory HlsDrmConfig.fromChannelMap(Map<dynamic, dynamic> map) {
    return HlsDrmConfig(
      certificateUrl: _uriOrNull(map['certificateUrl']),
      licenseServerUrl: _uriOrNull(map['licenseServerUrl']),
      contentId: map['contentId'] as String?,
    );
  }
}

/// Header or token-refresh identity when [HlsAuthMode] is not none.
class HlsAuthConfig {
  /// Creates auth material for origin fetches.
  const HlsAuthConfig({this.headerName, this.headerValue, this.tokenRefreshId});

  /// HTTP header name for [HlsAuthMode.tokenHeader].
  final String? headerName;

  /// HTTP header value for [HlsAuthMode.tokenHeader].
  final String? headerValue;

  /// Client-defined id if tokens rotate and native must refresh.
  final String? tokenRefreshId;

  /// Channel map. Omits null fields.
  Map<String, Object> toChannelMap() {
    return <String, Object>{
      if (headerName != null) 'headerName': headerName!,
      if (headerValue != null) 'headerValue': headerValue!,
      if (tokenRefreshId != null) 'tokenRefreshId': tokenRefreshId!,
    };
  }

  /// Reads a channel map. Unknown keys are ignored.
  factory HlsAuthConfig.fromChannelMap(Map<dynamic, dynamic> map) {
    return HlsAuthConfig(
      headerName: map['headerName'] as String?,
      headerValue: map['headerValue'] as String?,
      tokenRefreshId: map['tokenRefreshId'] as String?,
    );
  }
}

/// Per-asset contract Dart sends once before opening the stock player.
class HlsContentDescriptor {
  /// Creates a descriptor. [drmConfig] is required when [drm] is not none.
  const HlsContentDescriptor({
    required this.assetId,
    required this.originUrl,
    this.drm = HlsDrmKind.none,
    this.drmConfig,
    this.authMode = HlsAuthMode.none,
    this.authConfig,
    this.cachePolicy = HlsCachePolicy.liveSegmentCache,
    this.prefetchEnabled = true,
    this.substitutionEnabled = true,
    this.maxPrefetchSegments = 10,
    this.maxPrefetchHeight = 480,
  });

  /// Public-fixture defaults: clear HLS, live segment cache, prefetch on.
  factory HlsContentDescriptor.liveSegmentFixture({required Uri originUrl}) {
    return HlsContentDescriptor(assetId: originUrl, originUrl: originUrl);
  }

  /// Fake FairPlay descriptor for device QA. Not used by [HlsReelCatalog.fixtures].
  factory HlsContentDescriptor.fairplayManualQa({
    required Uri originUrl,
    required Uri certificateUrl,
    required Uri licenseServerUrl,
    String? contentId,
  }) {
    return HlsContentDescriptor(
      assetId: originUrl,
      originUrl: originUrl,
      drm: HlsDrmKind.fairplay,
      drmConfig: HlsDrmConfig(
        certificateUrl: certificateUrl,
        licenseServerUrl: licenseServerUrl,
        contentId: contentId,
      ),
      cachePolicy: HlsCachePolicy.fullDownload,
    );
  }

  /// Stable identity for substitution scoping. Usually the master URI.
  final Uri assetId;

  /// Real HLS master URL the CDN serves.
  final Uri originUrl;

  /// DRM system. [none] for the fixture catalog.
  final HlsDrmKind drm;

  /// Present when [drm] is not [HlsDrmKind.none].
  final HlsDrmConfig? drmConfig;

  /// How origin HTTP should authenticate.
  final HlsAuthMode authMode;

  /// Present when [authMode] is not [HlsAuthMode.none].
  final HlsAuthConfig? authConfig;

  /// Cache / download strategy for this asset.
  final HlsCachePolicy cachePolicy;

  /// Whether native may warm segments before the player asks.
  final bool prefetchEnabled;

  /// Whether stand-in segments are allowed for this [assetId].
  final bool substitutionEnabled;

  /// Prefetch cap: first N media segments of the chosen rung.
  final int maxPrefetchSegments;

  /// Prefetch cap: prefer the highest rung at or below this height.
  final int maxPrefetchHeight;

  /// Frozen MethodChannel payload. Keys are part of the native contract.
  Map<String, Object> toChannelMap() {
    return <String, Object>{
      'assetId': assetId.toString(),
      'originUrl': originUrl.toString(),
      'drm': drm.name,
      if (drmConfig != null) 'drmConfig': drmConfig!.toChannelMap(),
      'authMode': authMode.name,
      if (authConfig != null) 'authConfig': authConfig!.toChannelMap(),
      'cachePolicy': cachePolicy.name,
      'prefetchEnabled': prefetchEnabled,
      'substitutionEnabled': substitutionEnabled,
      'maxPrefetchSegments': maxPrefetchSegments,
      'maxPrefetchHeight': maxPrefetchHeight,
    };
  }

  /// Inverse of [toChannelMap]. Throws [FormatException] on missing URLs.
  factory HlsContentDescriptor.fromChannelMap(Map<dynamic, dynamic> map) {
    final Uri? assetId = _uriOrNull(map['assetId']);
    final Uri? originUrl = _uriOrNull(map['originUrl']);
    if (assetId == null || originUrl == null) {
      throw const FormatException('assetId and originUrl are required');
    }
    return HlsContentDescriptor(
      assetId: assetId,
      originUrl: originUrl,
      drm: _enumFromName(HlsDrmKind.values, map['drm'], HlsDrmKind.none),
      drmConfig: _mapOrNull(map['drmConfig']) == null
          ? null
          : HlsDrmConfig.fromChannelMap(_mapOrNull(map['drmConfig'])!),
      authMode: _enumFromName(
        HlsAuthMode.values,
        map['authMode'],
        HlsAuthMode.none,
      ),
      authConfig: _mapOrNull(map['authConfig']) == null
          ? null
          : HlsAuthConfig.fromChannelMap(_mapOrNull(map['authConfig'])!),
      cachePolicy: _enumFromName(
        HlsCachePolicy.values,
        map['cachePolicy'],
        HlsCachePolicy.liveSegmentCache,
      ),
      prefetchEnabled: map['prefetchEnabled'] as bool? ?? true,
      substitutionEnabled: map['substitutionEnabled'] as bool? ?? true,
      maxPrefetchSegments: (map['maxPrefetchSegments'] as num?)?.toInt() ?? 10,
      maxPrefetchHeight: (map['maxPrefetchHeight'] as num?)?.toInt() ?? 480,
    );
  }
}

/// URI the stock `VideoPlayerController` should open after `openAsset`.
class HlsOpenAssetResult {
  /// Creates a result. [strategy] must match how [playerUri] was produced.
  const HlsOpenAssetResult({required this.playerUri, required this.strategy});

  /// HTTPS origin, loopback HTTP, or local file URI.
  final Uri playerUri;

  /// Native delivery path that produced [playerUri].
  final HlsDeliveryStrategy strategy;

  /// Channel map.
  Map<String, Object> toChannelMap() {
    return <String, Object>{
      'playerUri': playerUri.toString(),
      'strategy': strategy.name,
    };
  }

  /// Inverse of [toChannelMap]. Throws [FormatException] if URI is missing.
  factory HlsOpenAssetResult.fromChannelMap(Map<dynamic, dynamic> map) {
    final Uri? playerUri = _uriOrNull(map['playerUri']);
    if (playerUri == null) {
      throw const FormatException('playerUri is required');
    }
    return HlsOpenAssetResult(
      playerUri: playerUri,
      strategy: _enumFromName(
        HlsDeliveryStrategy.values,
        map['strategy'],
        HlsDeliveryStrategy.direct,
      ),
    );
  }
}

/// Snapshot returned by `cacheStats`.
class HlsCacheStats {
  /// Creates a cache snapshot.
  const HlsCacheStats({
    required this.backendName,
    required this.entryCount,
    required this.storedBytes,
  });

  /// Native backend label (`none`, `simpleCache`, `disk`, …).
  final String backendName;

  /// Live entry count.
  final int entryCount;

  /// Live stored bytes.
  final int storedBytes;

  /// Channel map.
  Map<String, Object> toChannelMap() {
    return <String, Object>{
      'backendName': backendName,
      'entryCount': entryCount,
      'storedBytes': storedBytes,
    };
  }

  /// Inverse of [toChannelMap].
  factory HlsCacheStats.fromChannelMap(Map<dynamic, dynamic> map) {
    return HlsCacheStats(
      backendName: map['backendName'] as String? ?? 'none',
      entryCount: (map['entryCount'] as num?)?.toInt() ?? 0,
      storedBytes: (map['storedBytes'] as num?)?.toInt() ?? 0,
    );
  }
}

Uri? _uriOrNull(Object? value) {
  if (value is! String || value.isEmpty) {
    return null;
  }
  return Uri.parse(value);
}

Map<dynamic, dynamic>? _mapOrNull(Object? value) {
  if (value is Map) {
    return Map<dynamic, dynamic>.from(value);
  }
  return null;
}

T _enumFromName<T extends Enum>(List<T> values, Object? raw, T fallback) {
  if (raw is! String) {
    return fallback;
  }
  for (final T value in values) {
    if (value.name == raw) {
      return value;
    }
  }
  return fallback;
}
