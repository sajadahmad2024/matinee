package io.flutter.plugins.videoplayer.hls

/** Parsed subset of the Dart content descriptor used by the Android cache path. */
data class HlsNativeDescriptor(
  val assetId: String,
  val originUrl: String,
  val drm: String = "none",
  val cachePolicy: String,
  val headerName: String?,
  val headerValue: String?,
  val certificateUrl: String? = null,
  val licenseServerUrl: String? = null,
  val contentId: String? = null,
  val prefetchEnabled: Boolean = true,
  val substitutionEnabled: Boolean = true,
  val maxPrefetchSegments: Int = 10,
  val maxPrefetchHeight: Int = 480,
) {
  val shouldCache: Boolean
    get() = cachePolicy != "none"

  fun authHeaders(): Map<String, String> {
    if (headerName.isNullOrEmpty() || headerValue == null) {
      return emptyMap()
    }
    return mapOf(headerName to headerValue)
  }

  companion object {
    @JvmStatic
    fun fromChannelMap(raw: Map<*, *>?): HlsNativeDescriptor {
      if (raw == null) {
        throw IllegalArgumentException("originUrl is required")
      }
      val origin = raw["originUrl"] as? String
      if (origin.isNullOrEmpty()) {
        throw IllegalArgumentException("originUrl is required")
      }
      val assetId = (raw["assetId"] as? String).takeUnless { it.isNullOrEmpty() } ?: origin
      val auth = raw["authConfig"] as? Map<*, *>
      val drmConfig = raw["drmConfig"] as? Map<*, *>
      return HlsNativeDescriptor(
        assetId = assetId,
        originUrl = origin,
        drm = (raw["drm"] as? String) ?: "none",
        cachePolicy = (raw["cachePolicy"] as? String) ?: "liveSegmentCache",
        headerName = auth?.get("headerName") as? String,
        headerValue = auth?.get("headerValue") as? String,
        certificateUrl = drmConfig?.get("certificateUrl") as? String,
        licenseServerUrl = drmConfig?.get("licenseServerUrl") as? String,
        contentId = drmConfig?.get("contentId") as? String,
        prefetchEnabled = raw["prefetchEnabled"] as? Boolean ?: true,
        substitutionEnabled = raw["substitutionEnabled"] as? Boolean ?: true,
        maxPrefetchSegments = (raw["maxPrefetchSegments"] as? Number)?.toInt() ?: 10,
        maxPrefetchHeight = (raw["maxPrefetchHeight"] as? Number)?.toInt() ?: 480,
      )
    }
  }
}

class UnsupportedDrmException(message: String) : IllegalArgumentException(message)
