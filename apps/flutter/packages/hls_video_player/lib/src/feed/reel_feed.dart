import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:hls_video_player/src/engine/hls_engine.dart';
import 'package:hls_video_player/src/feed/builders/reel_builders.dart';
import 'package:hls_video_player/src/feed/builders/reel_item.dart';
import 'package:hls_video_player/src/feed/builders/reel_labels.dart';
import 'package:hls_video_player/src/feed/builders/reel_page.dart';
import 'package:hls_video_player/src/feed/builders/reel_slot.dart';
import 'package:hls_video_player/src/feed/builders/reel_style.dart';
import 'package:hls_video_player/src/feed/reel_events.dart';
import 'package:hls_video_player/src/feed/reel_feed_controller.dart';
import 'package:hls_video_player/src/feed/reel_inserts.dart';
import 'package:hls_video_player/src/player/hls_fullscreen_view.dart';
import 'package:hls_video_player/src/player/hls_hud_binder.dart';
import 'package:hls_video_player/src/player/hls_hud_session.dart';
import 'package:hls_video_player/src/player/hls_player_port.dart';
import 'package:hls_video_player/src/player/hls_port_window.dart';
import 'package:hls_video_player/src/player/portrait_pool_overlay.dart';
import 'package:hls_video_player/src/feed/reel_feed_item.dart';

/// Describes one reel's page; runs only when that page is built.
typedef ReelItemBuilder<T extends ReelFeedItem> =
    ReelItem<T> Function(BuildContext context, ReelSlot<T> slot);

/// A vertical, full-screen reels pager, like `ListView.builder` for reels.
///
/// [items] are your models; each describes itself as a [ReelFeedItem]. The
/// feed reads them eagerly, so neighbours' players are open before you swipe.
/// [itemBuilder] runs lazily and only describes each page's UI.
///
/// ```dart
/// ReelFeed<FeedReel>(
///   items: state.feed,
///   itemBuilder: (context, slot) => ReelItem(
///     overlay: (context, slot) => Caption(slot.data),
///     curtain: (context, slot) => Unlock(onTap: () => cubit.unlock(slot.id)),
///   ),
/// )
/// ```
class ReelFeed<T extends ReelFeedItem> extends StatefulWidget {
  const ReelFeed({
    required this.items,
    this.controller,
    this.itemBuilder,
    this.style = const ReelStyle(),
    this.labels = const ReelLabels(),
    this.header,
    this.footer,
    this.showHud = false,
    this.hudFor,
    this.onTap,
    this.onDoubleTap,
    this.onLongPressStart,
    this.onLongPressEnd,
    this.inserts = const ReelInserts.none(),
    this.onEvent,
    this.onEndReached,
    this.endReachedThreshold = 3,
    this.active,
    this.emptyBuilder,
    this.physics,
    super.key,
  }) : assert(endReachedThreshold >= 0);

  /// The reels, straight from your state. A new list updates the feed; players
  /// are kept by id, and unchanged elements are not read again.
  final List<T> items;

  /// Feed-level control from outside the pages. Optional; one is created when
  /// null.
  final ReelFeedController<T>? controller;

  /// One reel's page. Null gives every reel the default page.
  final ReelItemBuilder<T>? itemBuilder;

  /// Where and whether the package's parts show; a `ReelItem` can override it.
  final ReelStyle style;

  /// Screen reader names for the package's controls; a `ReelItem` can
  /// override them.
  final ReelLabels labels;

  /// Over the whole feed, e.g. a title and a points pill. Fills the feed;
  /// align its content yourself.
  final ReelFeedLayerBuilder<T>? header;

  /// Like [header], painted above it.
  final ReelFeedLayerBuilder<T>? footer;

  /// Debug overlay on every reel: live players, cache and network telemetry.
  final bool showHud;

  /// Shows the debug overlay only while a reel it returns true for is on
  /// screen, e.g. `(slot) => slot.index == 2`.
  final ReelSlotPredicate<T>? hudFor;

  /// Tap on the reel on screen. Null toggles play.
  final ReelGestureCallback<T>? onTap;

  /// Double tap on the reel on screen, e.g. like. Setting it makes single
  /// taps wait about 300 ms to rule out a second tap; leave it null otherwise.
  final ReelGestureCallback<T>? onDoubleTap;

