import 'package:material_ui/material_ui.dart';
import 'package:matinee/core/l10n/l10n.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/features/reels/presentation/widgets/comments/comment_actions.dart';

///
/// A comment's text, cut to [collapsedLines] with See more when it runs
/// longer. [mention] leads a reply to a reply, since replies never nest.
///
class CommentBody extends StatefulWidget {
  const CommentBody({required this.text, super.key, this.mention, this.collapsedLines = 3});

  final String text;

  /// The handle replied to, without the leading `@`.
  final String? mention;

  final int collapsedLines;

  @override
  State<CommentBody> createState() => _CommentBodyState();
}

class _CommentBodyState extends State<CommentBody> {
  bool _expanded = false;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    final style = AppTextStyle.bodySmall.copyWith(color: colors.text.secondary);
    final mention = widget.mention;
    final span = TextSpan(
      style: style,
      children: [
        if (mention != null)
          TextSpan(
            text: '${context.l10n.reelsCommentsHandle(mention)} ',
            style: style.copyWith(color: colors.text.primary),
          ),
        TextSpan(text: widget.text),
      ],
    );
    if (_expanded) {
      return Text.rich(span);
    }
    return LayoutBuilder(
      builder: (context, constraints) {
        final painter = TextPainter(
          text: span,
          maxLines: widget.collapsedLines,
          textDirection: Directionality.of(context),
          textScaler: MediaQuery.textScalerOf(context),
        )..layout(maxWidth: constraints.maxWidth);
        final overflows = painter.didExceedMaxLines;
        painter.dispose();
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text.rich(span, maxLines: widget.collapsedLines, overflow: TextOverflow.ellipsis),
            if (overflows)
              CommentTextAction(
                label: context.l10n.reelsCommentsSeeMore,
                onPressed: () => setState(() => _expanded = true),
              ),
          ],
        );
      },
    );
  }
}
