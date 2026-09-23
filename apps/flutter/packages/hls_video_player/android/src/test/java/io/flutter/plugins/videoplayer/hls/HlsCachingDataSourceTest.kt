package io.flutter.plugins.videoplayer

import androidx.media3.common.C
import androidx.media3.common.util.UnstableApi
import androidx.media3.datasource.ByteArrayDataSource
import androidx.media3.datasource.DataSpec
import androidx.test.core.app.ApplicationProvider
import io.flutter.plugins.videoplayer.hls.HlsCachingDataSource
import io.flutter.plugins.videoplayer.hls.HlsEngine
import io.flutter.plugins.videoplayer.hls.HlsNativeDescriptor
import java.util.Arrays
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
@UnstableApi
class HlsCachingDataSourceTest {
  private val origin = "https://cdn.example.com/video/segment-1.ts"

  @Before
  fun setUp() {
    HlsEngine.resetForTest()
    HlsEngine.ensureInitialized(ApplicationProvider.getApplicationContext())
    HlsEngine.registerDescriptor(
      HlsNativeDescriptor.fromChannelMap(
        mapOf(
          "originUrl" to origin,
          "assetId" to origin,
          "cachePolicy" to "liveSegmentCache",
        ),
      ),
    )
  }

  @After
  fun tearDown() {
    HlsEngine.resetForTest()
  }

  @Test
  fun secondOpenOfSameUriIsServedFromCache() {
    val body = ByteArray(2048)
    Arrays.fill(body, 7.toByte())
    val context = ApplicationProvider.getApplicationContext<android.content.Context>()
    val factory =
      HlsCachingDataSource.Factory(
        context,
        origin,
        emptyMap(),
        null,
        { ByteArrayDataSource(body) },
        HlsEngine.cache(),
      )
    val source = factory.createDataSource()
    val spec = DataSpec(android.net.Uri.parse(origin))

    val firstLength = source.open(spec)
    val firstBuf = ByteArray(body.size)
    var read = 0
    while (read < body.size) {
      val n = source.read(firstBuf, read, body.size - read)
      if (n == C.RESULT_END_OF_INPUT) {
        break
      }
      read += n
    }
    source.close()

    val secondLength = source.open(spec)
    source.close()

    assertEquals(body.size.toLong(), firstLength)
    assertEquals(body.size.toLong(), secondLength)
    val events = HlsEngine.recordedEvents()
    assertTrue(events.size >= 2)
    assertFalse(events[0]["servedFromCache"] as Boolean)
    assertTrue(events[1]["servedFromCache"] as Boolean)
    assertEquals("segment", events[1]["kind"])
  }

  @Test
  fun registeredHttpsMasterKeepsOriginScheme() {
    val master = "https://cdn.example.com/video/master.m3u8"
    HlsEngine.registerDescriptor(
      HlsNativeDescriptor.fromChannelMap(mapOf("originUrl" to master, "cachePolicy" to "liveSegmentCache")),
    )
    assertTrue(HlsEngine.shouldCache(master))
    assertTrue(master.startsWith("https://"))
  }
}
