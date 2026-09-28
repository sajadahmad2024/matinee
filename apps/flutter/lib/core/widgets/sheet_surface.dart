import 'package:material_ui/material_ui.dart';
import 'package:matinee/core/assets/app_icon_assets.dart';
import 'package:matinee/core/theme/app_elevation.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/core/widgets/svg_icon.dart';

///
/// The design's bottom-sheet container: the card fill, the top hairline and
/// shadow, and the grab handle with a round close button level beside it.
///
class SheetSurface extends StatelessWidget {
  const SheetSurface({required this.child, required this.closeLabel, super.key, this.isModal = false, this.color});

  final Widget child;

  ///
  /// A modal takes the dimmer handle, because the sheet is the whole view and
  /// the brighter one reads as a control.
  ///
  final bool isModal;

  /// Replaces the sheet's card fill.
  final Color? color;

  /// The close button's accessible name.
  final String closeLabel;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors.sheet;
    final handle = SizedBox.fromSize(
      size: AppControlHeight.sheetHandle,
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: isModal ? colors.handleModal : colors.handle,
          borderRadius: const BorderRadius.all(Radius.circular(AppRadius.full)),
        ),
      ),
    );
    return DecoratedBox(
      decoration: BoxDecoration(
        color: color ?? colors.background,
        borderRadius: AppRadius.sheetTop,
        border: Border(top: BorderSide(color: colors.border)),
        boxShadow: AppElevation.sheet,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Padding(
            // The close button lays out 48 for its 32, so the row sits 8 short
            // of the frame's gaps above and below it.
            padding: const EdgeInsets.only(
              left: AppScreenPadding.sheet,
              right: AppScreenPadding.sheet,
              top: AppSpacing.md,
              bottom: AppSpacing.xs,
            ),
            child: Stack(
              alignment: Alignment.center,
              children: [
                handle,
                Align(
                  alignment: AlignmentDirectional.centerEnd,
                  child: _CloseButton(label: closeLabel),
                ),
              ],
            ),
          ),
          // Flexible, so the block below gets the height left after the grab
          // handle rather than the whole cap as well.
          Flexible(
            // Ink splashes paint on the nearest Material, which would otherwise
            // be the route's, underneath this fill.
            child: Material(type: MaterialType.transparency, child: child),
          ),
        ],
      ),
    );
  }
}

class _CloseButton extends StatelessWidget {
  const _CloseButton({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    return IconButton(
      onPressed: () => Navigator.of(context).pop(),
      tooltip: label,
      icon: SvgIcon(AppIconAssets.close, color: colors.icon.primary, size: AppIconSize.xs),
      style: IconButton.styleFrom(
        backgroundColor: colors.sheet.closeBackground,
        fixedSize: const Size.square(AppControlHeight.button),
        padding: EdgeInsets.zero,
      ),
    );
  }
}
