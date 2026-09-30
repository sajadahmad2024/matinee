/// The data side of the reels feed, with no Flutter imports: what a feed item
/// is and what it plays.
///
/// Import this from your domain and data layers; only screens need
/// `reels.dart`.
library;

export 'src/domain/hls_content_descriptor.dart'
    show
        HlsAuthConfig,
        HlsAuthMode,
        HlsCachePolicy,
        HlsContentDescriptor,
        HlsDrmConfig,
        HlsDrmKind;
export 'src/feed/reel_feed_item.dart';
export 'src/feed/reel_source.dart';
