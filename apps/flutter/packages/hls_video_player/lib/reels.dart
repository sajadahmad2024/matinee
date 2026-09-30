/// Host-controlled reels feed over the native HLS engine.
///
/// Start with `ReelFeed`: give it `items` (your models, implementing
/// `ReelFeedItem`) and an `itemBuilder` returning a `ReelItem`. Add a
/// `ReelFeedController` for feed-level control from outside the pages. Call
/// `HlsEngine.initialize()` once at startup.
library;

export 'src/domain/hls_content_descriptor.dart'
    show
        HlsAuthConfig,
        HlsAuthMode,
        HlsCachePolicy,
        HlsContentDescriptor,
        HlsDrmConfig,
        HlsDrmKind;
export 'src/engine/hls_engine.dart' show HlsEngine;
export 'src/engine/hls_prefetch_result.dart';
export 'src/feed/builders/reel_builders.dart';
export 'src/feed/builders/reel_control_pieces.dart' hide snapshotOf;
export 'src/feed/builders/reel_item.dart';
export 'src/feed/builders/reel_labels.dart';
export 'src/feed/builders/reel_layers.dart';
export 'src/feed/builders/reel_slot.dart';
export 'src/feed/builders/reel_style.dart';
export 'src/feed/reel_controls.dart';
export 'src/feed/reel_events.dart';
export 'src/feed/reel_feed.dart';
export 'src/feed/reel_feed_controller.dart' hide ReelFeedAttachment;
export 'src/feed/reel_feed_item.dart';
export 'src/feed/reel_inserts.dart' hide ReelPageEntry, ReelPageMap;
export 'src/feed/reel_playback_state.dart';
export 'src/feed/reel_source.dart';
export 'src/feed/reel_state_builder.dart';
export 'src/feed/reel_tap_to_play.dart';
export 'src/feed/reel_video.dart';
export 'src/feed/reel_window.dart';
export 'src/player/hls_connectivity.dart';
export 'src/player/hls_player_controls.dart';
export 'src/player/hls_player_snapshot.dart' show HlsBufferedRange;
