package io.flutter.plugins.videoplayer.hls

import android.content.Context
import android.net.Uri
import androidx.annotation.OptIn
import androidx.annotation.VisibleForTesting
import androidx.media3.common.C
import androidx.media3.common.util.UnstableApi
import androidx.media3.datasource.DataSource
import androidx.media3.datasource.DataSpec
import androidx.media3.datasource.DefaultHttpDataSource
import androidx.media3.datasource.TransferListener
import androidx.media3.datasource.cache.Cache
import androidx.media3.datasource.cache.CacheDataSource
import java.io.ByteArrayOutputStream
import java.io.IOException

/** Delegates to [CacheDataSource], substitutes by assetId, and rewrites cache-only playlists. */
@UnstableApi
class HlsCachingDataSource(
  private val upstream: DataSource,
  private val cache: Cache,
  private val masterOrigin: String?,
) : DataSource {
  private var openedUri: Uri? = null
  private var playlistBytes: ByteArray? = null
  private var playlistPos = 0
  private var upstreamOpen = false

  override fun addTransferListener(transferListener: TransferListener) {
    upstream.addTransferListener(transferListener)
  }

  @Throws(IOException::class)
  override fun open(dataSpec: DataSpec): Long {
    playlistBytes = null
    playlistPos = 0
    val requested = dataSpec.uri.toString()
    val kind = HlsEngine.kindFor(requested, masterOrigin)
    val isPlaylist = kind == "masterPlaylist" || kind == "mediaPlaylist"
    var spec = dataSpec
    var skipReason: String? = null
    var substitutedOrigin: String? = null
    val originalKey = dataSpec.key ?: requested
    val lengthHint =
      if (dataSpec.length == C.LENGTH_UNSET.toLong()) 1L else dataSpec.length
    val exactCached = cache.isCached(originalKey, dataSpec.position, lengthHint)

    if (!isPlaylist &&
      dataSpec.position == 0L &&
      !exactCached &&
      !HlsEngine.shouldForceOrigin(requested)
    ) {
      if (kind == "segment") {
        val substitute = HlsEngine.findSubstitute(requested)
        if (substitute != null && HlsEngine.isCached(substitute.originUri)) {
          spec =
            dataSpec
              .buildUpon()
              .setUri(Uri.parse(substitute.originUri))
              .setKey(substitute.originUri)
              .build()
          skipReason = "substituted"
          substitutedOrigin = substitute.originUri
        } else if (HlsEngine.isCacheOnlyFor(HlsEngine.assetIdFor(requested, masterOrigin))) {
          HlsEngine.emitFetch(
            originUri = requested,
            servedFromCache = false,
            byteLength = 0,
            kind = kind,
            error = "cache-only miss",
            cacheSkipReason = "cancelled",
          )
          throw IOException("cache-only miss for $requested")
        }
      } else if (HlsEngine.isCacheOnlyFor(HlsEngine.assetIdFor(requested, masterOrigin))) {
        HlsEngine.emitFetch(
          originUri = requested,
          servedFromCache = false,
          byteLength = 0,
          kind = kind,
          error = "cache-only miss",
          cacheSkipReason = "cancelled",
        )
        throw IOException("cache-only miss for $requested")
      }
    }

    val servedFromCache =
      skipReason == "substituted" ||
        cache.isCached(spec.key ?: spec.uri.toString(), spec.position, lengthHint)
    val length = upstream.open(spec)
    upstreamOpen = true
    openedUri = spec.uri

    if (isPlaylist) {
      val originBytes = drainUpstream()
      closeUpstreamQuietly()
      val originText = String(originBytes, Charsets.UTF_8)
      HlsEngine.ingestPlaylist(requested, originText, masterOrigin)
      val assetId = HlsEngine.assetIdFor(requested, masterOrigin)
      val body =
        if (HlsEngine.isCacheOnlyFor(assetId)) {
          val rewritten =
            HlsEngine.rewriteCacheOnlyPlaylist(requested, originText, masterOrigin)
          val rewrittenText = String(rewritten, Charsets.UTF_8)
          if (
            kind == "masterPlaylist" &&
              HlsPlaylistParser.parseVariants(originText, requested).isNotEmpty() &&
              HlsPlaylistParser.parseVariants(rewrittenText, requested).isEmpty()
          ) {
            HlsEngine.emitFetch(
              originUri = requested,
              servedFromCache = servedFromCache,
              byteLength = 0L,
              kind = kind,
              error = "cache-only miss",
            )
            throw IOException("cache-only miss for $requested")
          }
          rewritten
        } else {
          originBytes
        }
      playlistBytes = body
      HlsEngine.emitFetch(
        originUri = requested,
        servedFromCache = servedFromCache,
        byteLength = body.size.toLong(),
        kind = kind,
      )
      return body.size.toLong()
    }

    val reportedLength = if (length == C.LENGTH_UNSET.toLong()) 0L else length
    HlsEngine.emitFetch(
      originUri = requested,
      servedFromCache = servedFromCache,
      byteLength = reportedLength,
      kind = kind,
      cacheSkipReason = skipReason,
      substitutedOriginUri = substitutedOrigin,
    )
    if (skipReason == "substituted") {
      HlsEngine.scheduleUpgrade(requested, masterOrigin)
    } else if (kind == "segment" && (servedFromCache || dataSpec.position == 0L)) {
      HlsEngine.recordCachedSegment(requested)
    }
    return length
  }

  @Throws(IOException::class)
  override fun read(buffer: ByteArray, offset: Int, length: Int): Int {
    val memory = playlistBytes
    if (memory != null) {
      if (playlistPos >= memory.size) {
        return C.RESULT_END_OF_INPUT
      }
      val n = minOf(length, memory.size - playlistPos)
      System.arraycopy(memory, playlistPos, buffer, offset, n)
      playlistPos += n
      return n
    }
    return upstream.read(buffer, offset, length)
  }

  override fun getUri(): Uri? = openedUri ?: upstream.uri

  override fun getResponseHeaders(): Map<String, List<String>> {
    if (playlistBytes != null) {
      return emptyMap()
    }
    return upstream.responseHeaders
  }

  @Throws(IOException::class)
  override fun close() {
    openedUri = null
    playlistBytes = null
    playlistPos = 0
    closeUpstreamQuietly()
  }

  private fun drainUpstream(): ByteArray {
    val out = ByteArrayOutputStream()
    val buffer = ByteArray(8 * 1024)
    while (true) {
      val n = upstream.read(buffer, 0, buffer.size)
      if (n == C.RESULT_END_OF_INPUT) {
        break
      }
      out.write(buffer, 0, n)
    }
    return out.toByteArray()
  }

  private fun closeUpstreamQuietly() {
    if (!upstreamOpen) {
      return
    }
    upstreamOpen = false
    try {
      upstream.close()
    } catch (_: Exception) {
    }
  }

  @OptIn(UnstableApi::class)
  class Factory
  @JvmOverloads
  constructor(
    private val context: Context,
    private val masterOrigin: String?,
    private val httpHeaders: Map<String, String>,
    private val userAgent: String?,
    private val upstreamFactory: DataSource.Factory? = null,
    private val cacheOverride: Cache? = null,
  ) : DataSource.Factory {
    override fun createDataSource(): DataSource {
      HlsEngine.ensureInitialized(context)
      val cache = cacheOverride ?: HlsEngine.cache()
      val descriptor = HlsEngine.descriptorFor(masterOrigin)
      val headers = LinkedHashMap<String, String>()
      headers.putAll(httpHeaders)
      headers.putAll(descriptor?.authHeaders().orEmpty())
      val http =
        upstreamFactory
          ?: DefaultHttpDataSource.Factory()
            .setUserAgent(userAgent)
            .setAllowCrossProtocolRedirects(true)
            .setDefaultRequestProperties(headers)
      val cacheSource =
        CacheDataSource.Factory()
          .setCache(cache)
          .setUpstreamDataSourceFactory(http)
          .setFlags(CacheDataSource.FLAG_IGNORE_CACHE_ON_ERROR)
          .createDataSource()
      return HlsCachingDataSource(cacheSource, cache, masterOrigin)
    }

    @VisibleForTesting
    internal constructor(
      context: Context,
      cache: Cache,
      upstream: DataSource.Factory,
      masterOrigin: String?,
    ) : this(
      context = context,
      masterOrigin = masterOrigin,
      httpHeaders = emptyMap(),
      userAgent = null,
      upstreamFactory = upstream,
      cacheOverride = cache,
    )
  }
}
