import 'dart:math' as math;

import 'package:material_ui/material_ui.dart';
import 'package:matinee/core/assets/app_icon_assets.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/core/widgets/sheet_surface.dart';
import 'package:matinee/core/widgets/svg_icon.dart';

///
/// Opens [builder] as the app's modal bottom sheet: above the shell so it
/// covers the bottom nav, with the handle drawn by [SheetSurface].
///
Future<T?> showAppBottomSheet<T>(BuildContext context, {required WidgetBuilder builder}) {
  return showModalBottomSheet<T>(
    context: context,
    isScrollControlled: true,
    useRootNavigator: true,
    useSafeArea: true,
    showDragHandle: false,
    backgroundColor: context.appColors.sheet.routeBackground,
    builder: builder,
  );
}

///
/// The design's bottom sheet: handle, an optional title row with a close
/// button, a [body], and an optional [footer] pinned to the bottom.
///
/// Sizes to its content up to [maxHeightFactor] of the room above the keyboard.
/// [height] or [heightFactor] fixes it instead, which a long or paginated
/// list needs so it can scroll lazily rather than measure every item.
///
class AppBottomSheet extends StatelessWidget {
  const AppBottomSheet({
    required this.body,
    super.key,
    this.title,
    this.closeLabel,
    this.footer,
    this.height,
    this.heightFactor,
    this.maxHeightFactor = 0.9,
  }) : assert(height == null || heightFactor == null, 'Pass height or heightFactor, not both.');

  final Widget body;
  final String? title;

  /// Shows the close button, and is its accessible name.
  final String? closeLabel;

  /// Kept above the keyboard and the bottom safe area.
  final Widget? footer;

  final double? height;

  /// A fraction of the room above the keyboard, below the top safe area.
  final double? heightFactor;

  final double maxHeightFactor;

  @override
  Widget build(BuildContext context) {
    final keyboard = MediaQuery.viewInsetsOf(context).bottom;
    final room = MediaQuery.sizeOf(context).height - MediaQuery.viewPaddingOf(context).top - keyboard;
    final maxHeight = room * maxHeightFactor;
    final fixed = height ?? (heightFactor == null ? null : room * heightFactor!);
    final closeLabel = this.closeLabel;

    final content = Column(
      mainAxisSize: fixed == null ? MainAxisSize.min : MainAxisSize.max,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (title != null || closeLabel != null) _Header(title: title, closeLabel: closeLabel),
        Flexible(fit: fixed == null ? FlexFit.loose : FlexFit.tight, child: body),
        if (footer case final footer?) SafeArea(top: false, child: footer),
      ],
    );

    return Padding(
      padding: EdgeInsets.only(bottom: keyboard),
      child: ConstrainedBox(
        constraints: fixed == null
            ? BoxConstraints(maxHeight: maxHeight)
            : BoxConstraints.tightFor(height: math.min(fixed, maxHeight)),
        child: SheetSurface(child: content),
      ),
    );
  }
}

class _Header extends StatelessWidget {
  const _Header({required this.title, required this.closeLabel});

  final String? title;
  final String? closeLabel;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    final title = this.title;
    final closeLabel = this.closeLabel;
    return Padding(
      // The close button lays out 48 for its 12 glyph, so the frame's 20 end
      // and 16 bottom gaps are taken back by its overhang.
      padding: const EdgeInsetsDirectional.only(start: AppSpacing.xl, end: AppSpacing.xs, bottom: AppSpacing.xs),
      child: Row(
        children: [
          Expanded(
            child: title == null
                ? const SizedBox.shrink()
                : Semantics(
                    header: true,
                    child: Text(title, style: AppTextStyle.titleMedium.copyWith(color: colors.text.primary)),
                  ),
          ),
          if (closeLabel != null)
            IconButton(
              onPressed: () => Navigator.of(context).pop(),
              tooltip: closeLabel,
              icon: SvgIcon(AppIconAssets.close, color: colors.text.secondary, size: AppIconSize.xs),
            ),
        ],
      ),
    );
  }
}
