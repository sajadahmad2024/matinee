import 'dart:math' as math;

import 'package:material_ui/material_ui.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/core/widgets/screen_title.dart';
import 'package:matinee/core/widgets/sheet_surface.dart';

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
/// The design's bottom sheet: handle with an optional round close button, an
/// optional eyebrow and title, a [body], and an optional [footer] at the foot.
///
/// Sizes to its content up to [maxHeightFactor] of the room above the keyboard.
/// [height] or [heightFactor] fixes it instead, which a long or paginated
/// list needs so it can scroll lazily rather than measure every item.
///
class AppBottomSheet extends StatelessWidget {
  const AppBottomSheet({
    required this.body,
    required this.closeLabel,
    super.key,
    this.eyebrow,
    this.title,
    this.titleStyle,
    this.footer,
    this.height,
    this.heightFactor,
    this.maxHeightFactor = 0.9,
    this.isModal = false,
    this.surfaceColor,
    this.hostsSnackBars = false,
  }) : assert(height == null || heightFactor == null, 'Pass height or heightFactor, not both.');

  final Widget body;

  /// A small muted line above the title.
  final String? eyebrow;

  /// The sheet's top-level heading.
  final String? title;

  /// Replaces the header's `titleMedium`, for a sheet whose title is its hero.
  final TextStyle? titleStyle;

  ///
  /// The accessible name of the close button every sheet carries level with
  /// its handle.
  ///
  final String closeLabel;

  /// Kept above the keyboard and the bottom safe area.
  final Widget? footer;

  final double? height;

  /// A fraction of the room above the keyboard, below the top safe area.
  final double? heightFactor;

  final double maxHeightFactor;

  /// See [SheetSurface.isModal].
  final bool isModal;

  /// Replaces the sheet's card fill.
  final Color? surfaceColor;

  ///
  /// Gives the sheet a messenger of its own, so a snackbar raised from [body]
  /// shows over the sheet rather than behind the scrim on the page below.
  ///
  final bool hostsSnackBars;

  @override
  Widget build(BuildContext context) {
    final keyboard = MediaQuery.viewInsetsOf(context).bottom;
    // The route's own height rather than the screen's, so the sheet measures
    // the room it is actually given wherever it is hosted.
    return LayoutBuilder(
      builder: (context, constraints) {
        final available = constraints.hasBoundedHeight
            ? constraints.maxHeight
            : MediaQuery.sizeOf(context).height - MediaQuery.viewPaddingOf(context).top;
        final sheet = _sized(room: available - keyboard);
        if (!hostsSnackBars) {
          return Padding(
            padding: EdgeInsets.only(bottom: keyboard),
            child: sheet,
          );
        }
        return ScaffoldMessenger(
          // The scaffold covers the route so snackbars land at the screen's
          // foot, and lifts the sheet over the keyboard itself.
          child: Scaffold(
            backgroundColor: context.appColors.sheet.routeBackground,
            body: Column(
              children: [
                Expanded(child: _DismissArea(label: closeLabel)),
                sheet,
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _sized({required double room}) {
    final maxHeight = room * maxHeightFactor;
    final fixed = height ?? (heightFactor == null ? null : room * heightFactor!);
    return ConstrainedBox(
      constraints: fixed == null
          ? BoxConstraints(maxHeight: maxHeight)
          : BoxConstraints.tightFor(height: math.min(fixed, maxHeight)),
      child: SheetSurface(
        isModal: isModal,
        color: surfaceColor,
        closeLabel: closeLabel,
        child: Column(
          mainAxisSize: fixed == null ? MainAxisSize.min : MainAxisSize.max,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (eyebrow != null || title != null) _Header(eyebrow: eyebrow, title: title, titleStyle: titleStyle),
            Flexible(fit: fixed == null ? FlexFit.loose : FlexFit.tight, child: body),
            if (footer case final footer?) SafeArea(top: false, child: footer),
          ],
        ),
      ),
    );
  }
}

///
/// Dismisses the sheet the way the modal barrier it covers would, and says so:
/// a bare gesture area announces nothing at all.
///
class _DismissArea extends StatelessWidget {
  const _DismissArea({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      label: label,
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: Navigator.of(context).pop,
        child: const SizedBox.expand(),
      ),
    );
  }
}

class _Header extends StatelessWidget {
  const _Header({required this.eyebrow, required this.title, required this.titleStyle});

  final String? eyebrow;
  final String? title;
  final TextStyle? titleStyle;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    final eyebrow = this.eyebrow;
    final title = this.title;
    return Padding(
      padding: const EdgeInsets.only(left: AppSpacing.xl, right: AppSpacing.xl, bottom: AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (eyebrow != null) Text(eyebrow, style: AppTextStyle.overline.copyWith(color: colors.text.muted)),
          if (title != null)
            ScreenTitle(
              label: title,
              child: Text(title, style: (titleStyle ?? AppTextStyle.titleMedium).copyWith(color: colors.text.primary)),
            ),
        ],
      ),
    );
  }
}
