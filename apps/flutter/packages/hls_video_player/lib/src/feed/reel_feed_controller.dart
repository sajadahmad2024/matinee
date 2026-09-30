import 'dart:async';
import 'dart:collection';

import 'package:collection/collection.dart' show DeepCollectionEquality;

import 'package:flutter/foundation.dart';
import 'package:flutter/scheduler.dart';
import 'package:flutter/widgets.dart';
import 'package:hls_video_player/src/engine/hls_engine.dart';
import 'package:hls_video_player/src/feed/reel_analytics.dart';
import 'package:hls_video_player/src/feed/reel_events.dart';
import 'package:hls_video_player/src/feed/reel_feed_item.dart';
import 'package:hls_video_player/src/feed/reel_playback_state.dart';
import 'package:hls_video_player/src/feed/reel_source.dart';
import 'package:hls_video_player/src/feed/reel_video.dart';
import 'package:hls_video_player/src/feed/reel_window.dart';
import 'package:hls_video_player/src/player/hls_connectivity.dart';
import 'package:hls_video_player/src/player/hls_player_port.dart';
import 'package:hls_video_player/src/player/hls_player_snapshot.dart';
import 'package:hls_video_player/src/player/hls_port_window.dart';
import 'package:hls_video_player/src/player/hls_reel_item.dart';

part 'reel_handle.dart';

/// Feed-level control of a `ReelFeed`: playback settings, navigation,
/// fullscreen and analytics.
///
/// Optional, like a `ScrollController`: pass one when something outside the
/// pages needs control, create it in `initState` and dispose it in `dispose`.
/// It never owns the items; `ReelFeed.items` does, and the controller sees
/// the list of the feed it is attached to.
///
/// ```dart
/// late final feed = ReelFeedController<FeedReel>(muted: false);
///
/// ReelFeed<FeedReel>(controller: feed, items: state.feed);
///
/// feed.current?.pause();
/// feed.jumpTo(3);
/// ```
class ReelFeedController<T extends ReelFeedItem> extends ChangeNotifier {
  /// Creates a controller. [initialIndex] is the reel shown first.
  ReelFeedController({
    this.window = const ReelWindow(),
    this.autoplay = true,
    this._muted = true,
    this.connectivity,
    this.progressInterval = const Duration(seconds: 5),
    int initialIndex = 0,
  }) : assert(initialIndex >= 0, 'initialIndex must be 0 or more.') {
    _currentIndex = initialIndex;
    _playIntent = autoplay;
    _analytics = ReelAnalytics<T>(
      emit: _emit,
      progressInterval: progressInterval,
    );
  }

  /// How many native players are kept around the focused reel.
  final ReelWindow window;

  /// Optional network source; when it reports back online, players that were
  /// cache-only are rebuilt at the same position.
  final HlsConnectivity? connectivity;

  /// How often [ReelProgress] is sent while a reel is watched.
  final Duration progressInterval;

  /// Play intent every newly focused reel starts with. Changing it never
  /// tears down players.
  bool autoplay;

  List<T> _items = <T>[];
  List<T> _itemsView = UnmodifiableListView<T>(<T>[]);
  List<HlsReelItem> _hls = const <HlsReelItem>[];
  List<bool> _locked = const <bool>[];
  Map<String, int> _indexById = <String, int>{};
  final Map<String, ReelHandle<T>> _handles = <String, ReelHandle<T>>{};

  HlsPortWindow? _window;
  bool _muted;
  final Map<String, bool> _pendingMuteOverrides = <String, bool>{};

  late int _currentIndex;
  String? _lastFocusedId;
  bool _onInsert = false;
  int? _insertPage;
  Duration _insertShownAt = Duration.zero;
  late bool _playIntent;
  bool _active = true;
  bool _fullscreen = false;
  bool _disposed = false;
  int _itemsRevision = 0;

  ReelFeedAttachment<T>? _attachment;
  late final ReelAnalytics<T> _analytics;
  final StreamController<ReelEvent<T>> _events =
      StreamController<ReelEvent<T>>.broadcast(sync: true);
  final List<(ReelEvent<T>, ReelFeedAttachment<T>?)> _pendingEvents =
      <(ReelEvent<T>, ReelFeedAttachment<T>?)>[];

