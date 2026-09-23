import Foundation

enum HlsContentStrategyRouter {
  static func open(_ descriptor: HlsNativeDescriptor) throws -> [String: String] {
    HlsEngine.shared.registerDescriptor(descriptor)
    if descriptor.drm != "none" {
      let fileURL = try HlsEngine.shared.openDownloaded(descriptor)
      return [
        "playerUri": fileURL.absoluteString,
        "strategy": "download",
      ]
    }
    if descriptor.cachePolicy == "none" {
      return [
        "playerUri": descriptor.originUrl,
        "strategy": "direct",
      ]
    }
    HlsEngine.shared.startMaster(descriptor.originUrl)
    let playerUri = try HlsEngine.shared.loopbackPlayerUri(forMaster: descriptor.originUrl)
    return [
      "playerUri": playerUri,
      "strategy": "loopback",
    ]
  }
}
