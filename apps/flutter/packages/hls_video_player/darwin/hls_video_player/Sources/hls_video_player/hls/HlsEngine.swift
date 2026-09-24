import Foundation

struct HlsResolveResult {
  var originUri: String
  var statusCode: Int
  var bytes: Data
  var contentType: String?
  var servedFromCache: Bool
  var cacheSkipReason: String?
  var substitutedOriginUri: String?
  var originPlaylistText: String?
  var extraHeaders: [String: String] = [:]
  var contentLength: Int? = nil
}

/// Process-wide iOS HLS engine: cache, substitution, reachability, prefetch, loopback.
final class HlsEngine {
  static let shared = HlsEngine()

  private let lock = NSLock()
  private var descriptors: [String: HlsNativeDescriptor] = [:]
  private var resources: [String: HlsResource] = [:]
  private let timeline = SegmentTimeline()
  private var reachability = MasterReachabilityStore()
  private let cache: HlsBodyCache
  let loopback = LoopbackHlsServer()
  private var eventSink: (([String: Any]) -> Void)?
  private var recordedEventLog: [[String: Any]] = []
  private var forceOrigin: Set<String> = []
  private var upgradeInFlight: Set<String> = []
  var originFetcher: ((String, [String: String], String?) throws -> (Int, Data, String?))?
  var downloader: HlsDownloading = HlsDownloadManager.shared
  private var downloadedFiles: [String: HlsNativeDescriptor] = [:]

  init(
    cacheRoot: URL = FileManager.default.urls(for: .cachesDirectory, in: .userDomainMask)[0]
      .appendingPathComponent("hls_engine_cache", isDirectory: true)
  ) {
    cache = HlsBodyCache(root: cacheRoot)
    loopback.resolve = { [weak self] origin, range in
      guard let self else {
        throw HlsEngineError.notStarted
      }
      let result = try self.resolve(originUri: origin, rangeHeader: range)
      return LoopbackHttpResult(
        status: result.statusCode,
        body: result.bytes,
        contentType: result.contentType,
        extraHeaders: result.extraHeaders,
        contentLength: result.contentLength ?? result.bytes.count
      )
    }
  }

  func setEventSink(_ sink: (([String: Any]) -> Void)?) {
    lock.lock()
    eventSink = sink
    lock.unlock()
  }

  func setOriginProber(_ prober: OriginProbing) {
    reachability = MasterReachabilityStore(prober: prober)
  }

  func registerDescriptor(_ descriptor: HlsNativeDescriptor) {
    let origin = HlsCacheKey.normalize(descriptor.originUrl)
    lock.lock()
    descriptors[origin] = descriptor
    resources[origin] = HlsResource(
      originUri: descriptor.originUrl,
      kind: inferKind(descriptor.originUrl, masterOrigin: descriptor.originUrl),
      assetId: descriptor.assetId,
      variant: nil,
      segmentStartMs: nil,
      segmentDurationMs: nil
    )
    lock.unlock()
  }

  func descriptor(forPlayerURL url: URL) -> HlsNativeDescriptor? {
    lock.lock()
    defer { lock.unlock() }
    if url.isFileURL {
      return downloadedFiles[url.standardizedFileURL.path]
    }
    return descriptors[HlsCacheKey.normalize(url.absoluteString)]
  }

  func openDownloaded(_ descriptor: HlsNativeDescriptor) throws -> URL {
    registerDescriptor(descriptor)
    if let ready = downloader.fileURLIfReady(assetId: descriptor.assetId) {
      rememberDownloadedFile(ready, descriptor: descriptor)
      return ready
    }
    let fileURL = try downloader.download(descriptor) { [weak self] fraction in
      self?.emitDownloadProgress(originUri: descriptor.originUrl, fraction: fraction)
    }
    rememberDownloadedFile(fileURL, descriptor: descriptor)
    return fileURL
  }

  func emitDownloadProgress(originUri: String, fraction: Double) {
    let percent = Int((min(max(fraction, 0), 1) * 100).rounded())
    emitRaw(
      [
        "kind": "unknown",
        "originUri": originUri,
        "byteLength": percent,
        "occurredAt": Int(Date().timeIntervalSince1970 * 1000),
        "servedFromCache": false,
        "cacheSkipReason": "download",
      ]
    )
  }

  func startMaster(_ originUrl: String) {
    reachability.start(HlsCacheKey.normalize(originUrl))
  }

