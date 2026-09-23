package io.flutter.plugins.videoplayer.hls

import androidx.media3.common.C
import androidx.media3.common.util.UnstableApi
import androidx.media3.datasource.DataSpec
import androidx.test.core.app.ApplicationProvider
import java.util.Arrays
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
@UnstableApi
class HlsEngineParityTest {
  private val masterA = "https://cdn.example.com/a/master.m3u8"
  private val masterB = "https://cdn.example.com/b/master.m3u8"
  private val lowA = "https://cdn.example.com/a/low.m3u8"
  private val highA = "https://cdn.example.com/a/high.m3u8"
  private val lowSegA = "https://cdn.example.com/a/low/seg0.ts"
  private val highSegA = "https://cdn.example.com/a/high/seg0.ts"
  private val highSegB = "https://cdn.example.com/b/high/seg0.ts"

  @Before
  fun setUp() {
    HlsEngine.resetForTest()
    HlsEngine.ensureInitialized(ApplicationProvider.getApplicationContext())
  }

  @After
  fun tearDown() {
    HlsEngine.resetForTest()
  }

  @Test
  fun substituteNeverCrossesAssetId() {
    registerMaster(masterA)
    registerMaster(masterB)
    HlsEngine.ingestPlaylist(
      masterA,
      """
      #EXTM3U
      #EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360
      low.m3u8
      #EXT-X-STREAM-INF:BANDWIDTH=2500000,RESOLUTION=1280x720
      high.m3u8
      """.trimIndent(),
      masterA,
    )
    HlsEngine.ingestPlaylist(
      lowA,
      """
      #EXTM3U
      #EXTINF:2.0,
      low/seg0.ts
      """.trimIndent(),
      masterA,
    )
    HlsEngine.ingestPlaylist(
      highA,
      """
      #EXTM3U
      #EXTINF:2.0,
      high/seg0.ts
      """.trimIndent(),
      masterA,
    )
    HlsEngine.ingestPlaylist(
      "https://cdn.example.com/b/high.m3u8",
      """
      #EXTM3U
      #EXTINF:2.0,
      high/seg0.ts
      """.trimIndent(),
      masterB,
    )

    HlsEngine.timeline()
      .record(
        TimelineEntry(
          assetId = masterA,
          originUri = lowSegA,
          segmentStartMs = 0,
          segmentDurationMs = 2000,
        ),
      )

    val sameAsset =
      HlsEngine.timeline()
        .findSubstitute(masterA, 500, highSegA, null)
    val otherAsset =
      HlsEngine.timeline()
        .findSubstitute(masterB, 500, highSegB, null)

    assertNotNull(sameAsset)
    assertEquals(lowSegA, sameAsset!!.originUri)
    assertNull(otherAsset)
  }

  @Test
  fun oneUnreachableMasterDoesNotForceAnotherIntoCacheOnly() {
    val reachable = mutableMapOf(masterA to true, masterB to false)
    HlsEngine.setOriginProberForTest { reachable[it] == true }
    HlsEngine.startMaster(masterA)
    HlsEngine.startMaster(masterB)
    assertFalse(HlsEngine.isCacheOnlyFor(masterA))
    assertTrue(HlsEngine.isCacheOnlyFor(masterB))
  }

  @Test
  fun refreshReachabilityFlipsOnlyListedMasters() {
    val reachable = mutableMapOf(masterA to false, masterB to false)
    HlsEngine.setOriginProberForTest { reachable[it] == true }
    HlsEngine.startMaster(masterA)
    HlsEngine.startMaster(masterB)
    assertTrue(HlsEngine.isCacheOnlyFor(masterA))
    assertTrue(HlsEngine.isCacheOnlyFor(masterB))

    reachable[masterA] = true
    reachable[masterB] = true
    assertEquals(listOf(masterA), HlsEngine.refreshReachability(listOf(masterA)))
    assertFalse(HlsEngine.isCacheOnlyFor(masterA))
    assertTrue(HlsEngine.isCacheOnlyFor(masterB))

    assertEquals(listOf(masterB), HlsEngine.refreshReachability(listOf(masterB)))
    assertFalse(HlsEngine.isCacheOnlyFor(masterB))
  }

  @Test
  fun refreshReachabilityReturnsOriginalMasterStrings() {
    val original = "$masterA#clip"
    val reachable = mutableMapOf(HlsEngine.normalize(original) to false)
    HlsEngine.setOriginProberForTest { reachable[it] == true }
    HlsEngine.startMaster(original)
    reachable[HlsEngine.normalize(original)] = true
    assertEquals(listOf(original), HlsEngine.refreshReachability(listOf(original)))
  }

