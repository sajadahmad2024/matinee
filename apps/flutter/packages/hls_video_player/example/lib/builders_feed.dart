import 'package:flutter/material.dart';
import 'package:hls_video_player/reels.dart';

class Trailer implements ReelFeedItem {
  const Trailer({
    required this.id,
    required this.url,
    required this.title,
    required this.poster,
    this.isLocked = false,
    this.isLiked = false,
  });

  @override
  final String id;
  final String url;
  final String title;
  final String poster;
  final bool isLiked;

  @override
  final bool isLocked;

  @override
  ReelSource? get source => ReelSource.hls(Uri.parse(url));

  Trailer copyWith({bool? isLocked, bool? isLiked}) => Trailer(
    id: id,
    url: url,
    title: title,
    poster: poster,
    isLocked: isLocked ?? this.isLocked,
    isLiked: isLiked ?? this.isLiked,
  );
}

/// A layered feed: no Stack, no layer order, no curtain wiring. `items` come
/// from your state; `itemBuilder` describes each page.
class BuildersFeed extends StatefulWidget {
  const BuildersFeed({required this.trailers, super.key});

  final List<Trailer> trailers;

  @override
  State<BuildersFeed> createState() => _BuildersFeedState();
}

class _BuildersFeedState extends State<BuildersFeed> {
  // Stands in for your cubit's state; each change is a new list.
  late List<Trailer> _trailers = widget.trailers;

  void _change(String id, Trailer Function(Trailer t) edit) => setState(() {
    _trailers = <Trailer>[
      for (final Trailer t in _trailers) t.id == id ? edit(t) : t,
    ];
  });

  @override
  Widget build(BuildContext context) {
    return ReelFeed<Trailer>(
      items: _trailers,
      style: const ReelStyle(
        timer: ReelControlPosition.topEnd,
        scrim: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: <Color>[Colors.transparent, Colors.black54],
        ),
      ),
      // Enabling double tap makes single taps wait ~300 ms; only set it when
      // you need it.
      onDoubleTap: (ReelSlot<Trailer> slot, Offset position) =>
          _change(slot.id, (Trailer t) => t.copyWith(isLiked: true)),
      itemBuilder: (BuildContext context, ReelSlot<Trailer> slot) =>
          ReelItem<Trailer>(
            thumbnail: (BuildContext context, ReelSlot<Trailer> slot) =>
                Image.network(slot.data.poster, fit: BoxFit.cover),
            overlay: (BuildContext context, ReelSlot<Trailer> slot) => Align(
              alignment: Alignment.bottomLeft,
              child: Padding(
                padding: slot.insets.add(const EdgeInsets.all(16)),
                child: Text(
                  slot.data.isLiked ? '♥ ${slot.data.title}' : slot.data.title,
                ),
              ),
            ),
            curtain: (BuildContext context, ReelSlot<Trailer> slot) =>
                ColoredBox(
                  color: Colors.black87,
                  child: Center(
                    child: FilledButton(
                      onPressed: () => _change(
                        slot.id,
                        (Trailer t) => t.copyWith(isLocked: false),
                      ),
                      child: const Text('Unlock'),
                    ),
                  ),
                ),
            doubleTapEffect:
                (
                  BuildContext context,
                  ReelSlot<Trailer> slot,
                  ReelGestureEffect effect,
                ) => Positioned(
                  left: effect.position.dx - 40,
                  top: effect.position.dy - 40,
                  child: FadeTransition(
                    opacity: ReverseAnimation(effect.animation),
                    child: ScaleTransition(
                      scale: effect.animation,
                      child: const Icon(Icons.favorite, size: 80),
                    ),
                  ),
                ),
            // Only the first reel gets custom controls; the rest keep defaults.
            controls:
                (
                  BuildContext context,
                  ReelSlot<Trailer> slot,
                  ReelPlaybackState state,
                ) => slot.index == 0
                ? Align(
                    alignment: Alignment.bottomCenter,
                    child: SafeArea(
                      child: ReelSeekBar(slot: slot, state: state),
                    ),
                  )
                : null,
          ),
    );
  }
}
