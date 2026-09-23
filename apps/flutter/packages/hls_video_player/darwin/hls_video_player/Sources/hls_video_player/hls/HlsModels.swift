import CryptoKit
import Foundation

struct HlsNativeDescriptor: Equatable {
  var assetId: String
  var originUrl: String
  var drm: String
  var cachePolicy: String
  var headerName: String?
  var headerValue: String?
  var certificateUrl: String?
  var licenseServerUrl: String?
  var contentId: String?
  var prefetchEnabled: Bool
  var substitutionEnabled: Bool
  var maxPrefetchSegments: Int
  var maxPrefetchHeight: Int

  var shouldCache: Bool { cachePolicy != "none" }

  var authHeaders: [String: String] {
    guard let headerName, !headerName.isEmpty, let headerValue else {
      return [:]
    }
    return [headerName: headerValue]
  }

  static func fromChannelMap(_ raw: Any?) throws -> HlsNativeDescriptor {
    guard let args = raw as? [String: Any],
      let origin = args["originUrl"] as? String, !origin.isEmpty
    else {
      throw HlsEngineError.invalidDescriptor("originUrl is required")
    }
    let auth = args["authConfig"] as? [String: Any]
    let drmConfig = args["drmConfig"] as? [String: Any]
    let assetId = (args["assetId"] as? String).flatMap { $0.isEmpty ? nil : $0 } ?? origin
    return HlsNativeDescriptor(
      assetId: assetId,
      originUrl: origin,
      drm: args["drm"] as? String ?? "none",
      cachePolicy: args["cachePolicy"] as? String ?? "liveSegmentCache",
      headerName: auth?["headerName"] as? String,
      headerValue: auth?["headerValue"] as? String,
      certificateUrl: drmConfig?["certificateUrl"] as? String,
      licenseServerUrl: drmConfig?["licenseServerUrl"] as? String,
      contentId: drmConfig?["contentId"] as? String,
      prefetchEnabled: args["prefetchEnabled"] as? Bool ?? true,
      substitutionEnabled: args["substitutionEnabled"] as? Bool ?? true,
      maxPrefetchSegments: (args["maxPrefetchSegments"] as? NSNumber)?.intValue ?? 10,
      maxPrefetchHeight: (args["maxPrefetchHeight"] as? NSNumber)?.intValue ?? 480
    )
  }
}

struct HlsVariantInfo: Equatable {
  var playlistUri: String
  var bandwidth: Int
  var width: Int?
  var height: Int?
  var codecs: String?

  func toChannelMap() -> [String: Any] {
    var map: [String: Any] = [
      "playlistUri": playlistUri,
      "bandwidth": bandwidth,
    ]
    if let width { map["width"] = width }
    if let height { map["height"] = height }
    if let codecs { map["codecs"] = codecs }
    return map
  }
}

struct HlsResource {
  var originUri: String
  var kind: String
  var assetId: String
  var variant: HlsVariantInfo?
  var segmentStartMs: Int64?
  var segmentDurationMs: Int64?
}

struct TimelineEntry: Equatable {
  var assetId: String
  var originUri: String
  var segmentStartMs: Int64
  var segmentDurationMs: Int64
  var variant: HlsVariantInfo?

  func covers(_ positionMs: Int64) -> Bool {
    positionMs >= segmentStartMs && positionMs < segmentStartMs + segmentDurationMs
  }
}

enum HlsTrackClass {
  static func of(_ variant: HlsVariantInfo?) -> String {
    guard let variant else {
      return "unknown"
    }
    if variant.height != nil || variant.width != nil {
      return "video"
    }
    guard let codecs = variant.codecs?.lowercased() else {
      return "unknown"
    }
    if ["avc", "hev", "hvc", "vp9", "av01"].contains(where: { codecs.contains($0) }) {
      return "video"
    }
    return "audio"
  }

  static func compatible(_ requested: HlsVariantInfo?, _ candidate: HlsVariantInfo?) -> Bool {
    of(requested) == of(candidate)
  }
}

final class SegmentTimeline {
  private var entries: [TimelineEntry] = []
  private let lock = NSLock()

  func record(_ entry: TimelineEntry) {
    lock.lock()
    entries.removeAll { $0.originUri == entry.originUri }
    entries.append(entry)
    lock.unlock()
  }

