package io.flutter.plugins.videoplayer.hls

import android.content.Context
import android.net.Uri
import android.os.Handler
import android.os.Looper
import androidx.annotation.VisibleForTesting
import androidx.media3.common.C
import androidx.media3.common.MediaItem
import androidx.media3.common.util.UnstableApi
import androidx.media3.datasource.DataSource
import androidx.media3.datasource.DataSpec
import androidx.media3.datasource.cache.Cache
import androidx.media3.datasource.cache.CacheDataSource
import androidx.media3.datasource.cache.ContentMetadata
import io.flutter.plugin.common.EventChannel
import java.io.ByteArrayOutputStream
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.CopyOnWriteArrayList
import java.util.concurrent.Executors

/** Process-wide HLS engine: descriptors, cache, HUD events, substitution. */
@UnstableApi
object HlsEngine {
  private val descriptors = ConcurrentHashMap<String, HlsNativeDescriptor>()
  private val resources = ConcurrentHashMap<String, HlsResource>()
  private val playlistBodies = ConcurrentHashMap<String, String>()
  private val forceOrigin = ConcurrentHashMap.newKeySet<String>()
  private val mainHandler = Handler(Looper.getMainLooper())
  private val recordedEvents = CopyOnWriteArrayList<Map<String, Any>>()
  private val executor = Executors.newCachedThreadPool()
  private val timeline = SegmentTimeline()
  private var reachability = MasterReachabilityStore()

  @Volatile private var appContext: Context? = null
  @Volatile private var cacheHolder: HlsCacheHolder? = null
  @Volatile private var eventSink: EventChannel.EventSink? = null
  @Volatile private var testUpstreamFactory: DataSource.Factory? = null

  @JvmStatic
  fun ensureInitialized(context: Context) {
    appContext = context.applicationContext
    if (cacheHolder == null) {
      synchronized(this) {
        if (cacheHolder == null) {
          cacheHolder = HlsCacheHolder(context.applicationContext)
        }
      }
    }
  }

  @JvmStatic
  fun registerDescriptor(descriptor: HlsNativeDescriptor) {
    val origin = normalize(descriptor.originUrl)
    descriptors[origin] = descriptor
    resources[origin] =
      HlsResource(
        originUri = descriptor.originUrl,
        kind = inferKind(descriptor.originUrl, descriptor.originUrl),
        assetId = descriptor.assetId,
      )
  }

  @JvmStatic
  fun openAssetResult(descriptor: HlsNativeDescriptor): Map<String, Any> {
    if (descriptor.drm == "fairplay") {
      throw UnsupportedDrmException("FairPlay is not supported on Android")
    }
    registerDescriptor(descriptor)
    startMaster(descriptor.originUrl)
    return mapOf(
      "playerUri" to descriptor.originUrl,
      "strategy" to "direct",
    )
  }

  @JvmStatic
  fun drmConfiguration(uri: String?): MediaItem.DrmConfiguration? {
    val descriptor = descriptorFor(uri) ?: return null
    if (descriptor.drm != "widevine") {
      return null
    }
    val license = descriptor.licenseServerUrl ?: return null
    val builder =
      MediaItem.DrmConfiguration.Builder(C.WIDEVINE_UUID).setLicenseUri(Uri.parse(license))
    val headers = descriptor.authHeaders()
    if (headers.isNotEmpty()) {
      builder.setLicenseRequestHeaders(headers)
    }
    return builder.build()
  }

  @JvmStatic
  fun startMaster(originUrl: String) {
    reachability.start(normalize(originUrl))
  }

  @JvmStatic
  fun shouldCache(uri: String?): Boolean {
    if (uri.isNullOrEmpty()) {
      return false
    }
    val descriptor = descriptors[normalize(uri)] ?: return false
    return descriptor.shouldCache
  }

  @JvmStatic
  fun descriptorFor(uri: String?): HlsNativeDescriptor? {
    if (uri.isNullOrEmpty()) {
      return null
    }
    return descriptors[normalize(uri)]
  }

  @JvmStatic
  fun resourceFor(uri: String?): HlsResource? {
    if (uri.isNullOrEmpty()) {
      return null
    }
    return resources[normalize(uri)]
  }

