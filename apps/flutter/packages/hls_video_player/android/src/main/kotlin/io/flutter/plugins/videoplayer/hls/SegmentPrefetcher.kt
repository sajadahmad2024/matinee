package io.flutter.plugins.videoplayer.hls

import android.content.Context
import androidx.media3.common.C
import androidx.media3.common.util.UnstableApi
import androidx.media3.datasource.DataSource
import androidx.media3.datasource.DataSpec
import androidx.media3.datasource.cache.Cache
import java.io.ByteArrayOutputStream

@UnstableApi
class SegmentPrefetcher(
  private val context: Context,
  private val cache: Cache,
  private val maxSegments: Int,
  private val maxHeight: Int,
  private val upstreamFactory: DataSource.Factory? = null,
) {
  fun prefetch(masterUri: String): Int {
    val factory =
      HlsCachingDataSource.Factory(
        context,
        masterUri,
        emptyMap(),
        null,
        upstreamFactory,
        cache,
      )
    val masterBody = readAll(factory, masterUri) ?: return 0
    val variants = HlsPlaylistParser.parseVariants(String(masterBody, Charsets.UTF_8), masterUri)
    val rung = HlsPlaylistParser.pickRung(variants, maxHeight) ?: return 0
    val mediaBody = readAll(factory, rung.playlistUri) ?: return 0
    val segments =
      HlsPlaylistParser.parseMediaSegments(String(mediaBody, Charsets.UTF_8), rung.playlistUri)
    var fetched = 0
    for (segment in segments) {
      if (segment.isInit) {
        readAll(factory, segment.uri)
        continue
      }
      if (fetched >= maxSegments) {
        break
      }
      if (readAll(factory, segment.uri) != null) {
        fetched++
      }
    }
    return fetched
  }

  private fun readAll(factory: DataSource.Factory, uri: String): ByteArray? {
    val source = factory.createDataSource()
    return try {
      source.open(DataSpec(android.net.Uri.parse(uri)))
      val out = ByteArrayOutputStream()
      val buffer = ByteArray(8 * 1024)
      while (true) {
        val n = source.read(buffer, 0, buffer.size)
        if (n == C.RESULT_END_OF_INPUT) {
          break
        }
        out.write(buffer, 0, n)
      }
      out.toByteArray()
    } catch (_: Exception) {
      null
    } finally {
      try {
        source.close()
      } catch (_: Exception) {
      }
    }
  }
}
