import 'package:flutter/foundation.dart';

/// Screen reader names for the package's controls. Pass localized strings;
/// the English defaults are for prototypes.
@immutable
class ReelLabels {
  const ReelLabels({
    this.togglePlay = 'Play or pause',
    this.play = 'Play',
    this.pause = 'Pause',
    this.mute = 'Mute',
    this.unmute = 'Unmute',
    this.fullscreen = 'Full screen',
    this.exitFullscreen = 'Exit full screen',
    this.retry = 'Retry',
    this.seek = 'Seek',
  });

  /// The tap layer over the video.
  final String togglePlay;

  final String play;
  final String pause;
  final String mute;
  final String unmute;
  final String fullscreen;
  final String exitFullscreen;
  final String retry;

  /// The seek bar, read as a slider.
  final String seek;
}
