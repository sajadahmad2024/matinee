import 'package:flutter/material.dart';
import 'package:hls_video_player/src/player/hls_engine_seek_bar.dart';
import 'package:hls_video_player/src/player/hls_player_port.dart';
import 'package:hls_video_player/src/player/hls_player_snapshot.dart';
import 'package:hls_video_player/src/player/hls_player_view.dart';

/// Standard package video surface shared by single player and pager.
class HlsPlayerChrome extends StatelessWidget {
  const HlsPlayerChrome({
    required this.port,
    required this.isFocused,
    required this.playRequested,
    required this.onSeek,
    this.onTogglePlay,
    this.showSeekBar = true,
    this.showBufferLoader = true,
    super.key,
  });

  final HlsPlayerPort? port;
  final bool isFocused;
  final bool playRequested;
  final ValueChanged<Duration> onSeek;
  final VoidCallback? onTogglePlay;
  final bool showSeekBar;
  final bool showBufferLoader;

  @override
  Widget build(BuildContext context) {
    final HlsPlayerPort? live = port;
    if (live == null) {
      return ColoredBox(
        color: Colors.black,
        child: Center(
          child: showBufferLoader && isFocused
              ? const CircularProgressIndicator(color: Colors.white)
              : const SizedBox.shrink(),
        ),
      );
    }
    return ValueListenableBuilder<HlsPlayerSnapshot>(
      valueListenable: live.snapshotListenable,
      builder: (BuildContext context, HlsPlayerSnapshot snapshot, _) {
        return ColoredBox(
          color: Colors.black,
          child: Center(
            child: AspectRatio(
              aspectRatio: snapshot.aspectRatio == 0
                  ? 9 / 16
                  : snapshot.aspectRatio,
              child: Stack(
                alignment: Alignment.center,
                children: <Widget>[
                  HlsPlayerView(port: live),
                  if (isFocused && onTogglePlay != null)
                    Positioned.fill(
                      child: GestureDetector(
                        behavior: HitTestBehavior.translucent,
                        onTap: onTogglePlay,
                      ),
                    ),
                  if (isFocused &&
                      showBufferLoader &&
                      (!snapshot.isInitialized || snapshot.isBuffering))
                    const IgnorePointer(
                      child: CircularProgressIndicator(color: Colors.white),
                    ),
                  if (isFocused && !playRequested)
                    const IgnorePointer(
                      child: DecoratedBox(
                        decoration: BoxDecoration(
                          color: Color(0x88000000),
                          shape: BoxShape.circle,
                        ),
                        child: Padding(
                          padding: EdgeInsets.all(16),
                          child: Icon(
                            Icons.play_arrow,
                            color: Colors.white,
                            size: 48,
                          ),
                        ),
                      ),
                    ),
                  if (showSeekBar)
                    HlsEngineSeekBar(snapshot: snapshot, onSeek: onSeek),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
