import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:hls_video_player/src/bridge/hls_native_bridge.dart';
import 'package:hls_video_player/src/domain/hls_content_descriptor.dart';
import 'package:hls_video_player/src/domain/hls_fetch_event.dart';
import 'package:hls_video_player/src/domain/hls_variant.dart';
import 'package:hls_video_player/src/player/hls_player_snapshot.dart';
import 'package:hls_video_player/src/player/hls_reel_catalog.dart';

/// Folds native fetch events and cache stats into [HlsHudModel] fields.
///
/// Owned by a player or pager for that widget's lifetime. Hiding the HUD
/// does not reset this object.
class HlsHudSession extends ChangeNotifier {
  static const int maxRecentFetches = 10;
  static const int maxTimelineRecords = 300;

  final List<HlsFetchEvent> recentFetches = <HlsFetchEvent>[];
  final List<HlsFetchEvent> segmentTimeline = <HlsFetchEvent>[];
  final Stopwatch _ttff = Stopwatch()..start();

  List<HlsVariant> variants = <HlsVariant>[];
  HlsVariant? currentFetchedVariant;
  HlsFetchEvent? lastSegment;
  HlsCacheStats stats = const HlsCacheStats(
    backendName: 'none',
    entryCount: 0,
    storedBytes: 0,
  );
  bool cacheOnly = false;
  int originBytes = 0;
  int cacheServedBytes = 0;
  int cacheHits = 0;
  int? ttffMs;

  /// Applies one process-wide fetch event. Returns true when HUD fields change.
  bool addEvent(HlsFetchEvent event) {
    if (event.advertisedVariants != null) {
      variants = event.advertisedVariants!;
    }
    if (event.variant != null) {
      currentFetchedVariant = event.variant;
    }
    if (event.kind == HlsResourceKind.segment ||
        event.kind == HlsResourceKind.initSegment) {
      lastSegment = event;
      if (event.servedFromCache || event.cacheSkipReason == 'substituted') {
        cacheHits++;
        cacheServedBytes += event.byteLength;
      } else if (event.error == null) {
        originBytes += event.byteLength;
      }
      if (event.error == null && event.segmentStart != null) {
        segmentTimeline.insert(0, event);
        if (segmentTimeline.length > maxTimelineRecords) {
          segmentTimeline.removeLast();
        }
      }
    }
    recentFetches.insert(0, event);
    if (recentFetches.length > maxRecentFetches) {
      recentFetches.removeLast();
    }
    notifyListeners();
    return true;
  }

  /// Records TTFF on the first initialized + playing snapshot.
  bool markFirstFrame(HlsPlayerSnapshot snapshot) {
    if (ttffMs != null || !snapshot.isInitialized || !snapshot.isPlaying) {
      return false;
    }
    _ttff.stop();
    ttffMs = _ttff.elapsedMilliseconds;
    notifyListeners();
    return true;
  }

  /// Drops byte counters and timeline after a native cache clear.
  void resetAfterClear() {
    originBytes = 0;
    cacheServedBytes = 0;
    cacheHits = 0;
    segmentTimeline.clear();
    notifyListeners();
  }

  /// Updates native cache snapshot fields.
  void applyStats({required HlsCacheStats stats, required bool cacheOnly}) {
    this.stats = stats;
    this.cacheOnly = cacheOnly;
    notifyListeners();
  }

  /// Builds the display model. Snapshot is supplied by the focused port.
  HlsHudModel model({
    required HlsPlayerSnapshot snapshot,
    required bool playRequested,
    required bool muted,
    String? openError,
  }) {
    return HlsHudModel(
      snapshot: snapshot,
      isCacheOnly: cacheOnly,
      playRequested: playRequested,
      muted: muted,
      originBytes: originBytes,
      cacheServedBytes: cacheServedBytes,
      cacheHits: cacheHits,
      cacheBackendName: stats.backendName,
      cacheEntryCount: stats.entryCount,
      cacheStoredBytes: stats.storedBytes,
      variants: variants,
      recentFetches: recentFetches,
      segmentTimeline: segmentTimeline,
      ttffMs: ttffMs,
      currentFetchedVariant: currentFetchedVariant,
      lastSegment: lastSegment,
      openError: openError,
    );
  }
}

/// One EventChannel fold for a player or pager State.
///
/// Starts in [initState] and survives HUD hide / page change. Does not
/// [setState] a PageView; [HlsHudSession] notifies only HUD listeners.
class HlsHudTelemetry {
  final HlsHudSession session = HlsHudSession();

  StreamSubscription<HlsFetchEvent>? _events;
  Uri? _statsMaster;

  bool get isListening => _events != null;

  /// Subscribes once. Later calls are no-ops.
  void start(HlsNativeBridge bridge) {
    if (_events != null) {
      return;
    }
    _events = bridge.events.listen(session.addEvent);
  }

  Future<void> refreshStats(HlsNativeBridge bridge, Uri masterUri) async {
    _statsMaster = masterUri;
    final HlsCacheStats stats = await bridge.cacheStats();
    final bool cacheOnly = await bridge.isCacheOnlyFor(masterUri);
    if (_statsMaster != masterUri) {
      return;
    }
    session.applyStats(stats: stats, cacheOnly: cacheOnly);
  }

  Future<void> clearCache({
    required HlsNativeBridge bridge,
    required Uri masterUri,
    required Future<void> Function() clear,
  }) async {
    await clear();
    session.resetAfterClear();
    await refreshStats(bridge, masterUri);
  }

  Future<void> stop() async {
    await _events?.cancel();
    _events = null;
  }
}