  @JvmStatic
  fun cache(): Cache {
    return cacheHolder?.cache ?: throw IllegalStateException("HlsEngine cache is not initialized")
  }

  @JvmStatic
  fun isCached(uri: String): Boolean {
    return isFullyCached(uri)
  }

  @JvmStatic
  fun isFullyCached(uri: String): Boolean {
    val holder = cacheHolder ?: return false
    val key = uri
    val contentLength = ContentMetadata.getContentLength(holder.cache.getContentMetadata(key))
    if (contentLength != C.LENGTH_UNSET.toLong()) {
      return holder.cache.isCached(key, 0, contentLength)
    }
    return holder.cache.getCachedLength(key, 0, Long.MAX_VALUE) > 8
  }

  @JvmStatic
  fun cacheStats(): Map<String, Any> {
    return cacheHolder?.stats()
      ?: mapOf("backendName" to "none", "entryCount" to 0, "storedBytes" to 0L)
  }

  @JvmStatic
  fun clearCache() {
    cacheHolder?.clear()
    timeline.clear()
  }

  @JvmStatic
  fun isCacheOnlyFor(masterUri: String): Boolean = reachability.isCacheOnlyFor(normalize(masterUri))

  @JvmStatic
  fun refreshReachability(masters: List<String>): List<String> {
    val originalByNormalized = LinkedHashMap<String, String>()
    for (original in masters) {
      originalByNormalized.putIfAbsent(normalize(original), original)
    }
    val normalized = originalByNormalized.keys.toList()
    reachability.retainStartedMasters(normalized)
    return reachability.refreshReachability(normalized).map { flipped ->
      originalByNormalized[flipped] ?: flipped
    }
  }

  @JvmStatic
  fun prefetchMaster(masterUri: String): Int {
    val context = appContext ?: return 0
    val descriptor = descriptorFor(masterUri) ?: return 0
    if (!descriptor.prefetchEnabled) {
      return 0
    }
    ensureInitialized(context)
    return SegmentPrefetcher(
        context = context,
        cache = cache(),
        maxSegments = descriptor.maxPrefetchSegments,
        maxHeight = descriptor.maxPrefetchHeight,
        upstreamFactory = testUpstreamFactory,
      )
      .prefetch(masterUri)
  }

  /** Registers [descriptor] and warms cache. Never probes reachability. */
  @JvmStatic
  fun prefetchToDisk(descriptor: HlsNativeDescriptor): Int {
    if (!descriptor.prefetchEnabled) {
      return 0
    }
    val context = appContext ?: return 0
    registerDescriptor(descriptor)
    ensureInitialized(context)
    return try {
      SegmentPrefetcher(
          context = context,
          cache = cache(),
          maxSegments = descriptor.maxPrefetchSegments,
          maxHeight = descriptor.maxPrefetchHeight,
          upstreamFactory = testUpstreamFactory,
        )
        .prefetch(descriptor.originUrl)
    } catch (_: Exception) {
      0
    }
  }

  @JvmStatic
  fun runBackground(task: Runnable) {
    executor.execute(task)
  }

  @JvmStatic
  fun setEventSink(sink: EventChannel.EventSink?) {
    eventSink = sink
  }

  fun ingestPlaylist(originUri: String, body: String, masterOrigin: String?) {
    playlistBodies[normalize(originUri)] = body
    val kind = kindFor(originUri, masterOrigin)
    val assetId = assetIdFor(originUri, masterOrigin)
    if (kind == "masterPlaylist") {
      val variants = HlsPlaylistParser.parseVariants(body, originUri)
      for (variant in variants) {
        resources[normalize(variant.playlistUri)] =
          HlsResource(
            originUri = variant.playlistUri,
            kind = "mediaPlaylist",
            assetId = assetId,
            variant = variant,
          )
      }
    } else if (kind == "mediaPlaylist") {
      val parent = resourceFor(originUri)
      val variant = parent?.variant
      val segments = HlsPlaylistParser.parseMediaSegments(body, originUri)
      for (segment in segments) {
        resources[normalize(segment.uri)] =
          HlsResource(
            originUri = segment.uri,
            kind = if (segment.isInit) "initSegment" else "segment",
            assetId = assetId,
            variant = variant,
            segmentStartMs = segment.startMs,
            segmentDurationMs = segment.durationMs,
          )
      }
    }
  }

