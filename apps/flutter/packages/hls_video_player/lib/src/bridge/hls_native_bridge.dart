import 'dart:async';

import 'package:flutter/services.dart';
import 'package:hls_video_player/src/domain/hls_content_descriptor.dart';
import 'package:hls_video_player/src/domain/hls_fetch_event.dart';

/// Dart side of the native HLS engine. Does not fetch segments.
///
/// Calls [openAsset] once per master before `VideoPlayerController.networkUrl`.
class HlsNativeBridge {
  /// Creates a bridge. Tests pass fake channels.
  HlsNativeBridge({MethodChannel? control, EventChannel? events})
    : _control = control ?? const MethodChannel(controlChannelName),
      _events = events ?? const EventChannel(eventChannelName);

  /// MethodChannel name. Native stubs must use this exact string.
  static const String controlChannelName = 'dev.flutter.hls_engine/control';

  /// EventChannel name. Native later pushes [HlsFetchEvent] maps here.
  static const String eventChannelName = 'dev.flutter.hls_engine/events';

  final MethodChannel _control;
  final EventChannel _events;
  Stream<HlsFetchEvent>? _eventStream;

  /// Registers [descriptor] and returns the URI the stock player should open.
  ///
  /// Phase 1 native stubs echo [HlsContentDescriptor.originUrl] with
  /// [HlsDeliveryStrategy.direct].
  Future<HlsOpenAssetResult> openAsset(HlsContentDescriptor descriptor) async {
    final Object? raw = await _control.invokeMethod<Object>(
      'openAsset',
      descriptor.toChannelMap(),
    );
    return HlsOpenAssetResult.fromChannelMap(_asMap(raw));
  }

  /// Registers [descriptor] and warms disk cache. Does not probe reachability.
  Future<int> prefetchToDisk(HlsContentDescriptor descriptor) async {
    final int? count = await _control.invokeMethod<int>(
      'prefetchToDisk',
      descriptor.toChannelMap(),
    );
    return count ?? 0;
  }

  /// Asks native to warm [masterUri]. Stub returns 0.
  ///
  /// Used by the player window after [openAsset]. Host prefetch uses
  /// [prefetchToDisk] instead.
  Future<int> prefetchMaster(Uri masterUri) async {
    final int? count = await _control.invokeMethod<int>(
      'prefetchMaster',
      <String, Object>{'masterUri': masterUri.toString()},
    );
    return count ?? 0;
  }

  /// Re-probes reachability for [masters]. Returns the masters that left
  /// cache-only. Empty when none flipped or the stub has no native engine.
  Future<List<Uri>> refreshReachability({
    required Iterable<Uri> masters,
  }) async {
    final List<String>? flipped = await _control.invokeListMethod<String>(
      'refreshReachability',
      <String, Object>{
        'masters': masters.map((Uri uri) => uri.toString()).toList(),
      },
    );
    if (flipped == null) {
      return const <Uri>[];
    }
    return flipped.map(Uri.parse).toList(growable: false);
  }

  /// Clears the native cache. Stub is a no-op.
  Future<void> clearCache() {
    return _control.invokeMethod<void>('clearCache');
  }

  /// Native cache snapshot for the HUD. Stub reports an empty `none` backend.
  Future<HlsCacheStats> cacheStats() async {
    final Object? raw = await _control.invokeMethod<Object>('cacheStats');
    return HlsCacheStats.fromChannelMap(_asMap(raw));
  }

  /// Whether [masterUri] is in cache-only mode. Stub returns false.
  Future<bool> isCacheOnlyFor(Uri masterUri) async {
    final bool? value = await _control.invokeMethod<bool>(
      'isCacheOnlyFor',
      <String, Object>{'masterUri': masterUri.toString()},
    );
    return value ?? false;
  }

  /// Native fetch telemetry, same shape the HUD already consumes.
  Stream<HlsFetchEvent> get events {
    return _eventStream ??= _events.receiveBroadcastStream().map((Object? raw) {
      return HlsFetchEvent.fromChannelMap(_asMap(raw));
    });
  }

  static Map<dynamic, dynamic> _asMap(Object? raw) {
    if (raw is Map) {
      return Map<dynamic, dynamic>.from(raw);
    }
    throw FormatException('expected a map, got ${raw.runtimeType}');
  }
}
