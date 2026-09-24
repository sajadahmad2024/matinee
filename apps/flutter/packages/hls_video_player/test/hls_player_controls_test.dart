import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hls_video_player/hls_video_player.dart';
import 'package:hls_video_player/src/player/hls_fullscreen_view.dart';
import 'package:hls_video_player/src/player/hls_port_window.dart';

const HlsPlayerSnapshot _landscape = HlsPlayerSnapshot(
  isInitialized: true,
  isPlaying: true,
  isBuffering: false,
  hasError: false,
  duration: Duration(seconds: 30),
  position: Duration(seconds: 3),
  width: 1280,
  height: 720,
  aspectRatio: 16 / 9,
);

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('chrome controls', () {
    late int toggles;
    late int mutes;
    late List<Duration> seeks;

    setUp(() {
      toggles = 0;
      mutes = 0;
      seeks = <Duration>[];
    });

    Future<void> pumpChrome(
      WidgetTester tester, {
      required bool playRequested,
      HlsPlayerControls controls = const HlsPlayerControls(),
      bool showSeekBar = true,
      bool wireMute = true,
      VoidCallback? onToggleFullscreen,
    }) async {
      tester.view.physicalSize = const Size(400, 800);
      tester.view.devicePixelRatio = 1;
      addTearDown(tester.view.reset);
      await tester.pumpWidget(
        MaterialApp(
          home: HlsVideoPlayer.fromPort(
            masterUri: Uri.parse('https://cdn.example/master.m3u8'),
            port: _FakePort('0')..notifier.value = _landscape,
            isFocused: true,
            playRequested: playRequested,
            muted: true,
            showSeekBar: showSeekBar,
            controls: controls,
            onTogglePlay: () => toggles++,
            onToggleMute: wireMute ? () => mutes++ : null,
            onToggleFullscreen: onToggleFullscreen,
            onSeek: seeks.add,
          ),
        ),
      );
    }

    testWidgets('paused shows mute directly above a centred play icon', (
      WidgetTester tester,
    ) async {
      await pumpChrome(tester, playRequested: false);

      final Offset play = tester.getCenter(find.byIcon(Icons.play_arrow));
      final Offset mute = tester.getCenter(find.byIcon(Icons.volume_off));
      expect(play, const Offset(200, 400));
      expect(mute.dx, play.dx);
      expect(mute.dy, lessThan(play.dy));
    });

    testWidgets('playing hides play and mute', (WidgetTester tester) async {
      await pumpChrome(tester, playRequested: true);

      expect(find.byIcon(Icons.play_arrow), findsNothing);
      expect(find.byIcon(Icons.volume_off), findsNothing);
    });

    testWidgets('tapping mute toggles mute without toggling play', (
      WidgetTester tester,
    ) async {
      await pumpChrome(tester, playRequested: false);

      await tester.tap(find.byIcon(Icons.volume_off));
      expect(mutes, 1);
      expect(toggles, 0);

      // The icon ignores pointers; the tap lands on the video's toggle layer.
      await tester.tapAt(tester.getCenter(find.byIcon(Icons.play_arrow)));
      expect(toggles, 1);
      expect(mutes, 1);
    });

    testWidgets('no mute button when mute is not wired or hidden', (
      WidgetTester tester,
    ) async {
      await pumpChrome(tester, playRequested: false, wireMute: false);
      expect(find.byIcon(Icons.volume_off), findsNothing);

      await pumpChrome(
        tester,
        playRequested: false,
        controls: const HlsPlayerControls(showMute: false),
      );
      expect(find.byIcon(Icons.volume_off), findsNothing);
      expect(find.byIcon(Icons.play_arrow), findsOneWidget);
    });

    testWidgets('seek bar sits at the page bottom, not the video bottom', (
      WidgetTester tester,
    ) async {
      await pumpChrome(tester, playRequested: true);

      expect(tester.getBottomLeft(find.byType(HlsEngineSeekBar)).dy, 800);
      expect(find.byType(HlsEngineTimer), findsOneWidget);
    });

    testWidgets('fullscreen button sits after the timer when wired', (
      WidgetTester tester,
    ) async {
      var fullscreens = 0;
      await pumpChrome(
        tester,
        playRequested: true,
        onToggleFullscreen: () => fullscreens++,
      );

      final Finder button = find.byIcon(Icons.fullscreen);
      expect(
        tester.getCenter(button).dx,
        greaterThan(tester.getCenter(find.byType(HlsEngineTimer)).dx),
      );
      await tester.tap(button);
      expect(fullscreens, 1);

      await pumpChrome(tester, playRequested: true);
      expect(find.byIcon(Icons.fullscreen), findsNothing);

      await pumpChrome(
        tester,
        playRequested: true,
        onToggleFullscreen: () {},
        controls: const HlsPlayerControls(showFullscreen: false),
      );
      expect(find.byIcon(Icons.fullscreen), findsNothing);
    });

    testWidgets('seek bar and timer hide independently', (
      WidgetTester tester,
    ) async {
      await pumpChrome(
        tester,
        playRequested: true,
        controls: const HlsPlayerControls(showTimer: false),
      );
      expect(find.byType(HlsEngineSeekBar), findsOneWidget);
      expect(find.byType(HlsEngineTimer), findsNothing);

      await pumpChrome(
        tester,
        playRequested: true,
        controls: const HlsPlayerControls(showSeekBar: false),
      );
      expect(find.byType(HlsEngineSeekBar), findsNothing);
      expect(find.byType(HlsEngineTimer), findsOneWidget);

      await pumpChrome(tester, playRequested: true, showSeekBar: false);
      expect(find.byType(HlsEngineSeekBar), findsNothing);
    });

    testWidgets('plain builder visuals still get the package taps', (
      WidgetTester tester,
    ) async {
      var fullscreens = 0;
      // Plain boxes with no gesture of their own, like a host icon.
      Widget visual(String key) => SizedBox(
        key: Key(key),
        width: 40,
        height: 40,
        child: const ColoredBox(color: Colors.white),
      );

      await pumpChrome(
        tester,
        playRequested: false,
        onToggleFullscreen: () => fullscreens++,
        controls: HlsPlayerControls(
          playPauseBuilder: (_, _) => visual('play'),
          muteBuilder: (_, _) => visual('mute'),
          seekBarBuilder: (_, _) => const SizedBox.expand(
            key: Key('seek'),
            child: ColoredBox(color: Colors.white),
          ),
          fullscreenBuilder: (_, _) => visual('fullscreen'),
        ),
      );
      WidgetController.hitTestWarningShouldBeFatal = true;
      addTearDown(() => WidgetController.hitTestWarningShouldBeFatal = false);

      await tester.tap(find.byKey(const Key('mute')));
      await tester.tap(find.byKey(const Key('play')));
      await tester.tap(find.byKey(const Key('fullscreen')));
      await tester.tapAt(tester.getTopLeft(find.byKey(const Key('seek'))));

      expect(mutes, 1);
      expect(toggles, 1);
      expect(fullscreens, 1);
      expect(seeks, <Duration>[Duration.zero]);
    });

    testWidgets('builder with its own button does not fire twice', (
      WidgetTester tester,
    ) async {
      await pumpChrome(
        tester,
        playRequested: false,
        controls: HlsPlayerControls(
          muteBuilder: (_, HlsControlsState state) => GestureDetector(
            onTap: state.onToggleMute,
            child: const SizedBox(
              key: Key('mute'),
              width: 40,
              height: 40,
              child: ColoredBox(color: Colors.white),
            ),
          ),
        ),
      );

      await tester.tap(find.byKey(const Key('mute')));
      expect(mutes, 1);
    });

    testWidgets('builders replace every control and receive state', (
      WidgetTester tester,
    ) async {
      final List<HlsControlsState> seen = <HlsControlsState>[];
      Widget tagged(String key, HlsControlsState state) {
        seen.add(state);
        return SizedBox(key: Key(key), width: 10, height: 10);
      }

      await pumpChrome(
        tester,
        playRequested: false,
        controls: HlsPlayerControls(
          playPauseBuilder: (_, HlsControlsState s) => tagged('play', s),
          muteBuilder: (_, HlsControlsState s) => tagged('mute', s),
          seekBarBuilder: (_, HlsControlsState s) => tagged('seek', s),
          timerBuilder: (_, HlsControlsState s) => tagged('timer', s),
        ),
      );

      for (final String key in <String>['play', 'mute', 'seek', 'timer']) {
        expect(find.byKey(Key(key)), findsOneWidget);
      }
      expect(find.byIcon(Icons.play_arrow), findsNothing);
      // The package keeps the seek gesture but drops its painted track.
      expect(
        find.descendant(
          of: find.byType(HlsEngineSeekBar),
          matching: find.byType(CustomPaint),
        ),
        findsNothing,
      );
      expect(seen.every((HlsControlsState s) => s.muted), isTrue);
      expect(seen.every((HlsControlsState s) => !s.playRequested), isTrue);
      expect(seen.first.snapshot, _landscape);
      seen.first.onToggleMute!();
      expect(mutes, 1);
    });
  });

  group('pager play and mute intent', () {
    const MethodChannel control = MethodChannel(
      HlsNativeBridge.controlChannelName,
    );
    late _FakeFactory factory;
    late PageController controller;
    HlsPortWindow? window;

    setUp(() {
      factory = _FakeFactory();
      controller = PageController();
      window = null;
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

    Future<void> settle(WidgetTester tester) async {
      for (var i = 0; i < 10; i++) {
        await tester.pump();
      }
    }

    Widget pager(
      List<HlsReelItem> items, {
      HlsPlayerControls controls = const HlsPlayerControls(),
      HlsReelSlot? Function(HlsReelSlot slot)? onSlot,
    }) {
      return MaterialApp(
        home: HlsReelPager(
          items: items,
          controller: controller,
          controls: controls,
          onWindowChanged: (HlsPortWindow next) => window = next,
          itemBuilder: (BuildContext context, HlsReelSlot slot) {
            onSlot?.call(slot);
            return Stack(
              fit: StackFit.expand,
              children: <Widget>[
                slot.video,
                // Stands in for an opaque host scrim over the video.
                const IgnorePointer(child: ColoredBox(color: Colors.black)),
                ?slot.bottomBar,
              ],
            );
          },
        ),
      );
    }

    testWidgets('slot bottom bar paints above host layers when not embedded', (
      WidgetTester tester,
    ) async {
      final Map<int, HlsReelSlot> slots = <int, HlsReelSlot>{};
      await tester.pumpWidget(
        pager(
          _items(3),
          controls: const HlsPlayerControls(embedBottomBar: false),
          onSlot: (HlsReelSlot slot) => slots[slot.index] = slot,
        ),
      );
      await settle(tester);
      factory.ports['0']!.notifier.value = _landscape;
      await tester.pump();

      expect(slots[0]!.bottomBar, isNotNull);
      final Finder bar = find.byType(HlsEngineSeekBar);
      expect(bar, findsOneWidget);
      expect(
        find.descendant(
          of: find.byType(HlsVideoPlayer),
          matching: find.byType(HlsEngineSeekBar),
        ),
        findsNothing,
      );
      // Fails if anything above the bar swallows the tap.
      WidgetController.hitTestWarningShouldBeFatal = true;
      addTearDown(() => WidgetController.hitTestWarningShouldBeFatal = false);
      await tester.tap(bar);
    });

    Future<void> openFullscreenPager(WidgetTester tester, Size size) async {
      tester.view.physicalSize = size;
      tester.view.devicePixelRatio = 1;
      addTearDown(tester.view.reset);
      await tester.pumpWidget(
        pager(
          _items(3),
          controls: const HlsPlayerControls(embedBottomBar: false),
        ),
      );
      await settle(tester);
      factory.ports['0']!.notifier.value = _landscape;
      await tester.pump();
      await tester.tap(find.byIcon(Icons.fullscreen));
      await tester.pump();
    }

    testWidgets('fullscreen rotates the same port on a portrait screen', (
      WidgetTester tester,
    ) async {
      await openFullscreenPager(tester, const Size(400, 800));
      final HlsPlayerPort focused = window!.ports['0']!;
      final int opened = factory.opens;

      final Finder view = find.byType(HlsFullscreenView);
      expect(view, findsOneWidget);
      expect(
        tester
            .widget<RotatedBox>(
              find.descendant(of: view, matching: find.byType(RotatedBox)),
            )
            .quarterTurns,
        1,
      );
      expect(window!.focusedIndex, 0);
      expect(identical(window!.ports['0'], focused), isTrue);
      expect(factory.opens, opened);

      await tester.tap(find.byIcon(Icons.fullscreen_exit));
      await tester.pump();
      expect(find.byType(HlsFullscreenView), findsNothing);
      expect(identical(window!.ports['0'], focused), isTrue);
    });

    testWidgets('fullscreen does not rotate an already landscape screen', (
      WidgetTester tester,
    ) async {
      await openFullscreenPager(tester, const Size(800, 400));

      expect(
        find.descendant(
          of: find.byType(HlsFullscreenView),
          matching: find.byType(RotatedBox),
        ),
        findsNothing,
      );
    });

    testWidgets('back leaves fullscreen and keeps the screen', (
      WidgetTester tester,
    ) async {
      await openFullscreenPager(tester, const Size(400, 800));

      await tester.binding.handlePopRoute();
      await tester.pump();

      expect(find.byType(HlsFullscreenView), findsNothing);
      expect(find.byType(HlsReelPager), findsOneWidget);
    });

    testWidgets('bottom bar stays embedded by default', (
      WidgetTester tester,
    ) async {
      HlsReelSlot? first;
      await tester.pumpWidget(
        pager(_items(3), onSlot: (HlsReelSlot slot) => first ??= slot),
      );
      await settle(tester);

      expect(first!.bottomBar, isNull);
    });

    testWidgets('pause stays on its reel; mute follows every reel', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(pager(_items(4)));
      await settle(tester);

      await tester.tapAt(tester.getCenter(find.byType(HlsReelPager)));
      await settle(tester);
      expect(window!.playRequested, isFalse);
      expect(factory.ports['0']!.playing, isFalse);

      await tester.tap(find.byIcon(Icons.volume_off));
      await settle(tester);
      expect(window!.muted, isFalse);
      expect(factory.ports['0']!.volume, 1);

      controller.jumpToPage(1);
      await settle(tester);

      expect(window!.focusedIndex, 1);
      expect(window!.playRequested, isTrue);
      expect(window!.muted, isFalse);
      expect(factory.ports['1']!.playing, isTrue);
      expect(factory.ports['1']!.volume, 1);
      expect(factory.ports['0']!.playing, isFalse);
      expect(factory.ports['0']!.volume, 0);
    });

    testWidgets('feed update keeps pause and port identity', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(pager(_items(4)));
      await settle(tester);
      await tester.tapAt(tester.getCenter(find.byType(HlsReelPager)));
      await settle(tester);
      final HlsPlayerPort focused = window!.ports['0']!;

      await tester.pumpWidget(pager(_items(6)));
      await settle(tester);

      expect(window!.playRequested, isFalse);
      expect(identical(window!.ports['0'], focused), isTrue);
      expect(factory.ports['0']!.playing, isFalse);
    });
  });
}

