import 'package:flutter/material.dart';
import 'package:hls_video_player/src/feed/builders/reel_builders.dart';
import 'package:hls_video_player/src/feed/builders/reel_item.dart';
import 'package:hls_video_player/src/feed/builders/reel_controls_layer.dart';
import 'package:hls_video_player/src/feed/builders/reel_curtain_layer.dart';
import 'package:hls_video_player/src/feed/builders/reel_gesture_layer.dart';
import 'package:hls_video_player/src/feed/builders/reel_slot.dart';
import 'package:hls_video_player/src/feed/builders/reel_style.dart';
import 'package:hls_video_player/src/feed/reel_feed_item.dart';
import 'package:hls_video_player/src/feed/reel_playback_state.dart';
import 'package:hls_video_player/src/feed/reel_video.dart';
import 'package:meta/meta.dart';

/// Each part of one reel's page, resolved to your builder or the default.
///
/// The default page is [stack]. A custom `ReelBuilders.page` reuses the parts
/// it wants and keeps the package's gestures, curtain and rebuild rules:
///
/// ```dart
/// page: (context, slot, layers) => Column(children: [
///   Expanded(child: Stack(children: [layers.video, layers.gestures, layers.controls])),
///   CommentsPanel(slot.data),
/// ]),
/// ```
class ReelLayers<T extends ReelFeedItem> {
  ReelLayers({
    required this.slot,
    required this.item,
    required this.style,
    required this.gestureLabel,
    this.onTap,
    this.onDoubleTap,
    this.onLongPressStart,
    this.onLongPressEnd,
    this._hud,
    this.forCustomPage = false,
  });

  final ReelSlot<T> slot;
  final ReelItem<T> item;
  final ReelStyle style;
  final String gestureLabel;
  final ReelGestureCallback<T>? onTap;
  final ReelGestureCallback<T>? onDoubleTap;
  final ReelGestureCallback<T>? onLongPressStart;
  final ReelSlotCallback<T>? onLongPressEnd;

  final Widget? _hud;

  /// On a custom page the package places the curtain and the HUD itself, so
  /// [curtain] and [hud] are empty there and can never appear twice.
  final bool forCustomPage;

  Widget get background => IgnorePointer(
    child: _DataLayer<T>(
      slot: slot,
      builder: item.background,
      fallback: (_) => ColoredBox(color: style.background),
    ),
  );

  /// Fades out once the first frame shows; stays while locked.
  Widget get thumbnail {
    final ReelSlotBuilder<T>? builder = item.thumbnail;
    if (builder == null) {
      return const SizedBox.shrink();
    }
    return IgnorePointer(
      child: _Thumbnail(
        slot: slot,
        fade: style.thumbnailFade,
        // Built with the page, not per tick; the fade listens on its own.
        child: Builder(
          builder: (BuildContext context) =>
              builder(context, slot) ?? const SizedBox.shrink(),
        ),
      ),
    );
  }

  Widget get video => IgnorePointer(
    child: _DataLayer<T>(
      slot: slot,
      builder: item.video,
      fallback: (_) => ReelVideo(
        slot.reel,
        fit: style.fit,
        showBufferLoader: false,
        backgroundColor: Colors.transparent,
      ),
    ),
  );

  Widget get scrim {
    final Gradient? gradient = style.scrim;
    return IgnorePointer(
      child: _DataLayer<T>(
        slot: slot,
        builder: item.scrim,
        fallback: (_) => gradient == null
            ? const SizedBox.shrink()
            : DecoratedBox(decoration: BoxDecoration(gradient: gradient)),
      ),
    );
  }

  /// Tap, double tap, long press and their effects. Off while locked.
  Widget get gestures {
    if (slot.isLocked) {
      return const SizedBox.shrink();
    }
    return ReelGestureLayer<T>(
      slot: slot,
      item: item,
      effectDuration: style.effectDuration,
      label: gestureLabel,
      onTap: onTap,
      onDoubleTap: onDoubleTap,
      onLongPressStart: onLongPressStart,
      onLongPressEnd: onLongPressEnd,
    );
  }

  Widget get overlay =>
      _DataLayer<T>(slot: slot, builder: item.overlay, fallback: null);

  /// The debug HUD panel, on the focused page only and while the HUD is on.
  /// It sits under the controls so they stay usable.
  Widget get hud => forCustomPage ? const SizedBox.shrink() : hudPanel;

  /// The HUD panel itself, for the package to place.
  @internal
  Widget get hudPanel => _hud ?? const SizedBox.shrink();

