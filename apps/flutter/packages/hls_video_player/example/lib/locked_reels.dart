import 'package:flutter/material.dart';
import 'package:hls_video_player/reels.dart';

class PaidClip implements ReelFeedItem {
  const PaidClip({required this.id, required this.url, required this.isLocked});

  @override
  final String id;
  final String url;

  @override
  final bool isLocked;

  @override
  ReelSource? get source => ReelSource.hls(Uri.parse(url));

  PaidClip unlocked() => PaidClip(id: id, url: url, isLocked: false);
}

/// Paid reels show a curtain and get no player, prefetch or cache until
/// unlocked. Unlocking is a new list from your state.
class LockedReelsFeed extends StatefulWidget {
  const LockedReelsFeed({required this.clips, super.key});

  final List<PaidClip> clips;

  @override
  State<LockedReelsFeed> createState() => _LockedReelsFeedState();
}

class _LockedReelsFeedState extends State<LockedReelsFeed> {
  // Stands in for your cubit's state.
  late List<PaidClip> _clips = widget.clips;

  void _unlock(String id) => setState(() {
    _clips = <PaidClip>[
      for (final PaidClip c in _clips) c.id == id ? c.unlocked() : c,
    ];
  });

  @override
  Widget build(BuildContext context) {
    return ReelFeed<PaidClip>(
      items: _clips,
      itemBuilder: (BuildContext context, ReelSlot<PaidClip> slot) =>
          ReelItem<PaidClip>(
            curtain: (BuildContext context, ReelSlot<PaidClip> slot) =>
                ColoredBox(
                  color: Colors.black87,
                  child: Center(
                    child: FilledButton(
                      onPressed: () => _unlock(slot.id),
                      child: const Text('Unlock'),
                    ),
                  ),
                ),
          ),
    );
  }
}
