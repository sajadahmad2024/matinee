import 'package:flutter/material.dart';
import 'package:hls_video_player/src/feed/builders/reel_item.dart';
import 'package:hls_video_player/src/feed/builders/reel_control_pieces.dart';
import 'package:hls_video_player/src/feed/builders/reel_labels.dart';
import 'package:hls_video_player/src/feed/builders/reel_slot.dart';
import 'package:hls_video_player/src/feed/builders/reel_style.dart';
import 'package:hls_video_player/src/feed/reel_playback_state.dart';
import 'package:meta/meta.dart';
import 'package:hls_video_player/src/feed/reel_feed_item.dart';

/// Default controls, placed from `ReelStyle`: centre play and mute while
/// paused, the bottom bar, and any corner controls.
@internal
class ReelDefaultControls<T extends ReelFeedItem> extends StatelessWidget {
  const ReelDefaultControls({
    required this.slot,
    required this.state,
    required this.item,
    required this.style,
    super.key,
  });

  final ReelSlot<T> slot;
  final ReelPlaybackState state;
  final ReelItem<T> item;
  final ReelStyle style;

  bool get _hasDuration => state.duration > Duration.zero;

  @override
  Widget build(BuildContext context) {
    final List<Widget> top = _at(context, ReelControlPosition.topEnd);
    final List<Widget> bottomStart = _at(
      context,
      ReelControlPosition.bottomStart,
    );
    final List<Widget> bottomEnd = _at(context, ReelControlPosition.bottomEnd);
    final double aboveBar = style.showsBar ? style.bottomBarHeight : 0;
    return Stack(
      fit: StackFit.expand,
      children: <Widget>[
        if (style.centreControls && state.isFocused && !state.isPlayRequested)
          _centre(context),
        if (style.showsBar && _hasDuration) _bar(context),
        if (top.isNotEmpty)
          _corner(AlignmentDirectional.topEnd, top, bottom: 0, top: true),
        if (bottomStart.isNotEmpty)
          _corner(
            AlignmentDirectional.bottomStart,
            bottomStart,
            bottom: aboveBar,
          ),
        if (bottomEnd.isNotEmpty)
          _corner(AlignmentDirectional.bottomEnd, bottomEnd, bottom: aboveBar),
      ],
    );
  }

  // Play at the exact centre with mute above it; empty space does not
  // hit-test, so taps there reach the gesture layer.
  Widget _centre(BuildContext context) {
    return Column(
      children: <Widget>[
        Expanded(
          child: Align(
            alignment: Alignment.bottomCenter,
            child: Padding(
              padding: const EdgeInsets.only(bottom: 16),
              child: ReelMuteButton(
                slot: slot,
                state: state,
                icon: item.muteIcon?.call(context, slot, state),
              ),
            ),
          ),
        ),
        ReelPlayPauseButton(
          slot: slot,
          state: state,
          icon: item.playIcon?.call(context, slot, state),
        ),
        const Expanded(child: SizedBox.shrink()),
      ],
    );
  }

  Widget _bar(BuildContext context) {
    final bool seek = style.seekBar == ReelBarPlacement.bottom;
    final List<Widget> trailing = _at(context, ReelControlPosition.bar);
    return Align(
      alignment: Alignment.bottomCenter,
      child: SafeArea(
        top: false,
        child: Padding(
          padding: style.controlsPadding,
          child: SizedBox(
            height: style.bottomBarHeight,
            child: Row(
              children: <Widget>[
                if (seek)
                  Expanded(
                    child: ReelSeekBar(
                      slot: slot,
                      state: state,
                      track: item.seekBar?.call(context, slot, state),
                    ),
                  )
                else
                  const Spacer(),
                if (seek && trailing.isNotEmpty) const SizedBox(width: 8),
                ...trailing,
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _corner(
    AlignmentDirectional alignment,
    List<Widget> children, {
    required double bottom,
    bool top = false,
  }) {
    return SafeArea(
      top: top,
      bottom: !top,
      child: Padding(
        padding: style.controlsPadding.add(EdgeInsets.only(bottom: bottom)),
        child: Align(
          alignment: alignment,
          child: Row(mainAxisSize: MainAxisSize.min, children: children),
        ),
      ),
    );
  }

  // Timer and fullscreen button placed at [position], in that order.
  List<Widget> _at(BuildContext context, ReelControlPosition position) {
    return <Widget>[
      if (style.timer == position && _hasDuration)
        ReelTimer(state: state, child: item.timer?.call(context, slot, state)),
      if (style.fullscreenButton == position && _hasDuration)
        ReelFullscreenButton(
          slot: slot,
          icon: item.fullscreenIcon?.call(context, slot, state),
        ),
    ];
  }
}

/// Default status: a loader while the reel on screen opens or stalls, and a
/// retry button when its player failed.
@internal
class ReelDefaultStatus<T extends ReelFeedItem> extends StatelessWidget {
  const ReelDefaultStatus({
    required this.slot,
    required this.state,
    required this.item,
    super.key,
  });

  final ReelSlot<T> slot;
  final ReelPlaybackState state;
  final ReelItem<T> item;

  @override
  Widget build(BuildContext context) {
    if (state.status == ReelPlayerStatus.error) {
      final ReelLabels labels = ReelScope.labelsOf(context);
      return item.error?.call(context, slot, state) ??
          Center(
            child: ReelTapTarget(
              label: labels.retry,
              onTap: slot.reel.retry,
              child: const ReelRoundIcon(icon: Icons.refresh),
            ),
          );
    }
    final bool loading =
        state.isFocused &&
        slot.isPlayable &&
        (state.isLoading || state.status == ReelPlayerStatus.idle);
    if (!loading) {
      return const SizedBox.shrink();
    }
    return IgnorePointer(
      child:
          item.loading?.call(context, slot, state) ??
          const Center(child: CircularProgressIndicator(color: Colors.white)),
    );
  }
}
