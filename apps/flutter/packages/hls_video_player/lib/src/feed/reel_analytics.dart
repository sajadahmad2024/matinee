import 'package:flutter/foundation.dart';
import 'package:hls_video_player/src/feed/reel_events.dart';
import 'package:hls_video_player/src/feed/reel_feed_controller.dart';
import 'package:hls_video_player/src/player/hls_player_port.dart';
import 'package:hls_video_player/src/player/hls_player_snapshot.dart';
import 'package:meta/meta.dart';
import 'package:hls_video_player/src/feed/reel_feed_item.dart';

final Stopwatch _monotonic = Stopwatch()..start();

/// Derives analytics events for the focused reel from its player snapshots.
///
/// Read-only: it listens to the port on its own and never writes back to the
/// window, the port or the handle.
@internal
class ReelAnalytics<T extends ReelFeedItem> {
  ReelAnalytics({required this.emit, required this.progressInterval});

  /// Monotonic time source; tests replace it.
  @visibleForTesting
  static Duration Function() clock = () => _monotonic.elapsed;

  static Duration now() => clock();

  final void Function(ReelEvent<T> event) emit;
  final Duration progressInterval;

  ReelHandle<T>? _reel;
  HlsPlayerPort? _port;

  Duration _focusedAt = Duration.zero;
  Duration? _watchingSince;
  Duration _watched = Duration.zero;
  Duration _nextProgress = Duration.zero;
  Duration? _stallSince;
  Duration _maxPosition = Duration.zero;
  Duration _lastPosition = Duration.zero;
  Duration _duration = Duration.zero;
  bool _firstFrame = false;
  bool _errored = false;
  bool _seeked = false;
  int _loops = 0;

  ReelHandle<T>? get reel => _reel;

  Duration get watchTime {
    final Duration? since = _watchingSince;
    return since == null ? _watched : _watched + (clock() - since);
  }

  /// Starts a session for [reel], closing the previous one.
  void focus(ReelHandle<T> reel, {int? fromIndex}) {
    leave();
    _reel = reel;
    _focusedAt = clock();
    _watchingSince = null;
    _watched = Duration.zero;
    _nextProgress = progressInterval;
    _stallSince = null;
    _maxPosition = Duration.zero;
    _lastPosition = Duration.zero;
    _duration = Duration.zero;
    _firstFrame = false;
    _errored = false;
    _seeked = false;
    _loops = 0;
    emit(ReelFocused<T>(reel, fromIndex: fromIndex));
  }

  /// Follows the focused reel's current port; call after the window changes.
  void bind(HlsPlayerPort? port) {
    if (identical(port, _port)) {
      return;
    }
    _port?.snapshotListenable.removeListener(_onTick);
    _port = port;
    if (_reel != null) {
      port?.snapshotListenable.addListener(_onTick);
      if (port != null) {
        _onTick();
      }
    }
  }

  /// A host seek back must not count as a loop; a seek forward cannot look
  /// like one, so it is ignored.
  void noteSeek(Duration target) {
    if (target < _lastPosition) {
      _seeked = true;
    }
  }

  /// A retry may fail again; that failure is reported too.
  void noteRetry() => _errored = false;

  void openError(String message) {
    final ReelHandle<T>? reel = _reel;
    if (reel == null || _errored) {
      return;
    }
    _errored = true;
    emit(ReelError<T>(reel, message: message));
  }

  /// Ends the session with a [ReelLeft].
  void leave() {
    final ReelHandle<T>? reel = _reel;
    if (reel == null) {
      return;
    }
    _stopWatching();
    _port?.snapshotListenable.removeListener(_onTick);
    _port = null;
    _reel = null;
    final bool completed =
        _loops > 0 ||
        (_duration > Duration.zero &&
            _maxPosition >= _duration - const Duration(milliseconds: 500));
    emit(
      ReelLeft<T>(
        reel,
        watchTime: _watched,
        maxPosition: _maxPosition,
        loops: _loops,
        completed: completed,
      ),
    );
  }

  void _onTick() {
    final ReelHandle<T>? reel = _reel;
    final HlsPlayerPort? port = _port;
    if (reel == null || port == null) {
      return;
    }
    final HlsPlayerSnapshot s = port.snapshot;
    if (s.hasError) {
      openError(s.errorDescription ?? 'Player error');
      return;
    }
    if (s.duration > Duration.zero) {
      _duration = s.duration;
    }
    _trackLoop(reel, s);
    final bool watching = s.isInitialized && s.isPlaying && !s.isBuffering;
    if (watching && _watchingSince == null) {
      _watchingSince = clock();
    } else if (!watching) {
      _stopWatching();
    }
    // Position past zero means frames are advancing, not just play accepted.
    if (!_firstFrame && watching && s.position > Duration.zero) {
      _firstFrame = true;
      emit(ReelFirstFrame<T>(reel, timeToFirstFrame: clock() - _focusedAt));
    }
    _trackStall(reel, s);
    if (s.position > _maxPosition) {
      _maxPosition = s.position;
    }
    final Duration watched = watchTime;
    if (watched >= _nextProgress) {
      _nextProgress = watched + progressInterval;
      emit(ReelProgress<T>(reel, watchTime: watched, position: s.position));
    }
  }

  void _trackLoop(ReelHandle<T> reel, HlsPlayerSnapshot s) {
    final Duration previous = _lastPosition;
    _lastPosition = s.position;
    if (s.position >= previous) {
      return;
    }
    if (_seeked) {
      _seeked = false;
      return;
    }
    final bool nearEnd =
        _duration > Duration.zero &&
        previous >= _duration - const Duration(seconds: 1);
    if (nearEnd) {
      _loops++;
      emit(ReelLooped<T>(reel, loopCount: _loops));
    }
  }

  void _trackStall(ReelHandle<T> reel, HlsPlayerSnapshot s) {
    if (!_firstFrame) {
      return;
    }
    final bool stalled = s.isPlaying && s.isBuffering;
    final Duration? since = _stallSince;
    if (stalled && since == null) {
      _stallSince = clock();
      emit(ReelBufferingStarted<T>(reel, position: s.position));
    } else if (!stalled && since != null) {
      _stallSince = null;
      emit(ReelBufferingEnded<T>(reel, stallDuration: clock() - since));
    }
  }

  void _stopWatching() {
    final Duration? since = _watchingSince;
    if (since != null) {
      _watched += clock() - since;
      _watchingSince = null;
    }
  }
}