  func isCacheOnlyFor(_ masterUri: String) -> Bool {
    reachability.isCacheOnlyFor(HlsCacheKey.normalize(masterUri))
  }

  func refreshReachability(_ masters: [String]) -> [String] {
    var originalByNormalized: [String: String] = [:]
    var normalized: [String] = []
    for original in masters {
      let key = HlsCacheKey.normalize(original)
      if originalByNormalized[key] == nil {
        originalByNormalized[key] = original
        normalized.append(key)
      }
    }
    reachability.retainStartedMasters(normalized)
    return reachability.refreshReachability(normalized).map { flipped in
      originalByNormalized[flipped] ?? flipped
    }
  }

  func cacheStats() -> [String: Any] {
    cache.stats()
  }

  func clearCache() {
    cache.clear()
    timeline.clear()
  }

  func loopbackPlayerUri(forMaster originUrl: String) throws -> String {
    try loopback.ensureListening()
    return loopback.registerResource(
      originUri: originUrl,
      kind: "masterPlaylist",
      variant: nil,
      segmentDurationMs: nil,
      segmentStartMs: nil
    )
  }

  func resolve(originUri: String, rangeHeader: String?) throws -> HlsResolveResult {
    let resource = resource(for: originUri) ?? HlsResource(
      originUri: originUri,
      kind: inferKind(originUri, masterOrigin: nil),
      assetId: originUri,
      variant: nil,
      segmentStartMs: nil,
      segmentDurationMs: nil
    )
    let cacheOnly = isCacheOnlyFor(resource.assetId)
    let forced: Bool
    lock.lock()
    forced = forceOrigin.contains(HlsCacheKey.normalize(originUri))
    lock.unlock()
    if isCacheable(resource.kind), let cached = cache.get(originUri) {
      return serveCached(resource: resource, cached: cached, rangeHeader: rangeHeader)
    }
    if !forced, resource.kind == "segment", let substitute = substitute(for: resource) {
      let result = serveCached(
        resource: resource,
        cached: substitute.body,
        rangeHeader: rangeHeader,
        skipReason: "substituted",
        substituted: substitute.origin
      )
      if !cacheOnly {
        scheduleUpgrade(originUri)
      }
      return result
    }
    if isPlaylist(resource.kind), let cached = cache.get(originUri) {
      return try servePlaylist(
        resource: resource,
        originText: String(data: cached, encoding: .utf8) ?? "",
        servedFromCache: true
      )
    }
    if cacheOnly {
      emit(
        resource: resource,
        byteLength: 0,
        servedFromCache: false,
        skipReason: "cancelled",
        error: "cache-only miss"
      )
      throw HlsEngineError.cacheOnlyMiss(originUri)
    }
    return try fetchOrigin(resource: resource, rangeHeader: rangeHeader)
  }

  /// Registers [descriptor] and warms the body cache. Never probes or starts loopback.
  func prefetchToDisk(_ descriptor: HlsNativeDescriptor) -> Int {
    registerDescriptor(descriptor)
    guard descriptor.prefetchEnabled else {
      return 0
    }
    do {
      try putOriginBytes(descriptor.originUrl)
      guard let masterData = cache.get(descriptor.originUrl),
        let text = String(data: masterData, encoding: .utf8)
      else {
        return 0
      }
      let variants = HlsPlaylistParser.parseVariants(body: text, masterUri: descriptor.originUrl)
      guard let rung = HlsPlaylistParser.pickRung(variants, maxHeight: descriptor.maxPrefetchHeight)
      else {
        return 0
      }
      try putOriginBytes(rung.playlistUri)
      guard let mediaData = cache.get(rung.playlistUri),
        let mediaText = String(data: mediaData, encoding: .utf8)
      else {
        return 0
      }
      let segments = HlsPlaylistParser.parseMediaSegments(
        body: mediaText,
        playlistUri: rung.playlistUri
      )
      var fetched = 0
      for segment in segments {
        if segment.isInit {
          try putOriginBytes(segment.uri)
          continue
        }
        if fetched >= descriptor.maxPrefetchSegments {
          break
        }
        try putOriginBytes(segment.uri)
        fetched += 1
      }
      return fetched
    } catch {
      return 0
    }
  }

