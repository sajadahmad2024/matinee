import 'package:flutter/widgets.dart';
import 'package:hls_video_player/src/feed/builders/reel_builders.dart';
import 'package:hls_video_player/src/feed/builders/reel_item.dart';
import 'package:hls_video_player/src/feed/builders/reel_labels.dart';
import 'package:hls_video_player/src/feed/builders/reel_layers.dart';
import 'package:hls_video_player/src/feed/builders/reel_slot.dart';
import 'package:hls_video_player/src/feed/builders/reel_style.dart';
import 'package:hls_video_player/src/feed/reel_feed_controller.dart';
import 'package:meta/meta.dart';
import 'package:hls_video_player/src/feed/reel_feed_item.dart';

/// One reel's page from its `ReelItem`: the default layer stack, or the
/// item's custom page with the curtain still enforced.
@internal
class ReelPage<T extends ReelFeedItem> extends StatelessWidget {
  const ReelPage({
    required this.reel,
    required this.item,
    required this.style,
    required this.labels,
    this.onTap,
    this.onDoubleTap,
    this.onLongPressStart,
    this.onLongPressEnd,
    this.isFullscreen = false,
    this.hud,
    super.key,
  });

  final ReelHandle<T> reel;
  final ReelItem<T> item;

  /// Feed defaults; the item's own style and labels win.
  final ReelStyle style;
  final ReelLabels labels;
  final ReelGestureCallback<T>? onTap;
  final ReelGestureCallback<T>? onDoubleTap;
  final ReelGestureCallback<T>? onLongPressStart;
  final ReelSlotCallback<T>? onLongPressEnd;
  final bool isFullscreen;

  /// The feed's single HUD panel, given only to the focused page.
  final Widget? hud;

  @override
  Widget build(BuildContext context) {
    final ReelStyle style = item.style ?? this.style;
    final ReelLabels labels = item.labels ?? this.labels;
    final ReelSlot<T> slot = ReelSlot<T>(
      reel: reel,
      insets: style.insetsFor(MediaQuery.paddingOf(context)),
      isFullscreen: isFullscreen,
    );
    final ReelLayers<T> layers = ReelLayers<T>(
      slot: slot,
      item: item,
      style: style,
      gestureLabel: labels.togglePlay,
      onTap: onTap,
      onDoubleTap: onDoubleTap,
      onLongPressStart: onLongPressStart,
      onLongPressEnd: onLongPressEnd,
      hud: hud,
    );
    return ReelScope(
      style: style,
      labels: labels,
      child: isFullscreen
          ? layers.fullscreenStack
          : _page(context, slot, layers),
    );
  }

  Widget _page(BuildContext context, ReelSlot<T> slot, ReelLayers<T> layers) {
    final ReelPageBuilder<T>? page = item.page;
    if (page == null) {
      return layers.stack;
    }
    final ReelLayers<T> custom = layers.forCustom();
    final Widget? built = page(context, slot, custom);
    // Null keeps the default page, which already holds the curtain and HUD.
    if (built == null) {
      return layers.stack;
    }
    // The package places the curtain and the HUD over a custom page, so they
    // are never missing and never doubled, whatever the page reads.
    return Stack(
      fit: StackFit.expand,
      children: <Widget>[built, custom.enforcedCurtain, custom.hudPanel],
    );
  }
}
