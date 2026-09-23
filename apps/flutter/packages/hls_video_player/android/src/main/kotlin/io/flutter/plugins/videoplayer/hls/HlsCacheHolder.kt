package io.flutter.plugins.videoplayer.hls

import android.content.Context
import androidx.media3.common.util.UnstableApi
import androidx.media3.database.StandaloneDatabaseProvider
import androidx.media3.datasource.cache.LeastRecentlyUsedCacheEvictor
import androidx.media3.datasource.cache.SimpleCache
import java.io.File

/** Process-wide SimpleCache (LRU byte storage). */
@UnstableApi
internal class HlsCacheHolder(context: Context) {
  val cache: SimpleCache

  init {
    val dir = File(context.applicationContext.cacheDir, CACHE_DIR)
    if (!dir.exists()) {
      dir.mkdirs()
    }
    cache =
      SimpleCache(
        dir,
        LeastRecentlyUsedCacheEvictor(MAX_BYTES),
        StandaloneDatabaseProvider(context.applicationContext),
      )
  }

  fun stats(): Map<String, Any> {
    var stored = 0L
    val keys = cache.keys
    for (key in keys) {
      stored += cache.getCachedBytes(key, 0, Long.MAX_VALUE)
    }
    return mapOf(
      "backendName" to "simpleCache",
      "entryCount" to keys.size,
      "storedBytes" to stored,
    )
  }

  fun clear() {
    for (key in cache.keys.toList()) {
      cache.removeResource(key)
    }
  }

  fun release() {
    cache.release()
  }

  companion object {
    private const val CACHE_DIR = "hls_engine_cache"
    private const val MAX_BYTES = 256L * 1024L * 1024L
  }
}
