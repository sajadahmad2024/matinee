import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hls_video_player/hls_video_player.dart';

/// Master URI whose first path segment is the item id, as the fakes expect.
Uri fakeMaster(String id) => Uri.parse('https://cdn.example/$id/master.m3u8');

String _idOf(String uri) => Uri.parse(uri).pathSegments.first;

/// Mocks the native control channel and records every call as `method:id`.
///
/// Also records player opens and disposes from [FakePortFactory], so one
/// ordered [calls] list shows the whole native conversation.
class RecordingNative {
  RecordingNative() {
    TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
        .setMockMethodCallHandler(_control, _handle);
  }

  static const MethodChannel _control = MethodChannel(
    HlsNativeBridge.controlChannelName,
  );

  final List<String> calls = <String>[];

  /// Masters the next `refreshReachability` reports as flipped online.
  List<Uri> flipNext = <Uri>[];

  Future<Object?> _handle(MethodCall call) async {
    final Map<Object?, Object?> args = Map<Object?, Object?>.from(
      call.arguments as Map? ?? <Object?, Object?>{},
    );
    switch (call.method) {
      case 'openAsset':
        final String origin = args['originUrl']! as String;
        calls.add('openAsset:${_idOf(origin)}');
        return <String, Object>{'playerUri': origin, 'strategy': 'direct'};
      case 'prefetchMaster':
        calls.add('prefetchMaster:${_idOf(args['masterUri']! as String)}');
        return 1;
      case 'refreshReachability':
        final List<Object?> masters = args['masters']! as List<Object?>;
        calls.add(
          'refreshReachability:${masters.map((Object? m) => _idOf(m! as String)).join(',')}',
        );
        final List<String> flipped = flipNext.map((Uri u) => '$u').toList();
        flipNext = <Uri>[];
        return flipped;
      case 'cacheStats':
        return const HlsCacheStats(
          backendName: 'none',
          entryCount: 0,
          storedBytes: 0,
        ).toChannelMap();
      case 'isCacheOnlyFor':
        return false;
      case 'clearCache':
        return null;
    }
    throw PlatformException(code: 'unimplemented');
  }

  void dispose() {
    TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
        .setMockMethodCallHandler(_control, null);
  }
}

class FakePortFactory implements HlsPlayerPortFactory {
  FakePortFactory([this.native]);

  final RecordingNative? native;
  final List<FakePort> opened = <FakePort>[];

  /// Ids whose player open throws, like a native init failure.
  final Set<String> failOpen = <String>{};

  /// Ids whose player open waits for this gate, like a slow network.
  final Map<String, Completer<void>> holdOpen = <String, Completer<void>>{};

  /// Latest port for each id, including disposed ones.
  final Map<String, FakePort> byId = <String, FakePort>{};

  /// URI each id's latest player was opened with.
  final Map<String, Uri> uriOf = <String, Uri>{};

  List<FakePort> get live =>
      opened.where((FakePort port) => !port.disposed).toList();

  @override
  Future<HlsPlayerPort> open({
    required Uri uri,
    required Map<String, String> httpHeaders,
  }) async {
    final String id = uri.pathSegments.first;
    native?.calls.add('open:$id');
    if (failOpen.contains(id)) {
      throw StateError('player open failed for $id');
    }
    final Completer<void>? gate = holdOpen[id];
    if (gate != null) {
      await gate.future;
    }
    final FakePort port = FakePort(id, opened.length + 1, native);
    opened.add(port);
    uriOf[id] = uri;
    return byId[id] = port;
  }
}

class FakePort implements HlsPlayerPort {
  FakePort(this.id, this.debugInstanceId, this._native);

  final String id;
  final RecordingNative? _native;

  @override
  final int debugInstanceId;

  final ValueNotifier<HlsPlayerSnapshot> notifier =
      ValueNotifier<HlsPlayerSnapshot>(
        const HlsPlayerSnapshot(
          isInitialized: true,
          isPlaying: false,
          isBuffering: false,
          hasError: false,
          duration: Duration(seconds: 30),
          position: Duration.zero,
          width: 1080,
          height: 1920,
          aspectRatio: 9 / 16,
        ),
      );

  int playCalls = 0;
  int pauseCalls = 0;
  double volume = 1;
  final List<Duration> seeks = <Duration>[];
  bool disposed = false;

  bool get isPlaying => notifier.value.isPlaying;

  /// Pushes a snapshot tick, like the native player does.
  void emit({
    bool? isPlaying,
    bool? isBuffering,
    Duration? position,
    Duration? duration,
    String? error,
  }) {
    final HlsPlayerSnapshot s = notifier.value;
    notifier.value = HlsPlayerSnapshot(
      isInitialized: s.isInitialized,
      isPlaying: isPlaying ?? s.isPlaying,
      isBuffering: isBuffering ?? s.isBuffering,
      hasError: error != null || s.hasError,
      duration: duration ?? s.duration,
      position: position ?? s.position,
      width: s.width,
      height: s.height,
      aspectRatio: s.aspectRatio,
      errorDescription: error ?? s.errorDescription,
    );
  }

  @override
  String get debugIdentity => 'fake-$id-$debugInstanceId';

  @override
  HlsPlayerSnapshot get snapshot => notifier.value;

  @override
  ValueListenable<HlsPlayerSnapshot> get snapshotListenable => notifier;

  @override
  Widget buildView() => SizedBox(key: ValueKey<String>('texture-$id'));

  @override
  Future<void> play() async {
    playCalls++;
    if (!disposed) {
      emit(isPlaying: true);
    }
  }

  @override
  Future<void> pause() async {
    pauseCalls++;
    if (!disposed) {
      emit(isPlaying: false);
    }
  }

  @override
  Future<void> seekTo(Duration position) async {
    seeks.add(position);
    if (!disposed) {
      emit(position: position);
    }
  }

  @override
  Future<void> setVolume(double volume) async {
    this.volume = volume;
  }

  @override
  Future<void> dispose() async {
    _native?.calls.add('dispose:$id');
    disposed = true;
  }
}

class FakeConnectivity implements HlsConnectivity {
  FakeConnectivity({this.connected = true});

  bool connected;
  final StreamController<bool> _controller = StreamController<bool>.broadcast();

  @override
  Future<bool> get isConnected async => connected;

  @override
  Stream<bool> get onConnectivityChanged => _controller.stream;

  void emit(bool value) {
    connected = value;
    _controller.add(value);
  }
}

/// Lets queued futures and microtasks run.
Future<void> settle([int turns = 10]) async {
  for (var i = 0; i < turns; i++) {
    await Future<void>.delayed(Duration.zero);
  }
}
