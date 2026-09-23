package io.flutter.plugins.videoplayer.hls

import android.content.Context
import android.os.Handler
import android.os.Looper
import androidx.media3.common.util.UnstableApi
import io.flutter.plugin.common.BinaryMessenger
import io.flutter.plugin.common.EventChannel
import io.flutter.plugin.common.MethodCall
import io.flutter.plugin.common.MethodChannel

/** Control and event channels for the Android HLS cache engine. */
@UnstableApi
object HlsEngineChannels {
  const val CONTROL = "dev.flutter.hls_engine/control"
  const val EVENTS = "dev.flutter.hls_engine/events"

  private val mainHandler = Handler(Looper.getMainLooper())

  @JvmStatic
  fun register(context: Context, messenger: BinaryMessenger) {
    HlsEngine.ensureInitialized(context)
    val control = MethodChannel(messenger, CONTROL)
    control.setMethodCallHandler { call, result -> onMethodCall(call, result) }
    val events = EventChannel(messenger, EVENTS)
    events.setStreamHandler(
      object : EventChannel.StreamHandler {
        override fun onListen(arguments: Any?, events: EventChannel.EventSink?) {
          HlsEngine.setEventSink(events)
        }

        override fun onCancel(arguments: Any?) {
          HlsEngine.setEventSink(null)
        }
      },
    )
  }

  @JvmStatic
  fun unregister(messenger: BinaryMessenger) {
    MethodChannel(messenger, CONTROL).setMethodCallHandler(null)
    EventChannel(messenger, EVENTS).setStreamHandler(null)
    HlsEngine.setEventSink(null)
  }

  private fun onMethodCall(call: MethodCall, result: MethodChannel.Result) {
    when (call.method) {
      "openAsset" -> {
        try {
          val descriptor = HlsNativeDescriptor.fromChannelMap(asMap(call.arguments))
          HlsEngine.runBackground {
            try {
              val payload = HlsEngine.openAssetResult(descriptor)
              mainHandler.post { result.success(payload) }
            } catch (e: UnsupportedDrmException) {
              mainHandler.post { result.error("unsupported_drm", e.message, null) }
            } catch (e: Exception) {
              mainHandler.post { result.error("open_asset_failed", e.message, null) }
            }
          }
        } catch (e: IllegalArgumentException) {
          result.error("invalid_descriptor", e.message, null)
        }
      }
      "prefetchMaster" -> {
        val uri = stringArg(call, "masterUri")
        if (uri == null) {
          result.success(0)
          return
        }
        HlsEngine.runBackground {
          val count =
            try {
              HlsEngine.prefetchMaster(uri)
            } catch (_: Exception) {
              0
            }
          mainHandler.post { result.success(count) }
        }
      }
      "prefetchToDisk" -> {
        try {
          val descriptor = HlsNativeDescriptor.fromChannelMap(asMap(call.arguments))
          HlsEngine.runBackground {
            val count =
              try {
                HlsEngine.prefetchToDisk(descriptor)
              } catch (_: Exception) {
                0
              }
            mainHandler.post { result.success(count) }
          }
        } catch (e: IllegalArgumentException) {
          result.success(0)
        }
      }
      "refreshReachability" -> {
        val masters = stringListArg(call, "masters")
        HlsEngine.runBackground {
          val flipped =
            try {
              HlsEngine.refreshReachability(masters)
            } catch (_: Exception) {
              emptyList()
            }
          mainHandler.post { result.success(flipped) }
        }
      }
      "clearCache" -> {
        HlsEngine.clearCache()
        result.success(null)
      }
      "cacheStats" -> result.success(HlsEngine.cacheStats())
      "isCacheOnlyFor" -> {
        val uri = stringArg(call, "masterUri")
        result.success(uri != null && HlsEngine.isCacheOnlyFor(uri))
      }
      else -> result.notImplemented()
    }
  }

  @Suppress("UNCHECKED_CAST")
  private fun asMap(raw: Any?): Map<*, *>? = raw as? Map<*, *>

  private fun stringArg(call: MethodCall, key: String): String? {
    val map = asMap(call.arguments) ?: return call.argument(key)
    return map[key] as? String
  }

  private fun stringListArg(call: MethodCall, key: String): List<String> {
    val map = asMap(call.arguments) ?: return emptyList()
    val raw = map[key] as? List<*> ?: return emptyList()
    return raw.mapNotNull { it as? String }
  }
}
