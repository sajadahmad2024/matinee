import 'package:flutter/material.dart';
import 'package:hls_video_player/src/player/hls_engine_hud.dart';
import 'package:hls_video_player/src/player/hls_hud_session.dart';
import 'package:hls_video_player/src/player/hls_player_port.dart';
import 'package:hls_video_player/src/player/hls_player_snapshot.dart';

/// Paints [HlsEngineHud] from a hoisted [HlsHudSession].
///
/// Does not subscribe to EventChannel. The player or pager owns telemetry.
class HlsHudBinder extends StatefulWidget {
  const HlsHudBinder({
    required this.session,
    required this.playRequested,
    required this.muted,
    required this.onTogglePlay,
    required this.onToggleMute,
    required this.onClearCache,
    this.port,
    this.openError,
    super.key,
  });

  final HlsHudSession session;
  final HlsPlayerPort? port;
  final bool playRequested;
  final bool muted;
  final String? openError;
  final VoidCallback onTogglePlay;
  final VoidCallback onToggleMute;
  final VoidCallback onClearCache;

  @override
  State<HlsHudBinder> createState() => _HlsHudBinderState();
}

class _HlsHudBinderState extends State<HlsHudBinder> {
  HlsPlayerPort? _snapshotPort;

  @override
  void initState() {
    super.initState();
    _bindSnapshot();
  }

  @override
  void didUpdateWidget(HlsHudBinder oldWidget) {
    super.didUpdateWidget(oldWidget);
    _bindSnapshot();
  }

  void _bindSnapshot() {
    if (identical(_snapshotPort, widget.port)) {
      return;
    }
    _snapshotPort?.snapshotListenable.removeListener(_onSnapshot);
    _snapshotPort = widget.port;
    _snapshotPort?.snapshotListenable.addListener(_onSnapshot);
    _onSnapshot();
  }

  void _onSnapshot() {
    widget.session.markFirstFrame(
      widget.port?.snapshot ?? HlsPlayerSnapshot.empty,
    );
  }

  @override
  void dispose() {
    _snapshotPort?.snapshotListenable.removeListener(_onSnapshot);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: widget.session,
      builder: (BuildContext context, _) {
        final HlsPlayerPort? live = widget.port;
        if (live == null) {
          return _hud(HlsPlayerSnapshot.empty);
        }
        return ValueListenableBuilder<HlsPlayerSnapshot>(
          valueListenable: live.snapshotListenable,
          builder: (BuildContext context, HlsPlayerSnapshot snapshot, _) {
            return _hud(snapshot);
          },
        );
      },
    );
  }

  Widget _hud(HlsPlayerSnapshot snapshot) {
    return Align(
      alignment: Alignment.bottomCenter,
      child: HlsEngineHud(
        model: widget.session.model(
          snapshot: snapshot,
          playRequested: widget.playRequested,
          muted: widget.muted,
          openError: widget.openError,
        ),
        onTogglePlay: widget.onTogglePlay,
        onToggleMute: widget.onToggleMute,
        onClearCache: widget.onClearCache,
      ),
    );
  }
}