  @Test
  fun prefetchToDiskDoesNotStartMasterAndCachesRung() {
    HlsEngine.setOriginProberForTest { false }
    val masterBody =
      """
      #EXTM3U
      #EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360
      low.m3u8
      #EXT-X-STREAM-INF:BANDWIDTH=2500000,RESOLUTION=1280x720
      high.m3u8
      """.trimIndent()
    val mediaBody =
      """
      #EXTM3U
      #EXTINF:2.0,
      low/seg0.ts
      """.trimIndent()
    HlsEngine.setTestUpstreamFactory {
      UriMappedDataSource(
        mapOf(
          masterA to masterBody.toByteArray(),
          lowA to mediaBody.toByteArray(),
          lowSegA to ByteArray(16) { 1 },
        ),
      )
    }
    val count =
      HlsEngine.prefetchToDisk(
        HlsNativeDescriptor.fromChannelMap(
          mapOf(
            "originUrl" to masterA,
            "assetId" to masterA,
            "cachePolicy" to "liveSegmentCache",
            "maxPrefetchSegments" to 10,
            "maxPrefetchHeight" to 480,
          ),
        ),
      )
    assertEquals(1, count)
    assertFalse(HlsEngine.isCacheOnlyFor(masterA))
    assertEquals(0, HlsEngine.rememberedMasterCount())
    assertTrue(HlsEngine.isFullyCached(lowSegA))
    HlsEngine.startMaster(masterA)
    assertTrue(HlsEngine.isCacheOnlyFor(masterA))
  }

  @Test
  fun substitutedSegmentIsCacheHitAndStaysOnSameAsset() {
    registerMaster(masterA)
    HlsEngine.ingestPlaylist(
      lowA,
      """
      #EXTM3U
      #EXTINF:2.0,
      low/seg0.ts
      """.trimIndent(),
      masterA,
    )
    HlsEngine.ingestPlaylist(
      highA,
      """
      #EXTM3U
      #EXTINF:2.0,
      high/seg0.ts
      """.trimIndent(),
      masterA,
    )
    val lowBody = ByteArray(512)
    Arrays.fill(lowBody, 3.toByte())
    val highBody = ByteArray(512)
    Arrays.fill(highBody, 9.toByte())
    val bodies =
      mapOf(
        lowSegA to lowBody,
        highSegA to highBody,
      )
    val context = ApplicationProvider.getApplicationContext<android.content.Context>()
    val factory =
      HlsCachingDataSource.Factory(
        context,
        masterA,
        emptyMap(),
        null,
        { UriMappedDataSource(bodies) },
        HlsEngine.cache(),
      )

    val first = factory.createDataSource()
    first.open(DataSpec(android.net.Uri.parse(lowSegA)))
    val buf = ByteArray(lowBody.size)
    var read = 0
    while (read < lowBody.size) {
      val n = first.read(buf, read, lowBody.size - read)
      if (n == C.RESULT_END_OF_INPUT) {
        break
      }
      read += n
    }
    first.close()

    val second = factory.createDataSource()
    second.open(DataSpec(android.net.Uri.parse(highSegA)))
    second.close()

    val substituted =
      HlsEngine.recordedEvents().last { it["originUri"] == highSegA }
    assertTrue(substituted["servedFromCache"] as Boolean)
    assertEquals("substituted", substituted["cacheSkipReason"])
    assertEquals(lowSegA, substituted["substitutedOriginUri"])
  }

  @Test
  fun initOpenIsNotSubstitutedByCachedMedia() {
    registerMaster(masterA)
    val media = "https://cdn.example.com/a/cmaf.m3u8"
    val init = "https://cdn.example.com/a/init.mp4"
    val frag = "https://cdn.example.com/a/1.m4s"
    HlsEngine.ingestPlaylist(
      media,
      """
      #EXTM3U
      #EXT-X-MAP:URI="init.mp4"
      #EXTINF:2.0,
      1.m4s
      """.trimIndent(),
      masterA,
    )
    val factory =
      HlsCachingDataSource.Factory(
        ApplicationProvider.getApplicationContext(),
        masterA,
        emptyMap(),
        null,
        { UriMappedDataSource(mapOf(frag to ByteArray(64) { 7 })) },
        HlsEngine.cache(),
      )
    drain(factory, frag)
    var thrown = false
    try {
      factory.createDataSource().open(DataSpec(android.net.Uri.parse(init)))
    } catch (_: java.io.IOException) {
      thrown = true
    }
    assertTrue(thrown)
    assertTrue(
      HlsEngine.recordedEvents().none {
        it["originUri"] == init && it["cacheSkipReason"] == "substituted"
      },
    )
  }

