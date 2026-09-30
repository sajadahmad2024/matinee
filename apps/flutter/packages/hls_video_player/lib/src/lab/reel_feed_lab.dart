import 'dart:async';

import 'package:flutter/material.dart';
import 'package:hls_video_player/reels.dart';
import 'package:hls_video_player/src/player/hls_reel_catalog.dart';

/// One lab reel: a public HLS stream that describes itself to the feed.
@immutable
class LabReel implements ReelFeedItem {
  const LabReel({
    required this.id,
    required this.master,
    required this.title,
    this.isLocked = false,
    this.noSource = false,
    this.likes = 0,
  });

  @override
  final String id;
  final Uri master;
  final String title;

  @override
  final bool isLocked;

  /// Simulates a reel still processing: no source, so no player.
  final bool noSource;

  final int likes;

  @override
  ReelSource? get source => noSource ? null : ReelSource.hls(master);

  LabReel copyWith({bool? isLocked, bool? noSource, int? likes}) => LabReel(
    id: id,
    master: master,
    title: title,
    isLocked: isLocked ?? this.isLocked,
    noSource: noSource ?? this.noSource,
    likes: likes ?? this.likes,
  );
}

/// Every part of the ReelFeed API, live: a feed of public HLS streams and a
/// panel that changes each field while it plays.
///
/// Brings its own [MaterialApp], so its chips, sheets and snackbars work in a
/// host whose app is built on another Material library.
class ReelFeedLab extends StatelessWidget {
  const ReelFeedLab({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(brightness: Brightness.dark, colorSchemeSeed: Colors.amber),
      home: const _LabScreen(),
    );
  }
}

class _LabScreen extends StatefulWidget {
  const _LabScreen();

  @override
  State<_LabScreen> createState() => _ReelFeedLabState();
}

class _ReelFeedLabState extends State<_LabScreen> {
  static final List<Uri> _masters = HlsReelCatalog.fixtures().masters;

  // Data: the lab's state, as a cubit's would be.
  late List<LabReel> _items = _page(0);
  int _pages = 1;

  // Controller config.
  int _radius = 2;
  late ReelFeedController<LabReel> _feed = _newController();

  // Style.
  BoxFit _fit = BoxFit.contain;
  ReelBarPlacement _seekBar = ReelBarPlacement.bottom;
  ReelControlPosition _timer = ReelControlPosition.bar;
  ReelControlPosition _fullscreen = ReelControlPosition.bar;
  bool _centreControls = true;
  bool _scrim = true;
  int _effectMs = 600;

  // Page builders.
  bool _thumbnail = true;
  bool _overlay = true;
  bool _curtain = true;
  bool _aboveCurtain = true;
  bool _customControlsOnFirst = false;
  bool _customStatus = false;
  bool _customSeekTrack = false;
  bool _customTimer = false;
  bool _customIcons = false;
  bool _customPageOnSecond = true;
  bool _itemStyleOnThird = true;

  // Gestures.
  bool _customTap = false;
  bool _doubleTap = true;
  bool _tapEffect = true;
  bool _longPress = true;

  // Feed.
  bool _inserts = true;
  bool _pagination = true;
  bool _header = true;
  bool _footer = true;
  bool _showHud = false;
  bool _hudOnFirstOnly = false;
  bool? _active;
  bool _customLabels = false;

  // Events.
  final List<String> _log = <String>[];
  bool _showLog = true;
  bool _disposing = false;

  static List<LabReel> _page(int page) => <LabReel>[
    for (var i = 0; i < _masters.length; i++)
      LabReel(
        id: 'p$page-$i',
        master: _masters[i],
        title: 'Reel ${page * _masters.length + i + 1}',
        // One locked reel per page shows the curtain.
        isLocked: i == 3,
      ),
  ];

  ReelFeedController<LabReel> _newController() => ReelFeedController<LabReel>(window: ReelWindow(radius: _radius));

  @override
  void dispose() {
    _disposing = true;
    _feed.dispose();
    super.dispose();
  }

  void _setRadius(int radius) {
    final ReelFeedController<LabReel> old = _feed;
    setState(() {
      _radius = radius;
      _feed = _newController();
    });
    // After the frame, once the feed has moved to the new controller.
    WidgetsBinding.instance.addPostFrameCallback((_) => old.dispose());
  }

