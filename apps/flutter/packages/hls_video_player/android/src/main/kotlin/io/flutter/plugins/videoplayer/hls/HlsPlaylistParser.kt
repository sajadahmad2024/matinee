package io.flutter.plugins.videoplayer.hls

import java.net.URI

data class MediaSegmentRef(
  val uri: String,
  val startMs: Long,
  val durationMs: Long,
  val isInit: Boolean = false,
)

object HlsPlaylistParser {
  fun parseVariants(body: String, masterUri: String): List<HlsVariantInfo> {
    val lines = body.split(Regex("\r?\n"))
    val variants = ArrayList<HlsVariantInfo>()
    var pending: Map<String, String>? = null
    for (raw in lines) {
      val line = raw.trim()
      if (line.startsWith("#EXT-X-STREAM-INF:")) {
        pending = parseAttributes(line.substring("#EXT-X-STREAM-INF:".length))
        continue
      }
      val attributes = pending
      if (attributes == null || line.isEmpty() || line.startsWith("#")) {
        continue
      }
      pending = null
      val bandwidth = attributes["BANDWIDTH"]?.toIntOrNull() ?: continue
      val codecs = attributes["CODECS"]
      val resolution = parseResolution(attributes["RESOLUTION"])
      if (isAudioOnly(codecs, resolution.second)) {
        continue
      }
      variants.add(
        HlsVariantInfo(
          playlistUri = resolve(masterUri, line),
          bandwidth = bandwidth,
          width = resolution.first,
          height = resolution.second,
          codecs = codecs,
        ),
      )
    }
    return variants
  }

  fun parseMediaSegments(body: String, playlistUri: String): List<MediaSegmentRef> {
    val lines = body.split(Regex("\r?\n"))
    val segments = ArrayList<MediaSegmentRef>()
    var pendingDurationMs: Long? = null
    var cursor = 0L
    for (raw in lines) {
      val line = raw.trim()
      if (line.startsWith("#EXTINF:")) {
        val value = line.substring("#EXTINF:".length).substringBefore(',').trim()
        pendingDurationMs = ((value.toDoubleOrNull() ?: 0.0) * 1000.0).toLong()
        continue
      }
      if (line.startsWith("#EXT-X-MAP:")) {
        val match = Regex("URI=\"([^\"]+)\"").find(line)
        if (match != null) {
          segments.add(
            MediaSegmentRef(
              uri = resolve(playlistUri, match.groupValues[1]),
              startMs = cursor,
              durationMs = 0,
              isInit = true,
            ),
          )
        }
        continue
      }
      if (line.isEmpty() || line.startsWith("#")) {
        continue
      }
      val duration = pendingDurationMs ?: 0L
      pendingDurationMs = null
      segments.add(
        MediaSegmentRef(
          uri = resolve(playlistUri, line),
          startMs = cursor,
          durationMs = duration,
        ),
      )
      cursor += duration
    }
    return segments
  }

  fun pickRung(variants: List<HlsVariantInfo>, maxHeight: Int): HlsVariantInfo? {
    if (variants.isEmpty()) {
      return null
    }
    val atOrBelow = variants.filter { it.height != null && it.height <= maxHeight }
    if (atOrBelow.isEmpty()) {
      return variants.first()
    }
    return atOrBelow.maxBy { it.height!! }
  }

  fun rewriteCacheOnly(
    body: String,
    playlistUri: String,
    isMaster: Boolean,
    hasCached: (String) -> Boolean,
  ): String {
    return if (isMaster) {
      rewriteMasterCacheOnly(body, playlistUri, hasCached)
    } else {
      rewriteMediaCacheOnly(body, playlistUri, hasCached)
    }
  }

  fun isPlayableRendition(
    body: String,
    playlistUri: String,
    hasCached: (String) -> Boolean,
  ): Boolean {
    val map = mapUri(body, playlistUri)
    if (map != null && !hasCached(map)) {
      return false
    }
    val firstMedia = parseMediaSegments(body, playlistUri).firstOrNull { !it.isInit } ?: return false
    return hasCached(firstMedia.uri)
  }

