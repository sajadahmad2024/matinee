import 'dart:math' as math;

import 'package:material_ui/material_ui.dart';
import 'package:matinee/core/assets/app_icon_assets.dart';
import 'package:matinee/core/l10n/l10n.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/core/widgets/svg_icon.dart';

///
/// The comment field with its send action, pinned under the comments list.
///
/// Send stays disabled until there is text, and clears the field once sent.
/// [replyingTo] adds the Replying to line with a way to cancel it.
///
class CommentInputBar extends StatefulWidget {
  const CommentInputBar({
    required this.onSend,
    super.key,
    this.focusNode,
    this.replyingTo,
    this.onCancelReply,
  });

  /// The trimmed text.
  final ValueChanged<String> onSend;

  final FocusNode? focusNode;

  /// The handle being answered, without the leading `@`.
  final String? replyingTo;

  final VoidCallback? onCancelReply;

  @override
  State<CommentInputBar> createState() => _CommentInputBarState();
}

class _CommentInputBarState extends State<CommentInputBar> {
  static const double _fieldInset = (kMinInteractiveDimension - AppControlHeight.commentField) / 2;

  final TextEditingController _controller = TextEditingController();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _send() {
    widget.onSend(_controller.text.trim());
    _controller.clear();
  }

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    final l10n = context.l10n;
    final replyingTo = widget.replyingTo;
    const textStyle = AppTextStyle.bodySmall;
    // Pads one line out to the 48 target so the text sits at its centre;
    // the decoration's own min height would stretch it after placing the text.
    final line = MediaQuery.textScalerOf(context).scale(textStyle.fontSize!) * textStyle.height!;
    final vertical = math.max(AppSpacing.sm, (kMinInteractiveDimension - line) / 2);

    return DecoratedBox(
      decoration: BoxDecoration(
        border: Border(top: BorderSide(color: colors.divider)),
      ),
      child: Padding(
        // The field and send button lay out 48 around the frame's 40 box, so
        // its 12 above and below lose their overhang.
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.sm),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (replyingTo != null)
              Row(
                children: [
                  Expanded(
                    child: Text(
                      l10n.reelsCommentsReplyingTo(replyingTo),
                      style: AppTextStyle.caption.copyWith(color: colors.text.muted),
                    ),
                  ),
                  IconButton(
                    onPressed: widget.onCancelReply,
                    tooltip: l10n.reelsCommentsCancelReply,
                    icon: SvgIcon(AppIconAssets.close, color: colors.text.secondary, size: AppIconSize.xs),
                  ),
                ],
              ),
            ConstrainedBox(
              constraints: const BoxConstraints(minHeight: kMinInteractiveDimension),
              child: Stack(
                alignment: AlignmentDirectional.centerEnd,
                children: [
                  // The box the frame draws, inside the field's 48 tap target.
                  Positioned.fill(
                    top: _fieldInset,
                    bottom: _fieldInset,
                    child: DecoratedBox(
                      decoration: BoxDecoration(
                        color: colors.input.background,
                        borderRadius: const BorderRadius.all(Radius.circular(AppRadius.sm)),
                      ),
                    ),
                  ),
                  TextField(
                    controller: _controller,
                    focusNode: widget.focusNode,
                    minLines: 1,
                    maxLines: 4,
                    keyboardType: TextInputType.multiline,
                    textCapitalization: TextCapitalization.sentences,
                    style: textStyle.copyWith(color: colors.input.text),
                    decoration: InputDecoration(
                      hintText: l10n.reelsCommentsInputHint,
                      hintStyle: textStyle.copyWith(color: colors.input.placeholder),
                      filled: false,
                      isDense: true,
                      // Drops the theme's form-field minimum; the padding sets the height.
                      constraints: const BoxConstraints(),
                      // The end leaves room for the send glyph drawn over the field.
                      contentPadding: EdgeInsetsDirectional.only(
                        start: AppSpacing.lg,
                        end: AppSpacing.lg + AppSpacing.md + AppIconSize.md,
                        top: vertical,
                        bottom: vertical,
                      ),
                      border: InputBorder.none,
                      enabledBorder: InputBorder.none,
                      focusedBorder: InputBorder.none,
                    ),
                  ),
                  // Centres the glyph the frame's 16 in from the field's end.
                  PositionedDirectional(
                    end: AppSpacing.xxs,
                    child: ValueListenableBuilder<TextEditingValue>(
                      valueListenable: _controller,
                      builder: (context, value, _) {
                        final canSend = value.text.trim().isNotEmpty;
                        return IconButton(
                          onPressed: canSend ? _send : null,
                          tooltip: l10n.reelsCommentsSend,
                          icon: SvgIcon(
                            AppIconAssets.send,
                            color: canSend ? colors.text.secondary : colors.icon.disabled,
                            size: AppIconSize.md,
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