  /// Hidden while locked: the curtain replaces them.
  Widget get controls {
    if (slot.isLocked) {
      return const SizedBox.shrink();
    }
    return _TickLayer<T>(
      slot: slot,
      builder: item.controls,
      fallback: (BuildContext context, ReelPlaybackState state) =>
          ReelDefaultControls<T>(
            slot: slot,
            state: state,
            item: item,
            style: style,
          ),
    );
  }

  Widget get status {
    if (slot.isLocked) {
      return const SizedBox.shrink();
    }
    return _TickLayer<T>(
      slot: slot,
      builder: item.status,
      fallback: (BuildContext context, ReelPlaybackState state) =>
          ReelDefaultStatus<T>(slot: slot, state: state, item: item),
    );
  }

  /// Shown only while locked.
  Widget get curtain =>
      forCustomPage ? const SizedBox.shrink() : enforcedCurtain;

  /// The curtain itself, for the package to place.
  @internal
  Widget get enforcedCurtain {
    if (!slot.isLocked) {
      return const SizedBox.shrink();
    }
    return ReelCurtainLayer(
      slot: slot,
      child: _DataLayer<T>(slot: slot, builder: item.curtain, fallback: null),
    );
  }

  Widget get aboveCurtain =>
      _DataLayer<T>(slot: slot, builder: item.aboveCurtain, fallback: null);

  /// These layers for a custom page, where the package places the curtain
  /// and the HUD.
  @internal
  ReelLayers<T> forCustom() => ReelLayers<T>(
    slot: slot,
    item: item,
    style: style,
    gestureLabel: gestureLabel,
    onTap: onTap,
    onDoubleTap: onDoubleTap,
    onLongPressStart: onLongPressStart,
    onLongPressEnd: onLongPressEnd,
    hud: _hud,
    forCustomPage: true,
  );

  /// The default page: every layer in the package's order.
  Widget get stack => Stack(
    fit: StackFit.expand,
    children: <Widget>[
      background,
      thumbnail,
      video,
      scrim,
      gestures,
      overlay,
      hud,
      controls,
      status,
      curtain,
      aboveCurtain,
    ],
  );

  /// The fullscreen page: video, gestures, controls and status only.
  Widget get fullscreenStack => Stack(
    fit: StackFit.expand,
    children: <Widget>[background, video, gestures, controls, status],
  );
}

/// A data layer: runs its builder with the page, never on player ticks.
class _DataLayer<T extends ReelFeedItem> extends StatelessWidget {
  const _DataLayer({
    required this.slot,
    required this.builder,
    required this.fallback,
  });

  final ReelSlot<T> slot;
  final ReelSlotBuilder<T>? builder;
  final WidgetBuilder? fallback;

  @override
  Widget build(BuildContext context) {
    return builder?.call(context, slot) ??
        fallback?.call(context) ??
        const SizedBox.shrink();
  }
}

/// A tick layer: rebuilds with the reel's playback state.
class _TickLayer<T extends ReelFeedItem> extends StatelessWidget {
  const _TickLayer({
    required this.slot,
    required this.builder,
    required this.fallback,
  });

  final ReelSlot<T> slot;
  final ReelTickBuilder<T>? builder;
  final Widget Function(BuildContext context, ReelPlaybackState state) fallback;

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<ReelPlaybackState>(
      valueListenable: slot.state,
      builder: (BuildContext context, ReelPlaybackState state, _) =>
          builder?.call(context, slot, state) ?? fallback(context, state),
    );
  }
}

class _Thumbnail extends StatelessWidget {
  const _Thumbnail({
    required this.slot,
    required this.fade,
    required this.child,
  });

  final ReelSlot<ReelFeedItem> slot;
  final Duration fade;
  final Widget child;

  static bool _showing(ReelPlaybackState state) =>
      state.status == ReelPlayerStatus.idle ||
      state.status == ReelPlayerStatus.opening ||
      state.status == ReelPlayerStatus.error;

  @override
  Widget build(BuildContext context) {
    final bool reduced = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    return ValueListenableBuilder<ReelPlaybackState>(
      valueListenable: slot.state,
      child: child,
      builder: (BuildContext context, ReelPlaybackState state, Widget? child) =>
          AnimatedOpacity(
            opacity: slot.isLocked || _showing(state) ? 1 : 0,
            duration: reduced ? Duration.zero : fade,
            child: child,
          ),
    );
  }
}
