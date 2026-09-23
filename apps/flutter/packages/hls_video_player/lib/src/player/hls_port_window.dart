import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/scheduler.dart';
import 'package:hls_video_player/src/bridge/hls_native_bridge.dart';
import 'package:hls_video_player/src/player/hls_connectivity.dart';
import 'package:hls_video_player/src/player/hls_player_port.dart';
import 'package:hls_video_player/src/player/hls_player_snapshot.dart';
import 'package:hls_video_player/src/player/hls_reel_item.dart';

/// Shared N±K native-player window used by package widgets.
class HlsPortWindow extends ChangeNotifier {
  /// Creates a window. Production widgets use the process engine dependencies.
  HlsPortWindow({
    required List<HlsReelItem> items,
    required this.windowRadius,
    required this.nativeBridge,
    required this.playerFactory,
    this.connectivity,
    this.playRequested = true,
    this.muted = true,
  }) : assert(windowRadius >= 0),
       _items = List<HlsReelItem>.unmodifiable(items);

  final int windowRadius;
  final HlsNativeBridge nativeBridge;
  final HlsPlayerPortFactory playerFactory;
  final HlsConnectivity? connectivity;

  List<HlsReelItem> _items;
  final Map<String, HlsPlayerPort> _ports = <String, HlsPlayerPort>{};
  final Map<String, String> _openErrors = <String, String>{};
  final Set<String> _opening = <String>{};
  StreamSubscription<bool>? _connectivitySubscription;
  HlsPlayerPort? _snapshotPort;
  int _focusedIndex = 0;
  bool _wasConnected = true;
  bool _refreshInFlight = false;
  bool _applyInFlight = false;
  bool _applyDirty = false;
  bool _disposed = false;
  int _openEpoch = 0;

  bool playRequested;
  bool muted;

  List<HlsReelItem> get items => _items;
  int get focusedIndex => _focusedIndex;
  Map<String, HlsPlayerPort> get ports =>
      Map<String, HlsPlayerPort>.unmodifiable(_ports);
  Map<String, String> get openErrors =>
      Map<String, String>.unmodifiable(_openErrors);
  HlsPlayerPort? get focusedPort => portAt(_focusedIndex);
  HlsPlayerSnapshot get focusedSnapshot =>
      focusedPort?.snapshot ?? HlsPlayerSnapshot.empty;

  HlsPlayerPort? portAt(int index) {
    if (index < 0 || index >= _items.length) {
      return null;
    }
    return _ports[_items[index].id];
  }

  String? errorAt(int index) {
    if (index < 0 || index >= _items.length) {
      return null;
    }
    return _openErrors[_items[index].id];
  }

  /// Starts connectivity observation and opens the initial keep-set.
  Future<void> initialize({int focusedIndex = 0}) async {
    final HlsConnectivity? source = connectivity;
    if (source != null) {
      _wasConnected = await source.isConnected;
      _connectivitySubscription = source.onConnectivityChanged.listen(
        _onConnectivity,
      );
    }
    await sync(focusedIndex: focusedIndex);
  }

  /// Replaces feed data while retaining ports whose stable ids remain.
  Future<void> updateItems(List<HlsReelItem> items) async {
    final String? focusedId = _items.isEmpty
        ? null
        : _items[_focusedIndex.clamp(0, _items.length - 1)].id;
    _items = List<HlsReelItem>.unmodifiable(items);
    if (_items.isEmpty) {
      _focusedIndex = 0;
      await _evictUnused(const <String>{});
      _notify();
      return;
    }
    final int retained = focusedId == null
        ? -1
        : _items.indexWhere((HlsReelItem item) => item.id == focusedId);
    await sync(
      focusedIndex: retained >= 0
          ? retained
          : _focusedIndex.clamp(0, _items.length - 1),
    );
  }

  Set<int> keepIndexes(int focusedIndex) {
    if (_items.isEmpty) {
      return const <int>{};
    }
    final Set<int> keep = <int>{};
    for (
      var index = focusedIndex - windowRadius;
      index <= focusedIndex + windowRadius;
      index++
    ) {
      if (index >= 0 && index < _items.length) {
        keep.add(index);
      }
    }
    return keep;
  }

