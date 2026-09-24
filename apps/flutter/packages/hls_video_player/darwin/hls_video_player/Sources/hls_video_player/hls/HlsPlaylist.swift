import Foundation

struct MediaSegmentRef {
  var uri: String
  var startMs: Int64
  var durationMs: Int64
  var isInit: Bool
}

enum HlsPlaylistParser {
  static func parseVariants(body: String, masterUri: String) -> [HlsVariantInfo] {
    let lines = body.split(whereSeparator: \.isNewline).map(String.init)
    var variants: [HlsVariantInfo] = []
    var pending: [String: String]?
    for raw in lines {
      let line = raw.trimmingCharacters(in: .whitespaces)
      if line.hasPrefix("#EXT-X-STREAM-INF:") {
        pending = parseAttributes(String(line.dropFirst("#EXT-X-STREAM-INF:".count)))
        continue
      }
      guard let attributes = pending else { continue }
      if line.isEmpty || line.hasPrefix("#") {
        continue
      }
      pending = nil
      guard let bandwidth = Int(attributes["BANDWIDTH"] ?? "") else { continue }
      let codecs = attributes["CODECS"]
      let resolution = parseResolution(attributes["RESOLUTION"])
      if isAudioOnly(codecs: codecs, height: resolution.1) {
        continue
      }
      variants.append(
        HlsVariantInfo(
          playlistUri: resolve(masterUri, line),
          bandwidth: bandwidth,
          width: resolution.0,
          height: resolution.1,
          codecs: codecs
        )
      )
    }
    return variants
  }

  static func parseMediaSegments(body: String, playlistUri: String) -> [MediaSegmentRef] {
    let lines = body.split(whereSeparator: \.isNewline).map(String.init)
    var segments: [MediaSegmentRef] = []
    var pendingDurationMs: Int64?
    var cursor: Int64 = 0
    for raw in lines {
      let line = raw.trimmingCharacters(in: .whitespaces)
      if line.hasPrefix("#EXTINF:") {
        let value = String(line.dropFirst("#EXTINF:".count)).split(separator: ",").first
          .map(String.init)?.trimmingCharacters(in: .whitespaces) ?? "0"
        pendingDurationMs = Int64((Double(value) ?? 0) * 1000.0)
        continue
      }
      if line.hasPrefix("#EXT-X-MAP:") {
        if let match = firstMatch(pattern: "URI=\"([^\"]+)\"", in: line) {
          segments.append(
            MediaSegmentRef(
              uri: resolve(playlistUri, match),
              startMs: cursor,
              durationMs: 0,
              isInit: true
            )
          )
        }
        continue
      }
      if line.isEmpty || line.hasPrefix("#") {
        continue
      }
      let duration = pendingDurationMs ?? 0
      pendingDurationMs = nil
      segments.append(
        MediaSegmentRef(
          uri: resolve(playlistUri, line),
          startMs: cursor,
          durationMs: duration,
          isInit: false
        )
      )
      cursor += duration
    }
    return segments
  }

  static func isPlayableRendition(
    body: String,
    playlistUri: String,
    isCached: (String) -> Bool
  ) -> Bool {
    if let map = mapUri(body: body, playlistUri: playlistUri), !isCached(map) {
      return false
    }
    guard let first = parseMediaSegments(body: body, playlistUri: playlistUri).first(where: { !$0.isInit })
    else {
      return false
    }
    return isCached(first.uri)
  }

  static func mapUri(body: String, playlistUri: String) -> String? {
    for raw in body.split(whereSeparator: \.isNewline).map(String.init) {
      let trimmed = raw.trimmingCharacters(in: .whitespaces)
      if trimmed.hasPrefix("#EXT-X-MAP:"), let match = firstMatch(pattern: "URI=\"([^\"]+)\"", in: trimmed) {
        return resolve(playlistUri, match)
      }
    }
    return nil
  }

  static func pickRung(_ variants: [HlsVariantInfo], maxHeight: Int) -> HlsVariantInfo? {
    if variants.isEmpty {
      return nil
    }
    let atOrBelow = variants.filter { variant in
      if let height = variant.height {
        return height <= maxHeight
      }
      return false
    }
    if atOrBelow.isEmpty {
      return variants.first
    }
    return atOrBelow.max { ($0.height ?? 0) < ($1.height ?? 0) }
  }

  static func resolve(_ base: String, _ ref: String) -> String {
    if let absolute = URL(string: ref), absolute.scheme != nil {
      return absolute.absoluteString
    }
    guard let baseUrl = URL(string: base) else {
      return ref
    }
    return URL(string: ref, relativeTo: baseUrl)?.absoluteString ?? ref
  }

