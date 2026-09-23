import 'dart:async';

import 'package:flutter/material.dart';
import 'package:hls_video_player/src/engine/hls_engine.dart';
import 'package:hls_video_player/src/player/hls_connectivity.dart';
import 'package:hls_video_player/src/player/hls_hud_binder.dart';
import 'package:hls_video_player/src/player/hls_hud_session.dart';
import 'package:hls_video_player/src/player/hls_player_chrome.dart';
import 'package:hls_video_player/src/player/hls_player_port.dart';
import 'package:hls_video_player/src/player/hls_port_window.dart';
import 'package:hls_video_player/src/player/hls_reel_item.dart';

/// One native-backed HLS player with optional package chrome and HUD.
///
/// Standalone construction owns a one-port window and one HUD session.
/// [HlsVideoPlayer.fromPort] paints an already-opened keep-set port and does
/// not dispose it or subscribe to events (the pager owns telemetry).
class HlsVideoPlayer extends StatefulWidget {
  /// Plays a single [masterUri] with a private radius-0 window.
  const HlsVideoPlayer({
    required this.masterUri,
    this.autoplay = true,
    this.muted = true,
    this.showHud = false,
    this.showSeekBar = true,
    this.tapToTogglePlay = true,
    this.showBufferLoader = true,
    this.connectivity,
    super.key,
  }) : port = null,
       isFocused = true,
       playRequested = autoplay,
       openError = null,
       onTogglePlay = null,
       onSeek = null,
       onToggleMute = null,
       onClearCache = null,
       ownsWindow = true;

  /// Surface over a port owned by [HlsPortWindow] / [HlsReelPager].
  const HlsVideoPlayer.fromPort({
    required this.masterUri,
    required this.port,
    required this.isFocused,
    required this.playRequested,
    required this.onTogglePlay,
    required this.onSeek,
    this.muted = true,
    this.showHud = false,
    this.showSeekBar = true,
    this.tapToTogglePlay = true,
    this.showBufferLoader = true,
    this.openError,
    this.onToggleMute,
    this.onClearCache,
    super.key,
  }) : autoplay = playRequested,
       connectivity = null,
       ownsWindow = false;

  final Uri masterUri;
  final HlsPlayerPort? port;
  final bool ownsWindow;
  final bool isFocused;
  final bool playRequested;
  final bool autoplay;
  final bool muted;
  final bool showHud;
  final bool showSeekBar;
  final bool tapToTogglePlay;
  final bool showBufferLoader;
  final HlsConnectivity? connectivity;
  final String? openError;
  final VoidCallback? onTogglePlay;
  final ValueChanged<Duration>? onSeek;
  final VoidCallback? onToggleMute;
  final Future<void> Function()? onClearCache;

  @override
  State<HlsVideoPlayer> createState() => _HlsVideoPlayerState();
}

class _HlsVideoPlayerState extends State<HlsVideoPlayer> {
  HlsPortWindow? _window;
  final HlsHudTelemetry _telemetry = HlsHudTelemetry();

  @override
  void initState() {
    super.initState();
    if (widget.ownsWindow) {
      _createWindow();
      unawaited(_window!.initialize());
      _startTelemetry();
    }
  }

  void _startTelemetry() {
    final HlsEngine engine = HlsEngine.instance;
    _telemetry.start(engine.nativeBridge);
    unawaited(_telemetry.refreshStats(engine.nativeBridge, widget.masterUri));
  }

  void _createWindow() {
    final HlsEngine engine = HlsEngine.instance;
    _window = HlsPortWindow(
      items: <HlsReelItem>[
        HlsReelItem(
          id: widget.masterUri.toString(),
          masterUri: widget.masterUri,
        ),
      ],
      windowRadius: 0,
      nativeBridge: engine.nativeBridge,
      playerFactory: engine.playerFactory,
      connectivity: widget.connectivity,
      playRequested: widget.autoplay,
      muted: widget.muted,
    )..addListener(_onOwnedWindow);
  }

  void _onOwnedWindow() {
    if (mounted) {
      setState(() {});
    }
  }

  @override
  void didUpdateWidget(HlsVideoPlayer oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (!widget.ownsWindow) {
      return;
    }
    if (oldWidget.masterUri != widget.masterUri) {
      unawaited(
        _telemetry.refreshStats(
          HlsEngine.instance.nativeBridge,
          widget.masterUri,
        ),
      );
    }
    if (oldWidget.masterUri != widget.masterUri ||
        oldWidget.connectivity != widget.connectivity ||
        oldWidget.autoplay != widget.autoplay ||
        oldWidget.muted != widget.muted) {
      _window?.removeListener(_onOwnedWindow);
      _window?.dispose();
      _createWindow();
      unawaited(_window!.initialize());
    }
  }

  @override
  void dispose() {
    if (widget.ownsWindow) {
      _window?.removeListener(_onOwnedWindow);
      _window?.dispose();
      unawaited(_telemetry.stop());
    }
    super.dispose();
  }

  Future<void> _togglePlay() async {
    if (widget.ownsWindow) {
      await _window?.togglePlay();
      return;
    }
    widget.onTogglePlay?.call();
  }

  Future<void> _toggleMute() async {
    if (widget.ownsWindow) {
      await _window?.toggleMute();
      return;
    }
    widget.onToggleMute?.call();
  }

  Future<void> _clearCache() async {
    if (widget.ownsWindow) {
      await _telemetry.clearCache(
        bridge: HlsEngine.instance.nativeBridge,
        masterUri: widget.masterUri,
        clear: () => HlsEngine.instance.nativeBridge.clearCache(),
      );
      return;
    }
    if (widget.onClearCache != null) {
      await widget.onClearCache!();
    }
  }

  void _seek(Duration position) {
    if (widget.ownsWindow) {
      unawaited(_window?.seekTo(position));
      return;
    }
    widget.onSeek?.call(position);
  }

  @override
  Widget build(BuildContext context) {
    final HlsPortWindow? window = _window;
    final HlsPlayerPort? port = widget.ownsWindow
        ? window?.portAt(0)
        : widget.port;
    final bool focused = widget.ownsWindow ? true : widget.isFocused;
    final bool playRequested = widget.ownsWindow
        ? (window?.playRequested ?? widget.autoplay)
        : widget.playRequested;
    final bool muted = widget.ownsWindow
        ? (window?.muted ?? widget.muted)
        : widget.muted;
    final String? openError = widget.ownsWindow
        ? window?.errorAt(0)
        : widget.openError;

    return Stack(
      fit: StackFit.expand,
      children: <Widget>[
        HlsPlayerChrome(
          port: port,
          isFocused: focused,
          playRequested: playRequested,
          showSeekBar: widget.showSeekBar,
          showBufferLoader: widget.showBufferLoader,
          onTogglePlay: focused && widget.tapToTogglePlay
              ? () => unawaited(_togglePlay())
              : null,
          onSeek: _seek,
        ),
        if (widget.ownsWindow && widget.showHud)
          HlsHudBinder(
            session: _telemetry.session,
            port: port,
            playRequested: playRequested,
            muted: muted,
            openError: openError,
            onTogglePlay: () => unawaited(_togglePlay()),
            onToggleMute: () => unawaited(_toggleMute()),
            onClearCache: () => unawaited(_clearCache()),
          ),
      ],
    );
  }
}