  func findSubstitute(
    assetId: String,
    requestedStartMs: Int64,
    excludeOrigin: String,
    preferVariant: HlsVariantInfo?
  ) -> TimelineEntry? {
    lock.lock()
    defer { lock.unlock() }
    let covering = entries.filter {
      $0.assetId == assetId &&
        $0.originUri != excludeOrigin &&
        $0.covers(requestedStartMs) &&
        HlsTrackClass.compatible(preferVariant, $0.variant)
    }
    if covering.isEmpty {
      return nil
    }
    if let preferVariant {
      if let match = covering.first(where: { $0.variant?.playlistUri == preferVariant.playlistUri })
      {
        return match
      }
    }
    return covering.last
  }

  func clear() {
    lock.lock()
    entries.removeAll()
    lock.unlock()
  }
}

protocol OriginProbing {
  func isReachable(_ masterUri: String) -> Bool
}

struct HttpOriginProber: OriginProbing {
  var timeout: TimeInterval = 4

  func isReachable(_ masterUri: String) -> Bool {
    guard let url = URL(string: masterUri) else {
      return false
    }
    for method in ["HEAD", "GET"] {
      var request = URLRequest(url: url, timeoutInterval: timeout)
      request.httpMethod = method
      let semaphore = DispatchSemaphore(value: 0)
      var ok = false
      URLSession.shared.dataTask(with: request) { _, response, _ in
        if let http = response as? HTTPURLResponse, (200..<400).contains(http.statusCode) {
          ok = true
        }
        semaphore.signal()
      }.resume()
      _ = semaphore.wait(timeout: .now() + timeout + 1)
      if ok {
        return true
      }
    }
    return false
  }
}

final class MasterReachabilityStore {
  private let prober: OriginProbing
  private let maxRemembered: Int
  private var cacheOnlyByMaster: [String: Bool] = [:]
  private var startedMasters: [String] = []
  private let lock = NSLock()

  init(prober: OriginProbing = HttpOriginProber(), maxRemembered: Int = 64) {
    self.prober = prober
    self.maxRemembered = maxRemembered
  }

  func start(_ masterUri: String) {
    lock.lock()
    let first = !startedMasters.contains(masterUri)
    if first {
      startedMasters.append(masterUri)
      lock.unlock()
      let cacheOnly = !prober.isReachable(masterUri)
      lock.lock()
      cacheOnlyByMaster[masterUri] = cacheOnly
      lock.unlock()
      return
    }
    lock.unlock()
  }

  func isCacheOnlyFor(_ masterUri: String) -> Bool {
    lock.lock()
    defer { lock.unlock() }
    return cacheOnlyByMaster[masterUri] == true
  }

  func refreshReachability(_ masters: [String]) -> [String] {
    lock.lock()
    let targets = masters.filter { cacheOnlyByMaster[$0] == true }
    lock.unlock()
    if targets.isEmpty {
      return []
    }
    var flipped: [String] = []
    for uri in targets {
      if prober.isReachable(uri) {
        lock.lock()
        cacheOnlyByMaster[uri] = false
        lock.unlock()
        flipped.append(uri)
      }
    }
    return flipped
  }

  func retainStartedMasters(_ retain: [String]) {
    lock.lock()
    defer { lock.unlock() }
    let keep = Set(retain)
    let cap = maxRemembered + keep.count
    if startedMasters.count <= cap {
      return
    }
    let drop = startedMasters.filter { !keep.contains($0) }
    for uri in drop {
      if startedMasters.count <= cap {
        break
      }
      startedMasters.removeAll { $0 == uri }
      cacheOnlyByMaster.removeValue(forKey: uri)
    }
  }

  func clear() {
    lock.lock()
    cacheOnlyByMaster.removeAll()
    startedMasters.removeAll()
    lock.unlock()
  }
}

enum HlsEngineError: LocalizedError {
  case invalidDescriptor(String)
  case notStarted
  case cacheOnlyMiss(String)
  case originFailed(String)

  var errorDescription: String? {
    switch self {
    case .invalidDescriptor(let message), .originFailed(let message), .cacheOnlyMiss(let message):
      return message
    case .notStarted:
      return "HLS engine has not been started."
    }
  }
}

enum HlsCacheKey {
  static func normalize(_ uri: String) -> String {
    guard var components = URLComponents(string: uri) else {
      return uri
    }
    components.fragment = nil
    return components.string ?? uri
  }

  /// Stable identity for signed URLs: drop query/fragment before hashing.
  static func hashingIdentity(_ uri: String) -> String {
    guard var components = URLComponents(string: uri) else {
      return uri
    }
    components.query = nil
    components.fragment = nil
    return components.string ?? uri
  }

  static func sha256Hex(_ uri: String) -> String {
    let digest = SHA256.hash(data: Data(hashingIdentity(uri).utf8))
    return digest.map { String(format: "%02x", $0) }.joined()
  }
}
