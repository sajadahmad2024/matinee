import 'package:flutter_test/flutter_test.dart';
import 'package:hls_video_player/reel_data.dart';
import 'package:matinee/features/reels/data/mappers/reel_feed_mapper.dart';
import 'package:matinee/features/reels/data/models/reel.dart';
import 'package:matinee/features/reels/data/models/reel_playback.dart';

const _clear = ReelPlayback(
  kind: ReelPlaybackKind.normal,
  drm: ReelDrmKind.none,
  authMode: ReelAuthMode.none,
  cachePolicy: ReelCachePolicy.liveSegmentCache,
  prefetchEnabled: true,
  substitutionEnabled: true,
  maxPrefetchSegments: 10,
  maxPrefetchHeight: 480,
);

Reel _reel(String id, {bool isExclusive = false, ReelPlayback playback = _clear}) => Reel(
  id: id,
  masterUri: 'https://cdn.example/$id/master.m3u8',
  title: 'Title $id',
  caption: 'Caption',
  author: const ReelAuthor(id: 'u1', handle: 'apexfilms', displayName: 'Apex Films'),
  likeCount: 1,
  commentCount: 1,
  shareCount: 1,
  durationMs: 30000,
  playback: playback,
  genres: const ['Drama'],
  isExclusive: isExclusive,
);

void main() {
  group('toFeedReels', () {
    test('drops DRM and auth reels and keeps the order of the rest', () {
      final feed = toFeedReels([
        _reel('a'),
        _reel('drm', playback: _clear.copyWith(drm: ReelDrmKind.widevine)),
        _reel('auth', playback: _clear.copyWith(authMode: ReelAuthMode.tokenHeader)),
        _reel('b'),
      ]);

      expect(feed.map((f) => f.id), ['a', 'b']);
    });

    test('locks exclusive reels and leaves the others unlocked', () {
      final feed = toFeedReels([_reel('free'), _reel('paid', isExclusive: true)]);

      expect(feed.map((f) => f.isLocked), [false, true]);
    });

    test('gives a clear reel its master URL as the source', () {
      final feed = toFeedReels([_reel('a')]);

      expect(feed.single.source, ReelSource.hls(Uri.parse('https://cdn.example/a/master.m3u8')));
    });
  });

  group('reelDescriptor', () {
    test('is null for clear HLS', () {
      expect(reelDescriptor(_reel('a'), Uri.parse('https://cdn.example/a/master.m3u8')), isNull);
    });

    test('carries the DRM kind and cache policy for a DRM reel', () {
      final reel = _reel(
        'drm',
        playback: _clear.copyWith(drm: ReelDrmKind.widevine, cachePolicy: ReelCachePolicy.fullDownload),
      );

      final descriptor = reelDescriptor(reel, Uri.parse(reel.masterUri))!;

      expect(descriptor.drm, HlsDrmKind.widevine);
      expect(descriptor.cachePolicy, HlsCachePolicy.fullDownload);
    });
  });
}
