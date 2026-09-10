import 'package:flutter/material.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';

///
/// One tile of the exclusive-content grid: the still once the item is open,
/// and an empty card with a padlock while it is not.
///
class ExclusiveTile extends StatelessWidget {
  const ExclusiveTile({
    required this.title,
    required this.imageAsset,
    required this.isUnlocked,
    required this.lockedLabel,
    required this.onTap,
    super.key,
  });

  /// The design's grid: 119 wide by 179 tall.
  static const double aspectRatio = 119 / 179;

  final String title;
  final String imageAsset;
  final bool isUnlocked;
  final String lockedLabel;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    return Semantics(
      // The tile's own content is a still or a glyph, so the label is the only
      // thing a screen reader has to go on. The InkWell below keeps the tap
      // action, which is why the subtree is not excluded wholesale.
      label: isUnlocked ? title : '$title, $lockedLabel',
      child: Material(
        color: isUnlocked ? null : colors.card.backgroundLocked,
        borderRadius: const BorderRadius.all(Radius.circular(AppRadius.md)),
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: onTap,
          child: isUnlocked
              ? Image.asset(imageAsset, fit: BoxFit.cover, excludeFromSemantics: true)
              : Center(
                  child: Icon(
                    Icons.lock,
                    size: AppIconSize.lg,
                    color: colors.icon.muted,
                  ),
                ),
        ),
      ),
    );
  }
}
