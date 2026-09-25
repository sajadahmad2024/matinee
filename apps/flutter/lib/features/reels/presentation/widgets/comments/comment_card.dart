import 'package:material_ui/material_ui.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/widgets/app_avatar.dart';
import 'package:matinee/features/reels/presentation/widgets/comments/comment_actions.dart';
import 'package:matinee/features/reels/presentation/widgets/comments/comment_body.dart';
import 'package:matinee/features/reels/presentation/widgets/comments/comment_header.dart';

///
/// One comment or reply: avatar, then handle and time, the text, and the
/// like and reply actions. Replies use this same card.
///
class CommentCard extends StatelessWidget {
  const CommentCard({
    required this.handle,
    required this.timeLabel,
    required this.text,
    required this.likeCount,
    required this.isLiked,
    required this.onLike,
    required this.onReply,
    super.key,
    this.avatarUrl,
    this.mention,
  });

  /// Without the leading `@`.
  final String handle;

  final String timeLabel;
  final String text;
  final int likeCount;
  final bool isLiked;
  final VoidCallback onLike;
  final VoidCallback onReply;
  final String? avatarUrl;

  /// The handle a reply to a reply answers; see [CommentBody.mention].
  final String? mention;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      spacing: AppSpacing.md,
      children: [
        AppAvatar(name: handle, imageUrl: avatarUrl),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              CommentHeader(handle: handle, timeLabel: timeLabel),
              Padding(
                padding: const EdgeInsets.only(top: AppSpacing.xs),
                child: CommentBody(text: text, mention: mention),
              ),
              // No top gap: the actions' 48 tap targets already overhang the
              // frame's 8.
              CommentActions(likeCount: likeCount, isLiked: isLiked, onLike: onLike, onReply: onReply),
            ],
          ),
        ),
      ],
    );
  }
}
