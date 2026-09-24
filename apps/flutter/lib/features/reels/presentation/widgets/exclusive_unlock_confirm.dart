import 'package:material_ui/material_ui.dart';
import 'package:matinee/core/theme/app_elevation.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/core/widgets/exclusive_unlock_shell.dart';

///
/// The confirm step of `UnlockOverlay`: the same tag and offer as the first
/// step, with the preview card and its CTA replaced by a spend confirmation.
///
class ExclusiveUnlockConfirm extends StatelessWidget {
  const ExclusiveUnlockConfirm({
    required this.tagLabel,
    required this.title,
    required this.unlocksForLabel,
    required this.costLabel,
    required this.confirmTitle,
    required this.confirmMessage,
    required this.pointDeductionLabel,
    required this.pointDeductionValue,
    required this.confirmCtaLabel,
    required this.onConfirm,
    super.key,
  });

  final String tagLabel;
  final String title;
  final String unlocksForLabel;
  final String costLabel;
  final String confirmTitle;
  final String confirmMessage;
  final String pointDeductionLabel;
  final String pointDeductionValue;
  final String confirmCtaLabel;
  final VoidCallback onConfirm;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    final theme = Theme.of(context);
    return ExclusiveUnlockShell(
      tagLabel: tagLabel,
      title: title,
      unlocksForLabel: unlocksForLabel,
      costLabel: costLabel,
      bottom: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            confirmTitle,
            style: theme.textTheme.headlineSmall?.copyWith(color: colors.text.primary),
          ),
          Padding(
            padding: const EdgeInsets.only(top: AppSpacing.sm),
            child: Text(
              confirmMessage,
              style: theme.textTheme.bodyMedium?.copyWith(color: colors.text.secondary),
            ),
          ),
          Padding(
            padding: const EdgeInsets.only(top: AppSpacing.xl),
            child: DecoratedBox(
              decoration: BoxDecoration(
                color: colors.card.backgroundRaised,
                borderRadius: const BorderRadius.all(Radius.circular(AppRadius.md)),
              ),
              child: Padding(
                padding: AppSpacing.cardPadding,
                child: Row(
                  spacing: AppSpacing.sm,
                  children: [
                    // Expanded, so a scaled-up label wraps onto a second line
                    // rather than pushing the value past the row.
                    Expanded(
                      child: Text(
                        pointDeductionLabel,
                        style: AppTextStyle.overline.copyWith(color: colors.text.secondary),
                      ),
                    ),
                    Text(
                      pointDeductionValue,
                      style: AppTextStyle.numeralMd.copyWith(color: colors.text.numeral),
                    ),
                  ],
                ),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.only(top: AppSpacing.lg),
            // The large gold CTA carries a glow no button theme can express: a
            // Material elevation is not this shape.
            child: DecoratedBox(
              decoration: BoxDecoration(
                borderRadius: const BorderRadius.all(Radius.circular(AppRadius.md)),
                boxShadow: AppElevation.glowCta,
              ),
              child: FilledButton(
                onPressed: onConfirm,
                child: Text(confirmCtaLabel),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
