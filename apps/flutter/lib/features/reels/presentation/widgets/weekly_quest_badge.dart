import 'package:material_ui/material_ui.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';

/// The gold-bordered pill with a star that flags a reel as part of a weekly quest.
class WeeklyQuestBadge extends StatelessWidget {
  const WeeklyQuestBadge({required this.label, super.key});

  final String label;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    return DecoratedBox(
      decoration: BoxDecoration(
        color: colors.tag.goldBackground,
        border: Border.all(color: colors.tag.goldBorder),
        borderRadius: const BorderRadius.all(Radius.circular(AppRadius.pill)),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.sm),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          spacing: AppSpacing.sm,
          children: [
            Icon(Icons.star_rounded, size: AppIconSize.xs, color: colors.tag.goldSubtleLabel),
            // Flexible, so a scaled-up label wraps inside the pill rather than
            // pushing it past the screen.
            Flexible(
              child: Text(
                label,
                style: AppTextStyle.labelMedium.copyWith(color: colors.text.primary),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
