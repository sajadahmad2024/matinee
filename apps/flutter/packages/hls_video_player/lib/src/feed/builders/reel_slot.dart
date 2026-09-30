import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:hls_video_player/src/feed/builders/reel_labels.dart';
import 'package:hls_video_player/src/feed/builders/reel_style.dart';
import 'package:hls_video_player/src/feed/reel_feed_controller.dart';
import 'package:hls_video_player/src/feed/reel_playback_state.dart';
import 'package:hls_video_player/src/feed/reel_feed_item.dart';

/// One reel's page, as every builder sees it: like the `index` of
/// `ListView.builder`, plus the reel's state and commands.
///
/// ```dart
/// overlay: (context, slot) => slot.index == 0 ? const Intro() : null,
/// ```
@immutable
class ReelSlot<T extends ReelFeedItem> {
  const ReelSlot({
    required this.reel,
    required this.insets,
    this.isFullscreen = false,
  });

  /// Commands and live state: `play`, `pause`, `seekTo`, `retry`,
  /// `mutedOverride`, `state`.
  final ReelHandle<T> reel;

  /// Space taken by the package's controls and the safe area. Pad your
  /// overlay with it so nothing sits under the seek bar.
  final EdgeInsets insets;

  /// Whether this is the rotated fullscreen view.
  final bool isFullscreen;

  int get index => reel.index;
  String get id => reel.id;
  T get data => reel.data;
  bool get isFocused => reel.isFocused;

  /// Locked reels have no player; the curtain shows instead.
  bool get isLocked => reel.isLocked;

  bool get isPlayable => reel.isPlayable;
  ValueListenable<ReelPlaybackState> get state => reel.state;
  ReelFeedController<T> get feed => reel.feed;
}

/// Style and labels for the package's page parts below it.
///
/// `ReelFeed` provides it; control pieces such as `ReelSeekBar` read it, so a
/// host can use them in its own controls without passing configuration.
class ReelScope extends InheritedWidget {
  const ReelScope({
    required this.style,
    required this.labels,
    required super.child,
    super.key,
  });

  final ReelStyle style;
  final ReelLabels labels;

  static ReelScope? maybeOf(BuildContext context) =>
      context.dependOnInheritedWidgetOfExactType<ReelScope>();

  static ReelStyle styleOf(BuildContext context) =>
      maybeOf(context)?.style ?? const ReelStyle();

  static ReelLabels labelsOf(BuildContext context) =>
      maybeOf(context)?.labels ?? const ReelLabels();

  @override
  bool updateShouldNotify(ReelScope oldWidget) =>
      style != oldWidget.style || labels != oldWidget.labels;
}