  // Items: a read-only view of the attached feed's list.

  /// The attached feed's items, in order. Empty before a feed attaches.
  List<T> get items => _itemsView;

  int get length => _items.length;

  bool get isEmpty => _items.isEmpty;

  /// The handle for reel [index]. The same reel always returns the same
  /// handle, until it leaves the list.
  ReelHandle<T> operator [](int index) {
    RangeError.checkValidIndex(index, _items, 'index', _items.length);
    final String id = _hls[index].id;
    return _handles.putIfAbsent(id, () => ReelHandle<T>._(this, id));
  }

  /// The handle for the reel with [id], or null when it is not in the feed.
  ReelHandle<T>? byId(String id) {
    final int? index = _indexById[id];
    return index == null ? null : this[index];
  }

  /// Index of the reel with [id], or -1.
  int indexOf(String id) => _indexById[id] ?? -1;

  // Focus and navigation.

  /// The reel on screen, or null while an insert is on screen.
  ReelHandle<T>? get current =>
      _onInsert || _items.isEmpty ? null : this[_currentIndex];

  /// Index of the reel on screen; while an insert shows, the reel after it.
  int get currentIndex => _currentIndex;

  /// Whether an insert page, not a reel, is on screen.
  bool get isOnInsert => _onInsert;

  /// Shows reel [index] without animation.
  void jumpTo(int index) {
    RangeError.checkValidIndex(index, _items, 'index', _items.length);
    final ReelFeedAttachment<T>? attachment = _attachment;
    if (attachment != null) {
      attachment.jumpToReel(index);
    } else {
      _focus(index, isInsert: false, pageIndex: null);
    }
  }

  /// Scrolls to reel [index].
  Future<void> animateTo(
    int index, {
    Duration duration = const Duration(milliseconds: 300),
    Curve curve = Curves.easeOut,
  }) async {
    RangeError.checkValidIndex(index, _items, 'index', _items.length);
    final ReelFeedAttachment<T>? attachment = _attachment;
    if (attachment == null) {
      jumpTo(index);
      return;
    }
    await attachment.animateToReel(index, duration, curve);
  }

  /// Scrolls to the next page, which may be an insert.
  Future<void> next({
    Duration duration = const Duration(milliseconds: 300),
    Curve curve = Curves.easeOut,
  }) async => _attachment?.movePage(1, duration, curve);

  /// Scrolls to the previous page, which may be an insert.
  Future<void> previous({
    Duration duration = const Duration(milliseconds: 300),
    Curve curve = Curves.easeOut,
  }) async => _attachment?.movePage(-1, duration, curve);

  // Playback.

  /// Mute for every reel that has no `mutedOverride`.
  bool get muted => _window?.muted ?? _muted;

  set muted(bool value) {
    final HlsPortWindow? w = _window;
    if (w == null) {
      _muted = value;
    } else {
      unawaited(w.setMuted(value));
    }
    _changed();
  }

  void toggleMute() => muted = !muted;

  /// False while the feed is hidden (another tab, [ReelFeed.active] false).
  /// Players stay open, so showing it again plays at once.
  bool get isActive => _active;

  /// Whether the current reel is shown fullscreen.
  bool get isFullscreen => _fullscreen;

  /// Shows the current reel fullscreen, turned landscape on a portrait
  /// screen. Uses the same player, so playback does not restart.
  void enterFullscreen() {
    if (_fullscreen || current == null) {
      return;
    }
    _fullscreen = true;
    _changed();
  }

  void exitFullscreen() {
    if (!_fullscreen) {
      return;
    }
    _fullscreen = false;
    _changed();
  }

  void toggleFullscreen() => _fullscreen ? exitFullscreen() : enterFullscreen();

  // Analytics.

  /// Every analytics event, the same ones `ReelFeed.onEvent` receives.
  ///
  /// Events are delivered after the current frame work, never inside a
  /// swipe, so a slow listener cannot delay playback.
  Stream<ReelEvent<T>> get events => _events.stream;

