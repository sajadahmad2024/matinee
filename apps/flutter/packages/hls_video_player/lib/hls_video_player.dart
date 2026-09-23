/// Native HLS playback bridge, telemetry models, and player UI.
///
/// App UI should import this barrel only, not `video_player` or native
/// implementation details.
library;

export 'src/video_player_android/video_player_android.dart' show AndroidVideoPlayer;
export 'src/video_player_avfoundation/video_player_avfoundation.dart'
    show AVFoundationVideoPlayer;
export 'src/bridge/hls_native_bridge.dart';
export 'src/domain/hls_content_descriptor.dart';
export 'src/domain/hls_fetch_event.dart';
export 'src/domain/hls_variant.dart';
export 'src/engine/hls_engine.dart';
export 'src/engine/hls_prefetch_result.dart';
export 'src/player/hls_engine_hud.dart';
export 'src/player/hls_engine_seek_bar.dart';
export 'src/player/hls_connectivity.dart';
export 'src/player/hls_player_port.dart';
export 'src/player/hls_player_snapshot.dart';
export 'src/player/hls_player_view.dart';
export 'src/player/hls_reel_item.dart';
export 'src/player/hls_reel_pager.dart';
export 'src/player/hls_reel_slot.dart';
export 'src/player/hls_reel_catalog.dart';
export 'src/player/hls_video_player.dart';
export 'src/player/portrait_player_item.dart';
export 'src/player/portrait_pool_overlay.dart';
export 'src/player/portrait_video_player_screen.dart';
