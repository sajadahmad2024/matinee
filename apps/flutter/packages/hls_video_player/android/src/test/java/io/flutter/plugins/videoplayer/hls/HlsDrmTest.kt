package io.flutter.plugins.videoplayer

import androidx.media3.common.C
import androidx.media3.common.util.UnstableApi
import androidx.test.core.app.ApplicationProvider
import io.flutter.plugins.videoplayer.hls.HlsEngine
import io.flutter.plugins.videoplayer.hls.HlsNativeDescriptor
import io.flutter.plugins.videoplayer.hls.UnsupportedDrmException
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.fail
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
@UnstableApi
class HlsDrmTest {
  private val origin = "https://cdn.example.com/drm/master.m3u8"
  private val license = "https://license.example.com/widevine"

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
  fun openAssetRejectsFairPlay() {
    val descriptor =
      HlsNativeDescriptor.fromChannelMap(
        mapOf(
          "originUrl" to origin,
          "drm" to "fairplay",
          "drmConfig" to mapOf("licenseServerUrl" to "https://license.example.com/fps"),
        ),
      )
    try {
      HlsEngine.openAssetResult(descriptor)
      fail("expected UnsupportedDrmException")
    } catch (_: UnsupportedDrmException) {
    }
  }

  @Test
  fun widevineMediaItemUsesLicenseUriAndAuthHeader() {
    HlsEngine.registerDescriptor(
      HlsNativeDescriptor.fromChannelMap(
        mapOf(
          "originUrl" to origin,
          "drm" to "widevine",
          "cachePolicy" to "liveSegmentCache",
          "drmConfig" to mapOf("licenseServerUrl" to license, "contentId" to "asset-1"),
          "authConfig" to mapOf("headerName" to "Authorization", "headerValue" to "Bearer z"),
        ),
      ),
    )
    val asset =
      VideoAsset.fromRemoteUrl(
        origin,
        VideoAsset.StreamingFormat.HTTP_LIVE,
        emptyMap(),
        null,
      ) as HttpVideoAsset
    val drm = asset.mediaItem.localConfiguration!!.drmConfiguration
    assertNotNull(drm)
    assertEquals(C.WIDEVINE_UUID, drm!!.scheme)
    assertEquals(android.net.Uri.parse(license), drm.licenseUri)
    assertEquals("Bearer z", drm.licenseRequestHeaders["Authorization"])
  }

  @Test
  fun clearHlsHasNoDrmConfiguration() {
    HlsEngine.registerDescriptor(
      HlsNativeDescriptor.fromChannelMap(mapOf("originUrl" to origin, "drm" to "none")),
    )
    assertNull(HlsEngine.drmConfiguration(origin))
  }
}
