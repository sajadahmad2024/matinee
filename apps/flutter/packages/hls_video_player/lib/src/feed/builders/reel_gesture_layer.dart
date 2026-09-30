import 'package:flutter/material.dart';
import 'package:hls_video_player/src/feed/builders/reel_builders.dart';
import 'package:hls_video_player/src/feed/builders/reel_item.dart';
import 'package:hls_video_player/src/feed/builders/reel_slot.dart';
import 'package:meta/meta.dart';
import 'package:hls_video_player/src/feed/reel_feed_item.dart';

/// Tap, double tap and long press over the video, plus their effects.
///
/// It sits under the host overlay and controls, so their buttons win their
/// taps and empty space falls through to here. Off while the reel is locked.
@internal
class ReelGestureLayer<T extends ReelFeedItem> extends StatefulWidget {
  const ReelGestureLayer({
    required this.slot,
    required this.item,
    required this.effectDuration,
    required this.label,
    this.onTap,
    this.onDoubleTap,
    this.onLongPressStart,
    this.onLongPressEnd,
    super.key,
  });

  final ReelSlot<T> slot;
  final ReelItem<T> item;
  final Duration effectDuration;

  /// Screen reader name for the tap action.
  final String label;

  /// Null toggles play.
  final ReelGestureCallback<T>? onTap;

  /// Null leaves double tap off, so single taps fire at once.
  final ReelGestureCallback<T>? onDoubleTap;

  final ReelGestureCallback<T>? onLongPressStart;
  final ReelSlotCallback<T>? onLongPressEnd;

  @override
  State<ReelGestureLayer<T>> createState() => _ReelGestureLayerState<T>();
}

class _ActiveEffect {
  _ActiveEffect(this.effect, this.controller);

  final ReelGestureEffect effect;
  final AnimationController controller;
  final Key key = UniqueKey();
}

class _ReelGestureLayerState<T extends ReelFeedItem>
    extends State<ReelGestureLayer<T>>
    with TickerProviderStateMixin {
  final List<_ActiveEffect> _effects = <_ActiveEffect>[];
  _ActiveEffect? _held;
  Offset _doubleTapAt = Offset.zero;

  ReelSlot<T> get _slot => widget.slot;

  bool get _enabled => _slot.isFocused && !_slot.isLocked;

  @override
  void dispose() {
    for (final _ActiveEffect active in _effects) {
      active.controller.dispose();
    }
    super.dispose();
  }

  void _tap(Offset position) {
    if (!_enabled) {
      return;
    }
    final ReelGestureCallback<T>? onTap = widget.onTap;
    // Captured before the action, so the effect shows what was tapped.
    final ReelGestureEffect? effect = _effectFor(ReelGestureKind.tap, position);
    if (onTap == null) {
      _slot.reel.togglePlay();
    } else {
      onTap(_slot, position);
    }
    _play(effect);
  }

  void _doubleTap() {
    if (!_enabled) {
      return;
    }
    final ReelGestureEffect? effect = _effectFor(
      ReelGestureKind.doubleTap,
      _doubleTapAt,
    );
    widget.onDoubleTap?.call(_slot, _doubleTapAt);
    _play(effect);
  }

  void _longPressStart(LongPressStartDetails details) {
    if (!_enabled) {
      return;
    }
    widget.onLongPressStart?.call(_slot, details.localPosition);
    final ReelGestureEffect? effect = _effectFor(
      ReelGestureKind.longPress,
      details.localPosition,
    );
    _held = _play(effect, hold: true);
  }

  void _longPressEnd(LongPressEndDetails details) {
    final _ActiveEffect? held = _held;
    _held = null;
    if (held != null) {
      held.controller.reverse().whenComplete(() => _remove(held));
    }
    if (_slot.isFocused) {
      widget.onLongPressEnd?.call(_slot);
    }
  }

  ReelEffectBuilder<T>? _builderFor(ReelGestureKind kind) => switch (kind) {
    ReelGestureKind.tap => widget.item.tapEffect,
    ReelGestureKind.doubleTap => widget.item.doubleTapEffect,
    ReelGestureKind.longPress => widget.item.longPressEffect,
  };

  // Null when there is no builder for it or motion is reduced.
  ReelGestureEffect? _effectFor(ReelGestureKind kind, Offset position) {
    if (_builderFor(kind) == null ||
        (MediaQuery.maybeDisableAnimationsOf(context) ?? false)) {
      return null;
    }
    final AnimationController controller = AnimationController(
      vsync: this,
      duration: widget.effectDuration,
    );
    return ReelGestureEffect(
      kind: kind,
      position: position,
      animation: controller,
      state: _slot.state.value,
    );
  }

  _ActiveEffect? _play(ReelGestureEffect? effect, {bool hold = false}) {
    if (effect == null) {
      return null;
    }
    final AnimationController controller =
        effect.animation as AnimationController;
    final _ActiveEffect active = _ActiveEffect(effect, controller);
    setState(() => _effects.add(active));
    final TickerFuture run = controller.forward();
    if (!hold) {
      run.whenComplete(() => _remove(active));
    }
    return active;
  }

  void _remove(_ActiveEffect active) {
    if (!mounted) {
      return;
    }
    setState(() => _effects.remove(active));
    active.controller.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final bool doubleTap = widget.onDoubleTap != null;
    final bool longPress =
        widget.onLongPressStart != null ||
        widget.onLongPressEnd != null ||
        widget.item.longPressEffect != null;
    return Stack(
      fit: StackFit.expand,
      children: <Widget>[
        Semantics(
          button: true,
          label: widget.label,
          onTap: _enabled ? () => _tap(Offset.zero) : null,
          child: GestureDetector(
            behavior: HitTestBehavior.opaque,
            excludeFromSemantics: true,
            onTapUp: (TapUpDetails details) => _tap(details.localPosition),
            onDoubleTapDown: doubleTap
                ? (TapDownDetails details) =>
                      _doubleTapAt = details.localPosition
                : null,
            onDoubleTap: doubleTap ? _doubleTap : null,
            onLongPressStart: longPress ? _longPressStart : null,
            onLongPressEnd: longPress ? _longPressEnd : null,
            child: const SizedBox.expand(),
          ),
        ),
        if (_effects.isNotEmpty)
          IgnorePointer(
            child: Stack(
              fit: StackFit.expand,
              children: <Widget>[
                for (final _ActiveEffect active in _effects)
                  KeyedSubtree(
                    key: active.key,
                    child:
                        _builderFor(
                          active.effect.kind,
                        )?.call(context, _slot, active.effect) ??
                        const SizedBox.shrink(),
                  ),
              ],
            ),
          ),
      ],
    );
  }
}
