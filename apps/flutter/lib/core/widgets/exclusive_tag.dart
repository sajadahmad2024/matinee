import 'package:material_ui/material_ui.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';

/// The gold outline pill with a padlock that names a piece of locked content.
class ExclusiveTag extends StatelessWidget {
  const ExclusiveTag({required this.label, super.key});

  final String label;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors.tag;
    return DecoratedBox(
      // Filled as well as outlined: the frame tints the pill, which an outline
      // on its own left looking hollow against the dimmed backdrop.
      decoration: BoxDecoration(
        color: colors.goldBackground,
        border: Border.all(color: colors.goldBorder),
        borderRadius: const BorderRadius.all(Radius.circular(AppRadius.pill)),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.sm),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          spacing: AppSpacing.sm,
          children: [
            Icon(Icons.lock_outline, size: AppIconSize.xs, color: colors.goldSubtleLabel),
            // Flexible, so a scaled-up label wraps inside the pill rather than
            // pushing it past the screen — at 200% it ran 43 over the edge.
            Flexible(
              child: Text(
                label,
                style: AppTextStyle.labelSmall.copyWith(color: colors.goldSubtleLabel),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