  @Test
  fun cacheOnlyFmp4MissingInitDropsRung() {
    registerMaster(masterA)
    val masterBody =
      """
      #EXTM3U
      #EXT-X-STREAM-INF:BANDWIDTH=2500000,RESOLUTION=1920x1080
      cmaf.m3u8
      """.trimIndent()
    val media = "https://cdn.example.com/a/cmaf.m3u8"
    HlsEngine.ingestPlaylist(masterA, masterBody, masterA)
    HlsEngine.ingestPlaylist(
      media,
      """
      #EXTM3U
      #EXT-X-MAP:URI="init.mp4"
      #EXTINF:2.0,
      1.m4s
      """.trimIndent(),
      masterA,
    )
    val frag = "https://cdn.example.com/a/1.m4s"
    drain(
      HlsCachingDataSource.Factory(
        ApplicationProvider.getApplicationContext(),
        masterA,
        emptyMap(),
        null,
        { UriMappedDataSource(mapOf(frag to ByteArray(32) { 1 })) },
        HlsEngine.cache(),
      ),
      frag,
    )
    val rewritten = String(HlsEngine.rewriteCacheOnlyPlaylist(masterA, masterBody, masterA))
    assertFalse(rewritten.contains("cmaf.m3u8"))
    assertFalse(rewritten.contains("#EXT-X-STREAM-INF"))
  }

  @Test
  fun tsCacheOnlyTruncatesAtFirstMissAndAddsEndlist() {
    registerMaster(masterA)
    val media = "https://cdn.example.com/a/low.m3u8"
    val mediaBody =
      """
      #EXTM3U
      #EXTINF:2.0,
      low/seg0.ts
      #EXTINF:2.0,
      low/seg1.ts
      #EXTINF:2.0,
      low/seg2.ts
      """.trimIndent()
    HlsEngine.ingestPlaylist(media, mediaBody, masterA)
    val factory =
      HlsCachingDataSource.Factory(
        ApplicationProvider.getApplicationContext(),
        masterA,
        emptyMap(),
        null,
        {
          UriMappedDataSource(
            mapOf(
              "https://cdn.example.com/a/low/seg0.ts" to ByteArray(16) { 1 },
              "https://cdn.example.com/a/low/seg1.ts" to ByteArray(16) { 2 },
            ),
          )
        },
        HlsEngine.cache(),
      )
    drain(factory, "https://cdn.example.com/a/low/seg0.ts")
    drain(factory, "https://cdn.example.com/a/low/seg1.ts")
    val rewritten = String(HlsEngine.rewriteCacheOnlyPlaylist(media, mediaBody, masterA))
    assertTrue(rewritten.contains("low/seg0.ts"))
    assertTrue(rewritten.contains("low/seg1.ts"))
    assertFalse(rewritten.contains("low/seg2.ts"))
    assertTrue(rewritten.contains("#EXT-X-ENDLIST"))
  }

  @Test
  fun audioDoesNotSubstituteVideoAtSameTimestamp() {
    val video = HlsVariantInfo("https://a/video.m3u8", 2500000, width = 1920, height = 1080)
    val audio = HlsVariantInfo("https://a/audio.m3u8", 128000, codecs = "mp4a.40.2")
    HlsEngine.timeline()
      .record(TimelineEntry(masterA, "https://a/video/1.m4s", 0, 6000, video))
    assertNull(HlsEngine.timeline().findSubstitute(masterA, 0, "https://a/audio/1.m4s", audio))
  }