  @override
  void dispose() {
    if (_disposed) {
      return;
    }
    _analytics.leave();
    _flushEvents();
    _disposed = true;
    _window
      ?..removeListener(_onWindow)
      ..dispose();
    _window = null;
    for (final ReelHandle<T> handle in _handles.values) {
      final int? i = _indexById[handle.id];
      handle._detach(i == null ? null : _items[i]);
    }
    _handles.clear();
    unawaited(_events.close());
    super.dispose();
  }

  // Internal API for ReelFeed and the package widgets.

  /// The native player window, once a `ReelFeed` has attached.
  @internal
  HlsPortWindow? get portWindow => _window;

  /// Changes whenever the item list changes.
  @internal
  int get itemsRevision => _itemsRevision;

  /// Whether reel [index] has a source.
  @internal
  bool isPlayableAt(int index) => _hls[index].playable;

  /// Whether reel [index] is locked.
  @internal
  bool isLockedAt(int index) => _locked[index];

  /// Master URI registered for reel [index].
  @internal
  Uri masterUriAt(int index) => _hls[index].masterUri;

  /// Asset id native events carry for reel [index].
  @internal
  String assetIdAt(int index) =>
      _hls[index].effectiveDescriptor.assetId.toString();

  /// A new feed takes over: when a feed moves in the tree, Flutter mounts the
  /// new one before it unmounts the old one.
  @internal
  void attach(ReelFeedAttachment<T> attachment) {
    assert(!_disposed, 'ReelFeedController was used after dispose().');
    final ReelFeedAttachment<T>? previous = _attachment;
    assert(() {
      if (previous != null && !identical(previous, attachment)) {
        SchedulerBinding.instance.addPostFrameCallback((_) {
          assert(
            !previous.isMounted,
            'This ReelFeedController is attached to two ReelFeeds at once. '
            'Use one controller per ReelFeed.',
          );
        });
      }
      return true;
    }());
    _attachment = attachment;
    _start();
  }

  /// Detaches without notifying: it runs while the widget tree is locked.
  @internal
  void detach(ReelFeedAttachment<T> attachment) {
    if (!identical(_attachment, attachment) || _disposed) {
      return;
    }
    _setActive(active: false, notify: false);
    _attachment = null;
    scheduleMicrotask(() {
      if (!_disposed) {
        _changed();
      }
    });
  }

  /// Sets whether the feed may play before it first attaches, so a feed
  /// built in a hidden tab never starts a player or a session.
  @internal
  void prepareActive({required bool active}) {
    if (_window == null) {
      _active = active;
    }
  }

  @internal
  void setActive({required bool active}) =>
      _setActive(active: active, notify: true);

  /// Takes the attached feed's list. Elements identical to the previous
  /// list's element with the same id are not read again.
  ///
  /// [notify] false leaves listeners alone, for calls made while widgets
  /// build; `ReelFeed` then notifies after the frame.
  @internal
  void syncItems(List<T> items, {bool notify = true}) {
    _mutate(() {
      _items = List<T>.of(items);
      _itemsView = UnmodifiableListView<T>(_items);
    }, notify: notify);
  }

  /// Notifies listeners and handle state, after a silent [syncItems] made
  /// while building.
  @internal
  void notifyItemsChanged() => _changed();

  /// Called by `ReelFeed` when a page settles past half way.
  @internal
  void focusPage({
    required int reelIndex,
    required bool isInsert,
    required int pageIndex,
  }) {
    _focus(reelIndex, isInsert: isInsert, pageIndex: pageIndex);
  }

  void _start() {
    if (_window != null) {
      return;
    }
    final HlsEngine engine = HlsEngine.instance;
    final HlsPortWindow w = HlsPortWindow(
      items: _hls,
      windowRadius: window.radius,
      nativeBridge: engine.nativeBridge,
      playerFactory: engine.playerFactory,
      connectivity: connectivity,
      playRequested: _effectivePlay,
      muted: _muted,
    );
    for (final MapEntry<String, bool> entry in _pendingMuteOverrides.entries) {
      unawaited(w.setMutedOverride(entry.key, entry.value));
    }
    _pendingMuteOverrides.clear();
    _window = w..addListener(_onWindow);
    unawaited(w.initialize(focusedIndex: _currentIndex));
    _startSession(fromIndex: null);
    _refreshHandles();
  }