  fun rewriteCacheOnlyPlaylist(originUri: String, body: String, masterOrigin: String?): ByteArray {
    val kind = kindFor(originUri, masterOrigin)
    val rewritten =
      HlsPlaylistParser.rewriteCacheOnly(
        body,
        originUri,
        kind == "masterPlaylist",
      ) { child ->
        if (kind == "masterPlaylist") {
          hasPlayableRendition(child)
        } else {
          isFullyCached(child)
        }
      }
    return rewritten.toByteArray(Charsets.UTF_8)
  }

  fun hasPlayableRendition(playlistUri: String): Boolean {
    val key = normalize(playlistUri)
    val text =
      playlistBodies[key]
        ?: readCachedPlaylist(playlistUri)?.also { playlistBodies[key] = it }
        ?: return false
    return HlsPlaylistParser.isPlayableRendition(text, playlistUri, ::isFullyCached)
  }

  private fun readCachedPlaylist(uri: String): String? {
    val holder = cacheHolder ?: return null
    if (!isFullyCached(uri)) {
      return null
    }
    val source = CacheDataSource(holder.cache, /* upstream= */ null)
    return try {
      source.open(DataSpec(Uri.parse(uri)))
      val out = ByteArrayOutputStream()
      val buffer = ByteArray(8 * 1024)
      while (true) {
        val n = source.read(buffer, 0, buffer.size)
        if (n == C.RESULT_END_OF_INPUT) {
          break
        }
        out.write(buffer, 0, n)
      }
      String(out.toByteArray(), Charsets.UTF_8)
    } catch (_: Exception) {
      null
    } finally {
      try {
        source.close()
      } catch (_: Exception) {
      }
    }
  }

  fun findSubstitute(requestedUri: String): TimelineEntry? {
    val resource = resourceFor(requestedUri) ?: return null
    if (resource.kind != "segment") {
      return null
    }
    val descriptor = descriptors[normalize(resource.assetId)]
    if (descriptor?.substitutionEnabled == false) {
      return null
    }
    val start = resource.segmentStartMs ?: return null
    return timeline.findSubstitute(
      assetId = resource.assetId,
      requestedStartMs = start,
      excludeOrigin = requestedUri,
      preferVariant = resource.variant,
    )
  }

  fun shouldForceOrigin(uri: String): Boolean = forceOrigin.contains(normalize(uri))

  fun recordCachedSegment(originUri: String) {
    val resource = resourceFor(originUri) ?: return
    val start = resource.segmentStartMs ?: return
    val duration = resource.segmentDurationMs ?: return
    if (resource.kind != "segment") {
      return
    }
    timeline.record(
      TimelineEntry(
        assetId = resource.assetId,
        originUri = originUri,
        segmentStartMs = start,
        segmentDurationMs = duration,
        variant = resource.variant,
      ),
    )
  }

  fun scheduleUpgrade(requestedUri: String, masterOrigin: String?) {
    if (isCacheOnlyFor(assetIdFor(requestedUri, masterOrigin))) {
      return
    }
    val context = appContext ?: return
    runBackground {
      forceOrigin.add(normalize(requestedUri))
      try {
        val factory =
          HlsCachingDataSource.Factory(
            context,
            masterOrigin,
            emptyMap(),
            null,
            testUpstreamFactory,
            cache(),
          )
        val source = factory.createDataSource()
        try {
          source.open(androidx.media3.datasource.DataSpec(android.net.Uri.parse(requestedUri)))
          val buffer = ByteArray(8 * 1024)
          while (true) {
            val n = source.read(buffer, 0, buffer.size)
            if (n == androidx.media3.common.C.RESULT_END_OF_INPUT) {
              break
            }
          }
        } finally {
          source.close()
        }
      } catch (_: Exception) {
      } finally {
        forceOrigin.remove(normalize(requestedUri))
      }
    }
  }

