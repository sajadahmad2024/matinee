import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hls_video_player/hls_video_player.dart';
import 'package:hls_video_player/src/player/hls_port_window.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  const MethodChannel control = MethodChannel(
    HlsNativeBridge.controlChannelName,
  );
  late _FakeFactory factory;
  late HlsNativeBridge bridge;

  setUp(() {
    factory = _FakeFactory();
    bridge = HlsNativeBridge();
    TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
        .setMockMethodCallHandler(control, (MethodCall call) async {
          final Map<Object?, Object?> args = Map<Object?, Object?>.from(
            call.arguments as Map,
          );
          switch (call.method) {
            case 'openAsset':
              return <String, Object>{
                'playerUri': args['originUrl']! as String,
                'strategy': 'direct',
              };
            case 'prefetchMaster':
              return 1;
            case 'refreshReachability':
              return <String>[];
          }
          throw PlatformException(code: 'unimplemented');
        });
  });

  tearDown(() {
    TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
        .setMockMethodCallHandler(control, null);
  });

  test('radius two clamps and retains surviving ports by id', () async {
    final HlsPortWindow window = HlsPortWindow(
      items: _items(7),
      windowRadius: 2,
      nativeBridge: bridge,
      playerFactory: factory,
    );

    expect(window.keepIndexes(0), <int>{0, 1, 2});
    expect(window.keepIndexes(3), <int>{1, 2, 3, 4, 5});

    await window.initialize();
    await _settle();
    final HlsPlayerPort retained = window.ports['1']!;
    await window.sync(focusedIndex: 3);
    await _settle();

    expect(identical(window.ports['1'], retained), isTrue);
    expect(factory.ports['0']!.disposed, isTrue);
    expect(window.ports.keys, containsAll(<String>['1', '2', '3', '4', '5']));
    await window.close();
  });

  test('radius zero creates one port and plays only focus', () async {
    final HlsPortWindow window = HlsPortWindow(
      items: _items(1),
      windowRadius: 0,
      nativeBridge: bridge,
      playerFactory: factory,
    );

    await window.initialize();
    await _settle();

    expect(window.ports, hasLength(1));
    expect(factory.ports['0']!.playCalls, greaterThan(0));
    await window.close();
  });

  test('applyPlayback pauses neighbors', () async {
    final HlsPortWindow window = HlsPortWindow(
      items: _items(5),
      windowRadius: 2,
      nativeBridge: bridge,
      playerFactory: factory,
    );

    await window.initialize(focusedIndex: 2);
    await _settle();
    await window.applyPlayback();

    expect(factory.ports['2']!.playCalls, greaterThan(0));
    expect(factory.ports['0']!.pauseCalls, greaterThan(0));
    expect(factory.ports['1']!.pauseCalls, greaterThan(0));
    expect(factory.ports['3']!.pauseCalls, greaterThan(0));
    expect(factory.ports['4']!.pauseCalls, greaterThan(0));
    await window.close();
  });

  test('offline to online rebuilds keep ports and seeks focus', () async {
    final List<String> methods = <String>[];
    TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
        .setMockMethodCallHandler(control, (MethodCall call) async {
          methods.add(call.method);
          final Map<Object?, Object?> args = Map<Object?, Object?>.from(
            call.arguments as Map,
          );
          switch (call.method) {
            case 'openAsset':
              return <String, Object>{
                'playerUri': args['originUrl']! as String,
                'strategy': 'direct',
              };
            case 'prefetchMaster':
              return 1;
            case 'refreshReachability':
              return <String>['https://cdn.example/2/master.m3u8'];
          }
          throw PlatformException(code: 'unimplemented');
        });

    final _FakeConnectivity connectivity = _FakeConnectivity(connected: false);
    final HlsPortWindow window = HlsPortWindow(
      items: _items(5),
      windowRadius: 2,
      nativeBridge: bridge,
      playerFactory: factory,
      connectivity: connectivity,
    );

    await window.initialize(focusedIndex: 2);
    await _settle();
    final HlsPlayerPort firstFocus = window.ports['2']!;
    factory.ports['2']!.position = const Duration(seconds: 4);

    connectivity.emit(true);
    await _settle();
    await Future<void>.delayed(const Duration(milliseconds: 20));

    expect(methods, contains('refreshReachability'));
    expect(firstFocus, isNot(same(window.ports['2'])));
    expect(factory.ports['2']!.seekCalls, isNotEmpty);
    expect(factory.ports['2']!.seekCalls.single, const Duration(seconds: 4));
    await window.close();
  });

  test('rebuild notifies a missing focus port before dispose', () async {
    TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
        .setMockMethodCallHandler(control, (MethodCall call) async {
          final Map<Object?, Object?> args = Map<Object?, Object?>.from(
            call.arguments as Map,
          );
          switch (call.method) {
            case 'openAsset':
              return <String, Object>{
                'playerUri': args['originUrl']! as String,
                'strategy': 'direct',
              };
            case 'prefetchMaster':
              return 1;
            case 'refreshReachability':
              return <String>['https://cdn.example/2/master.m3u8'];
          }
          throw PlatformException(code: 'unimplemented');
        });

    final _FakeConnectivity connectivity = _FakeConnectivity(connected: false);
    final HlsPortWindow window = HlsPortWindow(
      items: _items(5),
      windowRadius: 2,
      nativeBridge: bridge,
      playerFactory: factory,
      connectivity: connectivity,
    );

    await window.initialize(focusedIndex: 2);
    await _settle();
    final _FakePort firstFocus = factory.ports['2']!;
    var sawMissingBeforeDispose = false;
    window.addListener(() {
      if (window.portAt(2) == null && !firstFocus.disposed) {
        sawMissingBeforeDispose = true;
      }
    });

    connectivity.emit(true);
    await _settle();
    await Future<void>.delayed(const Duration(milliseconds: 20));

    expect(sawMissingBeforeDispose, isTrue);
    expect(firstFocus.disposed, isTrue);
    expect(firstFocus, isNot(same(window.ports['2'])));
    await window.close();
  });

  test('snapshot ticks do not notify the window', () async {
    final HlsPortWindow window = HlsPortWindow(
      items: _items(1),
      windowRadius: 0,
      nativeBridge: bridge,
      playerFactory: factory,
    );

    await window.initialize();
    await _settle();

    var notifies = 0;
    window.addListener(() => notifies++);
    factory.ports['0']!.notifier.notifyListeners();
    await _settle();

    expect(notifies, 0);
    await window.close();
  });
}

