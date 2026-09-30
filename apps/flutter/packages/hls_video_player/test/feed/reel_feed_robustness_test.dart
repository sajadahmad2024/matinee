import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hls_video_player/hls_video_player.dart'
    show HlsHudModel, HlsNativeBridge, HlsPlayerSnapshot;
import 'package:hls_video_player/reels.dart';
import 'package:hls_video_player/src/player/hls_hud_binder.dart';
import 'package:hls_video_player/src/player/hls_hud_session.dart';

import '../support/fakes.dart';

class _Reel implements ReelFeedItem {
  const _Reel(this.id, {this.version = 0, this.token, this.isLocked = false});

  @override
  final String id;
  final int version;

  /// An auth header value; a new one is a new descriptor for the same URL.
  final String? token;

  @override
  final bool isLocked;

  Uri get url => Uri.parse('https://cdn.example/$id/v$version/master.m3u8');

  @override
  ReelSource? get source => token == null
      ? ReelSource.hls(url)
      : ReelSource.descriptor(
          HlsContentDescriptor(
            assetId: url,
            originUrl: url,
            authMode: HlsAuthMode.tokenHeader,
            authConfig: HlsAuthConfig(
              headerName: 'Authorization',
              headerValue: token,
            ),
          ),
        );
}

List<_Reel> _reels(int count) =>
    List<_Reel>.generate(count, (int i) => _Reel('$i'));

