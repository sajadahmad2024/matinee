import 'package:material_ui/material_ui.dart';
import 'package:matinee/core/l10n/l10n.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/core/widgets/app_bottom_sheet.dart';
import 'package:matinee/core/widgets/loading_view.dart';
import 'package:matinee/features/reels/presentation/widgets/comments/comment_input_bar.dart';

///
/// The video's comments: a lazily built list of `CommentThread`s over the
/// comment bar. Holds no data; the caller supplies items and the load hooks.
///
/// [onLoadMore] fires as the list nears its end while [hasMore] is true.
/// Setting [replyingTo] moves focus to the field.
///
class CommentsSheet extends StatefulWidget {
  const CommentsSheet({
    required this.itemCount,
    required this.itemBuilder,
    required this.onSend,
    super.key,
    this.hasMore = false,
    this.isLoadingMore = false,
    this.onLoadMore,
    this.replyingTo,
    this.onCancelReply,
  });

  final int itemCount;
  final IndexedWidgetBuilder itemBuilder;
  final ValueChanged<String> onSend;
  final bool hasMore;
  final bool isLoadingMore;
  final VoidCallback? onLoadMore;

  /// See [CommentInputBar.replyingTo].
  final String? replyingTo;

  final VoidCallback? onCancelReply;

  @override
  State<CommentsSheet> createState() => _CommentsSheetState();
}

class _CommentsSheetState extends State<CommentsSheet> {
  /// The frame's sheet height over its screen height.
  static const double _heightFactor = 484 / 874;

  /// How close to the end, in pixels, the next page starts loading.
  static const double _loadMoreWithin = 400;

  final ScrollController _scroll = ScrollController();
  final FocusNode _field = FocusNode();

  @override
  void initState() {
    super.initState();
    _scroll.addListener(_maybeLoadMore);
    WidgetsBinding.instance.addPostFrameCallback((_) => _maybeLoadMore());
  }

  @override
  void didUpdateWidget(CommentsSheet oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.replyingTo != null && widget.replyingTo != oldWidget.replyingTo) {
      _field.requestFocus();
    }
    // A short first page may not fill the list, so no scroll would ask.
    WidgetsBinding.instance.addPostFrameCallback((_) => _maybeLoadMore());
  }

  @override
  void dispose() {
    _scroll.dispose();
    _field.dispose();
    super.dispose();
  }

  void _maybeLoadMore() {
    if (!mounted || !widget.hasMore || widget.isLoadingMore || !_scroll.hasClients) {
      return;
    }
    if (_scroll.position.extentAfter < _loadMoreWithin) {
      widget.onLoadMore?.call();
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final colors = context.appColors;
    final isEmpty = widget.itemCount == 0 && !widget.isLoadingMore;
    return AppBottomSheet(
      title: l10n.reelsCommentsTitle,
      closeLabel: l10n.reelsCommentsClose,
      heightFactor: _heightFactor,
      body: isEmpty
          ? Center(
              child: Text(l10n.reelsCommentsEmpty, style: AppTextStyle.bodySmall.copyWith(color: colors.text.muted)),
            )
          : ListView.separated(
              controller: _scroll,
              padding: const EdgeInsets.only(left: AppSpacing.xl, right: AppSpacing.xl, bottom: AppSpacing.lg),
              itemCount: widget.itemCount + (widget.isLoadingMore ? 1 : 0),
              // The actions' 48 tap targets already overhang most of the
              // frame's 20 between cards.
              separatorBuilder: (_, _) => const SizedBox(height: AppSpacing.xs),
              itemBuilder: (context, index) => index < widget.itemCount
                  ? widget.itemBuilder(context, index)
                  : const SizedBox(height: kMinInteractiveDimension, child: LoadingView()),
            ),
      footer: CommentInputBar(
        onSend: widget.onSend,
        focusNode: _field,
        replyingTo: widget.replyingTo,
        onCancelReply: widget.onCancelReply,
      ),
    );
  }
}