  @Test
  fun cacheOnlyMasterKeepsRungAfterPlaylistBodiesCleared() {
    registerMaster(masterA)
    val masterBody =
      """
      #EXTM3U
      #EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360
      low.m3u8
      """.trimIndent()
    val mediaBody =
      """
      #EXTM3U
      #EXTINF:2.0,
      low/seg0.ts
      """.trimIndent()
    val bodies =
      mapOf(
        masterA to masterBody.toByteArray(),
        lowA to mediaBody.toByteArray(),
        lowSegA to ByteArray(16) { 1 },
      )
    val factory =
      HlsCachingDataSource.Factory(
        ApplicationProvider.getApplicationContext(),
        masterA,
        emptyMap(),
        null,
        { UriMappedDataSource(bodies) },
        HlsEngine.cache(),
      )
    drain(factory, masterA)
    drain(factory, lowA)
    drain(factory, lowSegA)
    HlsEngine.clearPlaylistBodiesForTest()
    val rewritten = String(HlsEngine.rewriteCacheOnlyPlaylist(masterA, masterBody, masterA))
    assertTrue(rewritten.contains("low.m3u8"))
    assertTrue(rewritten.contains("#EXT-X-STREAM-INF"))
  }

  private fun drain(factory: HlsCachingDataSource.Factory, uri: String) {
    val source = factory.createDataSource()
    source.open(DataSpec(android.net.Uri.parse(uri)))
    val buffer = ByteArray(1024)
    while (true) {
      val n = source.read(buffer, 0, buffer.size)
      if (n == C.RESULT_END_OF_INPUT) {
        break
      }
    }
    source.close()
  }

  private fun registerMaster(uri: String) {
    HlsEngine.registerDescriptor(
      HlsNativeDescriptor.fromChannelMap(
        mapOf(
          "originUrl" to uri,
          "assetId" to uri,
          "cachePolicy" to "liveSegmentCache",
        ),
      ),
    )
  }
}

@UnstableApi
private class UriMappedDataSource(
  private val bodies: Map<String, ByteArray>,
) : androidx.media3.datasource.BaseDataSource(false) {
  private var data: ByteArray = ByteArray(0)
  private var readPosition = 0
  private var remaining = 0
  private var openedUri: android.net.Uri? = null

  override fun open(dataSpec: DataSpec): Long {
    val body = bodies[dataSpec.uri.toString()] ?: throw java.io.IOException("missing ${dataSpec.uri}")
    data = body
    readPosition = dataSpec.position.toInt()
    remaining = body.size - readPosition
    openedUri = dataSpec.uri
    return remaining.toLong()
  }

  override fun read(buffer: ByteArray, offset: Int, length: Int): Int {
    if (remaining == 0) {
      return C.RESULT_END_OF_INPUT
    }
    val n = minOf(length, remaining)
    System.arraycopy(data, readPosition, buffer, offset, n)
    readPosition += n
    remaining -= n
    return n
  }

  override fun getUri(): android.net.Uri? = openedUri

  override fun close() {
    openedUri = null
  }
}

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class SegmentTimelineTest {
  @Test
  fun prefersSameAssetAndSameVariant() {
    val timeline = SegmentTimeline()
    val variantLow = HlsVariantInfo("https://a/low.m3u8", 800000, height = 360)
    val variantHigh = HlsVariantInfo("https://a/high.m3u8", 2500000, height = 720)
    timeline.record(
      TimelineEntry("https://a/master.m3u8", "https://a/low/s.ts", 0, 2000, variantLow),
    )
    timeline.record(
      TimelineEntry("https://a/master.m3u8", "https://a/high/s.ts", 0, 2000, variantHigh),
    )
    timeline.record(
      TimelineEntry("https://b/master.m3u8", "https://b/low/s.ts", 0, 2000, variantLow),
    )
    val found =
      timeline.findSubstitute(
        "https://a/master.m3u8",
        100,
        "https://a/missing.ts",
        variantLow,
      )
    assertEquals("https://a/low/s.ts", found!!.originUri)
    val otherAsset =
      timeline.findSubstitute(
        "https://b/master.m3u8",
        100,
        "https://b/high/s.ts",
        variantLow,
      )
    assertEquals("https://b/low/s.ts", otherAsset!!.originUri)
    assertFalse(otherAsset.originUri.startsWith("https://a/"))
  }
}

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class MasterReachabilityStoreTest {
  @Test
  fun refreshOnlyTouchesListedCacheOnlyMasters() {
    val reachable = mutableMapOf("https://up" to false, "https://down" to false)
    val store = MasterReachabilityStore(prober = OriginProber { reachable[it] == true })
    store.start("https://up")
    store.start("https://down")
    reachable["https://up"] = true
    reachable["https://down"] = true
    assertEquals(listOf("https://up"), store.refreshReachability(listOf("https://up")))
    assertFalse(store.isCacheOnlyFor("https://up"))
    assertTrue(store.isCacheOnlyFor("https://down"))
  }
}
