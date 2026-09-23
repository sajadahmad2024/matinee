package io.flutter.plugins.videoplayer.hls

data class HlsVariantInfo(
  val playlistUri: String,
  val bandwidth: Int,
  val width: Int? = null,
  val height: Int? = null,
  val codecs: String? = null,
) {
  fun toChannelMap(): Map<String, Any> {
    val map = mutableMapOf<String, Any>(
      "playlistUri" to playlistUri,
      "bandwidth" to bandwidth,
    )
    if (width != null) map["width"] = width
    if (height != null) map["height"] = height
    if (codecs != null) map["codecs"] = codecs
    return map
  }
}

data class TimelineEntry(
  val assetId: String,
  val originUri: String,
  val segmentStartMs: Long,
  val segmentDurationMs: Long,
  val variant: HlsVariantInfo? = null,
) {
  fun covers(positionMs: Long): Boolean {
    return positionMs >= segmentStartMs && positionMs < segmentStartMs + segmentDurationMs
  }
}

object HlsTrackClass {
  fun of(variant: HlsVariantInfo?): String {
    if (variant == null) {
      return "unknown"
    }
    if (variant.height != null || variant.width != null) {
      return "video"
    }
    val codecs = variant.codecs?.lowercase() ?: return "unknown"
    val videoMarkers = listOf("avc", "hev", "hvc", "vp9", "av01")
    if (videoMarkers.any { codecs.contains(it) }) {
      return "video"
    }
    return "audio"
  }

  fun compatible(requested: HlsVariantInfo?, candidate: HlsVariantInfo?): Boolean {
    val requestedClass = of(requested)
    val candidateClass = of(candidate)
    return requestedClass == candidateClass
  }
}

/** AssetId-scoped segment substitution timeline. */
class SegmentTimeline {
  private val entries = ArrayList<TimelineEntry>()

  fun record(entry: TimelineEntry) {
    entries.removeAll { it.originUri == entry.originUri }
    entries.add(entry)
  }

  fun findSubstitute(
    assetId: String,
    requestedStartMs: Long,
    excludeOrigin: String,
    preferVariant: HlsVariantInfo? = null,
  ): TimelineEntry? {
    val covering =
      entries.filter {
        it.assetId == assetId &&
          it.originUri != excludeOrigin &&
          it.covers(requestedStartMs) &&
          HlsTrackClass.compatible(preferVariant, it.variant)
      }
    if (covering.isEmpty()) {
      return null
    }
    if (preferVariant != null) {
      val match =
        covering.firstOrNull { it.variant?.playlistUri == preferVariant.playlistUri }
      if (match != null) {
        return match
      }
    }
    return covering.last()
  }

  fun entryFor(originUri: String): TimelineEntry? = entries.lastOrNull { it.originUri == originUri }

  fun snapshot(): List<TimelineEntry> = entries.toList()

  fun clear() {
    entries.clear()
  }
}