  fun mapUri(body: String, playlistUri: String): String? {
    for (raw in body.split(Regex("\r?\n"))) {
      val trimmed = raw.trim()
      if (trimmed.startsWith("#EXT-X-MAP:")) {
        val uri = Regex("""URI="([^"]+)"""").find(trimmed)?.groupValues?.get(1) ?: return null
        return resolve(playlistUri, uri)
      }
    }
    return null
  }

  private fun rewriteMasterCacheOnly(
    body: String,
    playlistUri: String,
    hasCached: (String) -> Boolean,
  ): String {
    val lines = body.split(Regex("\r?\n"))
    val output = ArrayList<String>()
    val pending = ArrayList<String>()
    for (raw in lines) {
      val trimmed = raw.trim()
      if (trimmed.startsWith("#EXT-X-STREAM-INF:")) {
        pending.add(raw)
        continue
      }
      if (pending.isNotEmpty()) {
        if (trimmed.isNotEmpty() && !trimmed.startsWith("#")) {
          val child = resolve(playlistUri, trimmed)
          if (hasCached(child)) {
            output.addAll(pending)
            output.add(raw)
          }
          pending.clear()
          continue
        }
        pending.add(raw)
        continue
      }
      output.add(raw)
    }
    return output.joinToString("\n")
  }

  private fun rewriteMediaCacheOnly(
    body: String,
    playlistUri: String,
    hasCached: (String) -> Boolean,
  ): String {
    val lines = body.split(Regex("\r?\n"))
    val output = ArrayList<String>()
    val pending = ArrayList<String>()
    var truncated = false
    for (raw in lines) {
      if (truncated) {
        break
      }
      val trimmed = raw.trim()
      if (trimmed.startsWith("#EXT-X-MAP:")) {
        val uri = Regex("""URI="([^"]+)"""").find(trimmed)?.groupValues?.get(1)
        if (uri != null && !hasCached(resolve(playlistUri, uri))) {
          truncated = true
          pending.clear()
          break
        }
        output.add(raw)
        continue
      }
      if (trimmed.startsWith("#EXTINF:") || trimmed.startsWith("#EXT-X-BYTERANGE:")) {
        pending.add(raw)
        continue
      }
      if (trimmed.isNotEmpty() && !trimmed.startsWith("#") && pending.isNotEmpty()) {
        val child = resolve(playlistUri, trimmed)
        if (!hasCached(child)) {
          truncated = true
          pending.clear()
          break
        }
        output.addAll(pending)
        output.add(raw)
        pending.clear()
        continue
      }
      output.add(raw)
    }
    if (!output.any { it.trim() == "#EXT-X-ENDLIST" }) {
      output.add("#EXT-X-ENDLIST")
    }
    return output.joinToString("\n")
  }

  fun resolve(base: String, ref: String): String {
    return URI(base).resolve(ref).toString()
  }

  private fun parseAttributes(source: String): Map<String, String> {
    val result = LinkedHashMap<String, String>()
    val pattern = Regex("""([A-Z0-9-]+)=("[^"]*"|[^,]*)""")
    for (match in pattern.findAll(source)) {
      var value = match.groupValues[2]
      if (value.startsWith("\"") && value.endsWith("\"")) {
        value = value.substring(1, value.length - 1)
      }
      result[match.groupValues[1]] = value
    }
    return result
  }

  private fun parseResolution(value: String?): Pair<Int?, Int?> {
    if (value == null) {
      return null to null
    }
    val parts = value.lowercase().split("x")
    if (parts.size != 2) {
      return null to null
    }
    return parts[0].toIntOrNull() to parts[1].toIntOrNull()
  }

  private fun isAudioOnly(codecs: String?, height: Int?): Boolean {
    if (height != null || codecs == null) {
      return false
    }
    val normalized = codecs.lowercase()
    val videoMarkers = listOf("avc", "hev", "hvc", "vp9", "av01")
    return videoMarkers.none { normalized.contains(it) }
  }
}