  func prefetchMaster(_ masterUri: String) -> Int {
    guard let descriptor = descriptor(for: masterUri), descriptor.prefetchEnabled else {
      return 0
    }
    do {
      let master = try resolve(originUri: masterUri, rangeHeader: nil)
      guard let text = master.originPlaylistText ?? String(data: master.bytes, encoding: .utf8)
      else {
        return 0
      }
      let variants = HlsPlaylistParser.parseVariants(body: text, masterUri: masterUri)
      guard let rung = HlsPlaylistParser.pickRung(variants, maxHeight: descriptor.maxPrefetchHeight)
      else {
        return 0
      }
      let media = try resolve(originUri: rung.playlistUri, rangeHeader: nil)
      guard
        let mediaText = media.originPlaylistText ?? String(data: media.bytes, encoding: .utf8)
      else {
        return 0
      }
      let segments = HlsPlaylistParser.parseMediaSegments(
        body: mediaText,
        playlistUri: rung.playlistUri
      )
      var fetched = 0
      for segment in segments {
        if segment.isInit {
          _ = try resolve(originUri: segment.uri, rangeHeader: nil)
          continue
        }
        if fetched >= descriptor.maxPrefetchSegments {
          break
        }
        _ = try resolve(originUri: segment.uri, rangeHeader: nil)
        fetched += 1
      }
      return fetched
    } catch {
      return 0
    }
  }

  func recordedEvents() -> [[String: Any]] {
    lock.lock()
    defer { lock.unlock() }
    return recordedEventLog
  }

  func resetForTests() {
    lock.lock()
    descriptors.removeAll()
    resources.removeAll()
    recordedEventLog.removeAll()
    forceOrigin.removeAll()
    upgradeInFlight.removeAll()
    eventSink = nil
    downloadedFiles.removeAll()
    lock.unlock()
    timeline.clear()
    reachability.clear()
    cache.clear()
    loopback.stop()
    downloader = HlsDownloadManager.shared
    HlsDownloadManager.shared.resetForTests()
  }

  private func descriptor(for uri: String) -> HlsNativeDescriptor? {
    lock.lock()
    defer { lock.unlock() }
    return descriptors[HlsCacheKey.normalize(uri)]
  }

  private func resource(for uri: String) -> HlsResource? {
    lock.lock()
    defer { lock.unlock() }
    return resources[HlsCacheKey.normalize(uri)]
  }

  private func putResource(_ resource: HlsResource) {
    lock.lock()
    resources[HlsCacheKey.normalize(resource.originUri)] = resource
    lock.unlock()
  }

  private func isCacheable(_ kind: String) -> Bool {
    kind == "segment" || kind == "initSegment" || kind == "key"
  }

  private func isPlaylist(_ kind: String) -> Bool {
    kind == "masterPlaylist" || kind == "mediaPlaylist"
  }

  private func substitute(for resource: HlsResource) -> (origin: String, body: Data)? {
    guard resource.kind == "segment" else {
      return nil
    }
    guard let start = resource.segmentStartMs else {
      return nil
    }
    if descriptor(for: resource.assetId)?.substitutionEnabled == false {
      return nil
    }
    guard
      let entry = timeline.findSubstitute(
        assetId: resource.assetId,
        requestedStartMs: start,
        excludeOrigin: resource.originUri,
        preferVariant: resource.variant
      ),
      let body = cache.get(entry.originUri)
    else {
      return nil
    }
    return (entry.originUri, body)
  }

  private func serveCached(
    resource: HlsResource,
    cached: Data,
    rangeHeader: String?,
    skipReason: String? = nil,
    substituted: String? = nil
  ) -> HlsResolveResult {
    let sliced = applyRange(cached, rangeHeader)
    let typeKey = substituted ?? resource.originUri
    let mime = cache.contentType(typeKey) ?? contentType(for: typeKey, kind: resource.kind)
    emit(
      resource: resource,
      byteLength: sliced.body.count,
      servedFromCache: true,
      skipReason: skipReason,
      substituted: substituted,
      statusCode: sliced.status
    )
    return HlsResolveResult(
      originUri: resource.originUri,
      statusCode: sliced.status,
      bytes: sliced.body,
      contentType: mime,
      servedFromCache: true,
      cacheSkipReason: skipReason,
      substitutedOriginUri: substituted,
      originPlaylistText: nil,
      extraHeaders: sliced.extraHeaders,
      contentLength: sliced.contentLength
    )
  }

