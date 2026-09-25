import 'package:material_ui/material_ui.dart';
import 'package:matinee/core/l10n/l10n.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';

/// The commenter's handle and how long ago they wrote, on one line.
class CommentHeader extends StatelessWidget {
  const CommentHeader({required this.handle, required this.timeLabel, super.key});

  /// Without the leading `@`.
  final String handle;

  final String timeLabel;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    return Row(
      crossAxisAlignment: CrossAxisAlignment.baseline,
      textBaseline: TextBaseline.alphabetic,
      spacing: AppSpacing.sm,
      children: [
        Flexible(
          child: Text(
            context.l10n.reelsCommentsHandle(handle),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: AppTextStyle.titleSmall.copyWith(color: colors.text.primary),
          ),
        ),
        Text(timeLabel, style: AppTextStyle.caption.copyWith(color: colors.text.muted)),
      ],
    );
  }
}