  void _focus(
    int reelIndex, {
    required bool isInsert,
    required int? pageIndex,
  }) {
    if (_items.isEmpty ||
        (reelIndex == _currentIndex && isInsert == _onInsert)) {
      return;
    }
    _endSession();
    _fullscreen = false;
    _currentIndex = reelIndex;
    _onInsert = isInsert;
    _insertPage = isInsert ? pageIndex : null;
    // Pause belongs to the reel that was paused; each new reel starts fresh.
    _playIntent = autoplay;
    final HlsPortWindow? w = _window;
    if (w != null) {
      // Same order as HlsReelPager: sync sets focus and plays it before its
      // first await, so the swipe starts playback in this call.
      w.playRequested = _effectivePlay;
      unawaited(w.sync(focusedIndex: reelIndex));
    }
    _changed();
    final int from = _lastFocusedId == null ? -1 : indexOf(_lastFocusedId!);
    _startSession(fromIndex: from < 0 ? null : from);
  }

  void _startSession({required int? fromIndex}) {
    if (_window == null || !_active || _items.isEmpty) {
      return;
    }
    if (_onInsert) {
      _insertShownAt = ReelAnalytics.now();
      _emit(InsertShown<T>(pageIndex: _insertPage!, beforeReel: _currentIndex));
      return;
    }
    _analytics.focus(this[_currentIndex], fromIndex: fromIndex);
    _analytics.bind(_window?.portFor(_hls[_currentIndex].id));
    _lastFocusedId = _hls[_currentIndex].id;
  }

  void _endSession() {
    if (_onInsert && _insertPage != null && _active) {
      _emit(
        InsertLeft<T>(
          pageIndex: _insertPage!,
          beforeReel: _currentIndex,
          shownFor: ReelAnalytics.now() - _insertShownAt,
        ),
      );
    }
    _analytics.leave();
  }

  void _setActive({required bool active, required bool notify}) {
    if (_active == active) {
      return;
    }
    if (!active) {
      _endSession();
    }
    _active = active;
    if (active) {
      _startSession(fromIndex: null);
    }
    _applyEffectivePlay();
    if (notify) {
      _changed();
    }
  }

  bool get _effectivePlay => _playIntent && _active && !_onInsert;

  void _applyEffectivePlay() {
    final HlsPortWindow? w = _window;
    final bool play = _effectivePlay;
    if (w != null && w.playRequested != play) {
      w.playRequested = play;
      unawaited(w.applyPlayback());
    }
  }

  void _mutate(VoidCallback change, {bool notify = true}) {
    final String? currentId = _items.isEmpty ? null : _hls[_currentIndex].id;
    final List<T> previousItems = _items;
    final List<HlsReelItem> before = _hls;
    final List<bool> previousLocked = _locked;
    final Map<String, int> previousIndex = _indexById;
    // Removed handles keep their last model, so late events can read it.
    final Map<String, T> lastData = <String, T>{
      for (final String id in _handles.keys)
        if (previousIndex[id] case final int i) id: previousItems[i],
    };
    change();
    final Set<String> rederived = _derive(
      previousItems,
      before,
      previousLocked,
      previousIndex,
    );
    // Same URL but new auth, DRM or cache settings still needs a new player.
    final Set<String> descriptorChanged = <String>{
      for (final String id in rederived)
        if (previousIndex[id] case final int was)
          if (_descriptorChanged(before[was], _hls[_indexById[id]!])) id,
    };
    final bool windowChanged =
        !sameHlsReelFeed(before, _hls) || descriptorChanged.isNotEmpty;
    final Set<String> reopen = windowChanged
        ? <String>{..._sourceChanged(before, _hls), ...descriptorChanged}
        : const <String>{};
    if (!windowChanged && _sameItems(previousItems)) {
      return;
    }
    _itemsRevision++;
    final int? kept = currentId == null ? null : _indexById[currentId];
    final bool currentRemoved = currentId != null && kept == null;
    final bool firstItems = before.isEmpty && _items.isNotEmpty;
    if (currentRemoved) {
      _endSession();
    }
    _handles.removeWhere((String id, ReelHandle<T> handle) {
      final bool gone = !_indexById.containsKey(id);
      if (gone) {
        handle._detach(lastData[id]);
      }
      return gone;
    });
    if (_items.isEmpty) {
      _currentIndex = 0;
      _onInsert = false;
    } else if (kept != null) {
      _currentIndex = kept;
    } else if (currentRemoved || firstItems) {
      // A removed reel's neighbour, or the first reel of a feed that was empty.
      _currentIndex = _currentIndex.clamp(0, _items.length - 1);
      _onInsert = false;
      _playIntent = autoplay;
    }
    final HlsPortWindow? w = _window;
    if (w != null && windowChanged) {
      w.playRequested = _effectivePlay;
      unawaited(_updateWindow(w, _hls, reopen));
    }
    // After the window has the new items, so the session binds the right port.
    if ((currentRemoved || firstItems) && _items.isNotEmpty) {
      _startSession(fromIndex: null);
    }
    // Silent while building: handle state updates with the deferred notify,
    // so listeners outside the feed never change during a build.
    if (notify) {
      _changed();
    }
  }

