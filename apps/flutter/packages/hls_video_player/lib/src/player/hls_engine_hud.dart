import 'package:flutter/material.dart';
import 'package:hls_video_player/src/domain/hls_fetch_event.dart';
import 'package:hls_video_player/src/domain/hls_variant.dart';
import 'package:hls_video_player/src/player/hls_reel_catalog.dart';

/// Display-only diagnostics panel painted over a player.
///
/// Same fields and layout as the lab HUD: cache vs origin, NOW PLAYING,
/// rungs, and recent fetches. Driven by [HlsHudModel]. This widget does not
/// subscribe to native events or own a player.
class HlsEngineHud extends StatelessWidget {
  /// Creates the diagnostics panel.
  const HlsEngineHud({
    required this.model,
    required this.onTogglePlay,
    required this.onToggleMute,
    required this.onClearCache,
    super.key,
  });

  /// Live HUD fields assembled by the player HUD binder.
  final HlsHudModel model;

  /// Play / pause.
  final VoidCallback onTogglePlay;

  /// Mute / unmute.
  final VoidCallback onToggleMute;

  /// Clear the engine segment and playlist caches.
  final VoidCallback onClearCache;

  @override
  Widget build(BuildContext context) {
    final HlsHudModel m = model;
    final Duration position = m.snapshot.position;
    final Duration duration = m.snapshot.duration;
    final Duration bufferedAhead = m.snapshot.bufferedAhead;

    return ConstrainedBox(
      constraints: const BoxConstraints(maxHeight: 330),
      child: ColoredBox(
        color: const Color(0xFF111111),
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              const Text(
                'Auto ABR · last segment fetch is origin or cache',
                style: TextStyle(color: Colors.amber, fontSize: 11),
              ),
              const SizedBox(height: 8),
              Text(
                <String>[
                  'mode: ${m.isCacheOnly ? 'cache-only' : 'online'}',
                  'wants: ${m.playRequested}',
                  'playing: ${m.snapshot.isPlaying}',
                  'buffering: ${m.snapshot.isBuffering}',
                  'ttff: ${m.ttffMs ?? '—'} ms',
                  'decoded: ${m.snapshot.width.toInt()}x${m.snapshot.height.toInt()}',
                  'buffer ahead: ${bufferedAhead.inMilliseconds / 1000}s',
                  'pos: ${formatHudDuration(position)} / ${formatHudDuration(duration)}',
                  'origin: ${formatHudBytes(m.originBytes)}',
                  'cache: ${formatHudBytes(m.cacheServedBytes)}',
                  'hits: ${m.cacheHits}',
                  'strategy: ${m.cacheBackendName}',
                  'entries: ${m.cacheEntryCount}',
                  'stored: ${formatHudBytes(m.cacheStoredBytes)}',
                  if (m.openError != null) 'open: ${m.openError}',
                ].join('  ·  '),
                style: const TextStyle(color: Colors.white, fontSize: 12),
              ),
              const SizedBox(height: 8),
              _NowPlayingLine(
                position: position,
                segmentTimeline: m.segmentTimeline,
              ),
              const SizedBox(height: 4),
              Text(
                'Current fetched rung: '
                '${m.currentFetchedVariant?.label ?? 'waiting…'}',
                style: const TextStyle(color: Colors.lightGreenAccent),
              ),
              Text(
                m.lastSegment == null
                    ? 'Last fetched: waiting…'
                    : 'Last fetched: ${playbackSourceLabel(m.lastSegment!)} · '
                          '${m.lastSegment!.displayName} · '
                          '${formatHudBytes(m.lastSegment!.byteLength)}'
                          '${m.lastSegment!.segmentDuration == null ? '' : ' · ${m.lastSegment!.segmentDuration!.inMilliseconds / 1000}s'}'
                          '${m.lastSegment!.cacheSkipReason == null ? '' : ' · skip: ${m.lastSegment!.cacheSkipReason}'}',
                style: TextStyle(
                  color:
                      m.lastSegment != null && hudEventFromCache(m.lastSegment!)
                      ? Colors.lightGreenAccent
                      : Colors.lightBlueAccent,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Available rungs (${m.variants.length})',
                style: const TextStyle(color: Colors.white70, fontSize: 11),
              ),
              const SizedBox(height: 4),
              Wrap(
                spacing: 6,
                runSpacing: 6,
                children: m.variants
                    .map(
                      (HlsVariant variant) => DecoratedBox(
                        decoration: BoxDecoration(
                          color:
                              m.currentFetchedVariant?.playlistUri ==
                                  variant.playlistUri
                              ? Colors.green.shade800
                              : Colors.white12,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Padding(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 4,
                          ),
                          child: Text(
                            variant.label,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 10,
                            ),
                          ),
                        ),
                      ),
                    )
                    .toList(),
              ),
              if (m.recentFetches.isNotEmpty) ...<Widget>[
                const SizedBox(height: 8),
                const Text(
                  'Recent fetches',
                  style: TextStyle(color: Colors.white70, fontSize: 11),
                ),
                ...m.recentFetches.map(
                  (HlsFetchEvent event) => Text(
                    '${sourceLabel(event)}  ${event.displayName} · '
                    '${formatHudBytes(event.byteLength)}'
                    '${event.variant == null ? '' : ' · ${event.variant!.label}'}'
                    '${event.cacheSkipReason == null ? '' : ' · skip: ${event.cacheSkipReason}'}',
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      color: hudEventFromCache(event)
                          ? Colors.lightGreenAccent
                          : Colors.white60,
                      fontSize: 10,
                    ),
                  ),
                ),
              ],
              const SizedBox(height: 10),
              Wrap(
                spacing: 12,
                runSpacing: 8,
                children: <Widget>[
                  FilledButton(
                    onPressed: m.snapshot.isInitialized ? onTogglePlay : null,
                    child: Text(m.playRequested ? 'Pause' : 'Play'),
                  ),
                  OutlinedButton(
                    onPressed: m.snapshot.isInitialized ? onToggleMute : null,
                    child: Text(m.muted ? 'Unmute' : 'Mute'),
                  ),
                  OutlinedButton(
                    onPressed: onClearCache,
                    child: const Text('Clear cache'),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _NowPlayingLine extends StatelessWidget {
  const _NowPlayingLine({
    required this.position,
    required this.segmentTimeline,
  });

  final Duration position;
  final List<HlsFetchEvent> segmentTimeline;

  @override
  Widget build(BuildContext context) {
    final HlsFetchEvent? playing = segmentAt(position, segmentTimeline);
    if (playing == null) {
      return const Text(
        'NOW PLAYING  unknown · not fetched since this screen opened',
        style: TextStyle(color: Colors.white54, fontSize: 12),
      );
    }
    final Duration start = playing.segmentStart!;
    final Duration end = start + playing.segmentDuration!;
    return Text(
      'NOW PLAYING  ${playing.displayName} · '
      '${formatHudDuration(start)}-${formatHudDuration(end)} · '
      '${playbackSourceLabel(playing)}',
      style: TextStyle(
        color: hudEventFromCache(playing)
            ? Colors.lightGreenAccent
            : Colors.lightBlueAccent,
        fontSize: 12,
        fontWeight: FontWeight.w600,
      ),
    );
  }
}

/// Newest timeline event covering [position], or null.
HlsFetchEvent? segmentAt(
  Duration position,
  List<HlsFetchEvent> segmentTimeline,
) {
  for (final HlsFetchEvent event in segmentTimeline) {
    if (event.covers(position)) {
      return event;
    }
  }
  return null;
}

/// Whether this event should paint as cache (hit or same-asset substitute).
bool hudEventFromCache(HlsFetchEvent event) {
  return event.servedFromCache || event.cacheSkipReason == 'substituted';
}

/// Source column for a recent-fetch row (CACHE / NET / PLAYLIST).
String sourceLabel(HlsFetchEvent event) {
  if (event.kind != HlsResourceKind.segment &&
      event.kind != HlsResourceKind.initSegment) {
    return event.kind.name.toUpperCase();
  }
  if (event.cacheSkipReason == 'substituted') {
    return 'CACHE';
  }
  return event.servedFromCache ? 'CACHE' : 'NET  ';
}

/// Last-fetched / NOW PLAYING source word.
String playbackSourceLabel(HlsFetchEvent event) {
  if (event.cacheSkipReason == 'substituted') {
    return 'CACHE (substituted)';
  }
  return event.servedFromCache ? 'CACHE' : 'NETWORK';
}

/// `mm:ss` used by the lab HUD.
String formatHudDuration(Duration duration) {
  final String minutes = duration.inMinutes
      .remainder(60)
      .toString()
      .padLeft(2, '0');
  final String seconds = duration.inSeconds
      .remainder(60)
      .toString()
      .padLeft(2, '0');
  return '$minutes:$seconds';
}

/// Byte count as B / KB / MB, same as the lab HUD.
String formatHudBytes(int bytes) {
  if (bytes >= 1024 * 1024) {
    return '${(bytes / (1024 * 1024)).toStringAsFixed(2)} MB';
  }
  if (bytes >= 1024) {
    return '${(bytes / 1024).toStringAsFixed(1)} KB';
  }
  return '$bytes B';
}
