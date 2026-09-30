import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hls_video_player/hls_video_player.dart'
    show HlsEngineSeekBar, HlsNativeBridge, PortraitPoolOverlay;
import 'package:hls_video_player/reels.dart';
import 'package:hls_video_player/src/feed/builders/reel_page.dart';
import 'package:hls_video_player/src/player/hls_hud_binder.dart';
import 'package:hls_video_player/src/player/hls_fullscreen_view.dart';

import '../support/fakes.dart';

class _Clip implements ReelFeedItem {
  const _Clip(this.id, {this.isLocked = false});

  @override
  final String id;

  @override
  final bool isLocked;

  @override
  ReelSource? get source => ReelSource.hls(fakeMaster(id));

  _Clip withLock({required bool isLocked}) => _Clip(id, isLocked: isLocked);
}

List<_Clip> _clips(int count) =>
    List<_Clip>.generate(count, (int i) => _Clip('$i'));

void main() {
  group('ReelFeed builders', () {
    late RecordingNative native;
    late FakePortFactory factory;
    late ReelFeedController<_Clip> feed;
    // The host's state: pages follow it, as they would a cubit's.
    late ValueNotifier<List<_Clip>> items;

    void setLocked(String id, {required bool isLocked}) =>
        items.value = <_Clip>[
          for (final _Clip c in items.value)
            c.id == id ? c.withLock(isLocked: isLocked) : c,
        ];

    setUp(() {
      native = RecordingNative();
      factory = FakePortFactory(native);
      items = ValueNotifier<List<_Clip>>(_clips(4));
      HlsEngine.debugReset();
      HlsEngine.debugInstall(
        nativeBridge: HlsNativeBridge(),
        playerFactory: factory,
      );
      feed = ReelFeedController<_Clip>();
    });

    tearDown(() {
      feed.dispose();
      native.dispose();
      HlsEngine.debugReset();
    });

    Future<void> frames(WidgetTester t, [int count = 10]) async {
      for (var i = 0; i < count; i++) {
        await t.pump(const Duration(milliseconds: 16));
      }
    }

    Future<void> pumpFeed(
      WidgetTester t, {
      ReelItem<_Clip> builders = const ReelItem<_Clip>(),
      ReelSlotPredicate<_Clip>? hudFor,
      ReelFeedLayerBuilder<_Clip>? header,
      ReelStyle style = const ReelStyle(),
      ReelLabels labels = const ReelLabels(),
      ReelGestureCallback<_Clip>? onTap,
      ReelGestureCallback<_Clip>? onDoubleTap,
      ReelGestureCallback<_Clip>? onLongPressStart,
      ReelSlotCallback<_Clip>? onLongPressEnd,
    }) async {
      await t.pumpWidget(
        MaterialApp(
          home: ValueListenableBuilder<List<_Clip>>(
            valueListenable: items,
            builder: (BuildContext context, List<_Clip> list, _) =>
                ReelFeed<_Clip>(
                  controller: feed,
                  items: list,
                  itemBuilder: (BuildContext context, ReelSlot<_Clip> slot) =>
                      builders,
                  hudFor: hudFor,
                  header: header,
                  style: style,
                  labels: labels,
                  onTap: onTap,
                  onDoubleTap: onDoubleTap,
                  onLongPressStart: onLongPressStart,
                  onLongPressEnd: onLongPressEnd,
                ),
          ),
        ),
      );
      await frames(t);
    }

    FakePort port(String id) => factory.byId[id]!;

    group('renders', () {
      testWidgets('a complete page from only a controller', (
        WidgetTester t,
      ) async {
        await pumpFeed(t);

        expect(find.byKey(const ValueKey<String>('texture-0')), findsOneWidget);
        expect(find.byType(ReelSeekBar), findsOneWidget);
        expect(find.byType(ReelTimer), findsOneWidget);
        expect(find.byType(ReelFullscreenButton), findsOneWidget);
        expect(find.byType(ReelPlayPauseButton), findsNothing);
        expect(port('0').isPlaying, isTrue);
      });

      testWidgets('a seek bar painted across its whole row', (
        WidgetTester t,
      ) async {
        await pumpFeed(t);
        final double row = t.getSize(find.byType(ReelSeekBar)).width;
        final Finder paint = find.descendant(
          of: find.byType(HlsEngineSeekBar),
          matching: find.byType(CustomPaint),
        );

        expect(row, greaterThan(100));
        expect(t.getSize(paint).width, row);
      });

      testWidgets('a custom seek track across its whole row', (
        WidgetTester t,
      ) async {
        await pumpFeed(
          t,
          builders: ReelItem<_Clip>(
            seekBar:
                (
                  BuildContext context,
                  ReelSlot<_Clip> slot,
                  ReelPlaybackState state,
                ) => const ColoredBox(
                  key: ValueKey<String>('track'),
                  color: Colors.red,
                ),
          ),
        );

        expect(
          t.getSize(find.byKey(const ValueKey<String>('track'))).width,
          t.getSize(find.byType(ReelSeekBar)).width,
        );
      });

      testWidgets('the centre play button after a tap pauses', (
        WidgetTester t,
      ) async {
        await pumpFeed(t);

        await t.tapAt(const Offset(200, 150));
        await frames(t);

        expect(port('0').isPlaying, isFalse);
        expect(find.byType(ReelPlayPauseButton), findsOneWidget);
        await t.tap(find.byType(ReelPlayPauseButton));
        await frames(t);
        expect(port('0').isPlaying, isTrue);
      });

      testWidgets('a null builder result as the default, per index', (
        WidgetTester t,
      ) async {
        await pumpFeed(
          t,
          builders: ReelItem<_Clip>(
            overlay: (BuildContext context, ReelSlot<_Clip> slot) =>
                slot.index == 1 ? const Text('second') : null,
            controls:
                (
                  BuildContext context,
                  ReelSlot<_Clip> slot,
                  ReelPlaybackState state,
                ) => slot.index == 1 ? const Text('custom controls') : null,
          ),
        );
        expect(find.text('second'), findsNothing);
        expect(find.byType(ReelSeekBar), findsOneWidget);

        feed.jumpTo(1);
        await frames(t);

        expect(find.text('second'), findsOneWidget);
        expect(find.text('custom controls'), findsOneWidget);
      });

      testWidgets('insets that clear the bottom bar and safe area', (
        WidgetTester t,
      ) async {
        EdgeInsets? insets;
        await t.pumpWidget(
          MaterialApp(
            home: MediaQuery(
              data: const MediaQueryData(
                size: Size(400, 800),
                padding: EdgeInsets.only(top: 20, bottom: 30),
              ),
              child: ReelFeed<_Clip>(
                controller: feed,
                items: items.value,
                itemBuilder: (BuildContext context, ReelSlot<_Clip> slot) =>
                    ReelItem<_Clip>(
                      overlay: (BuildContext context, ReelSlot<_Clip> slot) {
                        insets = slot.insets;
                        return null;
                      },
                    ),
              ),
            ),
          ),
        );
        await frames(t);

        expect(insets!.bottom, 30 + kMinInteractiveDimension);
        expect(insets!.top, 20);
      });

      testWidgets('controls where the style puts them', (WidgetTester t) async {
        await pumpFeed(
          t,
          style: const ReelStyle(
            seekBar: ReelBarPlacement.hidden,
            timer: ReelControlPosition.topEnd,
            fullscreenButton: ReelControlPosition.hidden,
          ),
        );

        expect(find.byType(ReelSeekBar), findsNothing);
        expect(find.byType(ReelFullscreenButton), findsNothing);
        expect(t.getTopLeft(find.byType(ReelTimer)).dy, lessThan(100));
      });

      testWidgets('the thumbnail until the first frame, and on locked reels', (
        WidgetTester t,
      ) async {
        setLocked('1', isLocked: true);
        await pumpFeed(
          t,
          builders: ReelItem<_Clip>(
            thumbnail: (BuildContext context, ReelSlot<_Clip> slot) =>
                Text('thumb ${slot.id}'),
          ),
        );
        double opacityOf(String id) => t
            .widget<AnimatedOpacity>(
              find.ancestor(
                of: find.text('thumb $id'),
                matching: find.byType(AnimatedOpacity),
              ),
            )
            .opacity;

        expect(opacityOf('0'), 0);
        feed.jumpTo(1);
        await frames(t);
        expect(opacityOf('1'), 1);
      });

      testWidgets('localized labels and 48 dp targets', (WidgetTester t) async {
        final SemanticsHandle semantics = t.ensureSemantics();
        await pumpFeed(
          t,
          labels: const ReelLabels(togglePlay: 'Spielen', fullscreen: 'Voll'),
        );

        expect(find.bySemanticsLabel('Spielen'), findsOneWidget);
        expect(find.bySemanticsLabel('Voll'), findsOneWidget);
        await expectLater(t, meetsGuideline(androidTapTargetGuideline));
        await expectLater(t, meetsGuideline(labeledTapTargetGuideline));
        semantics.dispose();
      });
    });

    group('layer order', () {
      testWidgets('an overlay button wins its tap over tap-to-play', (
        WidgetTester t,
      ) async {
        var shares = 0;
        await pumpFeed(
          t,
          builders: ReelItem<_Clip>(
            overlay: (BuildContext context, ReelSlot<_Clip> slot) => Align(
              alignment: Alignment.centerRight,
              child: IconButton(
                icon: const Icon(Icons.share),
                onPressed: () => shares++,
              ),
            ),
          ),
        );

        await t.tap(find.byIcon(Icons.share));
        await frames(t);

        expect(shares, 1);
        expect(port('0').isPlaying, isTrue);
      });

      testWidgets('controls sit above the overlay', (WidgetTester t) async {
        await pumpFeed(
          t,
          builders: ReelItem<_Clip>(
            // An opaque band over the bottom bar, like a grown caption.
            overlay: (BuildContext context, ReelSlot<_Clip> slot) => Align(
              alignment: Alignment.bottomCenter,
              child: GestureDetector(
                onTap: () {},
                child: const SizedBox(height: 120, width: double.infinity),
              ),
            ),
          ),
        );

        await t.tap(find.byType(ReelFullscreenButton));
        await frames(t);

        expect(feed.isFullscreen, isTrue);
      });
    });

    group('rebuilds', () {
      testWidgets('data layers ignore player ticks; tick layers follow them', (
        WidgetTester t,
      ) async {
        var overlayBuilds = 0;
        var timerBuilds = 0;
        await pumpFeed(
          t,
          builders: ReelItem<_Clip>(
            overlay: (BuildContext context, ReelSlot<_Clip> slot) {
              overlayBuilds++;
              return null;
            },
            timer:
                (
                  BuildContext context,
                  ReelSlot<_Clip> slot,
                  ReelPlaybackState state,
                ) {
                  timerBuilds++;
                  return null;
                },
          ),
        );
        final int overlays = overlayBuilds;
        final int timers = timerBuilds;

        for (var i = 1; i <= 10; i++) {
          port('0').emit(position: Duration(milliseconds: i * 100));
          await t.pump();
        }

        expect(overlayBuilds, overlays);
        expect(timerBuilds, greaterThanOrEqualTo(timers + 10));
      });
    });

    group('gestures', () {
      testWidgets('a single tap acts at once without double tap', (
        WidgetTester t,
      ) async {
        await pumpFeed(t);

        await t.tapAt(const Offset(200, 150));
        await t.pump();

        expect(port('0').isPlaying, isFalse);
      });

      testWidgets('double tap fires once and does not toggle play', (
        WidgetTester t,
      ) async {
        final List<Offset> doubleTaps = <Offset>[];
        await pumpFeed(
          t,
          onDoubleTap: (ReelSlot<_Clip> slot, Offset position) =>
              doubleTaps.add(position),
        );

        await t.tapAt(const Offset(200, 150));
        await t.pump(const Duration(milliseconds: 50));
        await t.tapAt(const Offset(200, 150));
        await t.pump(const Duration(milliseconds: 400));

        expect(doubleTaps, <Offset>[const Offset(200, 150)]);
        expect(port('0').isPlaying, isTrue);
      });

      testWidgets('onTap replaces the play toggle', (WidgetTester t) async {
        var taps = 0;
        await pumpFeed(
          t,
          onTap: (ReelSlot<_Clip> slot, Offset position) => taps++,
        );

        await t.tapAt(const Offset(200, 150));
        await frames(t);

        expect(taps, 1);
        expect(port('0').isPlaying, isTrue);
      });

      testWidgets('an effect shows for its duration and is removed', (
        WidgetTester t,
      ) async {
        await pumpFeed(
          t,
          style: const ReelStyle(effectDuration: Duration(milliseconds: 300)),
          onDoubleTap: (ReelSlot<_Clip> slot, Offset position) {},
          builders: ReelItem<_Clip>(
            doubleTapEffect:
                (
                  BuildContext context,
                  ReelSlot<_Clip> slot,
                  ReelGestureEffect effect,
                ) => const Icon(Icons.favorite),
          ),
        );

        await t.tapAt(const Offset(200, 150));
        await t.pump(const Duration(milliseconds: 50));
        await t.tapAt(const Offset(200, 150));
        await t.pump();
        expect(find.byIcon(Icons.favorite), findsOneWidget);

        await t.pump(const Duration(milliseconds: 400));
        await t.pump();
        expect(find.byIcon(Icons.favorite), findsNothing);
      });

      testWidgets('long press calls back and does nothing by default', (
        WidgetTester t,
      ) async {
        final List<String> calls = <String>[];
        await pumpFeed(
          t,
          onLongPressStart: (ReelSlot<_Clip> slot, Offset position) =>
              calls.add('start ${slot.id}'),
          onLongPressEnd: (ReelSlot<_Clip> slot) => calls.add('end'),
        );

        await t.longPressAt(const Offset(200, 150));
        await frames(t);

        expect(calls, <String>['start 0', 'end']);
        expect(port('0').isPlaying, isTrue);
      });
    });

    group('locking', () {
      Widget curtain(BuildContext context, ReelSlot<_Clip> slot) => Center(
        child: FilledButton(
          onPressed: () {
            // The host's state changes; the feed follows the new list.
            setLocked(slot.id, isLocked: false);
          },
          child: const Text('Unlock'),
        ),
      );

      testWidgets('shows the curtain, blocks taps and opens no player', (
        WidgetTester t,
      ) async {
        setLocked('0', isLocked: true);
        await pumpFeed(t, builders: ReelItem<_Clip>(curtain: curtain));

        expect(find.text('Unlock'), findsOneWidget);
        expect(find.byType(ReelSeekBar), findsNothing);
        expect(factory.byId['0'], isNull);

        await t.tapAt(const Offset(200, 150));
        await frames(t);
        expect(feed.current!.state.value.isPlayRequested, isTrue);
      });

      testWidgets('an unlocked item from state plays', (WidgetTester t) async {
        setLocked('0', isLocked: true);
        await pumpFeed(t, builders: ReelItem<_Clip>(curtain: curtain));

        await t.tap(find.text('Unlock'));
        await frames(t);

        expect(find.text('Unlock'), findsNothing);
        expect(port('0').isPlaying, isTrue);
      });

      testWidgets('aboveCurtain stays usable on a locked reel', (
        WidgetTester t,
      ) async {
        setLocked('0', isLocked: true);
        var shares = 0;
        await pumpFeed(
          t,
          builders: ReelItem<_Clip>(
            curtain: (BuildContext context, ReelSlot<_Clip> slot) =>
                const ColoredBox(color: Colors.black),
            aboveCurtain: (BuildContext context, ReelSlot<_Clip> slot) => Align(
              alignment: Alignment.centerRight,
              child: IconButton(
                icon: const Icon(Icons.share),
                onPressed: () => shares++,
              ),
            ),
          ),
        );

        await t.tap(find.byIcon(Icons.share));
        expect(shares, 1);
      });

      testWidgets('an overscroll past a scrollable curtain changes page', (
        WidgetTester t,
      ) async {
        setLocked('0', isLocked: true);
        await pumpFeed(
          t,
          builders: ReelItem<_Clip>(
            curtain: (BuildContext context, ReelSlot<_Clip> slot) =>
                ListView(children: const <Widget>[Text('Exclusive')]),
          ),
        );

        await t.drag(find.text('Exclusive'), const Offset(0, -300));
        await frames(t, 40);

        expect(feed.currentIndex, 1);
      });

      testWidgets('a custom page without the curtain still gets it', (
        WidgetTester t,
      ) async {
        setLocked('0', isLocked: true);
        await pumpFeed(
          t,
          builders: ReelItem<_Clip>.custom(
            curtain: curtain,
            page:
                (
                  BuildContext context,
                  ReelSlot<_Clip> slot,
                  ReelLayers<_Clip> layers,
                ) => Column(
                  children: <Widget>[
                    Expanded(child: layers.video),
                    const Text('comments'),
                  ],
                ),
          ),
        );

        expect(find.text('comments'), findsOneWidget);
        expect(find.text('Unlock'), findsOneWidget);
      });
    });

    group('hud', () {
      testWidgets('shows only while a picked reel is on screen', (
        WidgetTester t,
      ) async {
        await pumpFeed(t, hudFor: (ReelSlot<_Clip> slot) => slot.index == 1);
        expect(find.byType(PortraitPoolOverlay), findsNothing);

        feed.jumpTo(1);
        await frames(t);
        expect(find.byType(PortraitPoolOverlay), findsOneWidget);

        feed.jumpTo(2);
        await frames(t);
        expect(find.byType(PortraitPoolOverlay), findsNothing);
      });

      testWidgets('ReelFeed.showHud still shows it on every reel', (
        WidgetTester t,
      ) async {
        await t.pumpWidget(
          MaterialApp(
            home: ReelFeed<_Clip>(
              controller: feed,
              items: items.value,
              showHud: true,
              hudFor: (ReelSlot<_Clip> slot) => false,
            ),
          ),
        );
        await frames(t);
        expect(find.byType(PortraitPoolOverlay), findsOneWidget);
      });

      testWidgets('is one panel and one tracker that keep their State', (
        WidgetTester t,
      ) async {
        await pumpFeed(t, hudFor: (ReelSlot<_Clip> slot) => true);
        final State<StatefulWidget> panel = t.state(find.byType(HlsHudBinder));

        for (final int index in <int>[1, 2, 1, 3]) {
          feed.jumpTo(index);
          await frames(t);
          expect(find.byType(HlsHudBinder), findsOneWidget);
          expect(find.byType(PortraitPoolOverlay), findsOneWidget);
          expect(identical(t.state(find.byType(HlsHudBinder)), panel), isTrue);
          final ReelPage<_Clip> host = t.widget<ReelPage<_Clip>>(
            find.ancestor(
              of: find.byType(HlsHudBinder),
              matching: find.byType(ReelPage<_Clip>),
            ),
          );
          expect(host.reel.id, '$index');
        }
      });

      testWidgets('sits under the controls, which stay usable', (
        WidgetTester t,
      ) async {
        await pumpFeed(t, hudFor: (ReelSlot<_Clip> slot) => true);

        await t.tap(find.byType(ReelFullscreenButton));
        await frames(t);

        expect(feed.isFullscreen, isTrue);
      });

      testWidgets('keeps both parts inside the safe area', (
        WidgetTester t,
      ) async {
        await t.pumpWidget(
          MaterialApp(
            home: MediaQuery(
              data: const MediaQueryData(
                size: Size(800, 600),
                padding: EdgeInsets.only(top: 40, bottom: 30),
              ),
              child: ReelFeed<_Clip>(
                controller: feed,
                items: items.value,
                showHud: true,
              ),
            ),
          ),
        );
        await frames(t);

        expect(
          t.getTopLeft(find.byType(PortraitPoolOverlay)).dy,
          greaterThanOrEqualTo(40),
        );
        expect(
          t.getBottomLeft(find.byType(HlsHudBinder)).dy,
          lessThanOrEqualTo(600 - 30),
        );
      });

      testWidgets('works with a custom page', (WidgetTester t) async {
        await t.pumpWidget(
          MaterialApp(
            home: ReelFeed<_Clip>(
              controller: feed,
              items: items.value,
              itemBuilder: (BuildContext context, ReelSlot<_Clip> slot) =>
                  ReelItem<_Clip>.custom(
                    page: (BuildContext context, ReelSlot<_Clip> slot, _) =>
                        slot.reel.video,
                  ),
              hudFor: (ReelSlot<_Clip> slot) => slot.index == 0,
            ),
          ),
        );
        await frames(t);

        expect(t.takeException(), isNull);
        expect(find.byType(PortraitPoolOverlay), findsOneWidget);
        expect(find.byType(HlsHudBinder), findsOneWidget);
      });
    });

    group('feed layers', () {
      testWidgets('a custom page reuses package layers', (
        WidgetTester t,
      ) async {
        await pumpFeed(
          t,
          builders: ReelItem<_Clip>.custom(
            page:
                (
                  BuildContext context,
                  ReelSlot<_Clip> slot,
                  ReelLayers<_Clip> layers,
                ) => slot.index == 0
                ? Column(
                    children: <Widget>[
                      Expanded(
                        child: Stack(
                          fit: StackFit.expand,
                          children: <Widget>[
                            layers.video,
                            layers.gestures,
                            layers.controls,
                          ],
                        ),
                      ),
                      const SizedBox(height: 100, child: Text('comments')),
                    ],
                  )
                : null,
          ),
        );

        expect(find.text('comments'), findsOneWidget);
        expect(find.byType(ReelSeekBar), findsOneWidget);
        await t.tapAt(const Offset(200, 150));
        await frames(t);
        expect(port('0').isPlaying, isFalse);
      });

      testWidgets('header follows the current reel', (WidgetTester t) async {
        await pumpFeed(
          t,
          header: (BuildContext context, ReelSlot<_Clip>? current) => Align(
            alignment: Alignment.topLeft,
            child: Text('on ${current?.id}'),
          ),
        );
        expect(find.text('on 0'), findsOneWidget);

        feed.jumpTo(2);
        await frames(t);
        expect(find.text('on 2'), findsOneWidget);
      });

      testWidgets('fullscreen shows the same player with an exit button', (
        WidgetTester t,
      ) async {
        await pumpFeed(t);
        final int opened = factory.opened.length;

        feed.enterFullscreen();
        await frames(t);

        expect(find.byType(HlsFullscreenView), findsOneWidget);
        expect(find.bySemanticsLabel('Exit full screen'), findsOneWidget);
        expect(factory.opened.length, opened);
      });
    });
  });
}
