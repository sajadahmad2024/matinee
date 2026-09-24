import 'dart:io' show File;

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:hls_video_player/src/player/hls_player_snapshot.dart';
import 'package:hls_video_player/src/video_player/video_player.dart';

/// Native player handle used by package UI.
///
/// Tests and alternate Dart-facing player implementations may implement this
/// interface without importing `video_player`.
abstract class HlsPlayerPort {
  /// Creates and initializes the production vendored-video-player port.
  static Future<HlsPlayerPort> open({
    required Uri uri,
    required Map<String, String> httpHeaders,
  }) async {
    final VideoPlayerController controller;
    if (uri.isScheme('file')) {
      controller = VideoPlayerController.file(File.fromUri(uri));
    } else {
      controller = VideoPlayerController.networkUrl(
        uri,
        formatHint: VideoFormat.hls,
        httpHeaders: httpHeaders,
      );
    }
    await controller.initialize();
    await controller.setLooping(true);
    return _VideoPlayerHlsPlayerPort(controller);
  }

  /// Monotonic id for diagnostics and stable texture keys.
  int get debugInstanceId;

  /// Object identity shown by the diagnostics overlay.
  String get debugIdentity;

  /// Latest HUD-safe state.
  ValueListenable<HlsPlayerSnapshot> get snapshotListenable;

  /// Current state.
  HlsPlayerSnapshot get snapshot;

  /// Paints the native texture.
  Widget buildView();

  Future<void> play();
  Future<void> pause();
  Future<void> setVolume(double volume);
  Future<void> seekTo(Duration position);
  Future<void> dispose();
}

class _VideoPlayerHlsPlayerPort implements HlsPlayerPort {
  _VideoPlayerHlsPlayerPort(this._controller)
    : debugInstanceId = _nextInstanceId++ {
    _controller.addListener(_onTick);
    _publish();
  }

  static int _nextInstanceId = 1;

  final VideoPlayerController _controller;
  final ValueNotifier<HlsPlayerSnapshot> _snapshot =
      ValueNotifier<HlsPlayerSnapshot>(HlsPlayerSnapshot.empty);

  @override
  final int debugInstanceId;

  @override
  String get debugIdentity => identityHashCode(this).toRadixString(16);

  @override
  ValueListenable<HlsPlayerSnapshot> get snapshotListenable => _snapshot;

  @override
  HlsPlayerSnapshot get snapshot => _snapshot.value;

  @override
  Widget buildView() =>
      VideoPlayer(_controller, key: ValueKey<int>(debugInstanceId));

  @override
  Future<void> play() => _controller.play();

  @override
  Future<void> pause() => _controller.pause();

  @override
  Future<void> setVolume(double volume) => _controller.setVolume(volume);

  @override
  Future<void> seekTo(Duration position) => _controller.seekTo(position);

  @override
  Future<void> dispose() async {
    _controller.removeListener(_onTick);
    _snapshot.dispose();
    await _controller.dispose();
  }

  void _onTick() => _publish();

  void _publish() {
    final VideoPlayerValue value = _controller.value;
    _snapshot.value = HlsPlayerSnapshot(
      isInitialized: value.isInitialized,
      isPlaying: value.isPlaying,
      isBuffering: value.isBuffering,
      hasError: value.hasError,
      duration: value.duration,
      position: value.position,
      width: value.size.width,
      height: value.size.height,
      aspectRatio: value.aspectRatio,
      buffered: value.buffered
          .map(
            (DurationRange range) =>
                HlsBufferedRange(start: range.start, end: range.end),
          )
          .toList(growable: false),
      errorDescription: value.errorDescription,
    );
  }
}

/// Factory so tests and hosts can replace Dart-facing player creation.
abstract class HlsPlayerPortFactory {
  Future<HlsPlayerPort> open({
    required Uri uri,
    required Map<String, String> httpHeaders,
  });
}

/// Production factory that uses the vendored `video_player` plugin.
class VideoPlayerHlsPlayerPortFactory implements HlsPlayerPortFactory {
  const VideoPlayerHlsPlayerPortFactory();

  @override
  Future<HlsPlayerPort> open({
    required Uri uri,
    required Map<String, String> httpHeaders,
  }) {
    return HlsPlayerPort.open(uri: uri, httpHeaders: httpHeaders);
  }
}
