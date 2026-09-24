import 'package:material_ui/material_ui.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/core/widgets/section_label.dart';

/// What the user gets for the points: a synopsis and who made it.
class ExclusivePreviewCard extends StatelessWidget {
  const ExclusivePreviewCard({
    required this.previewLabel,
    required this.preview,
    required this.castLabel,
    required this.cast,
    super.key,
  });

  final String previewLabel;
  final String preview;
  final String castLabel;
  final String cast;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    final theme = Theme.of(context);
    // Fill, border and radius all come from the card theme.
    return Card(
      child: Padding(
        padding: AppSpacing.cardPadding,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SectionLabel(label: previewLabel, isMuted: true),
            Padding(
              padding: const EdgeInsets.only(top: AppSpacing.sm),
              child: Text(
                preview,
                style: theme.textTheme.bodySmall?.copyWith(color: colors.text.secondary),
              ),
            ),
            const Padding(
              padding: EdgeInsets.symmetric(vertical: AppSpacing.md),
              child: Divider(height: 0),
            ),
            SectionLabel(label: castLabel, isMuted: true),
            Padding(
              padding: const EdgeInsets.only(top: AppSpacing.xs),
              child: Text(
                cast,
                style: theme.textTheme.titleSmall?.copyWith(color: colors.text.link),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