  private func servePlaylist(
    resource: HlsResource,
    originText: String,
    servedFromCache: Bool
  ) throws -> HlsResolveResult {
    ingestPlaylist(originUri: resource.originUri, body: originText, assetId: resource.assetId)
    let cacheOnly = isCacheOnlyFor(resource.assetId)
    let rewritten = HlsPlaylistRewriter.rewrite(
      body: originText,
      playlistUri: resource.originUri,
      localUriFor: { [weak self] origin, kind, variant, duration, start in
        self?.putResource(
          HlsResource(
            originUri: origin,
            kind: kind,
            assetId: resource.assetId,
            variant: variant ?? resource.variant,
            segmentStartMs: start,
            segmentDurationMs: duration
          )
        )
        return self?.loopback.registerResource(
          originUri: origin,
          kind: kind,
          variant: variant ?? resource.variant,
          segmentDurationMs: duration,
          segmentStartMs: start
        ) ?? origin
      },
      inheritedVariant: resource.variant,
      cacheOnlyHasSegment: cacheOnly ? { [weak self] uri in self?.cache.contains(uri) ?? false } : nil,
      cacheOnlyHasPlayableRendition: cacheOnly
        ? { [weak self] uri in self?.hasPlayableRendition(uri) ?? false } : nil
    )
    let bytes = Data(rewritten.body.utf8)
    if cacheOnly, resource.kind == "masterPlaylist" {
      let originalVariants = HlsPlaylistParser.parseVariants(body: originText, masterUri: resource.originUri)
      if !originalVariants.isEmpty && rewritten.variants.isEmpty {
        emit(
          resource: resource,
          byteLength: 0,
          servedFromCache: servedFromCache,
          skipReason: "cancelled",
          error: "cache-only miss"
        )
        throw HlsEngineError.cacheOnlyMiss(resource.originUri)
      }
    }
    emit(
      resource: resource,
      byteLength: bytes.count,
      servedFromCache: servedFromCache,
      variants: rewritten.variants
    )
    return HlsResolveResult(
      originUri: resource.originUri,
      statusCode: 200,
      bytes: bytes,
      contentType: "application/vnd.apple.mpegurl",
      servedFromCache: servedFromCache,
      cacheSkipReason: nil,
      substitutedOriginUri: nil,
      originPlaylistText: originText
    )
  }

  private func hasPlayableRendition(_ playlistUri: String) -> Bool {
    guard let data = cache.get(playlistUri),
      let text = String(data: data, encoding: .utf8)
    else {
      return false
    }
    return HlsPlaylistParser.isPlayableRendition(
      body: text,
      playlistUri: playlistUri,
      isCached: { [weak self] uri in self?.cache.contains(uri) ?? false }
    )
  }

  private func ingestPlaylist(originUri: String, body: String, assetId: String) {
    let kind = inferKind(originUri, masterOrigin: descriptor(for: assetId)?.originUrl ?? assetId)
    if kind == "masterPlaylist" {
      for variant in HlsPlaylistParser.parseVariants(body: body, masterUri: originUri) {
        putResource(
          HlsResource(
            originUri: variant.playlistUri,
            kind: "mediaPlaylist",
            assetId: assetId,
            variant: variant,
            segmentStartMs: nil,
            segmentDurationMs: nil
          )
        )
      }
    } else if kind == "mediaPlaylist" {
      let parent = resource(for: originUri)
      for segment in HlsPlaylistParser.parseMediaSegments(body: body, playlistUri: originUri) {
        putResource(
          HlsResource(
            originUri: segment.uri,
            kind: segment.isInit ? "initSegment" : "segment",
            assetId: assetId,
            variant: parent?.variant,
            segmentStartMs: segment.startMs,
            segmentDurationMs: segment.durationMs
          )
        )
      }
    }
  }

  private func putOriginBytes(_ originUri: String) throws {
    let headers = descriptor(for: originUri)?.authHeaders ?? [:]
    let fetched: (Int, Data, String?)
    if let originFetcher {
      fetched = try originFetcher(originUri, headers, nil)
    } else {
      fetched = try defaultFetch(originUri, headers: headers, range: nil)
    }
    cache.put(originUri, data: fetched.1, contentType: fetched.2)
  }

