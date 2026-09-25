import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:material_ui/material_ui.dart';
import 'package:matinee/core/assets/app_icon_assets.dart';
import 'package:matinee/core/l10n/l10n.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/core/widgets/svg_icon.dart';
import 'package:matinee/features/reels/data/models/reel.dart';
import 'package:matinee/features/reels/presentation/widgets/comments/comments_preview.dart';

///
/// The Home video overlay's action rail: like, comments, info, share, stacked
/// bottom-right over the player.
///
/// Like is the one stateful button — the [Reel] model has no `isLiked` flag,
/// so its toggle and optimistic count stay local, never persisted.
///
class ReelActionRail extends StatefulWidget {
  const ReelActionRail({required this.reel, super.key});

  final Reel reel;

  @override
  State<ReelActionRail> createState() => _ReelActionRailState();
}

class _ReelActionRailState extends State<ReelActionRail> {
  bool _liked = false;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final icon = context.appColors.icon;
    final format = context.compactFormat;
    final likeCount = format.format(widget.reel.likeCount + (_liked ? 1 : 0));
    final commentCount = format.format(widget.reel.commentCount);

    return Column(
      mainAxisSize: MainAxisSize.min,
      spacing: AppSpacing.xl,
      children: [
        _RailButton(
          asset: AppIconAssets.like,
          iconColor: _liked ? icon.accent : icon.primary,
          label: likeCount,
          semanticLabel: l10n.reelsLikeAction(likeCount),
          selected: _liked,
          onTap: () => setState(() => _liked = !_liked),
        ),
        _RailButton(
          asset: AppIconAssets.comment,
          iconColor: icon.primary,
          label: commentCount,
          semanticLabel: l10n.reelsCommentAction(commentCount),
          // Sample comments until comments have a data layer; debug only.
          onTap: kDebugMode ? () => unawaited(showCommentsPreview(context)) : () {},
        ),
        _RailButton(
          asset: AppIconAssets.info,
          iconColor: icon.primary,
          label: l10n.reelsInfoAction,
          semanticLabel: l10n.reelsInfoAction,
          onTap: () {},
        ),
        _RailButton(
          asset: AppIconAssets.share,
          iconColor: icon.primary,
          label: l10n.reelsShareAction,
          semanticLabel: l10n.reelsShareAction,
          onTap: () {},
        ),
      ],
    );
  }
}

class _RailButton extends StatelessWidget {
  const _RailButton({
    required this.asset,
    required this.iconColor,
    required this.label,
    required this.semanticLabel,
    required this.onTap,
    this.selected,
  });

  final String asset;
  final Color iconColor;
  final String label;
  final String semanticLabel;
  final VoidCallback onTap;
  final bool? selected;

  @override
  Widget build(BuildContext context) {
    final labelColor = context.appColors.text.secondary;
    return Semantics(
      button: true,
      label: semanticLabel,
      selected: selected,
      // Forwarding onTap keeps the InkWell's action reachable once the
      // subtree below is excluded from semantics.
      excludeSemantics: true,
      onTap: onTap,
      child: InkWell(
        onTap: onTap,
        customBorder: const CircleBorder(),
        child: ConstrainedBox(
          constraints: const BoxConstraints(
            minWidth: kMinInteractiveDimension,
            minHeight: kMinInteractiveDimension,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            spacing: AppSpacing.xs,
            children: [
              SvgIcon(asset, color: iconColor, size: AppIconSize.lg),
              Text(label, style: AppTextStyle.numeralAction.copyWith(color: labelColor)),
            ],
          ),
        ),
      ),
    );
  }
}
