/// One video rendition advertised by an HLS master playlist.
class HlsVariant {
  /// Creates HLS rendition metadata.
  const HlsVariant({
    required this.playlistUri,
    required this.bandwidth,
    this.width,
    this.height,
    this.codecs,
  });

  /// Absolute media-playlist URI for this rendition.
  final Uri playlistUri;

  /// Peak bandwidth declared by `BANDWIDTH`, in bits per second.
  final int bandwidth;

  /// Declared video width, when `RESOLUTION` is present.
  final int? width;

  /// Declared video height, when `RESOLUTION` is present.
  final int? height;

  /// Declared codecs, when present.
  final String? codecs;

  /// Channel map for HUD / native events.
  Map<String, Object> toChannelMap() {
    return <String, Object>{
      'playlistUri': playlistUri.toString(),
      'bandwidth': bandwidth,
      if (width != null) 'width': width!,
      if (height != null) 'height': height!,
      if (codecs != null) 'codecs': codecs!,
    };
  }

  /// Inverse of [toChannelMap]. Throws [FormatException] if URI is missing.
  factory HlsVariant.fromChannelMap(Map<dynamic, dynamic> map) {
    final Object? rawUri = map['playlistUri'];
    if (rawUri is! String || rawUri.isEmpty) {
      throw const FormatException('playlistUri is required');
    }
    return HlsVariant(
      playlistUri: Uri.parse(rawUri),
      bandwidth: (map['bandwidth'] as num?)?.toInt() ?? 0,
      width: (map['width'] as num?)?.toInt(),
      height: (map['height'] as num?)?.toInt(),
      codecs: map['codecs'] as String?,
    );
  }

  /// Compact label suitable for the lab HUD.
  String get label {
    final String resolution = height == null ? 'unknown' : '${height}p';
    final String bitrate = bandwidth >= 1000000
        ? '${(bandwidth / 1000000).toStringAsFixed(1)} Mbps'
        : '${(bandwidth / 1000).round()} kbps';
    return '$resolution · $bitrate';
  }
}