  static bool _descriptorChanged(HlsReelItem previous, HlsReelItem next) =>
      previous.playable &&
      next.playable &&
      !const DeepCollectionEquality().equals(
        previous.effectiveDescriptor.toChannelMap(),
        next.effectiveDescriptor.toChannelMap(),
      );

  bool _sameItems(List<T> previous) {
    if (previous.length != _items.length) {
      return false;
    }
    for (int i = 0; i < previous.length; i++) {
      if (!identical(previous[i], _items[i])) {
        return false;
      }
    }
    return true;
  }

  // updateItems swaps the window's items before its first await, so callers
  // that run after this call already see them.
  static Future<void> _updateWindow(
    HlsPortWindow w,
    List<HlsReelItem> items,
    Set<String> reopen,
  ) async {
    await w.updateItems(items);
    if (reopen.isNotEmpty) {
      await w.reopen(reopen);
    }
  }

  // Ids kept across the change whose URI or descriptor changed: the window
  // keeps ports by id, so their old players would go on playing the old stream.
  static Set<String> _sourceChanged(
    List<HlsReelItem> before,
    List<HlsReelItem> after,
  ) {
    final Map<String, HlsReelItem> old = <String, HlsReelItem>{
      for (final HlsReelItem item in before) item.id: item,
    };
    return <String>{
      for (final HlsReelItem item in after)
        if (old[item.id] case final HlsReelItem previous)
          if (_sourceSwapped(previous, item)) item.id,
    };
  }

  static bool _sourceSwapped(HlsReelItem previous, HlsReelItem next) =>
      previous.playable && next.playable && !previous.sameFeedIdentity(next);

  // Derives the window's view of every item. An element identical to the
  // previous one with its id reuses that entry, so appending a page or
  // replacing one element reads only what changed.
  // Returns the ids that were read again.
  Set<String> _derive(
    List<T> previousItems,
    List<HlsReelItem> previousHls,
    List<bool> previousLocked,
    Map<String, int> previousIndex,
  ) {
    final Set<String> rederived = <String>{};
    final List<HlsReelItem> hls = <HlsReelItem>[];
    final List<bool> locked = <bool>[];
    final Map<String, int> indexById = <String, int>{};
    for (int i = 0; i < _items.length; i++) {
      final T item = _items[i];
      final String id = item.id;
      assert(
        !indexById.containsKey(id),
        'Duplicate reel id "$id". Every ReelFeedItem needs a unique, stable id.',
      );
      indexById[id] = i;
      final int? was = previousIndex[id];
      if (was != null && identical(previousItems[was], item)) {
        hls.add(previousHls[was]);
        locked.add(previousLocked[was]);
        continue;
      }
      rederived.add(id);
      final ReelSource? source = item.source;
      final bool isLocked = item.isLocked;
      locked.add(isLocked);
      hls.add(
        HlsReelItem(
          id: id,
          masterUri: source?.masterUri ?? Uri(scheme: 'reel-feed', path: id),
          data: item,
          descriptor: source?.descriptor,
          // The window only sees `playable`; locking needs no window change.
          playable: source != null && !isLocked,
        ),
      );
    }
    _hls = List<HlsReelItem>.unmodifiable(hls);
    _locked = List<bool>.unmodifiable(locked);
    _indexById = indexById;
    return rederived;
  }

