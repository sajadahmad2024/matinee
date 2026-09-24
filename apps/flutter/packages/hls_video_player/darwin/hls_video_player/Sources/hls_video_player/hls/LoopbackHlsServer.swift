import Darwin
import Foundation
import Security

struct LoopbackHttpResult {
  var status: Int
  var body: Data
  var contentType: String?
  var extraHeaders: [String: String] = [:]
  var contentLength: Int? = nil
}

/// Loopback HTTP/1.1 server on 127.0.0.1. AVPlayer never sees origin HTTPS.
final class LoopbackHlsServer {
  private(set) var accessToken: String
  private(set) var port: Int = 0
  private var listenFd: Int32 = -1
  private var acceptSource: DispatchSourceRead?
  private let queue = DispatchQueue(label: "dev.flutter.hls_engine.loopback")
  private let lock = NSLock()
  private var originsById: [String: String] = [:]
  private var idsByKey: [String: String] = [:]
  private var nextResourceId = 0

  var resolve: ((String, String?) throws -> LoopbackHttpResult)?

  init(accessToken: String = LoopbackHlsServer.makeAccessToken()) {
    self.accessToken = accessToken
  }

  var isListening: Bool { port != 0 }

  func ensureListening() throws {
    lock.lock()
    if listenFd >= 0 {
      lock.unlock()
      return
    }
    lock.unlock()

    var addr = sockaddr_in()
    addr.sin_len = UInt8(MemoryLayout<sockaddr_in>.size)
    addr.sin_family = sa_family_t(AF_INET)
    addr.sin_port = 0
    addr.sin_addr = in_addr(s_addr: inet_addr("127.0.0.1"))

    let fd = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP)
    guard fd >= 0 else {
      throw HlsEngineError.originFailed("loopback socket failed")
    }
    var yes: Int32 = 1
    setsockopt(fd, SOL_SOCKET, SO_REUSEADDR, &yes, socklen_t(MemoryLayout<Int32>.size))
    let flags = fcntl(fd, F_GETFL, 0)
    if flags >= 0 {
      _ = fcntl(fd, F_SETFL, flags | O_NONBLOCK)
    }
    let bindResult = withUnsafePointer(to: &addr) { pointer in
      pointer.withMemoryRebound(to: sockaddr.self, capacity: 1) {
        bind(fd, $0, socklen_t(MemoryLayout<sockaddr_in>.size))
      }
    }
    guard bindResult == 0, listen(fd, 16) == 0 else {
      close(fd)
      throw HlsEngineError.originFailed("loopback bind failed")
    }
    var bound = sockaddr_in()
    var len = socklen_t(MemoryLayout<sockaddr_in>.size)
    let nameResult = withUnsafeMutablePointer(to: &bound) { pointer in
      pointer.withMemoryRebound(to: sockaddr.self, capacity: 1) {
        getsockname(fd, $0, &len)
      }
    }
    guard nameResult == 0 else {
      close(fd)
      throw HlsEngineError.originFailed("loopback port failed")
    }
    let boundPort = Int(UInt16(bigEndian: bound.sin_port))
    let source = DispatchSource.makeReadSource(fileDescriptor: fd, queue: queue)
    source.setEventHandler { [weak self] in
      self?.acceptOne(listenFd: fd)
    }
    source.setCancelHandler {
      Darwin.close(fd)
    }
    source.resume()

