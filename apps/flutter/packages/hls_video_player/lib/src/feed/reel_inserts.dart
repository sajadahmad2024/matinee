import 'package:flutter/widgets.dart';
import 'package:meta/meta.dart';

/// Builds one insert page, such as an ad.
typedef InsertBuilder =
    Widget Function(BuildContext context, ReelInsertSlot slot);

/// Where an insert page sits and whether it is on screen.
class ReelInsertSlot {
  const ReelInsertSlot({
    required this.pageIndex,
    required this.beforeReel,
    required this.isFocused,
  });

  final int pageIndex;

  /// Index of the reel that follows this insert.
  final int beforeReel;

  final bool isFocused;
}

/// Non-video pages placed between reels. They never shift reel indexes:
/// `feed[3]` is always the fourth reel.
///
/// While an insert is on screen every reel is paused and the next reel is
/// kept ready, so swiping on from an insert plays at once.
///
/// ```dart
/// inserts: ReelInserts.every(5, (context, slot) => const AdCard()),
/// ```
sealed class ReelInserts {
  const ReelInserts();

  /// No inserts.
  const factory ReelInserts.none() = NoReelInserts;

  /// An insert after every [every] reels. The first comes after [startAfter]
  /// reels, which defaults to [every].
  const factory ReelInserts.every(
    int every,
    InsertBuilder builder, {
    int? startAfter,
  }) = EveryReelInserts;

  /// Inserts before the given reel indexes: `{3: adBuilder}` puts one
  /// between reel 2 and reel 3.
  const factory ReelInserts.at(Map<int, InsertBuilder> builders) =
      AtReelInserts;
}

final class NoReelInserts extends ReelInserts {
  const NoReelInserts();
}

final class EveryReelInserts extends ReelInserts {
  const EveryReelInserts(this.every, this.builder, {int? startAfter})
    : assert(every >= 1, 'ReelInserts.every needs every >= 1.'),
      assert(
        startAfter == null || startAfter >= 1,
        'ReelInserts.every needs startAfter >= 1; an insert before the '
        'first reel is ReelInserts.at({0: builder}).',
      ),
      _startAfter = startAfter;

  final int every;
  final InsertBuilder builder;
  final int? _startAfter;

  int get startAfter => _startAfter ?? every;
}

final class AtReelInserts extends ReelInserts {
  const AtReelInserts(this.builders);

  final Map<int, InsertBuilder> builders;
}

/// One page of the feed: a reel or an insert before [reelIndex].
@internal
class ReelPageEntry {
  const ReelPageEntry({required this.reelIndex, required this.isInsert});

  final int reelIndex;
  final bool isInsert;
}

/// Maps page indexes to reels and inserts, and back.
///
/// Inserts only sit before an existing reel, so the last page is always a
/// reel and the reel after an insert can be kept ready.
@internal
class ReelPageMap {
  ReelPageMap(this.inserts, this.length)
    : _atKeys = switch (inserts) {
        AtReelInserts(:final Map<int, InsertBuilder> builders) =>
          builders.keys.where((int k) => k >= 0 && k < length).toList()..sort(),
        _ => const <int>[],
      };

  final ReelInserts inserts;
  final int length;
  final List<int> _atKeys;

  int get pageCount => length == 0 ? 0 : pageOfReel(length - 1) + 1;

  int pageOfReel(int reelIndex) => reelIndex + _insertsUpTo(reelIndex);

  /// Page of the insert before [reelIndex], or null when there is none.
  int? pageOfInsertBefore(int reelIndex) =>
      hasInsertBefore(reelIndex) ? pageOfReel(reelIndex) - 1 : null;

  bool hasInsertBefore(int reelIndex) {
    if (reelIndex < 0 || reelIndex >= length) {
      return false;
    }
    return switch (inserts) {
      NoReelInserts() => false,
      final EveryReelInserts e =>
        reelIndex >= e.startAfter && (reelIndex - e.startAfter) % e.every == 0,
      AtReelInserts(:final Map<int, InsertBuilder> builders) =>
        builders.containsKey(reelIndex),
    };
  }

  InsertBuilder? builderBefore(int reelIndex) {
    if (!hasInsertBefore(reelIndex)) {
      return null;
    }
    return switch (inserts) {
      NoReelInserts() => null,
      final EveryReelInserts e => e.builder,
      AtReelInserts(:final Map<int, InsertBuilder> builders) =>
        builders[reelIndex],
    };
  }

  ReelPageEntry entryAt(int page) {
    assert(page >= 0 && page < pageCount, 'page $page out of $pageCount');
    // Smallest reel whose page is at or after [page].
    int lo = 0;
    int hi = length - 1;
    while (lo < hi) {
      final int mid = (lo + hi) >> 1;
      if (pageOfReel(mid) >= page) {
        hi = mid;
      } else {
        lo = mid + 1;
      }
    }
    return ReelPageEntry(reelIndex: lo, isInsert: pageOfReel(lo) != page);
  }

  // Inserts placed before reels 0..reelIndex.
  int _insertsUpTo(int reelIndex) {
    return switch (inserts) {
      NoReelInserts() => 0,
      final EveryReelInserts e =>
        reelIndex < e.startAfter
            ? 0
            : (reelIndex - e.startAfter) ~/ e.every + 1,
      AtReelInserts() => _upperBound(_atKeys, reelIndex),
    };
  }

  static int _upperBound(List<int> sorted, int value) {
    int lo = 0;
    int hi = sorted.length;
    while (lo < hi) {
      final int mid = (lo + hi) >> 1;
      if (sorted[mid] <= value) {
        lo = mid + 1;
      } else {
        hi = mid;
      }
    }
    return lo;
  }
}
