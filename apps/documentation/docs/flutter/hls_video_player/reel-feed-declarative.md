# ReelFeed: Declarative Items and ReelItem — Implementation Plan

> A reshaping of the ReelFeed API. **Data** moves from the controller onto the items themselves, and **page UI**
> moves from a feed-wide `builders:` object into a `ListView.builder`-style `itemBuilder` that returns a
> `ReelItem`. Only ownership and boundaries change: playback, the player window, instant start on swipe, caching,
> prefetch, analytics, the HUD and every visible behaviour stay exactly the same.
>
> **Status:** Implemented. Where the build differs from this plan, §10 says so.
> **Builds on:** [ReelFeed API](./reel-feed-api.md), [ReelFeed Builders](./reel-feed-builders.md).

---

## 1. Non-negotiables

| # | Rule | How it is enforced |
|---|---|---|
| 1 | **Instant playback on swipe** | Data is given eagerly (`items`), so the window opens and prefetches ±2 reels before their pages exist. Builders are lazy and only draw. Tested (§7) |
| 2 | **Zero functional change** | Every public behaviour maps one-to-one to the new shape (§4). One internal pipeline (`_mutate`) serves the new data path |
| 3 | **Zero regression** | Pre-existing tests unedited; parity native-call sequences byte-identical; assertions of the ReelFeed API tests kept one-to-one (§7) |
| 4 | **One source of truth for data** | The app state owns items; the controller only sees the attached feed's list |

---

## 2. The shape

```dart
ReelFeed<FeedReel>(
  controller: feed,                         // optional
  items: state.feed,                        // eager; FeedReel implements ReelFeedItem
  style: ReelStyle(scrim: context.appColors.overlay.hero),   // feed-wide default
  labels: ReelLabels(togglePlay: l10n.reelsTogglePlayAction, ...),
  header: (context, current) => _Header(showPoints: !(current?.isLocked ?? false)),
  itemBuilder: (context, slot) => ReelItem(  // lazy; visuals only
    overlay: (context, slot) => _RailAndMeta(slot: slot, onShare: share),
    curtain: (context, slot) => _Curtain(onUnlock: () => cubit.unlock(slot.id)),
    fullscreenIcon: (context, slot, state) => const Icon(Icons.screen_rotation_rounded),
  ),
)
```

### 2.1 Three owners

| Owner | Holds | When it is read |
|---|---|---|
| **Item** (`ReelFeedItem`) | `id`, `source`, `isLocked` | Eagerly, for every item: window, prefetch, diffing, lock enforcement |
| **`ReelItem`** (from `itemBuilder`) | Page UI for one reel: layers, icons, effects, per-item style/labels override, custom page | Lazily, when that page is built |
| **`ReelFeed`** | Feed-wide: `items`, `style`/`labels` defaults, `header`, `footer`, HUD, `inserts`, gestures, `onEvent`, `onEndReached`, `active`, `emptyBuilder`, `physics` | On feed build |
| **`ReelFeedController`** (optional) | Config and feed commands: window, autoplay, muted, connectivity, progress interval, initial index; `jumpTo`, `next`, `previous`, `current`, `muted`, fullscreen, `events` | Any time; a read-only view of the attached feed's list |

### 2.2 `ReelFeedItem`

```dart
abstract interface class ReelFeedItem {
  /// Stable and unique; players, handles and focus are kept by it.
  String get id;

  /// What plays; null means no player and no cache.
  ReelSource? get source;

  /// Locked: no player, no cache, and the curtain shows.
  bool get isLocked;
}
```

`ReelFeed<T extends ReelFeedItem>`. There are no `id`/`source`/`locked` callbacks: the item describes itself, so the
UI cannot compute them and they are pure by construction.

### 2.3 `ReelItem`

`ReelItem`'s parameters are today's `ReelBuilders` page fields, unchanged in meaning and in rebuild kind:

```dart
const ReelItem({
  // data layers
  ReelSlotBuilder? background, thumbnail, video, scrim, overlay, curtain, aboveCurtain,
  // tick layers
  ReelTickBuilder? controls, status, loading, error, seekBar, timer, playIcon, muteIcon, fullscreenIcon,
  // effects
  ReelEffectBuilder? tapEffect, doubleTapEffect, longPressEffect,
  // per-item overrides of the feed defaults
  ReelStyle? style,
  ReelLabels? labels,
});

/// A custom page from the package's layers; the curtain is still enforced.
const ReelItem.custom({required ReelPageBuilder page, ReelStyle? style, ReelLabels? labels});
```

- `itemBuilder` is typed `ReelItem Function(BuildContext, ReelSlot<T>)`, so every page keeps the package's fixed
  layers, gestures, single HUD panel and curtain enforcement.
- `ReelItem.custom` is the one escape hatch for other page geometries. The hand-built widgets (`ReelVideo`,
  `ReelControls`, `ReelTapToPlay`, `ReelStateBuilder`) remain available inside it.
- Fullscreen calls the same `itemBuilder` with `slot.isFullscreen == true`, and uses the fullscreen layer subset as
  today.

---

## 3. Instant playback, stated precisely

Today, and after this change:

1. `items` arrive on `ReelFeed` at build. `syncItems` derives every item's `source`/`isLocked` synchronously and
   hands the window its list before the first page is laid out.
2. On a swipe, `onPageChanged` calls `window.sync()` synchronously, which plays the already-open neighbour before
   its first `await`. Nothing in this path reads `itemBuilder` or `ReelItem`.
3. `itemBuilder` runs only when `PageView` builds a page (the visible page and about one on each side). It never
   decides which players exist, when they open or what they play.

What would break rule 1, and is therefore **rejected**: an `itemCount`-only API, or `source`/`locked` inside
`ReelItem`. Both would open a reel's player only once its page is built, which removes the ±2 preloading.

---

## 4. Before and after, one to one

### 4.1 Package API map

| Before | After | Behaviour |
|---|---|---|
| `ReelFeedController(items:, id:, source:, locked:, …config)` | `ReelFeedController(…config)` + `ReelFeed(items:)` with `T extends ReelFeedItem` | Same |
| `feed.update / add / addAll / insert / removeAt / replaceAll` | Emit a new `items` list | Same (`_mutate`) |
| `feed.refresh(i) / refreshAll()` / `slot.refresh()` | Emit the changed item(s) | Same |
| `ReelFeed(builders: ReelBuilders(overlay: …, …))` | `ReelFeed(itemBuilder: (c, s) => ReelItem(overlay: …, …))` | Same layers, same rebuild kinds |
| `ReelBuilders.page` | `ReelItem.custom(page:)` | Same, curtain still enforced |
| `ReelBuilders.header / footer` | `ReelFeed.header / footer` | Same |
| `ReelBuilders.showHud` (predicate) | `ReelFeed.hudFor` (predicate); `ReelFeed.showHud` unchanged | Same; one HUD panel, one tracker |
| `ReelFeed.itemBuilder(context, handle)` (free-form page) | `ReelItem.custom(page: (c, s, layers) => …)` | Same widgets available; curtain now enforced there too |
| `ReelFeed.fullscreenBuilder` | `itemBuilder` with `slot.isFullscreen` | Same view, same port |
| `ReelFeed(style:, labels:)` | Same, as defaults; `ReelItem(style:, labels:)` overrides per item | Same when not overridden |
| `ReelHandle` commands, `ReelSlot` (minus `refresh`), `ReelStyle`, `ReelLabels`, events, inserts, gestures, `active`, `onEndReached` | Unchanged | Same |
| Controller required | Optional; `ReelFeed` owns one when none is passed | Same |

### 4.2 App: v2 before and after

**Before**