    lock.lock()
    listenFd = fd
    port = boundPort
    acceptSource = source
    lock.unlock()
  }

  func stop() {
    lock.lock()
    acceptSource?.cancel()
    acceptSource = nil
    listenFd = -1
    port = 0
    lock.unlock()
  }

  func registerResource(
    originUri: String,
    kind: String,
    variant: HlsVariantInfo?,
    segmentDurationMs: Int64?,
    segmentStartMs: Int64?
  ) -> String {
    try? ensureListening()
    let key = "\(originUri)|\(kind)|\(variant?.bandwidth ?? 0)"
    lock.lock()
    let id: String
    if let existing = idsByKey[key] {
      id = existing
    } else {
      id = String(nextResourceId, radix: 36)
      nextResourceId += 1
      idsByKey[key] = id
      originsById[id] = originUri
    }
    let currentPort = port
    lock.unlock()
    let ext = LoopbackHlsServer.fileExtension(originUri)
    return "http://127.0.0.1:\(currentPort)/\(accessToken)/\(id)\(ext)"
  }

  func origin(forResourceId id: String) -> String? {
    lock.lock()
    defer { lock.unlock() }
    return originsById[id]
  }

  private func acceptOne(listenFd: Int32) {
    var addr = sockaddr_in()
    var len = socklen_t(MemoryLayout<sockaddr_in>.size)
    let client = withUnsafeMutablePointer(to: &addr) { pointer in
      pointer.withMemoryRebound(to: sockaddr.self, capacity: 1) {
        accept(listenFd, $0, &len)
      }
    }
    if client < 0 {
      return
    }
    DispatchQueue.global(qos: .userInitiated).async {
      let flags = fcntl(client, F_GETFL, 0)
      if flags >= 0 {
        _ = fcntl(client, F_SETFL, flags & ~O_NONBLOCK)
      }
      self.handle(clientFd: client)
    }
  }

  private func handle(clientFd: Int32) {
    defer { Darwin.close(clientFd) }
    guard let request = readRequest(fd: clientFd) else {
      writeResponse(fd: clientFd, status: 400, body: Data(), contentType: nil)
      return
    }
    let path = request.path.split(separator: "/").map(String.init).filter { !$0.isEmpty }
    if (request.method != "GET" && request.method != "HEAD") || path.count != 2
      || path[0] != accessToken
    {
      writeResponse(fd: clientFd, status: 404, body: Data(), contentType: nil)
      return
    }
    let id = LoopbackHlsServer.resourceId(path[1])
    guard let origin = origin(forResourceId: id), let resolve else {
      writeResponse(fd: clientFd, status: 404, body: Data(), contentType: nil)
      return
    }
    do {
      let result = try resolve(origin, request.range)
      let body = request.method == "HEAD" ? Data() : result.body
      writeResponse(
        fd: clientFd,
        status: result.status,
        body: body,
        contentType: result.contentType,
        extraHeaders: result.extraHeaders,
        contentLength: result.contentLength ?? result.body.count
      )
    } catch {
      writeResponse(fd: clientFd, status: 502, body: Data(), contentType: nil)
    }
  }

  private struct ParsedRequest {
    var method: String
    var path: String
    var range: String?
  }

  private func readRequest(fd: Int32) -> ParsedRequest? {
    var data = Data()
    var buffer = [UInt8](repeating: 0, count: 4096)
    while data.count < 64 * 1024 {
      let n = recv(fd, &buffer, buffer.count, 0)
      if n <= 0 {
        break
      }
      data.append(buffer, count: n)
      if let range = data.range(of: Data("\r\n\r\n".utf8)) {
        data = data.prefix(range.lowerBound + 4)
        break
      }
    }
    guard let text = String(data: data, encoding: .utf8) else {
      return nil
    }
    let headerLines = text.components(separatedBy: "\r\n")
    guard let requestLine = headerLines.first else {
      return nil
    }
    let parts = requestLine.split(separator: " ")
    guard parts.count >= 2 else {
      return nil
    }
    var range: String?
    for line in headerLines.dropFirst() {
      if line.lowercased().hasPrefix("range:") {
        range = String(line.dropFirst(6)).trimmingCharacters(in: .whitespaces)
      }
    }
    return ParsedRequest(method: String(parts[0]), path: String(parts[1]), range: range)
  }

  private func writeResponse(
    fd: Int32,
    status: Int,
    body: Data,
    contentType: String?,
    extraHeaders: [String: String] = [:],
    contentLength: Int? = nil
  ) {
    let reason: String
    switch status {
    case 200: reason = "OK"
    case 206: reason = "Partial Content"
    case 404: reason = "Not Found"
    case 400: reason = "Bad Request"
    case 416: reason = "Range Not Satisfiable"
    default: reason = "Error"
    }
    let length = contentLength ?? body.count
    var header =
      "HTTP/1.1 \(status) \(reason)\r\n"
      + "Cache-Control: no-store, no-cache, must-revalidate\r\n"
      + "Pragma: no-cache\r\n"
      + "Expires: 0\r\n"
      + "Connection: close\r\n"
      + "Content-Length: \(length)\r\n"
    if let contentType {
      header += "Content-Type: \(contentType)\r\n"
    }
    for (name, value) in extraHeaders {
      header += "\(name): \(value)\r\n"
    }
    header += "\r\n"
    var payload = Data(header.utf8)
    payload.append(body)
    payload.withUnsafeBytes { pointer in
      guard let base = pointer.baseAddress else { return }
      var sent = 0
      while sent < payload.count {
        let n = send(fd, base + sent, payload.count - sent, 0)
        if n <= 0 {
          break
        }
        sent += n
      }
    }
  }

  static func makeAccessToken() -> String {
    var bytes = [UInt8](repeating: 0, count: 18)
    _ = SecRandomCopyBytes(kSecRandomDefault, bytes.count, &bytes)
    return bytes.map { String(format: "%02x", $0) }.joined()
  }

  static func fileExtension(_ originUri: String) -> String {
    let last = URL(string: originUri)?.path.split(separator: "/").last.map(String.init) ?? ""
    guard let dot = last.lastIndex(of: "."), dot != last.startIndex else {
      return ""
    }
    let ext = String(last[dot...]).lowercased()
    if ext.range(of: #"^\.[A-Za-z0-9]{1,5}$"#, options: .regularExpression) != nil {
      return ext
    }
    return ""
  }

  static func resourceId(_ pathSegment: String) -> String {
    if let dot = pathSegment.firstIndex(of: ".") {
      return String(pathSegment[..<dot])
    }
    return pathSegment
  }
}
