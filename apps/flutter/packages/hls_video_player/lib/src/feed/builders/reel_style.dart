import 'package:flutter/material.dart';

/// Whether the seek bar row shows at the bottom of the page.
enum ReelBarPlacement { bottom, hidden }

/// Where a single control sits.
enum ReelControlPosition {
  /// In the bottom bar, after the seek bar.
  bar,

  /// Top-end corner, below the status bar.
  topEnd,

  /// Bottom-start corner, above the bottom bar.
  bottomStart,

  /// Bottom-end corner, above the bottom bar.
  bottomEnd,

  hidden,
}

/// Where and whether the package's page parts show. Anything drawn is a
/// builder in `ReelBuilders`; this only places and toggles.
@immutable
class ReelStyle {
  const ReelStyle({
    this.fit = BoxFit.contain,
    this.background = Colors.black,
    this.scrim,
    this.seekBar = ReelBarPlacement.bottom,
    this.timer = ReelControlPosition.bar,
    this.fullscreenButton = ReelControlPosition.bar,
    this.centreControls = true,
    this.bottomBarHeight = kMinInteractiveDimension,
    this.controlsPadding = const EdgeInsets.symmetric(horizontal: 12),
    this.effectDuration = const Duration(milliseconds: 600),
    this.thumbnailFade = const Duration(milliseconds: 150),
  }) : assert(
         bottomBarHeight >= kMinInteractiveDimension,
         'ReelStyle.bottomBarHeight below 48 would shrink tap targets.',
       );

  /// [BoxFit.contain] letterboxes; [BoxFit.cover] fills and crops.
  final BoxFit fit;

  /// Page colour behind the video.
  final Color background;

  /// Gradient over the video, under your overlay. Null draws none.
  final Gradient? scrim;

  final ReelBarPlacement seekBar;
  final ReelControlPosition timer;
  final ReelControlPosition fullscreenButton;

  /// Play and mute at the centre while the reel is paused.
  final bool centreControls;

  /// Height of the bottom bar row, at least 48 so every control in it keeps
  /// a full tap target.
  final double bottomBarHeight;

  final EdgeInsets controlsPadding;

  /// How long tap, double-tap and long-press effects animate.
  final Duration effectDuration;

  /// Thumbnail fade once the first frame shows.
  final Duration thumbnailFade;

  bool get showsBar =>
      seekBar == ReelBarPlacement.bottom ||
      timer == ReelControlPosition.bar ||
      fullscreenButton == ReelControlPosition.bar;

  bool _anyAt(ReelControlPosition position) =>
      timer == position || fullscreenButton == position;

  bool get _anyTop => _anyAt(ReelControlPosition.topEnd);

  bool get _anyBottomCorner =>
      _anyAt(ReelControlPosition.bottomStart) ||
      _anyAt(ReelControlPosition.bottomEnd);

  /// Space the package's controls take, on top of the [safeArea].
  EdgeInsets insetsFor(EdgeInsets safeArea) {
    return EdgeInsets.only(
      left: safeArea.left,
      right: safeArea.right,
      top: safeArea.top + (_anyTop ? kMinInteractiveDimension : 0),
      bottom:
          safeArea.bottom +
          (showsBar ? bottomBarHeight : 0) +
          (_anyBottomCorner ? kMinInteractiveDimension : 0),
    );
  }

  ReelStyle copyWith({
    BoxFit? fit,
    Color? background,
    Gradient? scrim,
    ReelBarPlacement? seekBar,
    ReelControlPosition? timer,
    ReelControlPosition? fullscreenButton,
    bool? centreControls,
    double? bottomBarHeight,
    EdgeInsets? controlsPadding,
    Duration? effectDuration,
    Duration? thumbnailFade,
  }) {
    return ReelStyle(
      fit: fit ?? this.fit,
      background: background ?? this.background,
      scrim: scrim ?? this.scrim,
      seekBar: seekBar ?? this.seekBar,
      timer: timer ?? this.timer,
      fullscreenButton: fullscreenButton ?? this.fullscreenButton,
      centreControls: centreControls ?? this.centreControls,
      bottomBarHeight: bottomBarHeight ?? this.bottomBarHeight,
      controlsPadding: controlsPadding ?? this.controlsPadding,
      effectDuration: effectDuration ?? this.effectDuration,
      thumbnailFade: thumbnailFade ?? this.thumbnailFade,
    );
  }
}