  private func fetchOrigin(resource: HlsResource, rangeHeader: String?) throws -> HlsResolveResult {
    let headers = descriptor(for: resource.assetId)?.authHeaders ?? [:]
    let fetched: (Int, Data, String?)
    if let originFetcher {
      fetched = try originFetcher(resource.originUri, headers, nil)
    } else {
      fetched = try defaultFetch(resource.originUri, headers: headers, range: nil)
    }
    if isPlaylist(resource.kind) {
      cache.put(resource.originUri, data: fetched.1, contentType: fetched.2)
      let text = String(data: fetched.1, encoding: .utf8) ?? ""
      return try servePlaylist(resource: resource, originText: text, servedFromCache: false)
    }
    cache.put(resource.originUri, data: fetched.1, contentType: fetched.2)
    if resource.kind == "segment",
      let start = resource.segmentStartMs,
      let duration = resource.segmentDurationMs
    {
      timeline.record(
        TimelineEntry(
          assetId: resource.assetId,
          originUri: resource.originUri,
          segmentStartMs: start,
          segmentDurationMs: duration,
          variant: resource.variant
        )
      )
    }
    let sliced = applyRange(fetched.1, rangeHeader)
    emit(
      resource: resource,
      byteLength: sliced.body.count,
      servedFromCache: false,
      statusCode: sliced.status
    )
    return HlsResolveResult(
      originUri: resource.originUri,
      statusCode: sliced.status,
      bytes: sliced.body,
      contentType: fetched.2 ?? contentType(for: resource.originUri, kind: resource.kind),
      servedFromCache: false,
      cacheSkipReason: nil,
      substitutedOriginUri: nil,
      originPlaylistText: nil,
      extraHeaders: sliced.extraHeaders,
      contentLength: sliced.contentLength
    )
  }

  private func defaultFetch(
    _ uri: String,
    headers: [String: String],
    range: String?
  ) throws -> (Int, Data, String?) {
    guard let url = URL(string: uri) else {
      throw HlsEngineError.originFailed("bad url")
    }
    var request = URLRequest(url: url, timeoutInterval: 15)
    for (key, value) in headers {
      request.setValue(value, forHTTPHeaderField: key)
    }
    if let range {
      request.setValue(range, forHTTPHeaderField: "Range")
    }
    let semaphore = DispatchSemaphore(value: 0)
    var captured: (Int, Data, String?)?
    var capturedError: Error?
    URLSession.shared.dataTask(with: request) { data, response, error in
      if let error {
        capturedError = error
      } else if let http = response as? HTTPURLResponse {
        captured = (
          http.statusCode,
          data ?? Data(),
          http.value(forHTTPHeaderField: "Content-Type")
        )
      }
      semaphore.signal()
    }.resume()
    _ = semaphore.wait(timeout: .now() + 20)
    if let capturedError {
      throw capturedError
    }
    guard let captured else {
      throw HlsEngineError.originFailed(uri)
    }
    return captured
  }

  private func scheduleUpgrade(_ originUri: String) {
    let key = HlsCacheKey.normalize(originUri)
    lock.lock()
    if !upgradeInFlight.insert(key).inserted {
      lock.unlock()
      return
    }
    lock.unlock()
    DispatchQueue.global(qos: .utility).async { [weak self] in
      guard let self else { return }
      self.lock.lock()
      self.forceOrigin.insert(key)
      self.lock.unlock()
      _ = try? self.resolve(originUri: originUri, rangeHeader: nil)
      self.lock.lock()
      self.forceOrigin.remove(key)
      self.upgradeInFlight.remove(key)
      self.lock.unlock()
    }
  }

  private func applyRange(_ full: Data, _ header: String?) -> (
    status: Int, body: Data, extraHeaders: [String: String], contentLength: Int
  ) {
    let total = full.count
    guard let parsed = parseByteRange(header, length: total) else {
      return (
        416,
        Data(),
        [
          "Content-Range": "bytes */\(total)",
          "Accept-Ranges": "bytes",
        ],
        0
      )
    }
    if parsed.isFull {
      return (200, full, ["Accept-Ranges": "bytes"], total)
    }
    let slice = full.subdata(in: parsed.start..<(parsed.endInclusive + 1))
    return (
      206,
      slice,
      [
        "Content-Range": "bytes \(parsed.start)-\(parsed.endInclusive)/\(total)",
        "Accept-Ranges": "bytes",
      ],
      slice.count
    )
  }

