import AVFoundation
import CoreMedia
import Foundation

protocol HlsDownloading: AnyObject {
  func fileURLIfReady(assetId: String) -> URL?
  func download(
    _ descriptor: HlsNativeDescriptor,
    onProgress: @escaping (Double) -> Void
  ) throws -> URL
}

/// Downloads DRM HLS to `.movpkg` via `AVAssetDownloadTask` (iOS only).
final class HlsDownloadManager: NSObject, HlsDownloading {
  static let shared = HlsDownloadManager()

  private let lock = NSLock()
  private var completed: [String: URL] = [:]

  #if os(iOS)
    private var waiters: [Int: (Result<URL, Error>) -> Void] = [:]
    private var progressHandlers: [Int: (Double) -> Void] = [:]
    private var assetIdByTask: [Int: String] = [:]
    private var originByTask: [Int: String] = [:]
    private var keyDelegates: [Int: FairPlayKeyDelegate] = [:]
    private var keySessions: [Int: AVContentKeySession] = [:]
    private lazy var downloadSession: AVAssetDownloadURLSession = {
      let config = URLSessionConfiguration.background(
        withIdentifier: "dev.flutter.hls_engine.download"
      )
      config.isDiscretionary = false
      return AVAssetDownloadURLSession(
        configuration: config,
        assetDownloadDelegate: self,
        delegateQueue: OperationQueue()
      )
    }()
  #endif

  func fileURLIfReady(assetId: String) -> URL? {
    lock.lock()
    defer { lock.unlock() }
    if let url = completed[assetId], FileManager.default.fileExists(atPath: url.path) {
      return url
    }
    return nil
  }

  func remember(assetId: String, fileURL: URL) {
    lock.lock()
    completed[assetId] = fileURL
    lock.unlock()
  }

  func download(
    _ descriptor: HlsNativeDescriptor,
    onProgress: @escaping (Double) -> Void
  ) throws -> URL {
    if let ready = fileURLIfReady(assetId: descriptor.assetId) {
      return ready
    }
    #if os(iOS)
      return try downloadOnIOS(descriptor, onProgress: onProgress)
    #else
      throw HlsEngineError.originFailed("AVAssetDownloadTask is only available on iOS")
    #endif
  }

  func resetForTests() {
    lock.lock()
    completed.removeAll()
    lock.unlock()
  }

  #if os(iOS)
    private func downloadOnIOS(
      _ descriptor: HlsNativeDescriptor,
      onProgress: @escaping (Double) -> Void
    ) throws -> URL {
      guard let origin = URL(string: descriptor.originUrl) else {
        throw HlsEngineError.originFailed("bad originUrl")
      }
      let asset = AVURLAsset(url: origin)
      let semaphore = DispatchSemaphore(value: 0)
      var captured: Result<URL, Error>?
      guard
        let task = downloadSession.makeAssetDownloadTask(
          asset: asset,
          assetTitle: descriptor.assetId,
          assetArtworkData: nil,
          options: [AVAssetDownloadTaskMinimumRequiredMediaBitrateKey: 0]
        )
      else {
        throw HlsEngineError.originFailed("could not create AVAssetDownloadTask")
      }
      lock.lock()
      if descriptor.drm == "fairplay" {
        let keySession = AVContentKeySession(keySystem: .fairPlayStreaming)
        let delegate = FairPlayKeyDelegate(descriptor: descriptor)
        keySession.setDelegate(delegate, queue: DispatchQueue.global(qos: .userInitiated))
        keySession.addContentKeyRecipient(asset)
        keyDelegates[task.taskIdentifier] = delegate
        keySessions[task.taskIdentifier] = keySession
      }
      waiters[task.taskIdentifier] = { captured = $0; semaphore.signal() }
      progressHandlers[task.taskIdentifier] = onProgress
      assetIdByTask[task.taskIdentifier] = descriptor.assetId
      originByTask[task.taskIdentifier] = descriptor.originUrl
      lock.unlock()
      task.resume()
      _ = semaphore.wait(timeout: .now() + 600)
      guard let captured else {
        throw HlsEngineError.originFailed("download timed out")
      }
      return try captured.get()
    }
  #endif
}

#if os(iOS)
  extension HlsDownloadManager: AVAssetDownloadDelegate {
    func urlSession(
      _ session: URLSession,
      assetDownloadTask: AVAssetDownloadTask,
      didFinishDownloadingTo location: URL
    ) {
      let dest = persist(location, assetId: assetId(for: assetDownloadTask))
      if let dest {
        finish(task: assetDownloadTask, result: .success(dest))
      } else {
        finish(
          task: assetDownloadTask,
          result: .failure(HlsEngineError.originFailed("could not persist movpkg"))
        )
      }
    }

    func urlSession(
      _ session: URLSession,
      assetDownloadTask: AVAssetDownloadTask,
      didLoad timeRanges: [NSValue],
      totalTimeRangesToLoad: [NSValue],
      timeRangeProgress progress: TimeInterval
    ) {
      let loaded = seconds(timeRanges)
      let total = seconds(totalTimeRangesToLoad)
      let fraction = total > 0 ? min(1, loaded / total) : 0
      lock.lock()
      let handler = progressHandlers[assetDownloadTask.taskIdentifier]
      let origin = originByTask[assetDownloadTask.taskIdentifier]
      lock.unlock()
      handler?(fraction)
      if let origin {
        HlsEngine.shared.emitDownloadProgress(originUri: origin, fraction: fraction)
      }
    }

    func urlSession(
      _ session: URLSession,
      task: URLSessionTask,
      didCompleteWithError error: Error?
    ) {
      guard let error, let downloadTask = task as? AVAssetDownloadTask else {
        return
      }
      finish(task: downloadTask, result: .failure(error))
    }

    private func seconds(_ values: [NSValue]) -> Double {
      values.reduce(0) { $0 + CMTimeGetSeconds($1.timeRangeValue.duration) }
    }

    private func persist(_ location: URL, assetId: String?) -> URL? {
      let root = FileManager.default.urls(for: .cachesDirectory, in: .userDomainMask)[0]
        .appendingPathComponent("hls_engine_downloads", isDirectory: true)
      try? FileManager.default.createDirectory(at: root, withIntermediateDirectories: true)
      let name = HlsCacheKey.sha256Hex(assetId ?? location.lastPathComponent)
      let dest = root.appendingPathComponent("\(name).movpkg")
      try? FileManager.default.removeItem(at: dest)
      do {
        try FileManager.default.copyItem(at: location, to: dest)
        if let assetId {
          remember(assetId: assetId, fileURL: dest)
        }
        return dest
      } catch {
        return nil
      }
    }

    private func assetId(for task: AVAssetDownloadTask) -> String? {
      lock.lock()
      defer { lock.unlock() }
      return assetIdByTask[task.taskIdentifier]
    }

    private func finish(task: AVAssetDownloadTask, result: Result<URL, Error>) {
      lock.lock()
      let waiter = waiters.removeValue(forKey: task.taskIdentifier)
      progressHandlers.removeValue(forKey: task.taskIdentifier)
      keyDelegates.removeValue(forKey: task.taskIdentifier)
      keySessions.removeValue(forKey: task.taskIdentifier)
      assetIdByTask.removeValue(forKey: task.taskIdentifier)
      originByTask.removeValue(forKey: task.taskIdentifier)
      lock.unlock()
      waiter?(result)
    }
  }
#endif
