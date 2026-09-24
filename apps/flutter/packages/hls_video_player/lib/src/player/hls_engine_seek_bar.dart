import 'package:flutter/material.dart';
import 'package:hls_video_player/src/player/hls_player_snapshot.dart';

/// Converts a tap on the seek track into a media timestamp.
///
/// [dx] is the tap X inside the track, not the whole row (the time label sits
/// beside the track). Returns [Duration.zero] when the track has no width or
/// the clip has no duration. The fraction is clamped to 0–1 so a tap past
/// either end seeks to the start or end, not past it.
Duration hlsSeekPositionFromTap({
  required double dx,
  required double width,
  required Duration duration,
}) {
  if (width <= 0 || duration <= Duration.zero) {
    return Duration.zero;
  }
  final double fraction = (dx / width).clamp(0.0, 1.0);
  return Duration(milliseconds: (duration.inMilliseconds * fraction).round());
}

/// Thin played-versus-buffered track with a `mm:ss / mm:ss` label.
///
/// Copy of the lab seek bar, driven by [HlsPlayerSnapshot] so portrait UI
/// never imports `video_player`. Taps seek through [onSeek] and do not toggle
/// play. No thumbnail preview and no drag-to-scrub.
class HlsEngineSeekBar extends StatelessWidget {
  /// Creates the overlay seek bar.
  const HlsEngineSeekBar({
    required this.onSeek,
    required this.snapshot,
    super.key,
  });

  /// Invoked with a clamped timestamp when the user taps the bar.
  final ValueChanged<Duration> onSeek;

  /// Current native player state used to paint played and buffered ranges.
  final HlsPlayerSnapshot snapshot;

  static const double _trackHeight = 3;
  static const double _hitHeight = 44;

  @override
  Widget build(BuildContext context) {
    if (!snapshot.isInitialized || snapshot.duration <= Duration.zero) {
      return const SizedBox.shrink();
    }

    return Align(
      alignment: Alignment.bottomCenter,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12),
        child: Row(
          children: <Widget>[
            Expanded(
              child: LayoutBuilder(
                builder: (BuildContext context, BoxConstraints constraints) =>
                    GestureDetector(
                      behavior: HitTestBehavior.opaque,
                      onTapDown: (TapDownDetails details) {
                        onSeek(
                          hlsSeekPositionFromTap(
                            dx: details.localPosition.dx,
                            width: constraints.maxWidth,
                            duration: snapshot.duration,
                          ),
                        );
                      },
                      child: SizedBox(
                        height: _hitHeight,
                        child: CustomPaint(
                          painter: _HlsEngineSeekBarPainter(snapshot: snapshot),
                        ),
                      ),
                    ),
              ),
            ),
            const SizedBox(width: 8),
            Text(
              '${_format(snapshot.position)} / ${_format(snapshot.duration)}',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 11,
                fontFeatures: <FontFeature>[FontFeature.tabularFigures()],
                shadows: <Shadow>[Shadow(blurRadius: 3)],
              ),
            ),
          ],
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

class _HlsEngineSeekBarPainter extends CustomPainter {
  _HlsEngineSeekBarPainter({required this.snapshot});

  final HlsPlayerSnapshot snapshot;

  static const Color _trackColor = Color(0x33FFFFFF);
  static const Color _bufferedColor = Color(0x66FFFFFF);
  static const Color _playedColor = Color(0xE6FFFFFF);
  static const double _thumbRadius = 5;

  @override
  void paint(Canvas canvas, Size size) {
    final double durationMs = snapshot.duration.inMilliseconds.toDouble();
    if (durationMs <= 0 || size.width <= 0) {
      return;
    }

    final double y = size.height / 2;
    final Paint paint = Paint()
      ..strokeCap = StrokeCap.round
      ..strokeWidth = HlsEngineSeekBar._trackHeight;

    paint.color = _trackColor;
    canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);

    paint.color = _bufferedColor;
    for (final HlsBufferedRange range in snapshot.buffered) {
      final double start = (range.start.inMilliseconds / durationMs).clamp(
        0.0,
        1.0,
      );
      final double end = (range.end.inMilliseconds / durationMs).clamp(
        0.0,
        1.0,
      );
      if (end <= start) {
        continue;
      }
      canvas.drawLine(
        Offset(start * size.width, y),
        Offset(end * size.width, y),
        paint,
      );
    }

    final double played = (snapshot.position.inMilliseconds / durationMs).clamp(
      0.0,
      1.0,
    );
    paint.color = _playedColor;
    if (played > 0) {
      canvas.drawLine(Offset(0, y), Offset(played * size.width, y), paint);
    }
    canvas.drawCircle(
      Offset(played * size.width, y),
      _thumbRadius,
      Paint()..color = _playedColor,
    );
  }

  @override
  bool shouldRepaint(covariant _HlsEngineSeekBarPainter oldDelegate) =>
      oldDelegate.snapshot != snapshot;
}
