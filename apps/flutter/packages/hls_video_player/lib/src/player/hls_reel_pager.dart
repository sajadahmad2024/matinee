import 'dart:async';

import 'package:flutter/material.dart';
import 'package:hls_video_player/src/engine/hls_engine.dart';
import 'package:hls_video_player/src/player/hls_connectivity.dart';
import 'package:hls_video_player/src/player/hls_hud_binder.dart';
import 'package:hls_video_player/src/player/hls_hud_session.dart';
import 'package:hls_video_player/src/player/hls_player_port.dart';
import 'package:hls_video_player/src/player/hls_player_snapshot.dart';
import 'package:hls_video_player/src/player/hls_port_window.dart';
import 'package:hls_video_player/src/player/hls_reel_item.dart';
import 'package:hls_video_player/src/player/hls_reel_slot.dart';
import 'package:hls_video_player/src/player/hls_video_player.dart';
import 'package:hls_video_player/src/player/portrait_pool_overlay.dart';

/// Vertical reels pager backed by an N±K native-player window.
///
/// Each page is an [HlsVideoPlayer] surface over the shared [HlsPortWindow].
/// One HUD session lives on this State. [showHud] only controls paint.
class HlsReelPager extends StatefulWidget {
  const HlsReelPager({
    required this.items,
    required this.itemBuilder,
    this.windowRadius = 2,
    this.showHud = false,
    this.showSeekBar = true,
    this.tapToTogglePlay = true,
    this.showBufferLoader = true,
    this.autoplay = true,
    this.muted = true,
    this.connectivity,
    this.controller,
    this.onWindowChanged,
    super.key,
  }) : assert(windowRadius >= 0);

  final List<HlsReelItem> items;
  final Widget Function(BuildContext context, HlsReelSlot slot) itemBuilder;
  final int windowRadius;
  final bool showHud;
  final bool showSeekBar;
  final bool tapToTogglePlay;
  final bool showBufferLoader;
  final bool autoplay;
  final bool muted;
  final HlsConnectivity? connectivity;
  final PageController? controller;

  /// Optional diagnostics callback used by the bundled portrait lab.
  final ValueChanged<HlsPortWindow>? onWindowChanged;

  @override
  State<HlsReelPager> createState() => _HlsReelPagerState();
}

class _HlsReelPagerState extends State<HlsReelPager> {
  late HlsPortWindow _window;
  late PageController _controller;
  late bool _ownsController;
  final HlsHudTelemetry _telemetry = HlsHudTelemetry();
  int? _statsFocus;

  @override
  void initState() {
    super.initState();
    _createWindow();
    _ownsController = widget.controller == null;
    _controller = widget.controller ?? PageController();
    unawaited(_window.initialize());
    _startTelemetry();
  }

  void _startTelemetry() {
    final HlsEngine engine = HlsEngine.instance;
    _telemetry.start(engine.nativeBridge);
    _refreshFocusedStats();
  }

  void _refreshFocusedStats() {
    if (widget.items.isEmpty) {
      return;
    }
    final int focus = _window.focusedIndex.clamp(0, widget.items.length - 1);
    _statsFocus = focus;
    unawaited(
      _telemetry.refreshStats(
        HlsEngine.instance.nativeBridge,
        widget.items[focus].masterUri,
      ),
    );
  }

  void _createWindow() {
    final HlsEngine engine = HlsEngine.instance;
    _window = HlsPortWindow(
      items: widget.items,
      windowRadius: widget.windowRadius,
      nativeBridge: engine.nativeBridge,
      playerFactory: engine.playerFactory,
      connectivity: widget.connectivity,
      playRequested: widget.autoplay,
      muted: widget.muted,
    )..addListener(_onWindow);
  }

  void _onWindow() {
    widget.onWindowChanged?.call(_window);
    if (_statsFocus != _window.focusedIndex) {
      _refreshFocusedStats();
    }
    if (mounted) {
      setState(() {});
    }
  }