  final ReelGestureCallback<T>? onLongPressStart;
  final ReelSlotCallback<T>? onLongPressEnd;

  /// Pages between reels, such as ads. Reel indexes never shift for them.
  final ReelInserts inserts;

  /// Analytics: focus, first frame, watch time, loops, stalls, errors.
  final ValueChanged<ReelEvent<T>>? onEvent;

  /// Called once per feed length when the user is within
  /// [endReachedThreshold] reels of the end. Load the next page here.
  final VoidCallback? onEndReached;

  final int endReachedThreshold;

  /// Whether the feed may play. Null follows `TickerMode`, so a hidden tab
  /// pauses on its own. Players stay open either way.
  final bool? active;

  /// Shown when the feed has no items.
  final WidgetBuilder? emptyBuilder;

  final ScrollPhysics? physics;

  @override
  State<ReelFeed<T>> createState() => _ReelFeedState<T>();
}

class _ReelFeedState<T extends ReelFeedItem> extends State<ReelFeed<T>>
    implements ReelFeedAttachment<T> {
  late PageController _pages;
  late ReelPageMap _map;
  final HlsHudTelemetry _telemetry = HlsHudTelemetry();
  final OverlayPortalController _fullscreen = OverlayPortalController();
  HlsPortWindow? _window;
  int? _statsFocus;
  int _revision = 0;
  int _builtRevision = -1;
  int _endReachedFor = -1;
  bool _activeScheduled = false;
  bool _attached = false;

  // One HUD panel for the whole feed. The key moves the same element and
  // State into whichever page is focused; a second copy would throw.
  final GlobalKey _hudPanelKey = GlobalKey(debugLabel: 'ReelFeed HUD panel');

  // The panel for the focused page this build, or null when hidden.
  Widget? _pageHud;

  // Used when the host passes no controller; created and disposed here.
  ReelFeedController<T>? _owned;

  ReelFeedController<T> get _feed =>
      widget.controller ?? (_owned ??= ReelFeedController<T>());

  @override
  void initState() {
    super.initState();
    // Items first, so the window and the first page know them from the start.
    _feed.syncItems(widget.items, notify: false);
    scheduleMicrotask(_feed.notifyItemsChanged);
    _map = ReelPageMap(widget.inserts, _feed.length);
    _pages = PageController(initialPage: _pageOfCurrent());
    _revision = _feed.itemsRevision;
    SchedulerBinding.instance.addPostFrameCallback((_) => _checkEndReached());
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // Reading TickerMode here makes a hidden tab rebuild this state.
    final bool visible = TickerMode.valuesOf(context).enabled;
    if (!_attached) {
      // Attached here, not in initState, so a feed built in a hidden tab
      // knows before its first player that it must not play.
      _attached = true;
      _feed.prepareActive(active: widget.active ?? visible);
      _attach(_feed);
      _telemetry.start(HlsEngine.instance.nativeBridge);
      _refreshFocusedStats();
    }
    _scheduleActiveSync();
  }

  @override
  void didUpdateWidget(ReelFeed<T> oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (!identical(oldWidget.controller, widget.controller)) {
      final ReelFeedController<T> previous = oldWidget.controller ?? _owned!;
      _detach(previous);
      if (widget.controller != null && identical(previous, _owned)) {
        _owned = null;
        previous.dispose();
      }
      _feed.syncItems(widget.items, notify: false);
      _attach(_feed);
      _map = ReelPageMap(widget.inserts, _feed.length);
      _revision = _feed.itemsRevision;
      _jumpToCurrentAfterFrame();
      // A controller used before was left inactive when it was detached.
      _scheduleActiveSync();
    } else if (!identical(oldWidget.items, widget.items)) {
      // Silent while building; listeners outside the feed hear after it.
      _feed.syncItems(widget.items, notify: false);
      scheduleMicrotask(_feed.notifyItemsChanged);
      _itemsChanged();
    }
    if (!identical(oldWidget.inserts, widget.inserts)) {
      _map = ReelPageMap(widget.inserts, _feed.length);
      _jumpToCurrentAfterFrame();
    }
    if (oldWidget.active != widget.active) {
      _scheduleActiveSync();
    }
  }

  @override
  void dispose() {
    _detach(_feed);
    _owned?.dispose();
    _pages.dispose();
    unawaited(_telemetry.stop());
    super.dispose();
  }

  void _attach(ReelFeedController<T> feed) {
    feed
      ..attach(this)
      ..addListener(_onFeed);
    _window = feed.portWindow?..addListener(_onWindow);
  }

  void _detach(ReelFeedController<T> feed) {
    feed
      ..removeListener(_onFeed)
      ..detach(this);
    _window?.removeListener(_onWindow);
    _window = null;
  }

  // Deferred a frame: changing the feed notifies other widgets, which is not
  // allowed while this one is building.
  void _scheduleActiveSync() {
    if (_activeScheduled) {
      return;
    }
    _activeScheduled = true;
    SchedulerBinding.instance.addPostFrameCallback((_) {
      _activeScheduled = false;
      if (mounted) {
        _feed.setActive(
          active: widget.active ?? TickerMode.valuesOf(context).enabled,
        );
      }
    });
  }

  void _onFeed() {
    if (!mounted) {
      return;
    }
    _itemsChanged();
    if (_feed.isFullscreen != _fullscreen.isShowing) {
      _feed.isFullscreen ? _fullscreen.show() : _fullscreen.hide();
    }
    setState(() {});
  }

  void _itemsChanged() {
    if (_revision == _feed.itemsRevision) {
      return;
    }
    _revision = _feed.itemsRevision;
    _map = ReelPageMap(widget.inserts, _feed.length);
    _jumpToCurrentAfterFrame();
    // A page that arrived still inside the threshold asks for the next one.
    SchedulerBinding.instance.addPostFrameCallback((_) => _checkEndReached());
  }

  // HUD stats refresh on window changes, the same trigger as HlsReelPager, so
  // the cache walk never lands in the middle of a swipe.
  void _onWindow() {
    if (mounted && _statsFocus != _window?.focusedIndex) {
      _refreshFocusedStats();
    }
  }

  void _refreshFocusedStats() {
    final HlsPortWindow? w = _window;
    if (w == null || _feed.isEmpty) {
      return;
    }
    final int focus = w.focusedIndex.clamp(0, _feed.length - 1);
    _statsFocus = focus;
    if (_feed.isPlayableAt(focus)) {
      unawaited(
        _telemetry.refreshStats(
          HlsEngine.instance.nativeBridge,
          _feed.masterUriAt(focus),
        ),
      );
    }
  }

  int _pageOfCurrent() {
    if (_feed.isEmpty) {
      return 0;
    }
    final int reel = _feed.currentIndex;
    return _feed.isOnInsert
        ? _map.pageOfInsertBefore(reel) ?? _map.pageOfReel(reel)
        : _map.pageOfReel(reel);
  }

  // Items or inserts before the current reel shift its page; keep it on screen.
  void _jumpToCurrentAfterFrame() {
    SchedulerBinding.instance.addPostFrameCallback((_) {
      if (!mounted || !_pages.hasClients || _feed.isEmpty) {
        return;
      }
      final int page = _pageOfCurrent();
      if (_pages.page?.round() != page) {
        _pages.jumpToPage(page);
      }
    });
  }

  void _onPageChanged(int page) {
    final ReelPageEntry entry = _map.entryAt(page);
    _feed.focusPage(
      reelIndex: entry.reelIndex,
      isInsert: entry.isInsert,
      pageIndex: page,
    );
    _checkEndReached();
  }

  void _checkEndReached() {
    final VoidCallback? onEndReached = widget.onEndReached;
    // An empty feed counts as at its end, so the first page can load here.
    if (!mounted || onEndReached == null) {
      return;
    }
    final int length = _feed.length;
    if (_endReachedFor != length &&
        _feed.currentIndex >= length - 1 - widget.endReachedThreshold) {
      _endReachedFor = length;
      onEndReached();
    }
  }

  @override
  void jumpToReel(int index) {
    _whenBuilt(() => _pages.jumpToPage(_map.pageOfReel(index)));
  }

  @override
  Future<void> animateToReel(int index, Duration duration, Curve curve) {
    final Completer<void> done = Completer<void>();
    _whenBuilt(() async {
      await _animateToPage(_map.pageOfReel(index), duration, curve);
      done.complete();
    }, orElse: done.complete);
    return done.future;
  }

  // Reduced motion jumps instead of animating.
  Future<void> _animateToPage(int page, Duration duration, Curve curve) async {
    if (MediaQuery.maybeDisableAnimationsOf(context) ?? false) {
      _pages.jumpToPage(page);
      return;
    }
    await _pages.animateToPage(page, duration: duration, curve: curve);
  }

  // Right after the items change the PageView still has the old page count
  // and would clamp the target, so wait for the rebuild.
  void _whenBuilt(VoidCallback action, {VoidCallback? orElse}) {
    if (_pages.hasClients && _builtRevision == _feed.itemsRevision) {
      action();
      return;
    }
    SchedulerBinding.instance.addPostFrameCallback((_) {
      if (mounted && _pages.hasClients) {
        action();
      } else {
        orElse?.call();
      }
    });
  }

  @override
  Future<void> movePage(int delta, Duration duration, Curve curve) async {
    if (!_pages.hasClients || _map.pageCount == 0) {
      return;
    }
    final int from = _pages.page?.round() ?? _pageOfCurrent();
    final int to = (from + delta).clamp(0, _map.pageCount - 1);
    if (to != from) {
      await _animateToPage(to, duration, curve);
    }
  }

  @override
  void onEvent(ReelEvent<T> event) => widget.onEvent?.call(event);

  @override
  bool get isMounted => mounted;

  int? _findChildIndex(Key key) {
    return switch (key) {
      _ReelPageKey(:final String value) when _feed.indexOf(value) >= 0 =>
        _map.pageOfReel(_feed.indexOf(value)),
      _InsertPageKey(:final int value) => _map.pageOfInsertBefore(value),
      _ => null,
    };
  }

  Widget _buildPage(BuildContext context, int page) {
    final ReelPageEntry entry = _map.entryAt(page);
    final int reelIndex = entry.reelIndex;
    if (entry.isInsert) {
      final ReelInsertSlot slot = ReelInsertSlot(
        pageIndex: page,
        beforeReel: reelIndex,
        isFocused: _feed.isOnInsert && _feed.currentIndex == reelIndex,
      );
      return KeyedSubtree(
        key: _InsertPageKey(reelIndex),
        child: _map.builderBefore(reelIndex)!(context, slot),
      );
    }
    final ReelHandle<T> reel = _feed[reelIndex];
    return KeyedSubtree(
      key: _ReelPageKey(reel.id),
      child: _reelPage(context, reel, isFullscreen: false),
    );
  }

  Widget _reelPage(
    BuildContext context,
    ReelHandle<T> reel, {
    required bool isFullscreen,
  }) {
    final ReelSlot<T> slot = ReelSlot<T>(
      reel: reel,
      insets: widget.style.insetsFor(MediaQuery.paddingOf(context)),
      isFullscreen: isFullscreen,
    );
    return ReelPage<T>(
      reel: reel,
      hud: isFullscreen || !reel.isFocused ? null : _pageHud,
      item: widget.itemBuilder?.call(context, slot) ?? ReelItem<T>(),
      style: widget.style,
      labels: widget.labels,
      onTap: widget.onTap,
      onDoubleTap: widget.onDoubleTap,
      onLongPressStart: widget.onLongPressStart,
      onLongPressEnd: widget.onLongPressEnd,
      isFullscreen: isFullscreen,
    );
  }

  ReelSlot<T>? _currentSlot(BuildContext context) {
    final ReelHandle<T>? current = _feed.current;
    return current == null
        ? null
        : ReelSlot<T>(
            reel: current,
            insets: widget.style.insetsFor(MediaQuery.paddingOf(context)),
          );
  }

  // Feed-wide HUD, or only while a reel the predicate picks is on screen.
  bool _showsHud(ReelSlot<T>? current) {
    if (widget.showHud) {
      return true;
    }
    final ReelSlotPredicate<T>? pick = widget.hudFor;
    return pick != null && current != null && pick(current);
  }

  // Header and footer fill the feed over every page.
  List<Widget> _feedLayers(BuildContext context, ReelSlot<T>? slot) {
    final ReelFeedLayerBuilder<T>? header = widget.header;
    final ReelFeedLayerBuilder<T>? footer = widget.footer;
    if (header == null && footer == null) {
      return const <Widget>[];
    }
    return <Widget>[
      if (header?.call(context, slot) case final Widget built)
        Positioned.fill(child: built),
      if (footer?.call(context, slot) case final Widget built)
        Positioned.fill(child: built),
    ];
  }

  Widget _buildFullscreen(BuildContext context) {
    final ReelHandle<T>? reel = _feed.current;
    if (reel == null) {
      return const SizedBox.shrink();
    }
    // The same item builder, with `slot.isFullscreen` set.
    return HlsFullscreenView(
      child: _reelPage(context, reel, isFullscreen: true),
    );
  }

  // The live-players tracker: one widget, over every page and the header.
  Widget _hudTracker(HlsPortWindow w) {
    return Positioned(
      top: 0,
      left: 0,
      right: 0,
      child: SafeArea(
        bottom: false,
        child: PortraitPoolOverlay(
          focusedIndex: w.focusedIndex,
          windowRadius: w.windowRadius,
          ports: <int, HlsPlayerPort>{
            for (final MapEntry<String, HlsPlayerPort> e in w.ports.entries)
              if (_feed.indexOf(e.key) >= 0) _feed.indexOf(e.key): e.value,
          },
          openErrors: <int, String>{
            for (final MapEntry<String, String> e in w.openErrors.entries)
              if (_feed.indexOf(e.key) >= 0) _feed.indexOf(e.key): e.value,
          },
        ),
      ),
    );
  }

  // The telemetry panel. Always under [_hudPanelKey], so it exists once.
  Widget _hudPanel(HlsPortWindow w) {
    return KeyedSubtree(
      key: _hudPanelKey,
      child: SafeArea(
        top: false,
        child: HlsHudBinder(
          session: _telemetry.session,
          port: w.focusedPort,
          playRequested: w.playRequested,
          // What the reel on screen hears, its own override included.
          muted: _feed.current?.isMuted ?? w.muted,
          openError: w.errorAt(w.focusedIndex),
          // Only the reel on screen's traffic, not its neighbours' prefetch.
          // A locked reel has no traffic, so its HUD is empty, not borrowed.
          assetId: _feed.isEmpty ? null : _feed.assetIdAt(w.focusedIndex),
          onTogglePlay: () => _feed.current?.togglePlay(),
          onToggleMute: () => _feed.current?.toggleMute(),
          onClearCache: () => unawaited(_clearCache()),
        ),
      ),
    );
  }

  Future<void> _clearCache() {
    final Uri master = _feed.isEmpty
        ? Uri.parse('https://invalid.invalid/')
        : _feed.masterUriAt(_feed.currentIndex);
    return _telemetry.clearCache(
      bridge: HlsEngine.instance.nativeBridge,
      masterUri: master,
      clear: () => HlsEngine.instance.nativeBridge.clearCache(),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_feed.isEmpty) {
      return widget.emptyBuilder?.call(context) ??
          const ColoredBox(color: Colors.black);
    }
    _builtRevision = _feed.itemsRevision;
    final HlsPortWindow? w = _window;
    final ReelSlot<T>? current = _currentSlot(context);
    final bool hud = w != null && _showsHud(current);
    // The panel sits in the focused page, under its controls.
    _pageHud = hud ? _hudPanel(w) : null;
    final Widget pages = PageView.builder(
      controller: _pages,
      scrollDirection: Axis.vertical,
      physics: widget.physics,
      itemCount: _map.pageCount,
      onPageChanged: _onPageChanged,
      findChildIndexCallback: _findChildIndex,
      itemBuilder: _buildPage,
    );
    return PopScope(
      // Back leaves fullscreen first instead of leaving the screen.
      canPop: !_feed.isFullscreen,
      onPopInvokedWithResult: (bool didPop, _) {
        if (!didPop && _feed.isFullscreen) {
          _feed.exitFullscreen();
        }
      },
      child: OverlayPortal(
        controller: _fullscreen,
        overlayLocation: OverlayChildLocation.rootOverlay,
        overlayChildBuilder: _buildFullscreen,
        child: Stack(
          fit: StackFit.expand,
          children: <Widget>[
            pages,
            ..._feedLayers(context, current),
            if (hud) _hudTracker(w),
          ],
        ),
      ),
    );
  }
}

class _ReelPageKey extends ValueKey<String> {
  const _ReelPageKey(super.value);
}

class _InsertPageKey extends ValueKey<int> {
  const _InsertPageKey(super.value);
}
