import 'hls_variant.dart';

/// Kind of resource observed by the loopback HLS proxy.
enum HlsResourceKind {
  /// Top-level multivariant playlist.
  masterPlaylist,

  /// Rendition-specific media playlist.
  mediaPlaylist,

  /// Video or audio media segment.
  segment,

  /// Initialization segment referenced by `EXT-X-MAP`.
  initSegment,

  /// Encryption key referenced by a playlist.
  key,

  /// Resource whose kind could not be inferred.
  unknown,
}

/// Track a resource belongs to, by the same rule as native `HlsTrackClass`.
enum HlsTrackKind {
  video,
  audio,

  /// No rendition info, or audio and video in one segment.
  unknown,
}

/// A completed resource request observed by the lab proxy.
class HlsFetchEvent {
  /// Creates one fetch diagnostic event.
  const HlsFetchEvent({
    required this.kind,
    required this.originUri,
    required this.byteLength,
    required this.occurredAt,
    this.variant,
    this.segmentDuration,
    this.segmentStart,
    this.statusCode,
    this.error,
    this.servedFromCache = false,
    this.cacheSkipReason,
    this.advertisedVariants,
    this.assetId,
  });

  /// Resource classification.
  final HlsResourceKind kind;

  /// HTTPS origin URI. The UI must avoid exposing query tokens in analytics.
  final Uri originUri;

  /// Number of response-body bytes returned by the origin.
  final int byteLength;

  /// Time at which the response completed.
  final DateTime occurredAt;

  /// Rendition associated with this resource, when known.
  final HlsVariant? variant;

  /// Segment duration from `EXTINF`, when known.
  final Duration? segmentDuration;

  /// Media-playlist start offset of this segment, when known.
  final Duration? segmentStart;

  /// Origin HTTP status code, when a response was received.
  final int? statusCode;

  /// Sanitized failure description, when the request failed.
  final String? error;

  /// True when the proxy served a RAM-cached segment instead of Mux.
  final bool servedFromCache;

  /// Why a cacheable segment was not stored, when it was skipped.
  final String? cacheSkipReason;

  /// Variant catalog emitted by native after a master playlist fetch.
  final List<HlsVariant>? advertisedVariants;

  /// Asset this request belongs to, as registered by `openAsset`. Null from
  /// native builds that do not send it, or for resources native never saw.
  final String? assetId;

  /// Video when the rendition has a size or a video codec, audio when it has
  /// only other codecs, unknown without rendition info.
  HlsTrackKind get trackKind {
    final HlsVariant? v = variant;
    if (v == null) {
      return HlsTrackKind.unknown;
    }
    if (v.height != null || v.width != null) {
      return HlsTrackKind.video;
    }
    final String? codecs = v.codecs?.toLowerCase();
    if (codecs == null) {
      return HlsTrackKind.unknown;
    }
    const List<String> videoCodecs = <String>[
      'avc',
      'hev',
      'hvc',
      'vp9',
      'av01',
    ];
    return videoCodecs.any(codecs.contains)
        ? HlsTrackKind.video
        : HlsTrackKind.audio;
  }

  /// Whether [position] falls inside this segment's timeline range.
  bool covers(Duration position) {
    final Duration? start = segmentStart;
    final Duration? length = segmentDuration;
    if (start == null || length == null) {
      return false;
    }
    return position >= start && position < start + length;
  }

  /// Short filename without sensitive query parameters.
  String get displayName {
    if (originUri.pathSegments.isEmpty) {
      return originUri.host;
    }
    return originUri.pathSegments.last;
  }

  /// Channel map. Native EventChannel payloads must use these keys.
  Map<String, Object> toChannelMap() {
    return <String, Object>{
      'kind': kind.name,
      'originUri': originUri.toString(),
      'byteLength': byteLength,
      'occurredAt': occurredAt.toUtc().toIso8601String(),
      if (variant != null) 'variant': variant!.toChannelMap(),
      if (segmentDuration != null)
        'segmentDurationMs': segmentDuration!.inMilliseconds,
      if (segmentStart != null) 'segmentStartMs': segmentStart!.inMilliseconds,
      if (statusCode != null) 'statusCode': statusCode!,
      if (error != null) 'error': error!,
      'servedFromCache': servedFromCache,
      if (cacheSkipReason != null) 'cacheSkipReason': cacheSkipReason!,
      if (advertisedVariants != null)
        'variants': advertisedVariants!
            .map((HlsVariant variant) => variant.toChannelMap())
            .toList(growable: false),
      if (assetId != null) 'assetId': assetId!,
    };
  }

  /// Inverse of [toChannelMap]. Throws [FormatException] if origin is missing.
  factory HlsFetchEvent.fromChannelMap(Map<dynamic, dynamic> map) {
    final Object? rawUri = map['originUri'];
    if (rawUri is! String || rawUri.isEmpty) {
      throw const FormatException('originUri is required');
    }
    final Object? variantRaw = map['variant'];
    return HlsFetchEvent(
      kind: _kindFromName(map['kind']),
      originUri: Uri.parse(rawUri),
      byteLength: (map['byteLength'] as num?)?.toInt() ?? 0,
      occurredAt: _dateTimeFromChannel(map['occurredAt']),
      variant: variantRaw is Map
          ? HlsVariant.fromChannelMap(Map<dynamic, dynamic>.from(variantRaw))
          : null,
      segmentDuration: _durationMs(map['segmentDurationMs']),
      segmentStart: _durationMs(map['segmentStartMs']),
      statusCode: (map['statusCode'] as num?)?.toInt(),
      error: map['error'] as String?,
      servedFromCache: map['servedFromCache'] as bool? ?? false,
      cacheSkipReason: map['cacheSkipReason'] as String?,
      advertisedVariants: _variantsFromChannel(map['variants']),
      assetId: map['assetId'] as String?,
    );
  }
}

HlsResourceKind _kindFromName(Object? raw) {
  if (raw is String) {
    for (final HlsResourceKind kind in HlsResourceKind.values) {
      if (kind.name == raw) {
        return kind;
      }
    }
  }
  return HlsResourceKind.unknown;
}

DateTime _dateTimeFromChannel(Object? raw) {
  if (raw is String && raw.isNotEmpty) {
    return DateTime.parse(raw);
  }
  if (raw is num) {
    return DateTime.fromMillisecondsSinceEpoch(raw.toInt(), isUtc: true);
  }
  return DateTime.fromMillisecondsSinceEpoch(0, isUtc: true);
}

Duration? _durationMs(Object? raw) {
  if (raw is num) {
    return Duration(milliseconds: raw.toInt());
  }
  return null;
}

List<HlsVariant>? _variantsFromChannel(Object? raw) {
  if (raw is! List) {
    return null;
  }
  return [
    for (final Object? item in raw)
      if (item is Map)
        HlsVariant.fromChannelMap(Map<dynamic, dynamic>.from(item)),
  ];
}