  /// Evicts leavers, registers descriptors, prefetches, and plays focus.
  Future<void> sync({required int focusedIndex}) async {
    if (_disposed || _items.isEmpty) {
      return;
    }
    _focusedIndex = focusedIndex.clamp(0, _items.length - 1);
    await applyPlayback();
    final Set<int> keep = keepIndexes(_focusedIndex);
    final Set<String> keepIds = <String>{
      for (final int index in keep) _items[index].id,
    };
    _openErrors.removeWhere((String id, _) => !keepIds.contains(id));
    await _evictUnused(keepIds);
    final List<HlsReelItem> keepItems = <HlsReelItem>[
      for (final int index in keep) _items[index],
    ];
    await Future.wait(
      keepItems.map(
        (HlsReelItem item) => nativeBridge.openAsset(item.effectiveDescriptor),
      ),
    );
    List<Uri> flipped = const <Uri>[];
    if (_wasConnected) {
      flipped = await nativeBridge.refreshReachability(
        masters: keepItems.map((HlsReelItem item) => item.masterUri),
      );
    }
    final Set<String> stale = <String>{
      for (final HlsReelItem item in keepItems)
        if (_ports.containsKey(item.id) && flipped.contains(item.masterUri))
          item.id,
    };
    if (stale.isNotEmpty) {
      await _rebuildPorts(stale);
    }
    for (final HlsReelItem item in keepItems) {
      unawaited(nativeBridge.prefetchMaster(item.masterUri));
      unawaited(
        _ensurePort(item).then((_) {
          if (!_disposed) {
            unawaited(applyPlayback());
          }
        }),
      );
    }
    _bindSnapshotListener();
    await applyPlayback();
    _notify();
  }

  Future<void> _ensurePort(HlsReelItem item) async {
    if (_ports.containsKey(item.id) ||
        _opening.contains(item.id) ||
        _openErrors.containsKey(item.id)) {
      return;
    }
    final int epoch = _openEpoch;
    _opening.add(item.id);
    try {
      final opened = await nativeBridge.openAsset(item.effectiveDescriptor);
      final HlsPlayerPort port = await playerFactory.open(
        uri: opened.playerUri,
        httpHeaders: const <String, String>{},
      );
      final Set<String> keepIds = <String>{
        for (final int index in keepIndexes(_focusedIndex)) _items[index].id,
      };
      if (_disposed || epoch != _openEpoch || !keepIds.contains(item.id)) {
        await port.dispose();
        return;
      }
      _ports[item.id] = port;
      _openErrors.remove(item.id);
      _bindSnapshotListener();
      _notify();
    } catch (error, stack) {
      debugPrint('HLS port open failed id=${item.id}: $error\n$stack');
      if (!_disposed && epoch == _openEpoch) {
        _openErrors[item.id] = error.toString();
        _notify();
      }
    } finally {
      _opening.remove(item.id);
    }
  }

  Future<void> applyPlayback() async {
    if (_applyInFlight) {
      _applyDirty = true;
      return;
    }
    _applyInFlight = true;
    try {
      do {
        _applyDirty = false;
        final String? focusedId = _items.isEmpty
            ? null
            : _items[_focusedIndex].id;
        final entries = _ports.entries.toList(growable: false);
        for (final MapEntry<String, HlsPlayerPort> entry in entries) {
          final HlsPlayerPort? live = _ports[entry.key];
          if (live == null) {
            continue;
          }
          if (entry.key == focusedId) {
            await live.setVolume(muted ? 0 : 1);
            if (playRequested) {
              await live.play();
            } else {
              await live.pause();
            }
          } else {
            await live.pause();
            await live.setVolume(0);
          }
        }
      } while (_applyDirty && !_disposed);
    } finally {
      _applyInFlight = false;
    }
  }

  Future<void> togglePlay() async {
    final HlsPlayerPort? port = focusedPort;
    if (port == null) {
      return;
    }
    playRequested = !playRequested;
    await applyPlayback();
    _notify();
  }

  Future<void> toggleMute() async {
    muted = !muted;
    await focusedPort?.setVolume(muted ? 0 : 1);
    _notify();
  }

  Future<void> seekTo(Duration position) async {
    await focusedPort?.seekTo(position);
  }

  Future<void> _evictUnused(Set<String> keepIds) async {
    final List<String> drop = _ports.keys
        .where((String id) => !keepIds.contains(id))
        .toList();
    for (final String id in drop) {
      final HlsPlayerPort? port = _ports.remove(id);
      if (port == null) {
        continue;
      }
      if (identical(port, _snapshotPort)) {
        port.snapshotListenable.removeListener(_onSnapshot);
        _snapshotPort = null;
      }
      await port.dispose();
    }
  }

  void _bindSnapshotListener() {
    final HlsPlayerPort? next = focusedPort;
    if (identical(next, _snapshotPort)) {
      return;
    }
    _snapshotPort?.snapshotListenable.removeListener(_onSnapshot);
    _snapshotPort = next;
    _snapshotPort?.snapshotListenable.addListener(_onSnapshot);
  }

