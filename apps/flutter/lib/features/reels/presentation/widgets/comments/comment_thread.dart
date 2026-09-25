import 'package:material_ui/material_ui.dart';
import 'package:matinee/core/l10n/l10n.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/widgets/loading_view.dart';
import 'package:matinee/features/reels/presentation/widgets/comments/comment_actions.dart';

///
/// A top-level comment and its replies, one indent in under its text column.
///
/// Replies are collapsed behind View N replies. Every reply sits at the same
/// indent; one answering another reply leads with a mention instead of nesting.
///
class CommentThread extends StatefulWidget {
  const CommentThread({
    required this.comment,
    super.key,
    this.replyCount = 0,
    this.replies = const [],
    this.hasMoreReplies = false,
    this.isLoadingReplies = false,
    this.onExpandedChanged,
    this.onLoadMoreReplies,
  });

  /// Lines replies up with the parent's text: its avatar plus the gap after it.
  static const double replyIndent = AppAvatarSize.comment + AppSpacing.md;

  /// The top-level `CommentCard`.
  final Widget comment;

  /// The total, which the collapsed toggle shows.
  final int replyCount;

  /// The loaded replies, as `CommentCard`s.
  final List<Widget> replies;

  final bool hasMoreReplies;
  final bool isLoadingReplies;

  /// Lets the caller load the first page when the replies open.
  final ValueChanged<bool>? onExpandedChanged;

  final VoidCallback? onLoadMoreReplies;

  @override
  State<CommentThread> createState() => _CommentThreadState();
}

class _CommentThreadState extends State<CommentThread> {
  bool _expanded = false;

  void _setExpanded(bool expanded) {
    setState(() => _expanded = expanded);
    widget.onExpandedChanged?.call(expanded);
  }

  @override
  Widget build(BuildContext context) {
    if (widget.replyCount == 0) {
      return widget.comment;
    }
    final l10n = context.l10n;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        widget.comment,
        Padding(
          padding: const EdgeInsetsDirectional.only(start: CommentThread.replyIndent),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            spacing: AppSpacing.md,
            children: _expanded
                ? [
                    ...widget.replies,
                    if (widget.isLoadingReplies)
                      const SizedBox(height: kMinInteractiveDimension, child: LoadingView())
                    else if (widget.hasMoreReplies)
                      CommentTextAction(label: l10n.reelsCommentsViewMoreReplies, onPressed: widget.onLoadMoreReplies),
                    CommentTextAction(label: l10n.reelsCommentsHideReplies, onPressed: () => _setExpanded(false)),
                  ]
                : [
                    CommentTextAction(
                      label: l10n.reelsCommentsViewReplies(widget.replyCount),
                      onPressed: () => _setExpanded(true),
                    ),
                  ],
          ),
        ),
      ],
    );
  }
}