List<HlsReelItem> _items(int count) => List<HlsReelItem>.generate(
  count,
  (int index) => HlsReelItem(
    id: '$index',
    masterUri: Uri.parse('https://cdn.example/$index/master.m3u8'),
  ),
);

Future<void> _settle() async {
  for (var i = 0; i < 5; i++) {
    await Future<void>.delayed(Duration.zero);
  }
}

class _FakeConnectivity implements HlsConnectivity {
  _FakeConnectivity({required this.connected});

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

class _FakeFactory implements HlsPlayerPortFactory {
  final Map<String, _FakePort> ports = <String, _FakePort>{};

  @override
  Future<HlsPlayerPort> open({
    required Uri uri,
    required Map<String, String> httpHeaders,
  }) async {
    final String id = uri.pathSegments.first;
    return ports[id] = _FakePort(id);
  }
}

class _FakePort implements HlsPlayerPort {
  _FakePort(this.id);

  final String id;
  final ValueNotifier<HlsPlayerSnapshot> notifier =
      ValueNotifier<HlsPlayerSnapshot>(HlsPlayerSnapshot.empty);
  int playCalls = 0;
  int pauseCalls = 0;
  Duration position = Duration.zero;
  final List<Duration> seekCalls = <Duration>[];
  bool disposed = false;

  @override
  int get debugInstanceId => int.parse(id) + 1;

  @override
  String get debugIdentity => id;

  @override
  HlsPlayerSnapshot get snapshot => HlsPlayerSnapshot(
    isInitialized: true,
    isPlaying: playCalls > pauseCalls,
    isBuffering: false,
    hasError: false,
    duration: const Duration(seconds: 30),
    position: position,
    width: 1080,
    height: 1920,
    aspectRatio: 9 / 16,
  );

  @override
  ValueListenable<HlsPlayerSnapshot> get snapshotListenable => notifier;

  @override
  Widget buildView() => const SizedBox();

  @override
  Future<void> dispose() async {
    disposed = true;
  }

  @override
  Future<void> pause() async {
    pauseCalls++;
  }

  @override
  Future<void> play() async {
    playCalls++;
  }

  @override
  Future<void> seekTo(Duration position) async {
    this.position = position;
    seekCalls.add(position);
  }

  @override
  Future<void> setVolume(double volume) async {}
}