```dart
class _FeedState extends State<_Feed> {
  final _unlockedReelIds = <String>{};

  late final ReelFeedController<Reel> _feed = ReelFeedController<Reel>(
    items: _supported(widget.reels),
    id: (reel) => reel.id,
    source: toReelSource,
    locked: (reel) => reel.isExclusive && !_unlockedReelIds.contains(reel.id),
  );

  @override
  void didUpdateWidget(_Feed oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.reels != widget.reels) {
      _feed.replaceAll(_supported(widget.reels));
    }
  }

  @override
  void dispose() {
    _feed.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ReelFeed<Reel>(
      controller: _feed,
      style: ReelStyle(scrim: context.appColors.overlay.hero),
      labels: ReelLabels(...),
      builders: ReelBuilders<Reel>(
        overlay: (context, slot) => _RailAndMeta(slot: slot, onShare: () => unawaited(_share())),
        curtain: (context, slot) => _Curtain(slot: slot, onUnlock: () {
          _unlockedReelIds.add(slot.id);
          slot.refresh();
        }),
        fullscreenIcon: (context, slot, state) => const Icon(Icons.screen_rotation_rounded, size: AppIconSize.md),
        header: (context, current) => _Header(pointsBalance: widget.pointsBalance, showPoints: !(current?.isLocked ?? false)),
      ),
    );
  }
}
```

**After**

```dart
@override
Widget build(BuildContext context) {
  return ReelFeed<FeedReel>(
    items: feed,
    style: ReelStyle(scrim: context.appColors.overlay.hero),
    labels: ReelLabels(...),
    header: (context, current) => _Header(pointsBalance: pointsBalance, showPoints: !(current?.isLocked ?? false)),
    itemBuilder: (context, slot) => ReelItem(
      overlay: (context, slot) => _RailAndMeta(slot: slot, onShare: () => unawaited(_share(context))),
      curtain: (context, slot) => _Curtain(
        slot: slot,
        onUnlock: () => unawaited(context.read<ReelsFeedCubit>().unlock(slot.id)),
      ),
      fullscreenIcon: (context, slot, state) => const Icon(Icons.screen_rotation_rounded, size: AppIconSize.md),
    ),
  );
}
```

No controller, no `didUpdateWidget`, no `dispose`, no filtering, no mapping and no session set in the widget.

### 4.3 App: data layer

A v2-only cubit, so v1's `ReelsCubit`, its state and its tests stay untouched until v1 is removed.

> **Update:** v1 is removed. `ReelsCubit` and its state went with it; `ReelsFeedCubit` keeps its name.

```dart
@freezed
abstract class FeedReel with _$FeedReel implements ReelFeedItem {
  const factory FeedReel({required Reel reel, required ReelSource source, required bool isLocked}) = _FeedReel;
  const FeedReel._();

  @override
  String get id => reel.id;
}

class ReelsFeedCubit extends SafeCubit<ReelsFeedState> {
  ReelsFeedCubit(this._repository) : super(const ReelsFeedState.initial());

  final ReelsRepository _repository;

  Future<void> load() async {
    emit(const ReelsFeedState.loading());
    try {
      final (reels, points) = await (_repository.fetchReelsFeed(), _repository.fetchPointsBalance()).wait;
      emit(ReelsFeedState.success(
        feed: [for (final r in reels.where(isPlayableReel)) FeedReel(reel: r, source: toReelSource(r), isLocked: r.isExclusive)],
        pointsBalance: points,
      ));
    } on AppException catch (e) {
      emit(ReelsFeedState.failure(e));
    }
  }

  // Session unlock until an unlock API exists; only that element changes.
  Future<void> unlock(String id) async {
    final state = this.state;
    if (state is! ReelsFeedSuccess) return;
    emit(state.copyWith(feed: [for (final f in state.feed) f.id == id ? f.copyWith(isLocked: false) : f]));
  }
}
```

---

## 5. How behaviour stays identical inside the package

### 5.1 One pipeline

`ReelFeed` calls `controller.syncItems(items)` on attach and when `items` changes. It feeds the same `_mutate` the
removed methods used, so these run the same code as today:
- focus, handles and players kept by id;
- `window.updateItems` / `reopen` when a source changes;
- analytics sessions: `ReelLeft` for a removed reel, a new session for a feed that was empty;
- the page jump when items are inserted before the current reel;
- `onEndReached`.

