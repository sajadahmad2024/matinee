import 'package:flutter_test/flutter_test.dart';
import 'package:hls_video_player/hls_video_player.dart';

void main() {
  group('HlsPlayerSnapshot buffered ranges', () {
    test('maps multiple ranges and reports buffer ahead from the last end', () {
      const HlsPlayerSnapshot snapshot = HlsPlayerSnapshot(
        isInitialized: true,
        isPlaying: true,
        isBuffering: false,
        hasError: false,
        duration: Duration(seconds: 30),
        position: Duration(seconds: 4),
        width: 1080,
        height: 1920,
        aspectRatio: 9 / 16,
        buffered: <HlsBufferedRange>[
          HlsBufferedRange(start: Duration.zero, end: Duration(seconds: 2)),
          HlsBufferedRange(
            start: Duration(seconds: 3),
            end: Duration(seconds: 10),
          ),
        ],
      );

      expect(snapshot.buffered, hasLength(2));
      expect(snapshot.buffered.first.start, Duration.zero);
      expect(snapshot.buffered.last.end, const Duration(seconds: 10));
      expect(snapshot.bufferedAhead, const Duration(seconds: 6));
    });

    test('buffer ahead is zero when the last range is behind the playhead', () {
      const HlsPlayerSnapshot snapshot = HlsPlayerSnapshot(
        isInitialized: true,
        isPlaying: true,
        isBuffering: false,
        hasError: false,
        duration: Duration(seconds: 30),
        position: Duration(seconds: 12),
        width: 1,
        height: 1,
        aspectRatio: 1,
        buffered: <HlsBufferedRange>[
          HlsBufferedRange(start: Duration.zero, end: Duration(seconds: 10)),
        ],
      );

      expect(snapshot.bufferedAhead, Duration.zero);
    });

    test('empty snapshot has no buffered ranges', () {
      expect(HlsPlayerSnapshot.empty.buffered, isEmpty);
      expect(HlsPlayerSnapshot.empty.bufferedAhead, Duration.zero);
    });
  });

  group('hlsSeekPositionFromTap', () {
    test('clamps a tap past either end of the track', () {
      const Duration duration = Duration(seconds: 100);

      expect(
        hlsSeekPositionFromTap(dx: -10, width: 200, duration: duration),
        Duration.zero,
      );
      expect(
        hlsSeekPositionFromTap(dx: 400, width: 200, duration: duration),
        duration,
      );
    });

    test('maps the midpoint of the track to half the duration', () {
      expect(
        hlsSeekPositionFromTap(
          dx: 50,
          width: 100,
          duration: const Duration(seconds: 40),
        ),
        const Duration(seconds: 20),
      );
    });

    test('returns zero when the track has no width or duration', () {
      expect(
        hlsSeekPositionFromTap(
          dx: 10,
          width: 0,
          duration: const Duration(seconds: 10),
        ),
        Duration.zero,
      );
      expect(
        hlsSeekPositionFromTap(dx: 10, width: 100, duration: Duration.zero),
        Duration.zero,
      );
    });
  });
}
