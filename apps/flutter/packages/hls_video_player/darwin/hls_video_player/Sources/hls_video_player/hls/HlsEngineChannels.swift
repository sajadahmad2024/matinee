import Foundation

#if os(iOS)
  import Flutter
#elseif os(macOS)
  import FlutterMacOS
#endif

/// Control and event channels for the iOS HLS loopback engine.
enum HlsEngineChannels {
  static let control = "dev.flutter.hls_engine/control"
  static let events = "dev.flutter.hls_engine/events"

  static func register(messenger: FlutterBinaryMessenger) {
    let method = FlutterMethodChannel(name: control, binaryMessenger: messenger)
    method.setMethodCallHandler { call, result in
      onMethodCall(call, result: result)
    }
    let event = FlutterEventChannel(name: events, binaryMessenger: messenger)
    event.setStreamHandler(HlsEngineEventStreamHandler())
  }

  static func unregister(messenger: FlutterBinaryMessenger) {
    FlutterMethodChannel(name: control, binaryMessenger: messenger).setMethodCallHandler(nil)
    FlutterEventChannel(name: events, binaryMessenger: messenger).setStreamHandler(nil)
    HlsEngine.shared.setEventSink(nil)
  }

  private static func onMethodCall(_ call: FlutterMethodCall, result: @escaping FlutterResult) {
    switch call.method {
    case "openAsset":
      DispatchQueue.global(qos: .userInitiated).async {
        do {
          let descriptor = try HlsNativeDescriptor.fromChannelMap(call.arguments)
          let payload = try HlsContentStrategyRouter.open(descriptor)
          DispatchQueue.main.async { result(payload) }
        } catch {
          DispatchQueue.main.async {
            result(
              FlutterError(
                code: "invalid_descriptor",
                message: error.localizedDescription,
                details: nil
              )
            )
          }
        }
      }
    case "prefetchMaster":
      let uri = stringArg(call, "masterUri")
      DispatchQueue.global(qos: .utility).async {
        let count = uri.map { HlsEngine.shared.prefetchMaster($0) } ?? 0
        DispatchQueue.main.async { result(count) }
      }
    case "prefetchToDisk":
      DispatchQueue.global(qos: .utility).async {
        let count: Int
        do {
          let descriptor = try HlsNativeDescriptor.fromChannelMap(call.arguments)
          count = HlsEngine.shared.prefetchToDisk(descriptor)
        } catch {
          count = 0
        }
        DispatchQueue.main.async { result(count) }
      }
    case "refreshReachability":
      let masters = stringListArg(call, "masters")
      DispatchQueue.global(qos: .utility).async {
        let flipped = HlsEngine.shared.refreshReachability(masters)
        DispatchQueue.main.async { result(flipped) }
      }
    case "clearCache":
      HlsEngine.shared.clearCache()
      result(nil)
    case "cacheStats":
      result(HlsEngine.shared.cacheStats())
    case "isCacheOnlyFor":
      let uri = stringArg(call, "masterUri")
      result(uri.map { HlsEngine.shared.isCacheOnlyFor($0) } ?? false)
    default:
      result(FlutterMethodNotImplemented)
    }
  }

  private static func stringArg(_ call: FlutterMethodCall, _ key: String) -> String? {
    (call.arguments as? [String: Any])?[key] as? String
  }

  private static func stringListArg(_ call: FlutterMethodCall, _ key: String) -> [String] {
    ((call.arguments as? [String: Any])?[key] as? [Any])?.compactMap { $0 as? String } ?? []
  }
}

private final class HlsEngineEventStreamHandler: NSObject, FlutterStreamHandler {
  func onListen(withArguments arguments: Any?, eventSink events: @escaping FlutterEventSink)
    -> FlutterError?
  {
    HlsEngine.shared.setEventSink { payload in
      events(payload)
    }
    return nil
  }

  func onCancel(withArguments arguments: Any?) -> FlutterError? {
    HlsEngine.shared.setEventSink(nil)
    return nil
  }
}