  void _onWindow() {
    if (_disposed) {
      return;
    }
    if (!_onInsert && _active && _items.isNotEmpty) {
      final HlsPortWindow w = _window!;
      final String id = _hls[_currentIndex].id;
      _analytics.bind(w.portFor(id));
      final String? error = w.errorFor(id);
      if (error != null) {
        _analytics.openError(error);
      }
    }
    _changed();
  }

  void _changed() {
    if (_disposed) {
      return;
    }
    _refreshHandles();
    notifyListeners();
  }

  void _refreshHandles() {
    for (final ReelHandle<T> handle in _handles.values) {
      handle._refresh();
    }
  }

  bool _isFocusedIndex(int index) =>
      index >= 0 && !_onInsert && _items.isNotEmpty && index == _currentIndex;

  bool _isMutedFor(String id) =>
      _window?.isMutedFor(id) ?? _pendingMuteOverrides[id] ?? _muted;

  bool? _mutedOverrideFor(String id) =>
      _window?.mutedOverrideFor(id) ?? _pendingMuteOverrides[id];

  void _setMutedOverride(String id, bool? value) {
    final HlsPortWindow? w = _window;
    if (w != null) {
      unawaited(w.setMutedOverride(id, value));
    } else if (value == null) {
      _pendingMuteOverrides.remove(id);
    } else {
      _pendingMuteOverrides[id] = value;
    }
    _changed();
  }

  bool _setPlayIntent(ReelHandle<T> reel, {required bool play}) {
    if (!_isFocusedIndex(reel.index)) {
      return false;
    }
    if (_playIntent == play) {
      return true;
    }
    _playIntent = play;
    _applyEffectivePlay();
    _changed();
    final Duration position = reel.state.value.position;
    _emit(
      play
          ? ReelPlayed<T>(reel, position: position)
          : ReelPaused<T>(reel, position: position),
    );
    return true;
  }

  bool _seek(ReelHandle<T> reel, Duration position) {
    final HlsPlayerPort? port = reel.port;
    if (port == null) {
      return false;
    }
    if (_isFocusedIndex(reel.index)) {
      _analytics.noteSeek(position);
    }
    unawaited(port.seekTo(position));
    return true;
  }

  bool _retry(ReelHandle<T> reel) {
    final HlsPortWindow? w = _window;
    if (w == null || reel.index < 0) {
      return false;
    }
    if (_isFocusedIndex(reel.index)) {
      _analytics.noteRetry();
    }
    if (w.errorFor(reel.id) != null) {
      unawaited(w.retry(reel.id));
      return true;
    }
    if (w.portFor(reel.id)?.snapshot.hasError ?? false) {
      unawaited(w.reopen(<String>{reel.id}));
      return true;
    }
    return false;
  }

  // Delivered in one microtask so host listeners never run inside a swipe.
  void _emit(ReelEvent<T> event) {
    if (_disposed) {
      return;
    }
    // The attachment is captured now, so a feed closing still gets its last
    // events, such as the final ReelLeft.
    _pendingEvents.add((event, _attachment));
    if (_pendingEvents.length == 1) {
      scheduleMicrotask(_flushEvents);
    }
  }

  void _flushEvents() {
    if (_pendingEvents.isEmpty) {
      return;
    }
    final List<(ReelEvent<T>, ReelFeedAttachment<T>?)> batch =
        List<(ReelEvent<T>, ReelFeedAttachment<T>?)>.of(_pendingEvents);
    _pendingEvents.clear();
    for (final (ReelEvent<T> event, ReelFeedAttachment<T>? sink) in batch) {
      sink?.onEvent(event);
      if (!_events.isClosed) {
        _events.add(event);
      }
    }
  }
}

/// What a `ReelFeed` exposes to its controller.
@internal
abstract interface class ReelFeedAttachment<T extends ReelFeedItem> {
  /// Whether this feed is still in the tree.
  bool get isMounted;

  void jumpToReel(int index);

  Future<void> animateToReel(int index, Duration duration, Curve curve);

  Future<void> movePage(int delta, Duration duration, Curve curve);

  void onEvent(ReelEvent<T> event);
}
