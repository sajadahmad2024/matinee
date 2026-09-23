package io.flutter.plugins.videoplayer.hls

data class HlsResource(
  val originUri: String,
  val kind: String,
  val assetId: String,
  val variant: HlsVariantInfo? = null,
  val segmentStartMs: Long? = null,
  val segmentDurationMs: Long? = null,
)
