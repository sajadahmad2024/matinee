import XCTest

final class HlsEngineParityTests: XCTestCase {
  override func tearDown() {
    HlsEngine.shared.resetForTests()
    super.tearDown()
  }

  func testRewrittenPlaylistHasNoHttpsChildren() {
    let master = """
      #EXTM3U
      #EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360
      https://cdn.example.com/a/low.m3u8
      #EXT-X-STREAM-INF:BANDWIDTH=2500000,RESOLUTION=1280x720
      high.m3u8
      """
    var index = 0
    let rewritten = HlsPlaylistRewriter.rewrite(
      body: master,
      playlistUri: "https://cdn.example.com/a/master.m3u8",
      localUriFor: { origin, _, _, _, _ in
        index += 1
        return "http://127.0.0.1:9/tok/\(index).m3u8"
      }
    )
    XCTAssertFalse(HlsPlaylistRewriter.childUrisHaveHttps(rewritten.body))
    XCTAssertTrue(rewritten.body.contains("http://127.0.0.1:9/tok/"))
    XCTAssertEqual(rewritten.variants.count, 2)
  }

  func testSubstituteNeverCrossesAssetId() {
    let timeline = SegmentTimeline()
    timeline.record(
      TimelineEntry(
        assetId: "https://a/master.m3u8",
        originUri: "https://a/low/s.ts",
        segmentStartMs: 0,
        segmentDurationMs: 2000,
        variant: nil
      )
    )
    let same = timeline.findSubstitute(
      assetId: "https://a/master.m3u8",
      requestedStartMs: 500,
      excludeOrigin: "https://a/high/s.ts",
      preferVariant: nil
    )
    let other = timeline.findSubstitute(
      assetId: "https://b/master.m3u8",
      requestedStartMs: 500,
      excludeOrigin: "https://b/high/s.ts",
      preferVariant: nil
    )
    XCTAssertEqual(same?.originUri, "https://a/low/s.ts")
    XCTAssertNil(other)
  }

  func testCachePolicyNoneUsesDirectOrigin() throws {
    let descriptor = try HlsNativeDescriptor.fromChannelMap([
      "originUrl": "https://cdn.example.com/master.m3u8",
      "assetId": "https://cdn.example.com/master.m3u8",
      "drm": "none",
      "cachePolicy": "none",
    ])
    let opened = try HlsContentStrategyRouter.open(descriptor)
    XCTAssertEqual(opened["strategy"], "direct")
    XCTAssertEqual(opened["playerUri"], "https://cdn.example.com/master.m3u8")
  }

  func testLoopbackTokenMismatchReturns404() throws {
    let server = LoopbackHlsServer(accessToken: "goodtoken")
    server.resolve = { _, _ in
      LoopbackHttpResult(status: 200, body: Data("ok".utf8), contentType: "text/plain")
    }
    try server.ensureListening()
    let uri = server.registerResource(
      originUri: "https://cdn.example.com/master.m3u8",
      kind: "masterPlaylist",
      variant: nil,
      segmentDurationMs: nil,
      segmentStartMs: nil
    )
    XCTAssertTrue(uri.contains("/goodtoken/"))
    let bad = uri.replacingOccurrences(of: "/goodtoken/", with: "/badtoken/")
    let status = httpStatus(URL(string: bad)!)
    XCTAssertEqual(status, 404)
    server.stop()
  }

