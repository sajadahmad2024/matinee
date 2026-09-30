import 'package:flutter_test/flutter_test.dart';
import 'package:hls_video_player/hls_video_player.dart';
import 'package:hls_video_player/src/player/hls_port_window.dart';

import 'support/fakes.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  late RecordingNative native;
  late FakePortFactory factory;

  setUp(() {
    native = RecordingNative();
    factory = FakePortFactory(native);
  });

  tearDown(() => native.dispose());

  List<HlsReelItem> items(int count, {Set<int> locked = const <int>{}}) =>
      List<HlsReelItem>.generate(
        count,
        (int i) => HlsReelItem(
          id: '$i',
          masterUri: fakeMaster('$i'),
          playable: !locked.contains(i),
        ),
      );

  HlsPortWindow window(List<HlsReelItem> list, {int radius = 2}) =>
      HlsPortWindow(
        items: list,
        windowRadius: radius,
        nativeBridge: HlsNativeBridge(),
        playerFactory: factory,
      );

  group('playable', () {
    test('non-playable items get no player, openAsset or prefetch', () async {
      final HlsPortWindow w = window(items(5, locked: <int>{1}));
      await w.initialize();
      await settle();

      expect(w.keepIndexes(0), <int>{0, 2});
      expect(w.portAt(1), isNull);
      expect(native.calls.where((String c) => c.endsWith(':1')), isEmpty);
      expect(w.ports.keys.toSet(), <String>{'0', '2'});
      w.dispose();
    });

    test('a locked item still counts toward the radius', () async {
      final HlsPortWindow w = window(items(7, locked: <int>{2}));
      await w.initialize(focusedIndex: 3);
      await settle();

      // Radius 2 around 3 is 1..5; index 2 is skipped, not replaced by 6.
      expect(w.keepIndexes(3), <int>{1, 3, 4, 5});
      expect(w.ports.length, 4);
      w.dispose();
    });

    test('flipping to playable opens the player on update', () async {
      final HlsPortWindow w = window(items(3, locked: <int>{1}));
      await w.initialize();
      await settle();
      expect(w.portAt(1), isNull);

      await w.updateItems(items(3));
      await settle();

      expect(w.portAt(1), isNotNull);
      expect(native.calls, contains('open:1'));
      w.dispose();
    });

    test('flipping to non-playable evicts the player', () async {
      final HlsPortWindow w = window(items(3));
      await w.initialize();
      await settle();
      final FakePort port = factory.byId['1']!;

      await w.updateItems(items(3, locked: <int>{1}));
      await settle();

      expect(w.portAt(1), isNull);
      expect(port.disposed, isTrue);
      w.dispose();
    });

    test('sameHlsReelFeed sees a playable change', () {
      expect(sameHlsReelFeed(items(2), items(2, locked: <int>{0})), isFalse);
      expect(sameHlsReelFeed(items(2), items(2)), isTrue);
    });
  });

  group('mute override', () {
    test('override wins over window mute for the focused port', () async {
      final HlsPortWindow w = window(items(3))..muted = true;
      await w.initialize();
      await settle();
      final FakePort focused = factory.byId['0']!;
      expect(focused.volume, 0);

      await w.setMutedOverride('0', false);
      expect(focused.volume, 1);
      expect(w.isMutedFor('0'), isFalse);
      expect(w.isMutedFor('1'), isTrue);

      await w.setMutedOverride('0', null);
      expect(focused.volume, 0);
      expect(w.mutedOverrideFor('0'), isNull);
      w.dispose();
    });

    test('setMuted keeps overridden items on their own value', () async {
      final HlsPortWindow w = window(items(3))..muted = true;
      await w.initialize();
      await settle();
      await w.setMutedOverride('0', true);

      await w.setMuted(false);
      expect(factory.byId['0']!.volume, 0);
      expect(w.isMutedFor('1'), isFalse);
      w.dispose();
    });

    test('overrides for removed ids are dropped', () async {
      final HlsPortWindow w = window(items(3));
      await w.initialize();
      await settle();
      await w.setMutedOverride('2', false);

      await w.updateItems(items(2));
      expect(w.mutedOverrideFor('2'), isNull);
      w.dispose();
    });
  });

  group('retry', () {
    test('reopens an item after an open error', () async {
      factory.failOpen.add('1');
      final HlsPortWindow w = window(items(3));
      await w.initialize();
      await settle();
      expect(w.errorAt(1), isNotNull);
      expect(w.portAt(1), isNull);

      factory.failOpen.clear();
      await w.retry('1');
      await settle();

      expect(w.errorAt(1), isNull);
      expect(w.portAt(1), isNotNull);
      w.dispose();
    });

    test('is a no-op when there is no error', () async {
      final HlsPortWindow w = window(items(2));
      await w.initialize();
      await settle();
      final int opens = factory.opened.length;

      await w.retry('0');
      expect(factory.opened.length, opens);
      w.dispose();
    });
  });
}
