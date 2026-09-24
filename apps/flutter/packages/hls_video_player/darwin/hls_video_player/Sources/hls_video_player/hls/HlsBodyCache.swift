import Foundation

final class HlsBodyCache {
  private let root: URL
  private let lock = NSLock()
  private var memory: [String: Data] = [:]
  private var types: [String: String] = [:]

  init(root: URL) {
    self.root = root
    try? FileManager.default.createDirectory(at: root, withIntermediateDirectories: true)
  }

  func get(_ originUri: String) -> Data? {
    let key = HlsCacheKey.sha256Hex(originUri)
    lock.lock()
    if let memory = memory[key] {
      lock.unlock()
      return memory
    }
    lock.unlock()
    let file = root.appendingPathComponent("\(key).bin")
    return try? Data(contentsOf: file)
  }

  func put(_ originUri: String, data: Data, contentType: String? = nil) {
    let key = HlsCacheKey.sha256Hex(originUri)
    lock.lock()
    memory[key] = data
    if let contentType {
      types[key] = contentType
    }
    lock.unlock()
    let file = root.appendingPathComponent("\(key).bin")
    try? data.write(to: file, options: .atomic)
    if let contentType {
      let typeFile = root.appendingPathComponent("\(key).type")
      try? Data(contentType.utf8).write(to: typeFile, options: .atomic)
    }
  }

  func contentType(_ originUri: String) -> String? {
    let key = HlsCacheKey.sha256Hex(originUri)
    lock.lock()
    if let type = types[key] {
      lock.unlock()
      return type
    }
    lock.unlock()
    let typeFile = root.appendingPathComponent("\(key).type")
    guard let data = try? Data(contentsOf: typeFile) else {
      return nil
    }
    return String(data: data, encoding: .utf8)
  }

  func contains(_ originUri: String) -> Bool {
    get(originUri) != nil
  }

  func stats() -> [String: Any] {
    lock.lock()
    let count = memory.count
    let bytes = memory.values.reduce(0) { $0 + $1.count }
    lock.unlock()
    var entryCount = count
    var stored = bytes
    if let files = try? FileManager.default.contentsOfDirectory(
      at: root,
      includingPropertiesForKeys: [.fileSizeKey]
    ) {
      entryCount = files.filter { $0.pathExtension == "bin" }.count
      stored = files.reduce(0) { sum, url in
        let size = (try? url.resourceValues(forKeys: [.fileSizeKey]).fileSize) ?? 0
        return sum + size
      }
    }
    return [
      "backendName": "disk",
      "entryCount": entryCount,
      "storedBytes": stored,
    ]
  }

  func clear() {
    lock.lock()
    memory.removeAll()
    types.removeAll()
    lock.unlock()
    if let files = try? FileManager.default.contentsOfDirectory(
      at: root,
      includingPropertiesForKeys: nil
    ) {
      for file in files where file.pathExtension == "bin" || file.pathExtension == "type" {
        try? FileManager.default.removeItem(at: file)
      }
    }
  }
}
