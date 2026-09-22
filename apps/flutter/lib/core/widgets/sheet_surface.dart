import 'package:flutter/material.dart';
import 'package:matinee/core/theme/app_elevation.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';

///
/// The design's bottom-sheet container: the card fill, the top hairline and
/// shadow, and the grab handle above whatever the sheet holds.
///
class SheetSurface extends StatelessWidget {
  const SheetSurface({required this.child, super.key, this.isModal = false});

  final Widget child;

  ///
  /// A modal takes the dimmer handle, because the sheet is the whole view and
  /// the brighter one reads as a control.
  ///
  final bool isModal;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors.sheet;
    return DecoratedBox(
      decoration: BoxDecoration(
        color: colors.background,
        borderRadius: AppRadius.sheetTop,
        border: Border(top: BorderSide(color: colors.border)),
        boxShadow: AppElevation.sheet,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Padding(
            padding: const EdgeInsets.only(top: AppSpacing.md, bottom: AppSpacing.sm),
            child: SizedBox.fromSize(
              size: AppControlHeight.sheetHandle,
              child: DecoratedBox(
                decoration: BoxDecoration(
                  color: isModal ? colors.handleModal : colors.handle,
                  borderRadius: const BorderRadius.all(Radius.circular(AppRadius.full)),
                ),
              ),
            ),
          ),
          // Flexible, so the block below gets the height left after the grab
          // handle rather than the whole cap as well.
          Flexible(child: child),
        ],
      ),
    );
  }
}
