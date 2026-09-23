import 'dart:async';
import 'dart:collection';

import 'package:hls_video_player/src/bridge/hls_native_bridge.dart';
import 'package:hls_video_player/src/domain/hls_content_descriptor.dart';
import 'package:hls_video_player/src/engine/hls_prefetch_result.dart';
import 'package:hls_video_player/src/player/hls_player_port.dart';

/// Process-wide facade for the native HLS engine.
class HlsEngine {
  HlsEngine._({
    required this.nativeBridge,
    required this.playerFactory,
    required this.allowedOriginHosts,
  });

  static HlsEngine? _instance;

  /// Initializes the native facade once.
  ///
  /// [allowedOriginHosts] is retained for API compatibility with the
  /// Dart-heavy engine. This native implementation does not apply a Dart
  /// request allowlist.
  static Future<HlsEngine> initialize({
    Set<String> allowedOriginHosts = const <String>{},
  }) async {
    return _instance ??= HlsEngine._(
      nativeBridge: HlsNativeBridge(),
      playerFactory: const VideoPlayerHlsPlayerPortFactory(),
      allowedOriginHosts: Set<String>.unmodifiable(allowedOriginHosts),
    );
  }

  /// The initialized process facade.
  static HlsEngine get instance {
    final HlsEngine? value = _instance;
    if (value == null) {
      throw StateError(
        'HlsEngine is not initialized. Call HlsEngine.initialize() first.',
      );
    }
    return value;
  }

  /// Clears process state between tests.
  static void debugReset() {
    assert(() {
      _instance = null;
      return true;
    }());
  }

  /// Installs a facade for widget tests. Production uses [initialize].
  static void debugInstall({
    required HlsNativeBridge nativeBridge,
    required HlsPlayerPortFactory playerFactory,
  }) {
    assert(() {
      _instance = HlsEngine._(
        nativeBridge: nativeBridge,
        playerFactory: playerFactory,
        allowedOriginHosts: const <String>{},
      );
      return true;
    }());
  }

  /// Native control and telemetry channels.
  final HlsNativeBridge nativeBridge;

  /// Production player factory.
  final HlsPlayerPortFactory playerFactory;

  /// Compatibility value retained from [initialize].
  final Set<String> allowedOriginHosts;

  /// Warms first segments for unique [masters] without creating players.
  static Future<HlsPrefetchBatchResult> prefetchMasters(
    Iterable<Uri> masters, {
    int concurrency = 2,
  }) {
    return instance._prefetchMasters(masters, concurrency: concurrency);
  }

  Future<HlsPrefetchBatchResult> _prefetchMasters(
    Iterable<Uri> masters, {
    required int concurrency,
  }) async {
    if (concurrency < 1) {
      throw ArgumentError.value(concurrency, 'concurrency', 'must be positive');
    }
    final List<Uri> unique = LinkedHashSet<Uri>.of(masters).toList();
    final List<HlsPrefetchEntry?> results = List<HlsPrefetchEntry?>.filled(
      unique.length,
      null,
    );
    var next = 0;

    Future<void> worker() async {
      while (true) {
        final int index = next++;
        if (index >= unique.length) {
          return;
        }
        final Uri master = unique[index];
        var count = 0;
        try {
          count = await nativeBridge.prefetchToDisk(
            HlsContentDescriptor.liveSegmentFixture(originUrl: master),
          );
        } catch (_) {
          count = 0;
        }
        results[index] = HlsPrefetchEntry(
          masterUri: master,
          segmentCount: count,
        );
      }
    }

    await Future.wait(
      List<Future<void>>.generate(
        unique.length < concurrency ? unique.length : concurrency,
        (_) => worker(),
      ),
    );
    return HlsPrefetchBatchResult(
      results.cast<HlsPrefetchEntry>().toList(growable: false),
    );
  }
}