### 5.2 Same cost as the removed methods

Elements are compared by identity against the previous list. An element `identical` to the previous one with the
same id reuses its derived entry; only changed or new elements are read again.

| Emit | Read again | Matches before |
|---|---|---|
| Append a page | New items only | `addAll` |
| Unlock one reel (`copyWith` one element) | That one | `update` / `refresh` |
| Same list, widget rebuilt | None, no window call | — |
| Fully new list | All | `replaceAll` |

### 5.3 Where each old field goes inside

| Old | New home | Change |
|---|---|---|
| `ReelBuilders<T>` page fields | `ReelItem` fields | Moved; `ReelLayers` reads them the same way |
| `ReelPage` | Takes the resolved `ReelItem` plus feed defaults | Internal |
| Single HUD panel `GlobalKey` | Unchanged; still handed to the focused page only | None |
| `ReelScope` (style, labels for pieces) | Per page: `item.style ?? feed.style` | Same values when not overridden |

---

## 6. Things deliberately not changing

- Native code, the cache, prefetch, reachability, `HlsPortWindow` behaviour.
- `HlsReelPager`, `HlsVideoPlayer`, the old barrel, v1 `ReelsScreen`, `ReelsCubit`.
- HUD attribution, one HUD panel and one tracker.
- Gestures stay feed-level callbacks (`onTap`, `onDoubleTap`, long press), as today.

---

## 7. No-regression gate

| Check | Rule |
|---|---|
| Tests that existed before the ReelFeed work | Pass **unedited** |
| Parity tests (`HlsReelPager` vs `ReelFeed`, builders parity) | Drivers push lists instead of calling `addAll`; **expected native call sequences stay byte-identical** |
| ReelFeed API, builders, edge-case and HUD tests from this effort | Migrated mechanically (construction, `builders:` → `itemBuilder`, mutations → pushed lists). **Every assertion kept one-to-one**; a changed or dropped assertion needs sign-off |
| New: instant playback | The players for reels +1 and +2 are open **before `itemBuilder` has ever run for them**, and a swipe plays the neighbour in the same call as today |
| New: data path | Identity reuse (`source` read only for changed items); the same list makes no window call; an unlock emitted by the cubit plays the reel on screen |
| New: shape | `itemBuilder` + `ReelItem` gives the same layer order; per-item `style` override applies to that page only; `ReelItem.custom` without a curtain on a locked reel still shows it |
| New: controller | Optional controller; reads before attach return empty/null |
| App | `ReelsFeedCubit` `blocTest`s, failure path included; v2 widget tests keep their assertions, including the accessibility guideline test; `flutter analyze --fatal-infos` clean |
| Review | `/code-review` at high effort; findings fixed before done |

---

## 8. Phases

| # | Phase | Output | Gate |
|---|---|---|---|
| 0 | Approve this plan | Sign-off | — |
| 1 | `ReelFeedItem`, `ReelFeed(items:)`, `syncItems` with identity reuse, optional controller; old controller data API kept temporarily | Both paths compile | Full suite green, unchanged |
| 2 | `ReelItem` + `itemBuilder`; `header`/`footer`/`hudFor` on `ReelFeed`; `ReelBuilders` kept temporarily | Both shapes render the same page | Instant-playback test green |
| 3 | Migrate tests and parity drivers to the new shape | Same assertions | Parity sequences identical |
| 4 | Remove the old data API (`items` on controller, mutations, `slot.refresh`) and `ReelBuilders` / free-form `itemBuilder` | One path | Full suite green |
| 5 | App: `FeedReel`, `ReelsFeedCubit` (+ tests), v2 on the new shape | v1 untouched | App suite green |
| 6 | Examples, README, docs | New shape everywhere | Examples analyze clean |
| 7 | `/code-review`, fixes | Done | All gates |

---

## 9. Risks