  private func parseByteRange(_ header: String?, length: Int) -> (
    start: Int, endInclusive: Int, isFull: Bool
  )? {
    guard let header, header.lowercased().hasPrefix("bytes=") else {
      return (0, max(length - 1, 0), true)
    }
    if length <= 0 {
      return nil
    }
    let spec = String(header.dropFirst(6))
    if spec.hasPrefix("-") {
      guard let suffix = Int(spec.dropFirst()), suffix > 0 else {
        return nil
      }
      let start = max(0, length - suffix)
      return (start, length - 1, false)
    }
    let parts = spec.split(separator: "-", omittingEmptySubsequences: false)
    let start = Int(parts.first.map(String.init) ?? "") ?? 0
    let endInclusive: Int
    if parts.count > 1, !parts[1].isEmpty, let parsed = Int(parts[1]) {
      endInclusive = min(parsed, length - 1)
    } else {
      endInclusive = length - 1
    }
    if start >= length || start > endInclusive {
      return nil
    }
    if start == 0 && endInclusive == length - 1 {
      return (start, endInclusive, true)
    }
    return (start, endInclusive, false)
  }

  private func contentType(for uri: String, kind: String) -> String {
    let path = URL(string: uri)?.path.lowercased() ?? ""
    if kind.contains("Playlist") || path.hasSuffix(".m3u8") {
      return "application/vnd.apple.mpegurl"
    }
    if path.hasSuffix(".ts") {
      return "video/MP2T"
    }
    if path.hasSuffix(".m4s") || path.hasSuffix(".mp4") || path.hasSuffix(".m4a")
      || path.hasSuffix(".m4v")
    {
      return "video/mp4"
    }
    return "application/octet-stream"
  }

  private func inferKind(_ uri: String, masterOrigin: String?) -> String {
    let path = URL(string: uri)?.path.lowercased() ?? ""
    if path.hasSuffix(".m3u8") || path.hasSuffix(".m3u") {
      if let masterOrigin, HlsCacheKey.normalize(uri) == HlsCacheKey.normalize(masterOrigin) {
        return "masterPlaylist"
      }
      return "mediaPlaylist"
    }
    if path.contains("init") && (path.hasSuffix(".mp4") || path.hasSuffix(".m4s")) {
      return "initSegment"
    }
    if path.hasSuffix(".ts") || path.hasSuffix(".m4s") || path.hasSuffix(".mp4") {
      return "segment"
    }
    if path.hasSuffix(".key") {
      return "key"
    }
    return "unknown"
  }

  private func emit(
    resource: HlsResource,
    byteLength: Int,
    servedFromCache: Bool,
    skipReason: String? = nil,
    substituted: String? = nil,
    error: String? = nil,
    statusCode: Int? = nil,
    variants: [HlsVariantInfo] = []
  ) {
    var payload: [String: Any] = [
      "kind": resource.kind,
      "originUri": resource.originUri,
      "byteLength": byteLength,
      "occurredAt": Int(Date().timeIntervalSince1970 * 1000),
      "servedFromCache": servedFromCache,
    ]
    if let variant = resource.variant {
      payload["variant"] = variant.toChannelMap()
    }
    if let duration = resource.segmentDurationMs {
      payload["segmentDurationMs"] = duration
    }
    if let start = resource.segmentStartMs {
      payload["segmentStartMs"] = start
    }
    if let skipReason {
      payload["cacheSkipReason"] = skipReason
    }
    if let substituted {
      payload["substitutedOriginUri"] = substituted
    }
    if let error {
      payload["error"] = error
    }
    if let statusCode {
      payload["statusCode"] = statusCode
    }
    if resource.kind == "masterPlaylist", !variants.isEmpty {
      payload["variants"] = variants.map { $0.toChannelMap() }
    }
    emitRaw(payload)
  }

  private func rememberDownloadedFile(_ fileURL: URL, descriptor: HlsNativeDescriptor) {
    lock.lock()
    downloadedFiles[fileURL.standardizedFileURL.path] = descriptor
    lock.unlock()
  }

  private func emitRaw(_ payload: [String: Any]) {
    lock.lock()
    recordedEventLog.append(payload)
    if recordedEventLog.count > 100 {
      recordedEventLog.removeFirst()
    }
    let sink = eventSink
    lock.unlock()
    if let sink {
      DispatchQueue.main.async { sink(payload) }
    }
  }
}
