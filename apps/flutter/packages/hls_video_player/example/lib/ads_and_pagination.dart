import 'package:flutter/material.dart';
import 'package:hls_video_player/reels.dart';

class Video implements ReelFeedItem {
  const Video(this.uri);

  final Uri uri;

  @override
  String get id => uri.toString();

  @override
  ReelSource? get source => ReelSource.hls(uri);

  @override
  bool get isLocked => false;
}

/// An ad after every 5 reels, and the next page loaded near the end.
///
/// Ads never shift reel indexes, and the reel after an ad is kept ready, so
/// swiping on from an ad plays at once.
class AdsAndPaginationFeed extends StatefulWidget {
  const AdsAndPaginationFeed({
    required this.firstPage,
    required this.loadPage,
    super.key,
  });

  final List<Video> firstPage;
  final Future<List<Video>> Function(int page) loadPage;

  @override
  State<AdsAndPaginationFeed> createState() => _AdsAndPaginationFeedState();
}

class _AdsAndPaginationFeedState extends State<AdsAndPaginationFeed> {
  // Stands in for your cubit's state.
  late List<Video> _videos = widget.firstPage;
  int _page = 1;
  bool _loading = false;

  Future<void> _loadMore() async {
    if (_loading) {
      return;
    }
    _loading = true;
    final List<Video> next = await widget.loadPage(_page++);
    if (mounted) {
      // Existing players are kept by id, and only the new items are read.
      setState(() => _videos = <Video>[..._videos, ...next]);
    }
    _loading = false;
  }

  @override
  Widget build(BuildContext context) {
    return ReelFeed<Video>(
      items: _videos,
      inserts: ReelInserts.every(
        5,
        (BuildContext context, ReelInsertSlot slot) =>
            Center(child: Text('Ad before reel ${slot.beforeReel}')),
      ),
      onEndReached: _loadMore,
    );
  }
}
