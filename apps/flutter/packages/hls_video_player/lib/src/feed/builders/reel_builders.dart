import 'package:flutter/widgets.dart';
import 'package:hls_video_player/src/feed/builders/reel_layers.dart';
import 'package:hls_video_player/src/feed/builders/reel_slot.dart';
import 'package:hls_video_player/src/feed/reel_playback_state.dart';
import 'package:hls_video_player/src/feed/reel_feed_item.dart';

/// A layer that depends on the reel's data and focus. Runs when the item,
/// focus or lock changes, never on player ticks.
typedef ReelSlotBuilder<T extends ReelFeedItem> =
    Widget? Function(BuildContext context, ReelSlot<T> slot);

/// A layer that follows playback. Runs on every player tick, about ten times
/// a second while playing, so keep it cheap.
typedef ReelTickBuilder<T extends ReelFeedItem> =
    Widget? Function(
      BuildContext context,
      ReelSlot<T> slot,
      ReelPlaybackState state,
    );

/// An animation for one gesture. Runs as the effect starts and ends; the
/// package drives `effect.animation`.
typedef ReelEffectBuilder<T extends ReelFeedItem> =
    Widget? Function(
      BuildContext context,
      ReelSlot<T> slot,
      ReelGestureEffect effect,
    );

/// A whole custom page, built from the package's [ReelLayers].
typedef ReelPageBuilder<T extends ReelFeedItem> =
    Widget? Function(
      BuildContext context,
      ReelSlot<T> slot,
      ReelLayers<T> layers,
    );

/// A feed-wide layer over every page; [current] is null on an insert.
typedef ReelFeedLayerBuilder<T extends ReelFeedItem> =
    Widget? Function(BuildContext context, ReelSlot<T>? current);

/// A gesture on the reel on screen, at [position] in the page.
typedef ReelGestureCallback<T extends ReelFeedItem> =
    void Function(ReelSlot<T> slot, Offset position);

typedef ReelSlotCallback<T extends ReelFeedItem> =
    void Function(ReelSlot<T> slot);

/// A yes/no question about one reel.
typedef ReelSlotPredicate<T extends ReelFeedItem> =
    bool Function(ReelSlot<T> slot);

enum ReelGestureKind { tap, doubleTap, longPress }

/// One running gesture effect, given to `tapEffect`, `doubleTapEffect` and
/// `longPressEffect`.
@immutable
class ReelGestureEffect {
  const ReelGestureEffect({
    required this.kind,
    required this.position,
    required this.animation,
    required this.state,
  });

  final ReelGestureKind kind;

  /// Where the gesture happened, in page coordinates.
  final Offset position;

  /// 0 to 1 over `ReelStyle.effectDuration`; a long press holds at 1 until
  /// release, then runs back to 0.
  final Animation<double> animation;

  /// Playback state at the moment of the gesture.
  final ReelPlaybackState state;
}
