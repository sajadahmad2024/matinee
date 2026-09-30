part of 'reel_feed_controller.dart';

/// Your control over one reel, like a controller for one list item.
///
/// Get it from `feed[index]`, `feed.current` or the `ReelFeed.itemBuilder`.
/// A handle exists for the reel's whole life in the feed; the package attaches
/// a native player to it only while the reel is inside the window.
///
/// Commands return false when they could not apply, for example [play] on a
/// reel that is not on screen, or [seekTo] on a reel with no player yet.
class ReelHandle<T extends ReelFeedItem> {
  ReelHandle._(this._feed, this.id) {
    _state = _ReelStateNotifier(_compute);
    _refresh();
  }

  final ReelFeedController<T> _feed;

  /// Stable id from `ReelFeedController.id`.
  final String id;

  late final _ReelStateNotifier _state;
  HlsPlayerPort? _boundPort;
  bool _detached = false;
  bool _hasLastData = false;
  T? _lastData;

  /// The feed this reel belongs to.
  ReelFeedController<T> get feed => _feed;

  /// Current index in the feed, or -1 once the reel was removed.
  int get index => _detached ? -1 : _feed.indexOf(id);

  /// False once the reel was removed from its feed.
  bool get isInFeed => index >= 0;

  /// Your model for this reel; after removal, its last model.
  T get data {
    final int i = index;
    if (i >= 0) {
      return _feed._items[i];
    }
    if (_hasLastData) {
      return _lastData as T;
    }
    throw StateError('Reel "$id" was removed from its feed.');
  }

  /// Whether this reel is the one on screen.
  bool get isFocused => _feed._isFocusedIndex(index);

  /// Whether `source` returned a value for it; false means no player and no
  /// cache, such as a locked reel.
  bool get isPlayable {
    final int i = index;
    return i >= 0 && _feed._hls[i].playable;
  }

  /// Whether `locked` returned true: no player, no cache, curtain shown.
  bool get isLocked {
    final int i = index;
    return i >= 0 && _feed._locked[i];
  }

  /// Whether a native player is open for it right now.
  bool get hasPlayer => port != null;

  /// Live playback state. Rebuild UI from it with `ReelStateBuilder`.
  ValueListenable<ReelPlaybackState> get state => _state;

  /// The video surface. Shorthand for `ReelVideo(reel)`.
  Widget get video => ReelVideo(this);

  /// Native player for the video surface and HUD.
  @internal
  HlsPlayerPort? get port => _detached ? null : _feed._window?.portFor(id);

  /// Plays this reel. Only the reel on screen can play.
  bool play() => _feed._setPlayIntent(this, play: true);

  /// Pauses this reel. The next reel on screen starts from `autoplay` again.
  bool pause() => _feed._setPlayIntent(this, play: false);

  bool togglePlay() => _feed._playIntent && isFocused ? pause() : play();

  /// Seeks any reel that has a player, on screen or not, so a neighbour can be
  /// ready at a saved position before it shows.
  bool seekTo(Duration position) => _feed._seek(this, position);

  /// Opens the player again after [ReelPlayerStatus.error].
  bool retry() => _feed._retry(this);

  /// Effective mute: [mutedOverride], or the feed's `muted`.
  bool get isMuted => _feed._isMutedFor(id);

  /// Mute for this reel only; null follows the feed's `muted`.
  bool? get mutedOverride => _feed._mutedOverrideFor(id);

  set mutedOverride(bool? value) => _feed._setMutedOverride(id, value);

  /// Toggles what this reel hears: its [mutedOverride] when it has one,
  /// otherwise the feed's mute.
  void toggleMute() {
    if (mutedOverride != null) {
      mutedOverride = !isMuted;
    } else {
      _feed.toggleMute();
    }
  }

  void _refresh() {
    if (_detached) {
      return;
    }
    final HlsPlayerPort? next = port;
    if (!identical(next, _boundPort)) {
      _boundPort?.snapshotListenable.removeListener(_onTick);
      _boundPort = next;
      next?.snapshotListenable.addListener(_onTick);
    }
    _state.refresh();
  }

  void _onTick() {
    if (!_detached) {
      _state.refresh();
    }
  }

  void _detach(T? lastData) {
    _boundPort?.snapshotListenable.removeListener(_onTick);
    _boundPort = null;
    _hasLastData = lastData != null || null is T;
    _lastData = lastData;
    _detached = true;
    // Deferred: a detach can happen while widgets build.
    scheduleMicrotask(_state.refresh);
  }

  ReelPlaybackState _compute() {
    final int i = index;
    if (i < 0) {
      return const ReelPlaybackState.idle();
    }
    final bool focused = _feed._isFocusedIndex(i);
    final bool playRequested = focused && _feed._playIntent;
    final bool muted = _feed._isMutedFor(id);
    final HlsPortWindow? w = _feed._window;
    final String? openError = w?.errorFor(id);
    final HlsPlayerPort? live = _boundPort;
    if (live == null) {
      // Same rule as HlsPortWindow.keepIndexes, without building the set.
      final bool opening =
          w != null &&
          _feed._hls[i].playable &&
          (i - _feed._currentIndex).abs() <= w.windowRadius;
      return ReelPlaybackState(
        status: openError != null
            ? ReelPlayerStatus.error
            : opening
            ? ReelPlayerStatus.opening
            : ReelPlayerStatus.idle,
        isFocused: focused,
        isPlayRequested: playRequested,
        isMuted: muted,
        error: openError,
      );
    }
    final HlsPlayerSnapshot s = live.snapshot;
    return ReelPlaybackState(
      status: s.hasError
          ? ReelPlayerStatus.error
          : !s.isInitialized
          ? ReelPlayerStatus.opening
          : s.isBuffering
          ? ReelPlayerStatus.buffering
          : s.isPlaying
          ? ReelPlayerStatus.playing
          : ReelPlayerStatus.paused,
      isFocused: focused,
      isPlayRequested: playRequested,
      isMuted: muted,
      position: s.position,
      duration: s.duration,
      buffered: s.buffered,
      aspectRatio: s.aspectRatio,
      videoWidth: s.width,
      videoHeight: s.height,
      error: s.errorDescription ?? openError,
    );
  }

  @override
  String toString() => 'ReelHandle($id, index: $index)';
}

/// Computes the state only while someone listens; otherwise on first read.
///
/// A long feed builds a handle per reel it showed; idle handles then cost
/// nothing when the feed changes.
class _ReelStateNotifier extends ChangeNotifier
    implements ValueListenable<ReelPlaybackState> {
  _ReelStateNotifier(this._compute);

  final ReelPlaybackState Function() _compute;
  ReelPlaybackState? _value;

  @override
  ReelPlaybackState get value => _value ??= _compute();

  void refresh() {
    if (!hasListeners) {
      _value = null;
      return;
    }
    final ReelPlaybackState next = _compute();
    if (next != _value) {
      _value = next;
      notifyListeners();
    }
  }
}