  private static func parseAttributes(_ source: String) -> [String: String] {
    var result: [String: String] = [:]
    let regex = try? NSRegularExpression(pattern: #"([A-Z0-9-]+)=("[^"]*"|[^,]*)"#)
    let ns = source as NSString
    regex?.enumerateMatches(in: source, range: NSRange(location: 0, length: ns.length)) { match, _, _ in
      guard let match, match.numberOfRanges >= 3 else { return }
      let key = ns.substring(with: match.range(at: 1))
      var value = ns.substring(with: match.range(at: 2))
      if value.hasPrefix("\""), value.hasSuffix("\"") {
        value = String(value.dropFirst().dropLast())
      }
      result[key] = value
    }
    return result
  }

  private static func parseResolution(_ value: String?) -> (Int?, Int?) {
    guard let value else { return (nil, nil) }
    let parts = value.lowercased().split(separator: "x")
    guard parts.count == 2 else { return (nil, nil) }
    return (Int(parts[0]), Int(parts[1]))
  }

  private static func isAudioOnly(codecs: String?, height: Int?) -> Bool {
    if height != nil || codecs == nil {
      return false
    }
    let normalized = codecs!.lowercased()
    return !["avc", "hev", "hvc", "vp9", "av01"].contains { normalized.contains($0) }
  }

  private static func firstMatch(pattern: String, in source: String) -> String? {
    let regex = try? NSRegularExpression(pattern: pattern)
    let ns = source as NSString
    guard let match = regex?.firstMatch(in: source, range: NSRange(location: 0, length: ns.length)),
      match.numberOfRanges >= 2
    else {
      return nil
    }
    return ns.substring(with: match.range(at: 1))
  }
}

struct HlsPlaylistRewriteResult {
  var body: String
  var variants: [HlsVariantInfo]
}

enum HlsPlaylistRewriter {
  static func rewrite(
    body: String,
    playlistUri: String,
    localUriFor: (String, String, HlsVariantInfo?, Int64?, Int64?) -> String,
    inheritedVariant: HlsVariantInfo? = nil,
    cacheOnlyHasSegment: ((String) -> Bool)? = nil,
    cacheOnlyHasPlayableRendition: ((String) -> Bool)? = nil
  ) -> HlsPlaylistRewriteResult {
    let variants = HlsPlaylistParser.parseVariants(body: body, masterUri: playlistUri)
    let variantsByUri = Dictionary(uniqueKeysWithValues: variants.map { ($0.playlistUri, $0) })
    let lines = body.components(separatedBy: CharacterSet.newlines)
    var output: [String] = []
    var keptVariants: [HlsVariantInfo] = []
    var pendingTags: [String] = []
    var pendingDuration: Int64?
    var pendingStreamVariant = false
    var segmentCursor: Int64 = 0
    var truncated = false

    for rawLine in lines {
      if truncated {
        break
      }
      let trimmed = rawLine.trimmingCharacters(in: .whitespaces)
      if trimmed.hasPrefix("#EXT-X-STREAM-INF:") {
        pendingStreamVariant = true
        pendingTags.append(rawLine)
        continue
      }
      if trimmed.hasPrefix("#EXTINF:") {
        let secondsText = String(trimmed.dropFirst("#EXTINF:".count)).split(separator: ",").first
          .map(String.init) ?? ""
        if let seconds = Double(secondsText.trimmingCharacters(in: .whitespaces)) {
          pendingDuration = Int64(seconds * 1000.0)
        } else {
          pendingDuration = nil
        }
        pendingTags.append(rawLine)
        continue
      }

      if !trimmed.isEmpty && !trimmed.hasPrefix("#") {
        let originUri = HlsPlaylistParser.resolve(playlistUri, trimmed)
        let variant = variantsByUri[originUri] ?? inheritedVariant
        let isMediaPlaylist = pendingStreamVariant || variantsByUri[originUri] != nil
        let kind = isMediaPlaylist ? "mediaPlaylist" : "segment"
        let isSegment = kind == "segment"

        if cacheOnlyHasSegment != nil || cacheOnlyHasPlayableRendition != nil {
          if isSegment, let hasSegment = cacheOnlyHasSegment, !hasSegment(originUri) {
            pendingTags.removeAll()
            truncated = true
            continue
          }
          if !isSegment, let hasRendition = cacheOnlyHasPlayableRendition, !hasRendition(originUri)
          {
            pendingTags.removeAll()
            pendingDuration = nil
            pendingStreamVariant = false
            continue
          }
        }

        let local = localUriFor(
          originUri,
          kind,
          variant,
          pendingDuration,
          isSegment ? segmentCursor : nil
        )
        output.append(contentsOf: pendingTags)
        output.append(preserveLeadingWhitespace(rawLine, local))
        pendingTags.removeAll()
        if isSegment, let pendingDuration {
          segmentCursor += pendingDuration
        }
        if !isSegment, let kept = variantsByUri[originUri] {
          keptVariants.append(kept)
        }
        pendingDuration = nil
        pendingStreamVariant = false
        continue
      }

      if trimmed.hasPrefix("#") && trimmed.contains("URI=\"") {
        if let hasSegment = cacheOnlyHasSegment, trimmed.contains("#EXT-X-MAP:") {
          if let uri = attributeUri(trimmed) {
            let origin = HlsPlaylistParser.resolve(playlistUri, uri)
            if !hasSegment(origin) {
              truncated = true
              continue
            }
          }
        }
        output.append(contentsOf: pendingTags)
        output.append(
          rewriteUriAttributes(
            rawLine,
            playlistUri: playlistUri,
            inheritedVariant: inheritedVariant,
            localUriFor: localUriFor
          )
        )
        pendingTags.removeAll()
        continue
      }

      output.append(contentsOf: pendingTags)
      output.append(rawLine)
      pendingTags.removeAll()
    }

    output.append(contentsOf: pendingTags)
    if truncated && !output.contains(where: { $0.trimmingCharacters(in: .whitespaces) == "#EXT-X-ENDLIST" })
    {
      output.append("#EXT-X-ENDLIST")
    }

    return HlsPlaylistRewriteResult(
      body: output.joined(separator: "\n"),
      variants: cacheOnlyHasSegment == nil ? variants : keptVariants
    )
  }