void main() {
  group('ReelFeed robustness', () {
    late RecordingNative native;
    late FakePortFactory factory;
    late ValueNotifier<List<_Reel>> items;

    setUp(() {
      native = RecordingNative();
      factory = FakePortFactory(native);
      items = ValueNotifier<List<_Reel>>(_reels(3));
      HlsEngine.debugReset();
      HlsEngine.debugInstall(
        nativeBridge: HlsNativeBridge(),
        playerFactory: factory,
      );
    });

    tearDown(() {
      native.dispose();
      HlsEngine.debugReset();
    });

    Future<void> frames(WidgetTester t, [int count = 10]) async {
      for (var i = 0; i < count; i++) {
        await t.pump(const Duration(milliseconds: 16));
      }
    }

    Widget app({
      ReelFeedController<_Reel>? controller,
      ReelItemBuilder<_Reel>? itemBuilder,
      bool showHud = false,
      Widget Function(Widget feed)? around,
    }) {
      final Widget feed = ValueListenableBuilder<List<_Reel>>(
        valueListenable: items,
        builder: (BuildContext context, List<_Reel> list, _) => ReelFeed<_Reel>(
          controller: controller,
          items: list,
          itemBuilder: itemBuilder,
          showHud: showHud,
        ),
      );
      return MaterialApp(home: around?.call(feed) ?? feed);
    }

    testWidgets('an open superseded by a new source still ends with a player', (
      WidgetTester t,
    ) async {
      factory.holdOpen['1'] = Completer<void>();
      await t.pumpWidget(app());
      await frames(t);
      expect(factory.byId['1'], isNull);

      // A new URL while the old open is still in flight, past the 2 s wait.
      items.value = <_Reel>[...items.value]..[1] = const _Reel('1', version: 1);
      await t.pump(const Duration(seconds: 3));
      factory.holdOpen.remove('1')!.complete();
      await frames(t, 20);

      expect(factory.byId['1'], isNotNull);
      expect(factory.uriOf['1'], const _Reel('1', version: 1).url);
      await t.pumpWidget(const SizedBox());
    });

    testWidgets('a new auth token for the same URL replaces the player', (
      WidgetTester t,
    ) async {
      items.value = <_Reel>[
        const _Reel('0', token: 'old'),
        ..._reels(3).skip(1),
      ];
      await t.pumpWidget(app());
      await frames(t);
      final FakePort old = factory.byId['0']!;

      items.value = <_Reel>[
        const _Reel('0', token: 'new'),
        ...items.value.skip(1),
      ];
      await frames(t, 40);

      expect(old.disposed, isTrue);
      expect(factory.byId['0']!.disposed, isFalse);
      expect(native.calls.where((String c) => c == 'open:0'), hasLength(2));
      await t.pumpWidget(const SizedBox());
    });

    testWidgets(
      'a custom page reading the HUD and curtain late gets one each',
      (WidgetTester t) async {
        items.value = <_Reel>[
          const _Reel('0', isLocked: true),
          ..._reels(3).skip(1),
        ];
        await t.pumpWidget(
          app(
            showHud: true,
            itemBuilder: (BuildContext context, ReelSlot<_Reel> slot) =>
                ReelItem<_Reel>.custom(
                  curtain: (BuildContext context, ReelSlot<_Reel> slot) =>
                      const Text('curtain'),
                  // Reads the layers inside a nested builder, after the page
                  // builder returned.
                  page:
                      (
                        BuildContext context,
                        ReelSlot<_Reel> slot,
                        ReelLayers<_Reel> layers,
                      ) => Builder(
                        builder: (BuildContext context) => Stack(
                          children: <Widget>[
                            layers.video,
                            layers.hud,
                            layers.curtain,
                          ],
                        ),
                      ),
                ),
          ),
        );
        await frames(t);

        expect(t.takeException(), isNull);
        expect(find.byType(HlsHudBinder), findsOneWidget);
        expect(find.text('curtain'), findsOneWidget);
        await t.pumpWidget(const SizedBox());
      },
    );

    testWidgets('the HUD shows and toggles the reel override', (
      WidgetTester t,
    ) async {
      final ReelFeedController<_Reel> feed = ReelFeedController<_Reel>();
      await t.pumpWidget(app(controller: feed, showHud: true));
      await frames(t);
      feed.current!.mutedOverride = false;
      await frames(t);

      final HlsHudBinder hud = t.widget<HlsHudBinder>(
        find.byType(HlsHudBinder),
      );
      expect(hud.muted, isFalse);
      hud.onToggleMute();
      await frames(t);

      expect(feed.current!.mutedOverride, isTrue);
      expect(feed.muted, isTrue);
      await t.pumpWidget(const SizedBox());
      feed.dispose();
    });

    testWidgets('a list change never notifies state listeners during a build', (
      WidgetTester t,
    ) async {
      final ReelFeedController<_Reel> feed = ReelFeedController<_Reel>();
      // A listener outside the feed's subtree, built before it each frame;
      // it follows reel 1 once the feed has it.
      final ValueNotifier<ReelHandle<_Reel>?> watched =
          ValueNotifier<ReelHandle<_Reel>?>(null);
      await t.pumpWidget(
        app(
          controller: feed,
          around: (Widget child) => Column(
            children: <Widget>[
              ValueListenableBuilder<ReelHandle<_Reel>?>(
                valueListenable: watched,
                builder: (BuildContext context, ReelHandle<_Reel>? reel, _) =>
                    reel == null
                    ? const SizedBox.shrink()
                    : ValueListenableBuilder<ReelPlaybackState>(
                        valueListenable: reel.state,
                        builder:
                            (
                              BuildContext context,
                              ReelPlaybackState state,
                              _,
                            ) => Text('${state.status}'),
                      ),
              ),
              Expanded(child: child),
            ],
          ),
        ),
      );
      await frames(t);
      watched.value = feed[1];
      await frames(t);

      // Removing the reel on screen focuses reel 1 in the same call, which
      // changes the watched state while the feed is building.
      items.value = items.value.skip(1).toList();
      await frames(t);
      items.value = <_Reel>[
        const _Reel('1', isLocked: true),
        ...items.value.skip(1),
      ];
      await frames(t);

      expect(t.takeException(), isNull);
      await t.pumpWidget(const SizedBox());
      feed.dispose();
    });

    testWidgets('a feed moved in the tree keeps its controller and plays', (
      WidgetTester t,
    ) async {
      final ReelFeedController<_Reel> feed = ReelFeedController<_Reel>();
      await t.pumpWidget(app(controller: feed));
      await frames(t);

      // A layout switch: the same controller, the feed under a new parent.
      await t.pumpWidget(
        app(
          controller: feed,
          around: (Widget child) =>
              Column(children: <Widget>[Expanded(child: child)]),
        ),
      );
      await frames(t);

      expect(t.takeException(), isNull);
      expect(factory.byId['0']!.isPlaying, isTrue);
      await t.pumpWidget(const SizedBox());
      feed.dispose();
    });

    testWidgets('a failure after retry is reported again', (
      WidgetTester t,
    ) async {
      final ReelFeedController<_Reel> feed = ReelFeedController<_Reel>();
      final List<ReelEvent<_Reel>> events = <ReelEvent<_Reel>>[];
      feed.events.listen(events.add);
      await t.pumpWidget(app(controller: feed));
      await frames(t);

      factory.byId['0']!.emit(error: 'decode');
      await frames(t);
      feed.current!.retry();
      await frames(t, 40);
      factory.byId['0']!.emit(error: 'decode again');
      await frames(t);

      expect(events.whereType<ReelError<_Reel>>(), hasLength(2));
      await t.pumpWidget(const SizedBox());
      feed.dispose();
    });

    test('a HUD shown anew measures TTFF again for the same reel', () {
      final HlsHudSession session = HlsHudSession();
      const HlsPlayerSnapshot playing = HlsPlayerSnapshot(
        isInitialized: true,
        isPlaying: true,
        isBuffering: false,
        hasError: false,
        duration: Duration(seconds: 30),
        position: Duration.zero,
        width: 1,
        height: 1,
        aspectRatio: 1,
      );
      HlsHudModel model() => session.model(
        snapshot: HlsPlayerSnapshot.empty,
        playRequested: true,
        muted: true,
        assetId: 'a',
      );
      session
        ..focusAsset('a')
        ..markFirstFrame(playing, assetId: 'a');
      expect(model().ttffMs, isNotNull);

      session.focusAsset('a');
      expect(model().ttffMs, isNotNull);
      session.focusAsset('a', restart: true);
      expect(model().ttffMs, isNull);
      session.dispose();
    });

    test('items is a view, not a copy per read', () {
      final ReelFeedController<_Reel> feed = ReelFeedController<_Reel>()
        ..syncItems(_reels(3));
      expect(identical(feed.items, feed.items), isTrue);
      feed.dispose();
    });
  });
}