  void _onSnapshot() {
    // Seek/buffer chrome listens to the port listenable. Do not notify the
    // window here — that rebuilt PageView every tick and stuck scroll.
  }

  void _onConnectivity(bool connected) {
    final bool wasConnected = _wasConnected;
    _wasConnected = connected;
    if (!wasConnected && connected) {
      unawaited(_onBackOnline());
    }
  }

  Future<void> _onBackOnline() async {
    if (_refreshInFlight || _disposed || _items.isEmpty) {
      return;
    }
    _refreshInFlight = true;
    try {
      final List<HlsReelItem> keep = <HlsReelItem>[
        for (final int index in keepIndexes(_focusedIndex)) _items[index],
      ];
      final List<Uri> flipped = await nativeBridge.refreshReachability(
        masters: keep.map((HlsReelItem item) => item.masterUri),
      );
      if (flipped.isEmpty || _disposed) {
        return;
      }
      await _rebuildPorts(keep.map((HlsReelItem item) => item.id).toSet());
      for (final HlsReelItem item in keep) {
        unawaited(nativeBridge.prefetchMaster(item.masterUri));
      }
    } finally {
      _refreshInFlight = false;
    }
  }

  Future<void> _rebuildPorts(Set<String> ids) async {
    if (ids.isEmpty) {
      return;
    }
    await _waitForOpeningToDrain();
    await _waitForApplyToDrain();
    if (_disposed) {
      return;
    }
    _openEpoch++;
    final int epoch = _openEpoch;
    for (final String id in ids) {
      _openErrors.remove(id);
    }
    final String? focusedId = _items.isEmpty ? null : _items[_focusedIndex].id;
    final Duration position = focusedId != null && ids.contains(focusedId)
        ? (_ports[focusedId]?.snapshot.position ?? Duration.zero)
        : Duration.zero;
    if (ids.any((String id) => identical(_ports[id], _snapshotPort))) {
      _snapshotPort?.snapshotListenable.removeListener(_onSnapshot);
      _snapshotPort = null;
    }
    final List<HlsPlayerPort> detached = <HlsPlayerPort>[];
    for (final String id in ids) {
      final HlsPlayerPort? port = _ports.remove(id);
      if (port != null) {
        detached.add(port);
      }
    }
    _notify();
    await _yieldForUnmount();
    if (_disposed || epoch != _openEpoch) {
      await Future.wait(detached.map((HlsPlayerPort port) => port.dispose()));
      return;
    }
    await Future.wait(detached.map((HlsPlayerPort port) => port.dispose()));
    if (_disposed || epoch != _openEpoch) {
      return;
    }
    final List<HlsReelItem> rebuild = _items
        .where((HlsReelItem item) => ids.contains(item.id))
        .toList(growable: false);
    await Future.wait(rebuild.map(_ensurePort));
    if (_disposed || epoch != _openEpoch) {
      return;
    }
    _bindSnapshotListener();
    await applyPlayback();
    if (focusedId != null && position > Duration.zero) {
      await _ports[focusedId]?.seekTo(position);
    }
    _notify();
  }

  Future<void> _waitForOpeningToDrain() async {
    final DateTime deadline = DateTime.now().add(const Duration(seconds: 2));
    while (_opening.isNotEmpty && DateTime.now().isBefore(deadline)) {
      await Future<void>.delayed(const Duration(milliseconds: 16));
    }
  }

  Future<void> _waitForApplyToDrain() async {
    final DateTime deadline = DateTime.now().add(const Duration(seconds: 2));
    while (_applyInFlight && DateTime.now().isBefore(deadline)) {
      await Future<void>.delayed(const Duration(milliseconds: 16));
    }
  }

  Future<void> _yieldForUnmount() async {
    await Future<void>.delayed(Duration.zero);
    final SchedulerBinding binding = SchedulerBinding.instance;
    if (binding.hasScheduledFrame) {
      await binding.endOfFrame;
    }
  }

  void _notify() {
    if (!_disposed) {
      notifyListeners();
    }
  }

  /// Releases ports and connectivity observation.
  Future<void> close() async {
    if (_disposed) {
      return;
    }
    _disposed = true;
    _openEpoch++;
    _snapshotPort?.snapshotListenable.removeListener(_onSnapshot);
    _snapshotPort = null;
    await _connectivitySubscription?.cancel();
    final List<HlsPlayerPort> ports = _ports.values.toList(growable: false);
    _ports.clear();
    await Future.wait(ports.map((HlsPlayerPort port) => port.dispose()));
  }

  @override
  void dispose() {
    unawaited(close());
    super.dispose();
  }
}
