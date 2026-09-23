import AVFoundation
import Foundation

/// Builds the FairPlay license POST (SPC → license server).
enum FairPlayLicenseCodec {
  static func makeRequest(spc: Data, licenseServerUrl: URL, contentId: String?) -> URLRequest {
    var request = URLRequest(url: licenseServerUrl)
    request.httpMethod = "POST"
    request.httpBody = spc
    request.setValue("application/octet-stream", forHTTPHeaderField: "Content-Type")
    if let contentId, !contentId.isEmpty {
      request.setValue(contentId, forHTTPHeaderField: "X-Content-ID")
    }
    return request
  }
}

/// `AVContentKeySessionDelegate` for FairPlay SPC/CKC. Used for download and local playback.
final class FairPlayKeyDelegate: NSObject, AVContentKeySessionDelegate {
  var certificateUrl: URL?
  var licenseServerUrl: URL?
  var contentId: String?
  var httpHeaders: [String: String]
  var certificateLoader: ((URL) throws -> Data)?
  var licensePoster: ((URLRequest) throws -> Data)?

  init(descriptor: HlsNativeDescriptor) {
    certificateUrl = descriptor.certificateUrl.flatMap(URL.init(string:))
    licenseServerUrl = descriptor.licenseServerUrl.flatMap(URL.init(string:))
    contentId = descriptor.contentId
    httpHeaders = descriptor.authHeaders
    super.init()
  }

  func licenseRequest(forSpc spc: Data) throws -> URLRequest {
    guard let licenseServerUrl else {
      throw HlsEngineError.originFailed("drmConfig.licenseServerUrl is required")
    }
    var request = FairPlayLicenseCodec.makeRequest(
      spc: spc,
      licenseServerUrl: licenseServerUrl,
      contentId: contentId
    )
    for (key, value) in httpHeaders {
      request.setValue(value, forHTTPHeaderField: key)
    }
    return request
  }

  func loadCertificate() throws -> Data {
    guard let certificateUrl else {
      throw HlsEngineError.originFailed("drmConfig.certificateUrl is required")
    }
    if let certificateLoader {
      return try certificateLoader(certificateUrl)
    }
    return try Data(contentsOf: certificateUrl)
  }

  func postLicense(spc: Data) throws -> Data {
    let request = try licenseRequest(forSpc: spc)
    if let licensePoster {
      return try licensePoster(request)
    }
    let semaphore = DispatchSemaphore(value: 0)
    var body: Data?
    var capturedError: Error?
    URLSession.shared.dataTask(with: request) { data, _, error in
      body = data
      capturedError = error
      semaphore.signal()
    }.resume()
    _ = semaphore.wait(timeout: .now() + 20)
    if let capturedError {
      throw capturedError
    }
    guard let body else {
      throw HlsEngineError.originFailed("empty CKC")
    }
    return body
  }

  func contentKeySession(
    _ session: AVContentKeySession,
    didProvide keyRequest: AVContentKeyRequest
  ) {
    fulfill(keyRequest)
  }

  func contentKeySession(
    _ session: AVContentKeySession,
    didProvideRenewingContentKeyRequest keyRequest: AVContentKeyRequest
  ) {
    fulfill(keyRequest)
  }

  private func fulfill(_ keyRequest: AVContentKeyRequest) {
    do {
      let certificate = try loadCertificate()
      let identifier = contentId ?? keyRequest.identifier as? String ?? ""
      keyRequest.makeStreamingContentKeyRequestData(
        forApp: certificate,
        contentIdentifier: Data(identifier.utf8),
        options: nil
      ) { [weak self] spc, error in
        guard let self else { return }
        if let error {
          keyRequest.processContentKeyResponseError(error)
          return
        }
        guard let spc else {
          keyRequest.processContentKeyResponseError(
            HlsEngineError.originFailed("missing SPC")
          )
          return
        }
        do {
          let ckc = try self.postLicense(spc: spc)
          let response = AVContentKeyResponse(fairPlayStreamingKeyResponseData: ckc)
          keyRequest.processContentKeyResponse(response)
        } catch {
          keyRequest.processContentKeyResponseError(error)
        }
      }
    } catch {
      keyRequest.processContentKeyResponseError(error)
    }
  }
}

/// Retains FairPlay session + delegate for the life of an AVURLAsset.
final class FairPlayPlaybackSession {
  let session: AVContentKeySession
  let delegate: FairPlayKeyDelegate

  init?(asset: AVURLAsset, descriptor: HlsNativeDescriptor) {
    guard descriptor.drm == "fairplay" else {
      return nil
    }
    session = AVContentKeySession(keySystem: .fairPlayStreaming)
    delegate = FairPlayKeyDelegate(descriptor: descriptor)
    session.setDelegate(delegate, queue: DispatchQueue(label: "dev.flutter.hls_engine.fairplay"))
    session.addContentKeyRecipient(asset)
  }
}