| Risk | Mitigation |
|---|---|
| Losing instant playback | Data eager by construction; dedicated test that neighbours open before their pages are built |
| A cubit that rebuilds every element on each emit | Correct, at `replaceAll` cost; v2's cubit replaces only what changed |
| Per-item `style` differences across pages | Only that page's pieces read it; feed-wide parts (HUD, header) use the feed default |
| Test migration hides a regression | Assertions kept one-to-one, and parity sequences must match byte for byte |

---

## 10. Implementation notes

### Differences from the plan

- **`ReelItem.custom` also takes the layer builders.** A custom page reuses the package's `layers.*`, and those read
  the item's builders (`layers.curtain` shows `curtain`), so `custom` accepts the same optional builders plus the
  required `page`.
- **On a custom page the package always places the curtain and the HUD panel itself, on top.** `layers.curtain` and
  `layers.hud` are empty there. Detecting whether a page used them broke when a page read them inside a nested
  builder: the check ran before the read, which doubled the HUD (a duplicate `GlobalKey`) or the curtain.
- **`ReelItem` is a description, not a widget.** `itemBuilder` returns it, and the package builds the page from it,
  so a page can never skip the package's layers.
- **Old and new shapes were not kept side by side.** Nothing was released, so the old data API and `ReelBuilders`
  were removed in the same pass, and the tests were migrated against the recorded baseline instead.

### Verified

| Check | Result |
|---|---|
| Pre-existing package and app tests | Unedited, passing |
| Parity (native call sequences vs `HlsReelPager`), both drivers | Identical |
| Migrated ReelFeed test files, test and `expect(` counts vs baseline | Identical in every file, except one test (below) |
| New tests | Neighbours open before their pages are built; a swipe plays the already-open player; no controller; controller before attach; same list makes no window call; unlock from state plays; per-item style |
| App | `ReelsFeedCubit` `blocTest`s (load, failure, unlock, unlock before load); v2 widget tests, including the accessibility guideline test |
| Totals | Package 393 passing (1 vendored skip); app 748 passing; analyzers clean |

### Code review

`/code-review` at high effort found 10 issues. Seven are fixed with regression tests in
`test/feed/reel_feed_robustness_test.dart`, one is deliberate, and one is pre-existing and left alone. Two
more issues were found while fixing them.

| Finding | Fix |
|---|---|
| An open still running after the 2 s rebuild wait was dropped, leaving the reel stuck "opening" | The window opens the reel's current item when an older open was superseded. Only this edge case changes; parity is unchanged |
| A new descriptor (auth token, DRM, cache policy) for the same URL did not count as a change | Re-read items compare their descriptors deeply, and a change reopens the player |
| A custom page reading `layers.hud` / `layers.curtain` inside a nested builder got two | The package places them itself on custom pages (above) |
| The HUD mute showed and toggled the feed, not the reel's override | It uses the reel's effective mute and `toggleMute` |
| A list change notified handle state during a build | Silent sync and handle detach both defer their notification; a mutation check shows the test fails without the fix |
| A failure after `retry()` was not reported | Retry re-arms error reporting |
| A HUD shown anew kept the reel's old TTFF | A new HUD panel measures again |
| `items` copied the list on every read | An unmodifiable view, O(1) |
| *Found while fixing:* a feed moved in the tree hit the one-controller assert | A new feed takes over; a post-frame debug check still asserts if two stay attached |
| *Found while fixing:* a custom page returning null doubled the curtain and HUD | Null returns the default page alone |
| v2 duplicates v1 | Deliberate: v1 stays frozen for comparison and is deleted at the switch |
| iOS emits download progress twice | Pre-existing, in the iOS download path that is not tested here; left alone |

### One test dropped, for sign-off

`itemBuilder and builders together assert` checked a runtime assert against mixing the free-form `itemBuilder` with
`ReelBuilders`. That mix no longer exists: `itemBuilder` is typed to return a `ReelItem`, so the misuse is now a
compile error, which is a stronger guarantee than the assert it replaced.

### Not verified yet

Device QA on v2 (unchanged list from the ReelFeed plan §10.5), since this reshaping changed no native code.
