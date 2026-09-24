import 'package:flutter/material.dart';
import 'package:hls_video_player/src/player/hls_player_port.dart';

/// Devtool list of live native players in the ±2 window.
///
/// Shown over the video when the portrait HUD toggle is on. Height hugs
/// the instance lines; it does not stretch the full stack.
///
/// Each line is one [HlsPlayerPort]. The instance id and identity hash stay
/// the same when a reel's window label changes (N-1 becomes N-2). A new id
/// means that catalog index just entered the window. A missing index means
/// that port was disposed.
class PortraitPoolOverlay extends StatelessWidget {
  /// Creates the overlay.
  const PortraitPoolOverlay({
    required this.focusedIndex,
    required this.windowRadius,
    required this.ports,
    this.openErrors = const <int, String>{},
    super.key,
  });

  /// Playing catalog index (N).
  final int focusedIndex;

  /// Keep-set half-width. Live count is at most `2 * radius + 1`.
  final int windowRadius;

  /// Ports keyed by catalog index.
  final Map<int, HlsPlayerPort> ports;

  /// Per-index native open failures still in the keep-set.
  final Map<int, String> openErrors;

  @override
  Widget build(BuildContext context) {
    final int maxLive = windowRadius * 2 + 1;
    final List<int> indexes = <int>{...ports.keys, ...openErrors.keys}.toList()
      ..sort();
    return DecoratedBox(
      decoration: const BoxDecoration(color: Color(0xCC111111)),
      child: Padding(
        padding: const EdgeInsets.fromLTRB(12, 8, 12, 8),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Text(
              'live ${ports.length}/$maxLive · N=$focusedIndex',
              style: const TextStyle(
                color: Colors.amber,
                fontSize: 12,
                fontWeight: FontWeight.w600,
              ),
            ),
            ...indexes.map((int index) {
              final HlsPlayerPort? port = ports[index];
              final String? openError = openErrors[index];
              if (port == null) {
                return Text(
                  'reel $index  ERROR  ${openError ?? 'no engine'}',
                  style: TextStyle(
                    color: index == focusedIndex
                        ? Colors.lightGreenAccent
                        : Colors.white70,
                    fontSize: 11,
                    fontFeatures: const <FontFeature>[
                      FontFeature.tabularFigures(),
                    ],
                  ),
                );
              }
              final String role = index == focusedIndex ? 'PLAY' : 'WARM';
              final String seconds = port.snapshot.position.inSeconds
                  .remainder(60)
                  .toString()
                  .padLeft(2, '0');
              final String pos = '${port.snapshot.position.inMinutes}:$seconds';
              return Text(
                'reel $index  inst #${port.debugInstanceId}  '
                '${port.debugIdentity}  $role  $pos',
                style: TextStyle(
                  color: index == focusedIndex
                      ? Colors.lightGreenAccent
                      : Colors.white70,
                  fontSize: 11,
                  fontFeatures: const <FontFeature>[
                    FontFeature.tabularFigures(),
                  ],
                ),
              );
            }),
          ],
        ),
      ),
    );
  }
}
