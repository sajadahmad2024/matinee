import 'package:flutter/material.dart';
import 'package:hls_video_player/reels.dart';

/// Your model. It describes itself to the feed; your data layer fills it in.
class Clip implements ReelFeedItem {
  const Clip({required this.id, required this.url, required this.title});

  @override
  final String id;
  final String url;
  final String title;

  @override
  ReelSource? get source => ReelSource.hls(Uri.parse(url));

  @override
  bool get isLocked => false;
}

/// The smallest feed: the default page, plus a title over it.
///
/// Call `await HlsEngine.initialize()` once at app start before showing it.
class BasicFeed extends StatelessWidget {
  const BasicFeed({required this.clips, super.key});

  final List<Clip> clips;

  @override
  Widget build(BuildContext context) {
    return ReelFeed<Clip>(
      items: clips,
      itemBuilder: (BuildContext context, ReelSlot<Clip> slot) =>
          ReelItem<Clip>(
            overlay: (BuildContext context, ReelSlot<Clip> slot) => Align(
              alignment: Alignment.bottomLeft,
              child: Padding(
                padding: slot.insets.add(const EdgeInsets.all(16)),
                child: Text(slot.data.title),
              ),
            ),
          ),
    );
  }
}
