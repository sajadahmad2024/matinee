import 'package:material_ui/material_ui.dart';
import 'package:matinee/core/assets/app_icon_assets.dart';
import 'package:matinee/core/l10n/l10n.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/core/widgets/svg_icon.dart';

/// Like with its count, then Reply, under a comment's text.
class CommentActions extends StatelessWidget {
  const CommentActions({
    required this.likeCount,
    required this.isLiked,
    required this.onLike,
    required this.onReply,
    super.key,
  });

  final int likeCount;
  final bool isLiked;
  final VoidCallback onLike;
  final VoidCallback onReply;

  @override
  Widget build(BuildContext context) {
    return Row(
      spacing: AppSpacing.lg,
      children: [
        _LikeButton(likeCount: likeCount, isLiked: isLiked, onTap: onLike),
        CommentTextAction(label: context.l10n.reelsCommentsReply, onPressed: onReply),
      ],
    );
  }
}

///
/// A comment's small text control: Reply, See more and the reply toggles.
/// Laid out at 48 for the tap target; the caption it paints is much smaller.
///
class CommentTextAction extends StatelessWidget {
  const CommentTextAction({required this.label, required this.onPressed, super.key});

  final String label;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    return TextButton(
      onPressed: onPressed,
      style: TextButton.styleFrom(
        foregroundColor: context.appColors.text.muted,
        textStyle: AppTextStyle.caption,
        padding: EdgeInsets.zero,
        minimumSize: const Size.square(kMinInteractiveDimension),
        alignment: AlignmentDirectional.centerStart,
      ),
      child: Text(label),
    );
  }
}

class _LikeButton extends StatelessWidget {
  const _LikeButton({required this.likeCount, required this.isLiked, required this.onTap});

  final int likeCount;
  final bool isLiked;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    final count = context.compactFormat.format(likeCount);
    return Semantics(
      button: true,
      label: context.l10n.reelsLikeAction(count),
      selected: isLiked,
      // Forwarding onTap keeps the InkWell's action reachable once the
      // subtree below is excluded from semantics.
      excludeSemantics: true,
      onTap: onTap,
      child: InkWell(
        onTap: onTap,
        child: ConstrainedBox(
          constraints: const BoxConstraints(
            minWidth: kMinInteractiveDimension,
            minHeight: kMinInteractiveDimension,
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            spacing: AppSpacing.xs,
            children: [
              SvgIcon(
                AppIconAssets.like,
                color: isLiked ? colors.icon.accent : colors.text.secondary,
                size: AppIconSize.sm,
              ),
              Text(count, style: AppTextStyle.caption.copyWith(color: colors.text.secondary)),
            ],
          ),
        ),
      ),
    );
  }
}