  @override
  void didUpdateWidget(HlsReelPager oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.windowRadius != widget.windowRadius ||
        oldWidget.connectivity != widget.connectivity ||
        oldWidget.autoplay != widget.autoplay ||
        oldWidget.muted != widget.muted) {
      final int focused = _window.focusedIndex;
      _window.removeListener(_onWindow);
      _window.dispose();
      _createWindow();
      unawaited(_window.initialize(focusedIndex: focused));
    } else if (!sameHlsReelFeed(oldWidget.items, widget.items)) {
      unawaited(_window.updateItems(widget.items));
    }
    if (oldWidget.controller != widget.controller) {
      if (_ownsController) {
        _controller.dispose();
      }
      _ownsController = widget.controller == null;
      _controller = widget.controller ?? PageController();
    }
  }

  @override
  void dispose() {
    _window.removeListener(_onWindow);
    _window.dispose();
    if (_ownsController) {
      _controller.dispose();
    }
    unawaited(_telemetry.stop());
    super.dispose();
  }

  Future<void> _clearCache() {
    final Uri master = widget.items.isEmpty
        ? Uri.parse('https://invalid.invalid/')
        : widget
              .items[_window.focusedIndex.clamp(0, widget.items.length - 1)]
              .masterUri;
    return _telemetry.clearCache(
      bridge: HlsEngine.instance.nativeBridge,
      masterUri: master,
      clear: () => HlsEngine.instance.nativeBridge.clearCache(),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (widget.items.isEmpty) {
      return const ColoredBox(color: Colors.black);
    }
    final Widget pages = PageView.builder(
      controller: _controller,
      scrollDirection: Axis.vertical,
      itemCount: widget.items.length,
      onPageChanged: (int index) {
        unawaited(_window.sync(focusedIndex: index));
      },
      itemBuilder: (BuildContext context, int index) {
        final item = widget.items[index];
        final port = _window.portAt(index);
        final bool focused = index == _window.focusedIndex;
        final HlsPlayerSnapshot snapshot =
            port?.snapshot ?? HlsPlayerSnapshot.empty;
        final Widget video = HlsVideoPlayer.fromPort(
          key: ValueKey<String>('reel-${item.id}'),
          masterUri: item.masterUri,
          port: port,
          isFocused: focused,
          playRequested: _window.playRequested,
          muted: _window.muted,
          showSeekBar: widget.showSeekBar,
          tapToTogglePlay: widget.tapToTogglePlay,
          showBufferLoader: widget.showBufferLoader,
          openError: _window.errorAt(index),
          onTogglePlay: focused && widget.tapToTogglePlay
              ? () => unawaited(_window.togglePlay())
              : null,
          onSeek: (Duration position) {
            if (focused) {
              unawaited(_window.seekTo(position));
            }
          },
        );
        return widget.itemBuilder(
          context,
          HlsReelSlot(
            index: index,
            item: item,
            video: video,
            port: port,
            isFocused: focused,
            snapshot: snapshot,
          ),
        );
      },
    );
    return Stack(
      fit: StackFit.expand,
      children: <Widget>[
        pages,
        if (widget.showHud) ...<Widget>[
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: PortraitPoolOverlay(
              focusedIndex: _window.focusedIndex,
              windowRadius: _window.windowRadius,
              ports: <int, HlsPlayerPort>{
                for (var index = 0; index < widget.items.length; index++)
                  if (_window.portAt(index) case final HlsPlayerPort port)
                    index: port,
              },
              openErrors: <int, String>{
                for (var index = 0; index < widget.items.length; index++)
                  if (_window.errorAt(index) case final String error)
                    index: error,
              },
            ),
          ),
          HlsHudBinder(
            session: _telemetry.session,
            port: _window.focusedPort,
            playRequested: _window.playRequested,
            muted: _window.muted,
            openError: _window.errorAt(_window.focusedIndex),
            onTogglePlay: () => unawaited(_window.togglePlay()),
            onToggleMute: () => unawaited(_window.toggleMute()),
            onClearCache: () => unawaited(_clearCache()),
          ),
        ],
      ],
    );
  }
}