List<HlsReelItem> _items(int count) => List<HlsReelItem>.generate(
  count,
  (int index) => HlsReelItem(
    id: '$index',
    masterUri: Uri.parse('https://cdn.example/$index/master.m3u8'),
  ),
);

class _FakeFactory implements HlsPlayerPortFactory {
  final Map<String, _FakePort> ports = <String, _FakePort>{};
  int opens = 0;

  @override
  Future<HlsPlayerPort> open({
    required Uri uri,
    required Map<String, String> httpHeaders,
  }) async {
    opens++;
    final String id = uri.pathSegments.first;
    return ports[id] = _FakePort(id);
  }
}

class _FakePort implements HlsPlayerPort {
  _FakePort(this.id);

  final String id;
  final ValueNotifier<HlsPlayerSnapshot> notifier =
      ValueNotifier<HlsPlayerSnapshot>(HlsPlayerSnapshot.empty);
  bool playing = false;
  double volume = -1;

  @override
  int get debugInstanceId => int.parse(id) + 1;

  @override
  String get debugIdentity => id;

  @override
  HlsPlayerSnapshot get snapshot => notifier.value;

  @override
  ValueListenable<HlsPlayerSnapshot> get snapshotListenable => notifier;

  @override
  Widget buildView() => const ColoredBox(color: Colors.red);

  @override
  Future<void> dispose() async {}

  @override
  Future<void> pause() async => playing = false;

  @override
  Future<void> play() async => playing = true;

  @override
  Future<void> seekTo(Duration position) async {}

  @override
  Future<void> setVolume(double volume) async => this.volume = volume;
}