  func testEngineSubstituteStaysOnSameAsset() throws {
    let engine = HlsEngine.shared
    engine.resetForTests()
    engine.setOriginProber(FixedProber(reachable: true))
    let masterA = "https://cdn.example.com/a/master.m3u8"
    engine.registerDescriptor(
      try HlsNativeDescriptor.fromChannelMap([
        "originUrl": masterA,
        "assetId": masterA,
        "cachePolicy": "liveSegmentCache",
      ])
    )
    engine.startMaster(masterA)
    let low = "https://cdn.example.com/a/low/seg0.ts"
    let high = "https://cdn.example.com/a/high/seg0.ts"
    let lowBody = Data(repeating: 3, count: 64)
    engine.originFetcher = { url, _, _ in
      if url.hasSuffix("master.m3u8") {
        let body = """
          #EXTM3U
          #EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360
          low.m3u8
          #EXT-X-STREAM-INF:BANDWIDTH=2500000,RESOLUTION=1280x720
          high.m3u8
          """
        return (200, Data(body.utf8), "application/vnd.apple.mpegurl")
      }
      if url.hasSuffix("low.m3u8") {
        return (
          200,
          Data(
            """
            #EXTM3U
            #EXTINF:2.0,
            low/seg0.ts
            """.utf8),
          "application/vnd.apple.mpegurl"
        )
      }
      if url.hasSuffix("high.m3u8") {
        return (
          200,
          Data(
            """
            #EXTM3U
            #EXTINF:2.0,
            high/seg0.ts
            """.utf8),
          "application/vnd.apple.mpegurl"
        )
      }
      if url == low {
        return (200, lowBody, "video/MP2T")
      }
      if url == high {
        return (200, Data(repeating: 9, count: 32), "video/MP2T")
      }
      XCTFail("unexpected origin fetch \(url)")
      return (500, Data(), nil)
    }
    _ = try engine.resolve(originUri: masterA, rangeHeader: nil)
    _ = try engine.resolve(originUri: "https://cdn.example.com/a/low.m3u8", rangeHeader: nil)
    _ = try engine.resolve(originUri: "https://cdn.example.com/a/high.m3u8", rangeHeader: nil)
    _ = try engine.resolve(originUri: low, rangeHeader: nil)
    let highResult = try engine.resolve(originUri: high, rangeHeader: nil)
    XCTAssertTrue(highResult.servedFromCache)
    XCTAssertEqual(highResult.cacheSkipReason, "substituted")
    XCTAssertEqual(highResult.substitutedOriginUri, low)
    XCTAssertEqual(highResult.bytes, lowBody)
  }

  func testLoopbackHeadReportsBodyLength() throws {
    let server = LoopbackHlsServer(accessToken: "headtoken")
    let body = Data(repeating: 9, count: 200)
    server.resolve = { _, _ in
      LoopbackHttpResult(
        status: 200,
        body: body,
        contentType: "video/MP2T",
        extraHeaders: ["Accept-Ranges": "bytes"],
        contentLength: body.count
      )
    }
    try server.ensureListening()
    let uri = server.registerResource(
      originUri: "https://cdn.example.com/a/seg.ts",
      kind: "segment",
      variant: nil,
      segmentDurationMs: 2000,
      segmentStartMs: 0
    )
    let head = httpExchange(URL(string: uri)!, method: "HEAD")
    XCTAssertEqual(head.status, 200)
    XCTAssertEqual(head.body.count, 0)
    XCTAssertEqual(head.headers["content-length"], "200")
    let get = httpExchange(URL(string: uri)!, method: "GET")
    XCTAssertEqual(get.body.count, 200)
    server.stop()
  }

  func testLoopbackRangeAndUnsatisfiable() throws {
    let server = LoopbackHlsServer(accessToken: "rangetoken")
    let body = Data(repeating: 3, count: 200)
    server.resolve = { _, range in
      if range == "bytes=0-99" {
        return LoopbackHttpResult(
          status: 206,
          body: Data(body.prefix(100)),
          contentType: "video/MP2T",
          extraHeaders: [
            "Content-Range": "bytes 0-99/200",
            "Accept-Ranges": "bytes",
          ],
          contentLength: 100
        )
      }
      if range == "bytes=-10" {
        return LoopbackHttpResult(
          status: 206,
          body: Data(body.suffix(10)),
          contentType: "video/MP2T",
          extraHeaders: [
            "Content-Range": "bytes 190-199/200",
            "Accept-Ranges": "bytes",
          ],
          contentLength: 10
        )
      }
      if range == "bytes=999-" {
        return LoopbackHttpResult(
          status: 416,
          body: Data(),
          contentType: "video/MP2T",
          extraHeaders: [
            "Content-Range": "bytes */200",
            "Accept-Ranges": "bytes",
          ],
          contentLength: 0
        )
      }
      return LoopbackHttpResult(status: 200, body: body, contentType: "video/MP2T", contentLength: 200)
    }
    try server.ensureListening()
    let uri = server.registerResource(
      originUri: "https://cdn.example.com/a/seg.ts",
      kind: "segment",
      variant: nil,
      segmentDurationMs: 2000,
      segmentStartMs: 0
    )
    let ranged = httpExchange(URL(string: uri)!, method: "GET", headers: ["Range": "bytes=0-99"])
    XCTAssertEqual(ranged.status, 206)
    XCTAssertEqual(ranged.body.count, 100)
    XCTAssertEqual(ranged.headers["content-range"], "bytes 0-99/200")
    let suffix = httpExchange(URL(string: uri)!, method: "GET", headers: ["Range": "bytes=-10"])
    XCTAssertEqual(suffix.status, 206)
    XCTAssertEqual(suffix.body.count, 10)
    let unsat = httpExchange(URL(string: uri)!, method: "GET", headers: ["Range": "bytes=999-"])
    XCTAssertEqual(unsat.status, 416)
    server.stop()
  }

