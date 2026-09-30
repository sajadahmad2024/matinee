import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hls_video_player/src/feed/reel_inserts.dart';

Widget _ad(BuildContext context, ReelInsertSlot slot) => const SizedBox();

void main() {
  group('ReelPageMap', () {
    test('no inserts maps pages one to one', () {
      final ReelPageMap map = ReelPageMap(const ReelInserts.none(), 4);
      expect(map.pageCount, 4);
      for (var i = 0; i < 4; i++) {
        expect(map.pageOfReel(i), i);
        expect(map.entryAt(i).isInsert, isFalse);
        expect(map.entryAt(i).reelIndex, i);
      }
    });

    test('every(3) puts an insert before reels 3, 6, 9', () {
      final ReelPageMap map = ReelPageMap(const ReelInserts.every(3, _ad), 10);
      // r0 r1 r2 ad r3 r4 r5 ad r6 r7 r8 ad r9
      expect(map.pageCount, 13);
      expect(map.pageOfReel(2), 2);
      expect(map.pageOfReel(3), 4);
      expect(map.pageOfInsertBefore(3), 3);
      expect(map.pageOfInsertBefore(4), isNull);
      expect(map.pageOfReel(9), 12);

      final ReelPageEntry ad = map.entryAt(7);
      expect(ad.isInsert, isTrue);
      expect(ad.reelIndex, 6);
      expect(map.entryAt(8).isInsert, isFalse);
      expect(map.entryAt(8).reelIndex, 6);
    });

    test('never ends on an insert', () {
      final ReelPageMap map = ReelPageMap(const ReelInserts.every(3, _ad), 3);
      expect(map.pageCount, 3);
      expect(map.hasInsertBefore(3), isFalse);
    });

    test('startAfter moves the first insert', () {
      final ReelPageMap map = ReelPageMap(
        const ReelInserts.every(4, _ad, startAfter: 1),
        6,
      );
      // r0 ad r1 r2 r3 r4 ad r5
      expect(map.hasInsertBefore(1), isTrue);
      expect(map.hasInsertBefore(5), isTrue);
      expect(map.pageCount, 8);
    });

    test('at() places inserts before given reels and ignores out of range', () {
      final ReelPageMap map = ReelPageMap(
        const ReelInserts.at(<int, InsertBuilder>{0: _ad, 2: _ad, 50: _ad}),
        4,
      );
      // ad r0 r1 ad r2 r3
      expect(map.pageCount, 6);
      expect(map.entryAt(0).isInsert, isTrue);
      expect(map.entryAt(0).reelIndex, 0);
      expect(map.pageOfReel(0), 1);
      expect(map.pageOfReel(2), 4);
      expect(map.entryAt(3).isInsert, isTrue);
    });

    test('entryAt and pageOfReel round-trip', () {
      final ReelPageMap map = ReelPageMap(const ReelInserts.every(2, _ad), 25);
      for (var page = 0; page < map.pageCount; page++) {
        final ReelPageEntry entry = map.entryAt(page);
        final int back = entry.isInsert
            ? map.pageOfInsertBefore(entry.reelIndex)!
            : map.pageOfReel(entry.reelIndex);
        expect(back, page);
      }
    });
  });
}
