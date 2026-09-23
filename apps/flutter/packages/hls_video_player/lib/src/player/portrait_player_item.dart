import 'package:flutter/material.dart';
import 'package:hls_video_player/src/player/hls_player_port.dart';

/// Host chrome for one reel page: the package video plus an optional chip.
///
/// [child] is the [HlsReelSlot.video] surface. The chip is a devtool and only
/// shows when [hudOn] is true. This file never imports `video_player`.
class PortraitPlayerItem extends StatelessWidget {
  /// Creates one feed page wrapper.
  const PortraitPlayerItem({
    required this.child,
    required this.reelIndex,
    required this.isFocused,
    required this.hudOn,
    this.port,
    this.openError,
    super.key,
  });

  /// Package video surface from [HlsReelSlot.video].
  final Widget child;

  /// Catalog index for this page.
  final int reelIndex;

  /// Whether this page is the focused reel.
  final bool isFocused;

  /// Native player for this index, or null while the window has not opened it.
  final HlsPlayerPort? port;

  /// Whether to show the instance chip (same toggle as the screen HUD).
  final bool hudOn;

  /// Native player or loopback failure for this index, if any.
  final String? openError;

  @override
  Widget build(BuildContext context) {
    return Stack(
      fit: StackFit.expand,
      children: <Widget>[
        child,
        Offstage(
          offstage: !hudOn,
          child: _InstanceChip(
            reelIndex: reelIndex,
            isFocused: isFocused,
            port: port,
            openError: openError,
          ),
        ),
      ],
    );
  }
}

/// Devtool identity label for one reel page. Shown only with the HUD toggle.
class _InstanceChip extends StatelessWidget {
  const _InstanceChip({
    required this.reelIndex,
    required this.isFocused,
    required this.port,
    this.openError,
  });

  final int reelIndex;
  final bool isFocused;
  final HlsPlayerPort? port;
  final String? openError;

  @override
  Widget build(BuildContext context) {
    final String text;
    if (port == null) {
      text = openError == null
          ? 'reel $reelIndex · no engine'
          : 'reel $reelIndex · ERROR $openError';
    } else {
      final String role = isFocused ? 'PLAY' : 'WARM';
      final Duration pos = port!.snapshot.position;
      text =
          'reel $reelIndex · inst #${port!.debugInstanceId} · '
          '${port!.debugIdentity} · $role · ${_format(pos)}';
    }
    return Align(
      alignment: Alignment.topLeft,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(8, 8, 8, 0),
        child: DecoratedBox(
          decoration: BoxDecoration(
            color: const Color(0xCC000000),
            borderRadius: BorderRadius.circular(6),
          ),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            child: Text(
              text,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 11,
                fontFeatures: <FontFeature>[FontFeature.tabularFigures()],
              ),
            ),
          ),
        ),
      ),
    );
  }

  static String _format(Duration duration) {
    final String seconds = duration.inSeconds
        .remainder(60)
        .toString()
        .padLeft(2, '0');
    return '${duration.inMinutes}:$seconds';
  }
}