  func testInitMimeAndNeverSubstituted() throws {
    let engine = HlsEngine.shared
    engine.resetForTests()
    engine.setOriginProber(FixedProber(reachable: true))
    let masterA = "https://cdn.example.com/a/master.m3u8"
    engine.registerDescriptor(
      try HlsNativeDescriptor.fromChannelMap([
        "originUrl": masterA,
        "assetId": masterA,
        "cachePolicy": "liveSegmentCache",
      ])
    )
    engine.startMaster(masterA)
    let initUri = "https://cdn.example.com/a/init.mp4"
    let frag = "https://cdn.example.com/a/1.m4s"
    engine.originFetcher = { url, _, _ in
      if url.hasSuffix("master.m3u8") {
        return (
          200,
          Data(
            """
            #EXTM3U
            #EXT-X-STREAM-INF:BANDWIDTH=2500000,RESOLUTION=1920x1080
            cmaf.m3u8
            """.utf8),
          "application/vnd.apple.mpegurl"
        )
      }
      if url.hasSuffix("cmaf.m3u8") {
        return (
          200,
          Data(
            """
            #EXTM3U
            #EXT-X-MAP:URI="init.mp4"
            #EXTINF:2.0,
            1.m4s
            """.utf8),
          "application/vnd.apple.mpegurl"
        )
      }
      if url == frag {
        return (200, Data(repeating: 7, count: 64), "video/mp4")
      }
      if url == initUri {
        return (200, Data(repeating: 1, count: 32), "video/mp4")
      }
      XCTFail("unexpected origin fetch \(url)")
      return (500, Data(), nil)
    }
    _ = try engine.resolve(originUri: masterA, rangeHeader: nil)
    _ = try engine.resolve(originUri: "https://cdn.example.com/a/cmaf.m3u8", rangeHeader: nil)
    _ = try engine.resolve(originUri: frag, rangeHeader: nil)
    var originCalls = 0
    engine.originFetcher = { url, _, _ in
      originCalls += 1
      if url == initUri {
        return (200, Data(repeating: 2, count: 32), "video/mp4")
      }
      XCTFail("init must not substitute; unexpected \(url)")
      return (500, Data(), nil)
    }
    let initResult = try engine.resolve(originUri: initUri, rangeHeader: nil)
    XCTAssertEqual(initResult.contentType, "video/mp4")
    XCTAssertNotEqual(initResult.cacheSkipReason, "substituted")
    XCTAssertEqual(originCalls, 1)
    let ranged = try engine.resolve(originUri: frag, rangeHeader: "bytes=0-9")
    XCTAssertEqual(ranged.statusCode, 206)
    XCTAssertEqual(ranged.bytes.count, 10)
    XCTAssertEqual(ranged.extraHeaders["Content-Range"], "bytes 0-9/64")
    let suffix = try engine.resolve(originUri: frag, rangeHeader: "bytes=-8")
    XCTAssertEqual(suffix.statusCode, 206)
    XCTAssertEqual(suffix.bytes.count, 8)
    let unsat = try engine.resolve(originUri: frag, rangeHeader: "bytes=999-")
    XCTAssertEqual(unsat.statusCode, 416)
  }

  func testPlayableRenditionRequiresMap() {
    let body = """
      #EXTM3U
      #EXT-X-MAP:URI="init.mp4"
      #EXTINF:2.0,
      1.m4s
      """
    let playlist = "https://cdn.example.com/a/cmaf.m3u8"
    XCTAssertFalse(
      HlsPlaylistParser.isPlayableRendition(body: body, playlistUri: playlist) { uri in
        uri.hasSuffix("1.m4s")
      }
    )
    XCTAssertTrue(
      HlsPlaylistParser.isPlayableRendition(body: body, playlistUri: playlist) { _ in true }
    )
  }

  private func httpStatus(_ url: URL) -> Int {
    httpExchange(url, method: "GET").status
  }

  private func httpExchange(
    _ url: URL,
    method: String,
    headers: [String: String] = [:]
  ) -> (status: Int, headers: [String: String], body: Data) {
    let semaphore = DispatchSemaphore(value: 0)
    var status = -1
    var responseHeaders: [String: String] = [:]
    var body = Data()
    var request = URLRequest(url: url)
    request.httpMethod = method
    for (key, value) in headers {
      request.setValue(value, forHTTPHeaderField: key)
    }
    URLSession.shared.dataTask(with: request) { data, response, _ in
      if let http = response as? HTTPURLResponse {
        status = http.statusCode
        for (key, value) in http.allHeaderFields {
          responseHeaders["\(key)".lowercased()] = "\(value)"
        }
      }
      body = data ?? Data()
      semaphore.signal()
    }.resume()
    _ = semaphore.wait(timeout: .now() + 5)
    return (status, responseHeaders, body)
  }

