import 'package:flutter/widgets.dart';
import 'package:hls_video_player/src/player/hls_player_port.dart';
import 'package:hls_video_player/src/player/hls_player_snapshot.dart';
import 'package:hls_video_player/src/player/hls_reel_item.dart';

/// Package video and state exposed to a reel item builder.
class HlsReelSlot {
  const HlsReelSlot({
    required this.index,
    required this.item,
    required this.video,
    required this.port,
    required this.isFocused,
    required this.snapshot,
    this.bottomBar,
  });

  final int index;
  final HlsReelItem item;
  final Widget video;
  final HlsPlayerPort? port;
  final bool isFocused;
  final HlsPlayerSnapshot snapshot;

  /// Seek bar and timer for the host to place; null while they are embedded
  /// in [video] (`HlsPlayerControls.embedBottomBar`).
  final Widget? bottomBar;
}
