/// Result for one master in a batch prefetch request.
class HlsPrefetchEntry {
  /// Creates an entry.
  const HlsPrefetchEntry({required this.masterUri, required this.segmentCount});

  /// Origin master passed by the host.
  final Uri masterUri;

  /// Media segments fetched. Zero means skipped or failed.
  final int segmentCount;
}

/// Ordered results for a list prefetch request.
class HlsPrefetchBatchResult {
  /// Creates a batch result.
  const HlsPrefetchBatchResult(this.entries);

  /// One entry for every unique input URI, preserving input order.
  final List<HlsPrefetchEntry> entries;
}