  void _edit(String id, LabReel Function(LabReel reel) change) => setState(() {
    _items = <LabReel>[for (final LabReel r in _items) r.id == id ? change(r) : r];
  });

  void _toast(String message) {
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(SnackBar(content: Text(message), duration: const Duration(seconds: 1)));
  }

  void _onEvent(ReelEvent<LabReel> event) {
    final String line = switch (event) {
      ReelFocused(:final ReelHandle<LabReel> reel, :final int? fromIndex) =>
        'focus ${reel.data.title} (from ${fromIndex ?? '-'})',
      ReelFirstFrame(:final ReelHandle<LabReel> reel, :final Duration timeToFirstFrame) =>
        'first frame ${reel.data.title} ${timeToFirstFrame.inMilliseconds} ms',
      ReelPlayed(:final ReelHandle<LabReel> reel) => 'played ${reel.data.title}',
      ReelPaused(:final ReelHandle<LabReel> reel) => 'paused ${reel.data.title}',
      ReelBufferingStarted(:final ReelHandle<LabReel> reel) => 'stall ${reel.data.title}',
      ReelBufferingEnded(:final Duration stallDuration) => 'stall ended ${stallDuration.inMilliseconds} ms',
      ReelLooped(:final ReelHandle<LabReel> reel, :final int loopCount) => 'loop $loopCount ${reel.data.title}',
      ReelProgress(:final Duration watchTime) => 'watched ${watchTime.inSeconds} s',
      ReelLeft(:final ReelHandle<LabReel> reel, :final Duration watchTime, :final bool completed) =>
        'left ${reel.data.title} after ${watchTime.inSeconds} s${completed ? ', completed' : ''}',
      ReelError(:final String message) => 'error $message',
      InsertShown(:final int beforeReel) => 'ad shown before reel ${beforeReel + 1}',
      InsertLeft(:final Duration shownFor) => 'ad left after ${shownFor.inSeconds} s',
    };
    // Disposing the controller reports the last ReelLeft while still mounted.
    if (!mounted || _disposing) {
      return;
    }
    setState(() {
      _log.insert(0, line);
      if (_log.length > 30) {
        _log.removeLast();
      }
    });
  }

