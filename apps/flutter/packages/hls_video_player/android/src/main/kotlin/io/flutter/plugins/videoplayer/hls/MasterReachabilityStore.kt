package io.flutter.plugins.videoplayer.hls

import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.ConcurrentHashMap

fun interface OriginProber {
  fun isReachable(masterUri: String): Boolean
}

class HttpOriginProber(
  private val timeoutMs: Int = 4_000,
) : OriginProber {
  override fun isReachable(masterUri: String): Boolean {
    for (method in listOf("HEAD", "GET")) {
      var connection: HttpURLConnection? = null
      try {
        connection = URL(masterUri).openConnection() as HttpURLConnection
        connection.connectTimeout = timeoutMs
        connection.readTimeout = timeoutMs
        connection.instanceFollowRedirects = true
        connection.requestMethod = method
        connection.connect()
        val code = connection.responseCode
        if (code in 200..399) {
          return true
        }
      } catch (_: Exception) {
      } finally {
        connection?.disconnect()
      }
    }
    return false
  }
}

/** Per-master origin reachability and cache-only state. */
class MasterReachabilityStore(
  private val prober: OriginProber = HttpOriginProber(),
  private val maxRemembered: Int = 64,
) {
  private val cacheOnlyByMaster = ConcurrentHashMap<String, Boolean>()
  private val startedMasters = LinkedHashSet<String>()
  private val startInFlight = ConcurrentHashMap<String, Any>()

  @Synchronized
  fun start(masterUri: String) {
    val first = startedMasters.add(masterUri)
    if (first) {
      cacheOnlyByMaster[masterUri] = !prober.isReachable(masterUri)
    }
  }

  fun isCacheOnlyFor(masterUri: String): Boolean = cacheOnlyByMaster[masterUri] == true

  fun refreshReachability(masters: List<String>): List<String> {
    val targets = masters.filter { cacheOnlyByMaster[it] == true }
    if (targets.isEmpty()) {
      return emptyList()
    }
    val flipped = mutableListOf<String>()
    for (uri in targets) {
      if (prober.isReachable(uri)) {
        cacheOnlyByMaster[uri] = false
        flipped.add(uri)
      }
    }
    return flipped
  }

  @Synchronized
  fun retainStartedMasters(retain: Collection<String>) {
    val keep = retain.toSet()
    val cap = maxRemembered + keep.size
    if (startedMasters.size <= cap) {
      return
    }
    val drop = startedMasters.filter { it !in keep }.toList()
    for (uri in drop) {
      if (startedMasters.size <= cap) {
        break
      }
      startedMasters.remove(uri)
      cacheOnlyByMaster.remove(uri)
    }
  }

  fun rememberedCount(): Int = startedMasters.size

  fun clear() {
    cacheOnlyByMaster.clear()
    startedMasters.clear()
    startInFlight.clear()
  }
}
