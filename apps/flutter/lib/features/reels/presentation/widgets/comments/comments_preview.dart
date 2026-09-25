import 'dart:async';

import 'package:material_ui/material_ui.dart';
import 'package:matinee/core/widgets/app_bottom_sheet.dart';
import 'package:matinee/features/reels/presentation/widgets/comments/comment_card.dart';
import 'package:matinee/features/reels/presentation/widgets/comments/comment_thread.dart';
import 'package:matinee/features/reels/presentation/widgets/comments/comments_sheet.dart';

///
/// Opens [CommentsSheet] over hard-coded sample comments, for debug builds
/// until comments have a data layer. Likes, replies and paging work locally.
///
Future<void> showCommentsPreview(BuildContext context) {
  return showAppBottomSheet<void>(context, builder: (_) => const _CommentsPreview());
}

typedef _Sample = ({String id, String handle, String time, String text, int likes, String? mention});

const List<_Sample> _firstPage = [
  (
    id: 'c1',
    handle: 'alexr',
    time: '2m ago',
    text: 'This trailer gave me chills! The cinematography is absolutely stunning.',
    likes: 124,
    mention: null,
  ),
  (
    id: 'c2',
    handle: 'sarahk',
    time: '15m ago',
    text: "Can't believe this drops next month. I've been waiting forever!",
    likes: 88,
    mention: null,
  ),
  (
    id: 'c3',
    handle: 'marcus_t',
    time: '1h ago',
    text:
        'The score in this is insane. Who composed it? It keeps building under every cut and '
        'the last shot lands right on the drop. I have watched it six times already.',
    likes: 56,
    mention: null,
  ),
  (id: 'c4', handle: 'priya.n', time: '2h ago', text: 'Front row on opening night.', likes: 31, mention: null),
];

const List<_Sample> _alexReplies = [
  (id: 'r1', handle: 'sarahk', time: '1m ago', text: 'Same, that opening shot!', likes: 12, mention: null),
  (id: 'r2', handle: 'alexr', time: '1m ago', text: 'Right? The colour grade too.', likes: 4, mention: 'sarahk'),
  (id: 'r3', handle: 'marcus_t', time: 'now', text: 'Shot on film, apparently.', likes: 2, mention: 'alexr'),
  (id: 'r4', handle: 'priya.n', time: 'now', text: 'Needs to be seen in IMAX.', likes: 1, mention: null),
];

class _CommentsPreview extends StatefulWidget {
  const _CommentsPreview();

  @override
  State<_CommentsPreview> createState() => _CommentsPreviewState();
}

class _CommentsPreviewState extends State<_CommentsPreview> {
  static const int _pages = 3;
  static const int _repliesPerPage = 2;
  static const Duration _latency = Duration(milliseconds: 700);

  final List<_Sample> _comments = [..._firstPage];
  final Set<String> _liked = {};
  int _page = 1;
  bool _loadingMore = false;
  int _alexRepliesShown = _repliesPerPage;
  bool _loadingReplies = false;
  String? _replyingTo;

  Future<void> _loadMore() async {
    setState(() => _loadingMore = true);
    await Future<void>.delayed(_latency);
    if (!mounted) {
      return;
    }
    setState(() {
      _page++;
      _comments.addAll([
        for (final sample in _firstPage)
          (
            id: '${sample.id}-p$_page',
            handle: sample.handle,
            time: sample.time,
            text: sample.text,
            likes: sample.likes,
            mention: sample.mention,
          ),
      ]);
      _loadingMore = false;
    });
  }

  Future<void> _loadMoreReplies() async {
    setState(() => _loadingReplies = true);
    await Future<void>.delayed(_latency);
    if (!mounted) {
      return;
    }
    setState(() {
      _alexRepliesShown += _repliesPerPage;
      _loadingReplies = false;
    });
  }

  CommentCard _card(_Sample sample) {
    final liked = _liked.contains(sample.id);
    return CommentCard(
      handle: sample.handle,
      timeLabel: sample.time,
      text: sample.text,
      mention: sample.mention,
      likeCount: sample.likes + (liked ? 1 : 0),
      isLiked: liked,
      onLike: () => setState(() => liked ? _liked.remove(sample.id) : _liked.add(sample.id)),
      onReply: () => setState(() => _replyingTo = sample.handle),
    );
  }

  @override
  Widget build(BuildContext context) {
    return CommentsSheet(
      itemCount: _comments.length,
      hasMore: _page < _pages,
      isLoadingMore: _loadingMore,
      onLoadMore: () => unawaited(_loadMore()),
      replyingTo: _replyingTo,
      onCancelReply: () => setState(() => _replyingTo = null),
      onSend: (_) => setState(() => _replyingTo = null),
      itemBuilder: (context, index) {
        final sample = _comments[index];
        final hasReplies = sample.id == 'c1';
        return CommentThread(
          key: ValueKey(sample.id),
          comment: _card(sample),
          replyCount: hasReplies ? _alexReplies.length : 0,
          replies: hasReplies ? [for (final reply in _alexReplies.take(_alexRepliesShown)) _card(reply)] : const [],
          hasMoreReplies: hasReplies && _alexRepliesShown < _alexReplies.length,
          isLoadingReplies: hasReplies && _loadingReplies,
          onLoadMoreReplies: () => unawaited(_loadMoreReplies()),
        );
      },
    );
  }
}