  ReelStyle get _style => ReelStyle(
    fit: _fit,
    seekBar: _seekBar,
    timer: _timer,
    fullscreenButton: _fullscreen,
    centreControls: _centreControls,
    effectDuration: Duration(milliseconds: _effectMs),
    scrim: _scrim
        ? const LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: <Color>[Color(0x66000000), Colors.transparent, Color(0xAA000000)],
            stops: <double>[0, 0.4, 1],
          )
        : null,
  );

  ReelLabels get _labels => _customLabels
      ? const ReelLabels(
          togglePlay: '[lab] play or pause',
          play: '[lab] play',
          pause: '[lab] pause',
          mute: '[lab] mute',
          unmute: '[lab] unmute',
          fullscreen: '[lab] full screen',
          exitFullscreen: '[lab] exit full screen',
          retry: '[lab] retry',
          seek: '[lab] seek',
        )
      : const ReelLabels();

  ReelItem<LabReel> _itemFor(BuildContext context, ReelSlot<LabReel> slot) {
    if (_customPageOnSecond && slot.index == 1 && !slot.isFullscreen) {
      return ReelItem<LabReel>.custom(
        overlay: _overlay ? _buildOverlay : null,
        page: (BuildContext context, ReelSlot<LabReel> slot, ReelLayers<LabReel> layers) => Column(
          children: <Widget>[
            Expanded(
              child: Stack(
                fit: StackFit.expand,
                children: <Widget>[layers.video, layers.gestures, layers.overlay, layers.controls, layers.status],
              ),
            ),
            _CommentsPanel(reel: slot.data),
          ],
        ),
      );
    }
    return ReelItem<LabReel>(
      style: _itemStyleOnThird && slot.index == 2
          ? _style.copyWith(
              fit: BoxFit.cover,
              timer: ReelControlPosition.topEnd,
              fullscreenButton: ReelControlPosition.bottomEnd,
            )
          : null,
      thumbnail: _thumbnail ? (BuildContext c, ReelSlot<LabReel> s) => _Poster(title: s.data.title) : null,
      overlay: _overlay ? _buildOverlay : null,
      curtain: _curtain ? _buildCurtain : null,
      aboveCurtain: _aboveCurtain
          ? (BuildContext c, ReelSlot<LabReel> s) => s.isLocked
                ? Align(
                    alignment: Alignment.centerRight,
                    child: Padding(
                      padding: const EdgeInsets.only(right: 12),
                      child: IconButton.filledTonal(
                        tooltip: 'Share (works while locked)',
                        icon: const Icon(Icons.share),
                        onPressed: () => _toast('Shared ${s.data.title}'),
                      ),
                    ),
                  )
                : null
          : null,
      controls: _customControlsOnFirst
          ? (BuildContext c, ReelSlot<LabReel> s, ReelPlaybackState state) =>
                s.index == 0 ? _CustomControls(slot: s, state: state) : null
          : null,
      loading: _customStatus
          ? (BuildContext c, ReelSlot<LabReel> s, ReelPlaybackState state) =>
                const Align(alignment: Alignment.topCenter, child: LinearProgressIndicator())
          : null,
      error: _customStatus
          ? (BuildContext c, ReelSlot<LabReel> s, ReelPlaybackState state) => Center(
              child: FilledButton.icon(
                onPressed: s.reel.retry,
                icon: const Icon(Icons.refresh),
                label: Text('Retry: ${state.error ?? 'error'}'),
              ),
            )
          : null,
      seekBar: _customSeekTrack
          ? (BuildContext c, ReelSlot<LabReel> s, ReelPlaybackState state) => Center(
              child: LinearProgressIndicator(value: state.progress, color: Colors.amber),
            )
          : null,
      timer: _customTimer
          ? (BuildContext c, ReelSlot<LabReel> s, ReelPlaybackState state) => Text(
              '${(state.duration - state.position).inSeconds}s left',
              style: const TextStyle(color: Colors.amber, fontSize: 12),
            )
          : null,
      playIcon: _customIcons
          ? (BuildContext c, ReelSlot<LabReel> s, ReelPlaybackState state) =>
                const Icon(Icons.play_circle_fill, size: 72, color: Colors.amber)
          : null,
      muteIcon: _customIcons
          ? (BuildContext c, ReelSlot<LabReel> s, ReelPlaybackState state) =>
                Icon(state.isMuted ? Icons.music_off : Icons.music_note, size: 36, color: Colors.amber)
          : null,
      fullscreenIcon: _customIcons
          ? (BuildContext c, ReelSlot<LabReel> s, ReelPlaybackState state) =>
                const Icon(Icons.open_in_full, color: Colors.amber)
          : null,
      tapEffect: _tapEffect ? _buildTapEffect : null,
      doubleTapEffect: _doubleTap ? _buildHeart : null,
      longPressEffect: _longPress ? _buildHold : null,
    );
  }

  Widget? _buildOverlay(BuildContext context, ReelSlot<LabReel> slot) {
    return Align(
      alignment: Alignment.bottomLeft,
      child: Padding(
        padding: slot.insets.add(const EdgeInsets.fromLTRB(16, 0, 72, 16)),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Text(
              '${slot.data.title} · index ${slot.index}',
              style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
            ),
            Text('♥ ${slot.data.likes}', style: const TextStyle(color: Colors.white70)),
            // A tick layer inside a data layer: only this chip follows the player.
            ReelStateBuilder(
              reel: slot.reel,
              builder: (BuildContext context, ReelPlaybackState state) => Text(
                '${state.status.name} · ${state.position.inSeconds}/${state.duration.inSeconds}s'
                '${state.isMuted ? ' · muted' : ''}',
                style: const TextStyle(color: Colors.white54, fontSize: 12),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget? _buildCurtain(BuildContext context, ReelSlot<LabReel> slot) {
    return ColoredBox(
      color: const Color(0xDD000000),
      child: ListView(
        padding: const EdgeInsets.all(32),
        children: <Widget>[
          const SizedBox(height: 120),
          const Icon(Icons.lock, size: 56, color: Colors.amber),
          const SizedBox(height: 12),
          Text(
            '${slot.data.title} is locked',
            textAlign: TextAlign.center,
            style: const TextStyle(color: Colors.white, fontSize: 20),
          ),
          const SizedBox(height: 8),
          const Text(
            'No player and no cache until unlocked. Swipe up or down to pass it.',
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.white70),
          ),
          const SizedBox(height: 24),
          Center(
            child: FilledButton(
              onPressed: () => _edit(slot.id, (LabReel r) => r.copyWith(isLocked: false)),
              child: const Text('Unlock'),
            ),
          ),
        ],
      ),
    );
  }

  Widget? _buildTapEffect(BuildContext context, ReelSlot<LabReel> slot, ReelGestureEffect effect) {
    return Center(
      child: FadeTransition(
        opacity: ReverseAnimation(effect.animation),
        child: Icon(
          effect.state.isPlayRequested ? Icons.pause_circle : Icons.play_circle,
          size: 96,
          color: Colors.white70,
        ),
      ),
    );
  }

  Widget? _buildHeart(BuildContext context, ReelSlot<LabReel> slot, ReelGestureEffect effect) {
    return Positioned(
      left: effect.position.dx - 48,
      top: effect.position.dy - 48,
      child: FadeTransition(
        opacity: ReverseAnimation(effect.animation),
        child: ScaleTransition(
          scale: Tween<double>(begin: 0.5, end: 1.4).animate(effect.animation),
          child: const Icon(Icons.favorite, size: 96, color: Colors.pinkAccent),
        ),
      ),
    );
  }

  Widget? _buildHold(BuildContext context, ReelSlot<LabReel> slot, ReelGestureEffect effect) {
    return Align(
      alignment: Alignment.topCenter,
      child: Padding(
        padding: const EdgeInsets.only(top: 120),
        child: FadeTransition(
          opacity: effect.animation,
          child: const Chip(label: Text('Paused while held')),
        ),
      ),
    );
  }

  Widget? _buildHeader(BuildContext context, ReelSlot<LabReel>? current) {
    return Align(
      alignment: Alignment.topCenter,
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.only(top: 8),
          child: Chip(
            label: Text(
              current == null
                  ? 'Header · ad on screen'
                  : 'Header · ${current.data.title}${current.isLocked ? ' (locked)' : ''}',
            ),
          ),
        ),
      ),
    );
  }

  Widget? _buildFooter(BuildContext context, ReelSlot<LabReel>? current) {
    return Align(
      alignment: Alignment.bottomRight,
      child: Padding(
        padding: EdgeInsets.only(right: 12, bottom: (current?.insets.bottom ?? 0) + 72),
        child: Chip(label: Text('Footer · ${_feed.currentIndex + 1}/${_feed.length}')),
      ),
    );
  }

  Widget _buildAd(BuildContext context, ReelInsertSlot slot) {
    return ColoredBox(
      color: Colors.indigo,
      child: Center(
        child: Text(
          'AD\nbefore reel ${slot.beforeReel + 1}\n(the next reel is already loading)',
          textAlign: TextAlign.center,
          style: const TextStyle(color: Colors.white, fontSize: 22),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        fit: StackFit.expand,
        children: <Widget>[
          ReelFeed<LabReel>(
            key: ValueKey<int>(_radius),
            controller: _feed,
            items: _items,
            itemBuilder: _itemFor,
            style: _style,
            labels: _labels,
            header: _header ? _buildHeader : null,
            footer: _footer ? _buildFooter : null,
            showHud: _showHud,
            hudFor: _hudOnFirstOnly ? (ReelSlot<LabReel> slot) => slot.index == 0 : null,
            onTap: _customTap ? (ReelSlot<LabReel> slot, Offset p) => _toast('Custom tap on ${slot.data.title}') : null,
            onDoubleTap: _doubleTap
                ? (ReelSlot<LabReel> slot, Offset p) => _edit(slot.id, (LabReel r) => r.copyWith(likes: r.likes + 1))
                : null,
            onLongPressStart: _longPress ? (ReelSlot<LabReel> slot, Offset p) => slot.reel.pause() : null,
            onLongPressEnd: _longPress ? (ReelSlot<LabReel> slot) => slot.reel.play() : null,
            inserts: _inserts ? ReelInserts.every(4, _buildAd) : const ReelInserts.none(),
            onEvent: _onEvent,
            onEndReached: _pagination
                ? () => setState(() {
                    _items = <LabReel>[..._items, ..._page(_pages++)];
                  })
                : null,
            active: _active,
            emptyBuilder: (BuildContext context) => const Center(
              child: Text('No reels · add some in the panel', style: TextStyle(color: Colors.white)),
            ),
          ),
          if (_showLog) _EventLog(lines: _log),
          Positioned(
            left: 12,
            bottom: 96,
            child: SafeArea(
              child: FloatingActionButton.small(
                heroTag: 'reel-feed-lab',
                tooltip: 'ReelFeed controls',
                onPressed: _openPanel,
                child: const Icon(Icons.tune),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _openPanel() {
    return showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      builder: (BuildContext context) => StatefulBuilder(
        builder: (BuildContext context, StateSetter refresh) {
          void set(VoidCallback change) {
            setState(change);
            refresh(() {});
          }

          return DraggableScrollableSheet(
            expand: false,
            initialChildSize: 0.55,
            maxChildSize: 0.9,
            builder: (BuildContext context, ScrollController scroll) =>
                _Panel(scroll: scroll, children: _panelSections(set)),
          );
        },
      ),
    );
  }

  List<Widget> _panelSections(void Function(VoidCallback) set) {
    final ReelHandle<LabReel>? current = _feed.current;
    return <Widget>[
      const _Heading('Controller'),
      Wrap(
        spacing: 8,
        runSpacing: 8,
        children: <Widget>[
          _Action('Play', () => current?.play()),
          _Action('Pause', () => current?.pause()),
          _Action('Toggle', () => current?.togglePlay()),
          _Action('−10 s', () => current?.seekTo(current.state.value.position - const Duration(seconds: 10))),
          _Action('+10 s', () => current?.seekTo(current.state.value.position + const Duration(seconds: 10))),
          _Action('First', () => _feed.jumpTo(0)),
          _Action('Last', () => _feed.jumpTo(_feed.length - 1)),
          _Action('Previous', () => unawaited(_feed.previous())),
          _Action('Next', () => unawaited(_feed.next())),
          _Action('Fullscreen', _feed.enterFullscreen),
          _Action('Retry', () => current?.retry()),
          _Action('Feed mute ${_feed.muted ? 'on' : 'off'}', () => set(_feed.toggleMute)),
          _Action(
            'Reel override: ${current?.mutedOverride == null
                ? 'none'
                : current!.mutedOverride!
                ? 'muted'
                : 'unmuted'}',
            () => set(() {
              final bool? now = current?.mutedOverride;
              current?.mutedOverride = now == null ? false : (now ? null : true);
            }),
          ),
        ],
      ),
      _Switch('Autoplay each new reel', _feed.autoplay, (bool v) => set(() => _feed.autoplay = v)),
      _Choice<int>('Window radius (recreates the controller)', _radius, const <int>[0, 1, 2, 3], (int v) => '$v', (
        int v,
      ) {
        Navigator.of(context).pop();
        _setRadius(v);
      }),
      const _Heading('Data (items)'),
      Wrap(
        spacing: 8,
        runSpacing: 8,
        children: <Widget>[
          _Action(
            current?.isLocked ?? false ? 'Unlock current' : 'Lock current',
            () => set(() {
              final ReelHandle<LabReel>? r = current;
              if (r != null) {
                _items = <LabReel>[
                  for (final LabReel item in _items) item.id == r.id ? item.copyWith(isLocked: !item.isLocked) : item,
                ];
              }
            }),
          ),
          _Action(
            'Toggle source of current',
            () => set(() {
              final ReelHandle<LabReel>? r = current;
              if (r != null) {
                _items = <LabReel>[
                  for (final LabReel item in _items) item.id == r.id ? item.copyWith(noSource: !item.noSource) : item,
                ];
              }
            }),
          ),
          _Action(
            'Insert at top',
            () => set(() {
              _items = <LabReel>[
                LabReel(id: 'top-${DateTime.now().microsecondsSinceEpoch}', master: _masters[0], title: 'Inserted'),
                ..._items,
              ];
            }),
          ),
          _Action(
            'Remove current',
            () => set(() {
              _items = <LabReel>[
                for (final LabReel item in _items)
                  if (item.id != current?.id) item,
              ];
            }),
          ),
          _Action('Shuffle all', () => set(() => _items = List<LabReel>.of(_items)..shuffle())),
          _Action('Append a page', () => set(() => _items = <LabReel>[..._items, ..._page(_pages++)])),
        ],
      ),
      const _Heading('Style'),
      _Choice<BoxFit>(
        'Fit',
        _fit,
        const <BoxFit>[BoxFit.contain, BoxFit.cover],
        (BoxFit v) => v.name,
        (BoxFit v) => set(() => _fit = v),
      ),
      _Choice<ReelBarPlacement>(
        'Seek bar',
        _seekBar,
        ReelBarPlacement.values,
        (ReelBarPlacement v) => v.name,
        (ReelBarPlacement v) => set(() => _seekBar = v),
      ),
      _Choice<ReelControlPosition>(
        'Timer',
        _timer,
        ReelControlPosition.values,
        (ReelControlPosition v) => v.name,
        (ReelControlPosition v) => set(() => _timer = v),
      ),
      _Choice<ReelControlPosition>(
        'Fullscreen button',
        _fullscreen,
        ReelControlPosition.values,
        (ReelControlPosition v) => v.name,
        (ReelControlPosition v) => set(() => _fullscreen = v),
      ),
      _Switch('Centre play and mute while paused', _centreControls, (bool v) => set(() => _centreControls = v)),
      _Switch('Scrim', _scrim, (bool v) => set(() => _scrim = v)),
      _Choice<int>(
        'Effect duration',
        _effectMs,
        const <int>[300, 600, 1200],
        (int v) => '$v ms',
        (int v) => set(() => _effectMs = v),
      ),
      const _Heading('Page builders (ReelItem)'),
      _Switch('thumbnail (fades on first frame)', _thumbnail, (bool v) => set(() => _thumbnail = v)),
      _Switch('overlay (title, likes, live state)', _overlay, (bool v) => set(() => _overlay = v)),
      _Switch('curtain (on locked reels)', _curtain, (bool v) => set(() => _curtain = v)),
      _Switch('aboveCurtain (share on locked reels)', _aboveCurtain, (bool v) => set(() => _aboveCurtain = v)),
      _Switch(
        'controls: custom on reel 1 only',
        _customControlsOnFirst,
        (bool v) => set(() => _customControlsOnFirst = v),
      ),
      _Switch('loading and error: custom', _customStatus, (bool v) => set(() => _customStatus = v)),
      _Switch('seekBar: custom track', _customSeekTrack, (bool v) => set(() => _customSeekTrack = v)),
      _Switch('timer: custom text', _customTimer, (bool v) => set(() => _customTimer = v)),
      _Switch('playIcon, muteIcon, fullscreenIcon: custom', _customIcons, (bool v) => set(() => _customIcons = v)),
      const _Heading('Per item'),
      _Switch(
        'ReelItem.custom on reel 2 (video + comments)',
        _customPageOnSecond,
        (bool v) => set(() => _customPageOnSecond = v),
      ),
      _Switch(
        'ReelItem style on reel 3 (cover, corner controls)',
        _itemStyleOnThird,
        (bool v) => set(() => _itemStyleOnThird = v),
      ),
      const _Heading('Gestures'),
      _Switch('onTap: custom (instead of play/pause)', _customTap, (bool v) => set(() => _customTap = v)),
      _Switch('tapEffect', _tapEffect, (bool v) => set(() => _tapEffect = v)),
      _Switch('onDoubleTap + heart (single tap waits ~300 ms)', _doubleTap, (bool v) => set(() => _doubleTap = v)),
      _Switch('onLongPress: pause while held + effect', _longPress, (bool v) => set(() => _longPress = v)),
      const _Heading('Feed'),
      _Switch('inserts: an ad every 4 reels', _inserts, (bool v) => set(() => _inserts = v)),
      _Switch('onEndReached: load the next page', _pagination, (bool v) => set(() => _pagination = v)),
      _Switch('header', _header, (bool v) => set(() => _header = v)),
      _Switch('footer', _footer, (bool v) => set(() => _footer = v)),
      _Switch('showHud: every reel', _showHud, (bool v) => set(() => _showHud = v)),
      _Switch('hudFor: reel 1 only', _hudOnFirstOnly, (bool v) => set(() => _hudOnFirstOnly = v)),
      _Choice<bool?>(
        'active',
        _active,
        const <bool?>[null, true, false],
        (bool? v) => v == null ? 'auto' : (v ? 'on' : 'off'),
        (bool? v) => set(() => _active = v),
      ),
      _Switch('labels: custom (screen reader)', _customLabels, (bool v) => set(() => _customLabels = v)),
      const _Heading('Events'),
      _Switch('Show the live event log', _showLog, (bool v) => set(() => _showLog = v)),
    ];
  }
}

class _Poster extends StatelessWidget {
  const _Poster({required this.title});

  final String title;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: const BoxDecoration(gradient: LinearGradient(colors: <Color>[Colors.deepPurple, Colors.teal])),
      child: Center(
        child: Text(
          '$title\nthumbnail',
          textAlign: TextAlign.center,
          style: const TextStyle(color: Colors.white, fontSize: 28),
        ),
      ),
    );
  }
}

class _CustomControls extends StatelessWidget {
  const _CustomControls({required this.slot, required this.state});

  final ReelSlot<LabReel> slot;
  final ReelPlaybackState state;

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.bottomCenter,
      child: SafeArea(
        child: Container(
          margin: const EdgeInsets.all(12),
          decoration: BoxDecoration(color: Colors.black54, borderRadius: BorderRadius.circular(16)),
          child: Row(
            children: <Widget>[
              ReelPlayPauseButton(
                slot: slot,
                state: state,
                icon: Icon(state.isPlayRequested ? Icons.pause : Icons.play_arrow),
              ),
              ReelMuteButton(slot: slot, state: state),
              Expanded(
                child: ReelSeekBar(slot: slot, state: state),
              ),
              ReelTimer(state: state),
              ReelFullscreenButton(slot: slot),
            ],
          ),
        ),
      ),
    );
  }
}

class _CommentsPanel extends StatelessWidget {
  const _CommentsPanel({required this.reel});

  final LabReel reel;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 150,
      width: double.infinity,
      color: Colors.grey.shade900,
      padding: const EdgeInsets.all(12),
      child: Text(
        'ReelItem.custom: a page of another shape.\n'
        'Comments for ${reel.title} would go here; the video above keeps its '
        'gestures, controls and status.',
        style: const TextStyle(color: Colors.white70),
      ),
    );
  }
}

class _EventLog extends StatelessWidget {
  const _EventLog({required this.lines});

  final List<String> lines;

  @override
  Widget build(BuildContext context) {
    return Positioned(
      left: 8,
      top: 0,
      width: 240,
      child: SafeArea(
        child: IgnorePointer(
          child: Container(
            margin: const EdgeInsets.only(top: 56),
            padding: const EdgeInsets.all(8),
            color: const Color(0x99000000),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                const Text('Events', style: TextStyle(color: Colors.amber, fontSize: 11)),
                for (final String line in lines.take(8))
                  Text(line, style: const TextStyle(color: Colors.white, fontSize: 11)),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _Panel extends StatelessWidget {
  const _Panel({required this.scroll, required this.children});

  final ScrollController scroll;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    // Built in full, so every switch exists even before it is scrolled to.
    return SingleChildScrollView(
      controller: scroll,
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 32),
      child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: children),
    );
  }
}

class _Heading extends StatelessWidget {
  const _Heading(this.text);

  final String text;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 16, bottom: 8),
      child: Text(text, style: Theme.of(context).textTheme.titleMedium),
    );
  }
}

class _Action extends StatelessWidget {
  const _Action(this.label, this.onPressed);

  final String label;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) => OutlinedButton(onPressed: onPressed, child: Text(label));
}

class _Switch extends StatelessWidget {
  const _Switch(this.label, this.value, this.onChanged);

  final String label;
  final bool value;
  final ValueChanged<bool> onChanged;

  @override
  Widget build(BuildContext context) {
    return SwitchListTile(
      contentPadding: EdgeInsets.zero,
      dense: true,
      title: Text(label),
      value: value,
      onChanged: onChanged,
    );
  }
}

class _Choice<V> extends StatelessWidget {
  const _Choice(this.label, this.value, this.options, this.name, this.onChanged);

  final String label;
  final V value;
  final List<V> options;
  final String Function(V value) name;
  final ValueChanged<V> onChanged;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: <Widget>[
          Expanded(child: Text(label)),
          DropdownButton<V>(
            value: value,
            items: <DropdownMenuItem<V>>[
              for (final V option in options) DropdownMenuItem<V>(value: option, child: Text(name(option))),
            ],
            onChanged: (V? v) => onChanged(v as V),
          ),
        ],
      ),
    );
  }
}