  fun variantsPayload(originUri: String): List<Map<String, Any>> {
    return resources.values
      .filter { it.kind == "mediaPlaylist" && it.assetId == assetIdFor(originUri, originUri) }
      .mapNotNull { it.variant?.toChannelMap() }
  }

  fun emitFetch(payload: Map<String, Any>) {
    recordedEvents.add(payload)
    if (recordedEvents.size > 100) {
      recordedEvents.removeAt(0)
    }
    val sink = eventSink ?: return
    mainHandler.post { sink.success(payload) }
  }

  @JvmStatic
  fun emitFetch(
    originUri: String,
    servedFromCache: Boolean,
    byteLength: Long,
    kind: String,
    cacheSkipReason: String? = null,
    substitutedOriginUri: String? = null,
    error: String? = null,
  ) {
    val resource = resourceFor(originUri)
    val payload = LinkedHashMap<String, Any>()
    payload["kind"] = kind
    payload["originUri"] = originUri
    payload["byteLength"] = byteLength
    payload["occurredAt"] = System.currentTimeMillis()
    payload["servedFromCache"] = servedFromCache
    resource?.variant?.let { payload["variant"] = it.toChannelMap() }
    resource?.segmentDurationMs?.let { payload["segmentDurationMs"] = it }
    resource?.segmentStartMs?.let { payload["segmentStartMs"] = it }
    if (cacheSkipReason != null) {
      payload["cacheSkipReason"] = cacheSkipReason
    }
    if (substitutedOriginUri != null) {
      payload["substitutedOriginUri"] = substitutedOriginUri
    }
    if (error != null) {
      payload["error"] = error
    }
    if (kind == "masterPlaylist") {
      val variants = variantsPayload(originUri)
      if (variants.isNotEmpty()) {
        payload["variants"] = variants
      }
    }
    emitFetch(payload)
  }

  @JvmStatic
  fun kindFor(uri: String, masterOrigin: String?): String {
    resourceFor(uri)?.kind?.let {
      return it
    }
    return inferKind(uri, masterOrigin)
  }

  private fun inferKind(uri: String, masterOrigin: String?): String {
    val path = android.net.Uri.parse(uri).path?.lowercase() ?: ""
    return when {
      path.endsWith(".m3u8") || path.endsWith(".m3u") -> {
        if (masterOrigin != null && normalize(uri) == normalize(masterOrigin)) {
          "masterPlaylist"
        } else {
          "mediaPlaylist"
        }
      }
      path.contains("init") && (path.endsWith(".mp4") || path.endsWith(".m4s")) -> "initSegment"
      path.endsWith(".ts") || path.endsWith(".m4s") || path.endsWith(".mp4") -> "segment"
      path.endsWith(".key") -> "key"
      else -> "unknown"
    }
  }

  fun assetIdFor(uri: String, masterOrigin: String?): String {
    resourceFor(uri)?.assetId?.let {
      return it
    }
    if (masterOrigin != null) {
      return descriptorFor(masterOrigin)?.assetId ?: masterOrigin
    }
    return uri
  }

  @VisibleForTesting
  fun recordedEvents(): List<Map<String, Any>> = recordedEvents.toList()

  @VisibleForTesting
  fun timeline(): SegmentTimeline = timeline

  @VisibleForTesting
  fun setOriginProberForTest(prober: OriginProber) {
    reachability = MasterReachabilityStore(prober)
  }

  @VisibleForTesting
  fun setTestUpstreamFactory(factory: DataSource.Factory?) {
    testUpstreamFactory = factory
  }

  @VisibleForTesting
  fun rememberedMasterCount(): Int = reachability.rememberedCount()

  @VisibleForTesting
  fun clearPlaylistBodiesForTest() {
    playlistBodies.clear()
  }

  @VisibleForTesting
  fun resetForTest() {
    descriptors.clear()
    resources.clear()
    playlistBodies.clear()
    forceOrigin.clear()
    recordedEvents.clear()
    timeline.clear()
    reachability = MasterReachabilityStore()
    eventSink = null
    testUpstreamFactory = null
    cacheHolder?.release()
    cacheHolder = null
  }

  internal fun normalize(uri: String): String {
    val parsed = android.net.Uri.parse(uri)
    return parsed.buildUpon().fragment(null).build().toString()
  }
}
