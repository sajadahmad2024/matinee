import 'package:flutter/foundation.dart';
import 'package:hls_video_player/src/feed/builders/reel_builders.dart';
import 'package:hls_video_player/src/feed/builders/reel_labels.dart';
import 'package:hls_video_player/src/feed/builders/reel_style.dart';
import 'package:hls_video_player/src/feed/reel_feed_item.dart';

/// One reel's page, returned from `ReelFeed.itemBuilder`. Every part is an
/// optional builder; returning null, or leaving it out, keeps the default.
///
/// Layers, bottom to top: [background], [thumbnail], [video], [scrim],
/// gestures and effects, [overlay], the debug HUD, [controls], [status],
/// [curtain], [aboveCurtain].
///
/// ```dart
/// itemBuilder: (context, slot) => ReelItem(
///   overlay: (context, slot) => Caption(slot.data),
///   curtain: (context, slot) => Unlock(onTap: () => cubit.unlock(slot.id)),
/// ),
/// ```
@immutable
class ReelItem<T extends ReelFeedItem> {
  const ReelItem({
    this.background,
    this.thumbnail,
    this.video,
    this.scrim,
    this.overlay,
    this.curtain,
    this.aboveCurtain,
    this.controls,
    this.status,
    this.loading,
    this.error,
    this.seekBar,
    this.timer,
    this.playIcon,
    this.muteIcon,
    this.fullscreenIcon,
    this.tapEffect,
    this.doubleTapEffect,
    this.longPressEffect,
    this.style,
    this.labels,
  }) : page = null;

  /// A page of another shape, built from the package's layers. The other
  /// builders still shape the layers it uses (`layers.curtain` shows
  /// [curtain]), and the curtain shows on a locked reel even if [page] leaves
  /// it out.
  const ReelItem.custom({
    required ReelPageBuilder<T> this.page,
    this.background,
    this.thumbnail,
    this.video,
    this.scrim,
    this.overlay,
    this.curtain,
    this.aboveCurtain,
    this.controls,
    this.status,
    this.loading,
    this.error,
    this.seekBar,
    this.timer,
    this.playIcon,
    this.muteIcon,
    this.fullscreenIcon,
    this.tapEffect,
    this.doubleTapEffect,
    this.longPressEffect,
    this.style,
    this.labels,
  });

  /// Behind everything. Default: `ReelStyle.background`.
  final ReelSlotBuilder<T>? background;

  /// Shown until the first frame, then faded out; stays on a locked reel.
  final ReelSlotBuilder<T>? thumbnail;

  /// The video surface. Default: `ReelVideo` with `ReelStyle.fit`.
  final ReelSlotBuilder<T>? video;

  /// Over the video. Default: `ReelStyle.scrim`.
  final ReelSlotBuilder<T>? scrim;

  /// Your UI: caption, author, action rail. Pad it with `slot.insets`.
  final ReelSlotBuilder<T>? overlay;

  /// Shown above everything while the reel is locked; video gestures are off
  /// and swiping past it still changes page.
  final ReelSlotBuilder<T>? curtain;

  /// Above the curtain, e.g. a Share button that stays usable on locked reels.
  final ReelSlotBuilder<T>? aboveCurtain;

  /// Replaces all controls. Prefer the piece builders below.
  final ReelTickBuilder<T>? controls;

  /// Replaces the loader and the error view together.
  final ReelTickBuilder<T>? status;

  /// Shown while the reel on screen is opening or stalled.
  final ReelTickBuilder<T>? loading;

  /// Shown when the player failed. Offer `slot.reel.retry`.
  final ReelTickBuilder<T>? error;

  /// Visual of the seek track; taps on it still seek.
  final ReelTickBuilder<T>? seekBar;

  /// Replaces the `m:ss / m:ss` text.
  final ReelTickBuilder<T>? timer;

  /// Visual of the centre play button; the package handles the tap.
  final ReelTickBuilder<T>? playIcon;

  /// Visual of the mute button; the package handles the tap.
  final ReelTickBuilder<T>? muteIcon;

  /// Visual of the fullscreen button; the package handles the tap.
  final ReelTickBuilder<T>? fullscreenIcon;

  final ReelEffectBuilder<T>? tapEffect;

  /// Needs `ReelFeed.onDoubleTap`, which enables double tap.
  final ReelEffectBuilder<T>? doubleTapEffect;

  final ReelEffectBuilder<T>? longPressEffect;

  /// Set by [ReelItem.custom] only.
  final ReelPageBuilder<T>? page;

  /// This page's style; null uses `ReelFeed.style`.
  final ReelStyle? style;

  /// This page's labels; null uses `ReelFeed.labels`.
  final ReelLabels? labels;
}
