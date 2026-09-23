import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hls_video_player/hls_video_player.dart';
import 'package:hls_video_player/src/player/hls_port_window.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  const MethodChannel control = MethodChannel(
    HlsNativeBridge.controlChannelName,
  );
  late _FakeFactory factory;
  late PageController controller;
  HlsPortWindow? window;
  final List<int> focusedIndexes = <int>[];

  setUp(() {
    factory = _FakeFactory();
    controller = PageController();
    window = null;
    focusedIndexes.clear();
    HlsEngine.debugReset();
    TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
        .setMockMethodCallHandler(control, (MethodCall call) async {
          final Map<Object?, Object?> args = Map<Object?, Object?>.from(
            call.arguments as Map? ?? <Object?, Object?>{},
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
            case 'cacheStats':
              return const HlsCacheStats(
                backendName: 'none',
                entryCount: 0,
                storedBytes: 0,
              ).toChannelMap();
            case 'isCacheOnlyFor':
              return false;
          }
          throw PlatformException(code: 'unimplemented');
        });
    HlsEngine.debugInstall(
      nativeBridge: HlsNativeBridge(),
      playerFactory: factory,
    );
  });

  tearDown(() {
    controller.dispose();
    HlsEngine.debugReset();
    TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
        .setMockMethodCallHandler(control, null);
  });

  testWidgets(
    'toggling showHud keeps page, focus, and port identity',
    (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: _HudToggleHost(
            items: _items(5),
            controller: controller,
            onWindowChanged: (HlsPortWindow next) {
              window = next;
              focusedIndexes.add(next.focusedIndex);
            },
          ),
        ),
      );
      await tester.pump();
      for (var i = 0; i < 8; i++) {
        await tester.pump();
      }

      controller.jumpToPage(2);
      await tester.pump();
      for (var i = 0; i < 8; i++) {
        await tester.pump();
      }

      expect(controller.page, 2);
      expect(window, isNotNull);
      expect(window!.focusedIndex, 2);
      final HlsPlayerPort focused = window!.ports['2']!;
      final int recordedBeforeToggle = focusedIndexes.length;

      await tester.tap(find.byTooltip('Toggle HUD'));
      await tester.pump();
      for (var i = 0; i < 8; i++) {
        await tester.pump();
      }

      expect(controller.page, 2);
      expect(window!.focusedIndex, 2);
      expect(identical(window!.ports['2'], focused), isTrue);
      expect(find.byType(HlsEngineHud), findsOneWidget);
      expect(focusedIndexes.skip(recordedBeforeToggle), isNot(contains(0)));

      await tester.tap(find.byTooltip('Toggle HUD'));
      await tester.pump();
      for (var i = 0; i < 8; i++) {
        await tester.pump();
      }

      expect(controller.page, 2);
      expect(window!.focusedIndex, 2);
      expect(identical(window!.ports['2'], focused), isTrue);
      expect(find.byType(HlsEngineHud), findsNothing);
    },
  );
}

List<HlsReelItem> _items(int count) => List<HlsReelItem>.generate(
  count,
  (int index) => HlsReelItem(
    id: '$index',
    masterUri: Uri.parse('https://cdn.example/$index/master.m3u8'),
  ),
);

class _HudToggleHost extends StatefulWidget {
  const _HudToggleHost({
    required this.items,
    required this.controller,
    required this.onWindowChanged,
  });

  final List<HlsReelItem> items;
  final PageController controller;
  final ValueChanged<HlsPortWindow> onWindowChanged;

  @override
  State<_HudToggleHost> createState() => _HudToggleHostState();
}

class _HudToggleHostState extends State<_HudToggleHost> {
  bool _hudOn = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        actions: <Widget>[
          IconButton(
            tooltip: 'Toggle HUD',
            onPressed: () => setState(() => _hudOn = !_hudOn),
            icon: const Icon(Icons.analytics_outlined),
          ),
        ],
      ),
      body: HlsReelPager(
        items: widget.items,
        controller: widget.controller,
        showHud: _hudOn,
        onWindowChanged: widget.onWindowChanged,
        itemBuilder: (BuildContext context, HlsReelSlot slot) {
          return PortraitPlayerItem(
            reelIndex: slot.index,
            isFocused: slot.isFocused,
            port: slot.port,
            hudOn: _hudOn,
            child: slot.video,
          );
        },
      ),
    );
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

  @override
  int get debugInstanceId => int.parse(id) + 1;

  @override
  String get debugIdentity => id;

  @override
  HlsPlayerSnapshot get snapshot => notifier.value;

  @override
  ValueListenable<HlsPlayerSnapshot> get snapshotListenable => notifier;

  @override
  Widget buildView() => ColoredBox(color: Colors.red, child: Text('port $id'));

  @override
  Future<void> dispose() async {}

  @override
  Future<void> pause() async {}

  @override
  Future<void> play() async {}

  @override
  Future<void> seekTo(Duration position) async {}

  @override
  Future<void> setVolume(double volume) async {}
}