  func testDrmDescriptorUsesDownloadStrategy() throws {
    let fileURL = URL(fileURLWithPath: "/tmp/reel.movpkg")
    HlsEngine.shared.downloader = ImmediateFileDownloader(fileURL: fileURL)
    let descriptor = try HlsNativeDescriptor.fromChannelMap([
      "originUrl": "https://cdn.example.com/fp/master.m3u8",
      "assetId": "https://cdn.example.com/fp/master.m3u8",
      "drm": "fairplay",
      "cachePolicy": "liveSegmentCache",
      "drmConfig": [
        "certificateUrl": "https://license.example.com/cert",
        "licenseServerUrl": "https://license.example.com/fps",
        "contentId": "reel42",
      ],
    ])
    let opened = try HlsContentStrategyRouter.open(descriptor)
    XCTAssertEqual(opened["strategy"], "download")
    XCTAssertEqual(opened["playerUri"], fileURL.absoluteString)
  }

  func testFairPlayDelegateBuildsLicensePostBody() throws {
    let descriptor = try HlsNativeDescriptor.fromChannelMap([
      "originUrl": "https://cdn.example.com/fp/master.m3u8",
      "drm": "fairplay",
      "drmConfig": [
        "certificateUrl": "https://license.example.com/cert",
        "licenseServerUrl": "https://license.example.com/fps",
        "contentId": "reel42",
      ],
      "authConfig": [
        "headerName": "Authorization",
        "headerValue": "Bearer tok",
      ],
    ])
    let delegate = FairPlayKeyDelegate(descriptor: descriptor)
    let spc = Data("spc-bytes".utf8)
    let request = try delegate.licenseRequest(forSpc: spc)
    XCTAssertEqual(request.httpMethod, "POST")
    XCTAssertEqual(request.url?.absoluteString, "https://license.example.com/fps")
    XCTAssertEqual(request.httpBody, spc)
    XCTAssertEqual(request.value(forHTTPHeaderField: "Content-Type"), "application/octet-stream")
    XCTAssertEqual(request.value(forHTTPHeaderField: "X-Content-ID"), "reel42")
    XCTAssertEqual(request.value(forHTTPHeaderField: "Authorization"), "Bearer tok")
  }

  func testPrefetchToDiskDoesNotStartMaster() throws {
    let engine = HlsEngine.shared
    engine.resetForTests()
    engine.setOriginProber(FixedProber(reachable: false))
    let master = "https://cdn.example.com/a/master.m3u8"
    engine.originFetcher = { url, _, _ in
      if url.hasSuffix("master.m3u8") {
        let body = """
          #EXTM3U
          #EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360
          low.m3u8
          #EXT-X-STREAM-INF:BANDWIDTH=2500000,RESOLUTION=1280x720
          high.m3u8
          """
        return (200, Data(body.utf8), "application/vnd.apple.mpegurl")
      }
      if url.hasSuffix("low.m3u8") {
        return (
          200,
          Data(
            """
            #EXTM3U
            #EXTINF:2.0,
            low/seg0.ts
            """.utf8
          ),
          "application/vnd.apple.mpegurl"
        )
      }
      return (200, Data(repeating: 1, count: 16), "video/MP2T")
    }
    let descriptor = try HlsNativeDescriptor.fromChannelMap([
      "originUrl": master,
      "assetId": master,
      "cachePolicy": "liveSegmentCache",
      "maxPrefetchSegments": 10,
      "maxPrefetchHeight": 480,
    ])
    XCTAssertEqual(engine.prefetchToDisk(descriptor), 1)
    XCTAssertFalse(engine.isCacheOnlyFor(master))
    engine.startMaster(master)
    XCTAssertTrue(engine.isCacheOnlyFor(master))
  }
}

private struct FixedProber: OriginProbing {
  var reachable: Bool
  func isReachable(_ masterUri: String) -> Bool { reachable }
}

private final class ImmediateFileDownloader: HlsDownloading {
  let fileURL: URL
  init(fileURL: URL) {
    self.fileURL = fileURL
  }

  func fileURLIfReady(assetId: String) -> URL? { fileURL }

  func download(
    _ descriptor: HlsNativeDescriptor,
    onProgress: @escaping (Double) -> Void
  ) throws -> URL {
    onProgress(1)
    return fileURL
  }
}