  static func childUrisHaveHttps(_ body: String) -> Bool {
    let lines = body.components(separatedBy: CharacterSet.newlines)
    for raw in lines {
      let trimmed = raw.trimmingCharacters(in: .whitespaces)
      if trimmed.isEmpty || trimmed.hasPrefix("#") {
        if trimmed.contains("URI=\"https://") {
          return true
        }
        continue
      }
      if trimmed.lowercased().hasPrefix("https://") {
        return true
      }
    }
    return false
  }

  private static func rewriteUriAttributes(
    _ line: String,
    playlistUri: String,
    inheritedVariant: HlsVariantInfo?,
    localUriFor: (String, String, HlsVariantInfo?, Int64?, Int64?) -> String
  ) -> String {
    let kind: String
    if line.contains("#EXT-X-MAP:") {
      kind = "initSegment"
    } else if line.contains("#EXT-X-KEY:") || line.contains("#EXT-X-SESSION-KEY:") {
      kind = "key"
    } else if line.contains("#EXT-X-MEDIA:") || line.contains("#EXT-X-I-FRAME-STREAM-INF:") {
      kind = "mediaPlaylist"
    } else {
      kind = "unknown"
    }
    let regex = try? NSRegularExpression(pattern: #"URI="([^"]+)""#)
    let ns = line as NSString
    var result = line
    regex?.enumerateMatches(in: line, range: NSRange(location: 0, length: ns.length)) { match, _, _ in
      guard let match, match.numberOfRanges >= 2 else { return }
      let originRef = ns.substring(with: match.range(at: 1))
      let originUri = HlsPlaylistParser.resolve(playlistUri, originRef)
      let local = localUriFor(originUri, kind, inheritedVariant, nil, nil)
      result = result.replacingOccurrences(of: "URI=\"\(originRef)\"", with: "URI=\"\(local)\"")
    }
    return result
  }

  private static func attributeUri(_ line: String) -> String? {
    let regex = try? NSRegularExpression(pattern: #"URI="([^"]+)""#)
    let ns = line as NSString
    guard let match = regex?.firstMatch(in: line, range: NSRange(location: 0, length: ns.length)),
      match.numberOfRanges >= 2
    else {
      return nil
    }
    return ns.substring(with: match.range(at: 1))
  }

  private static func preserveLeadingWhitespace(_ source: String, _ replacement: String) -> String {
    let trimmed = source.trimmingCharacters(in: .whitespaces)
    let prefixCount = source.count - trimmed.count
    return String(source.prefix(prefixCount)) + replacement
  }
}
