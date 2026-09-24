import 'package:material_ui/material_ui.dart';
import 'package:matinee/core/theme/app_elevation.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/widgets/exclusive_preview_card.dart';
import 'package:matinee/core/widgets/exclusive_unlock_shell.dart';

///
/// The full body of an unlock prompt: exclusive tag, offer, preview card and
/// CTA.
///
/// Callers own the chrome around it — a `Scaffold`, or a translucent panel
/// over a video — and supply every string, carrying no business logic itself.
///
class ExclusiveUnlockContent extends StatelessWidget {
  const ExclusiveUnlockContent({
    required this.tagLabel,
    required this.title,
    required this.unlocksForLabel,
    required this.costLabel,
    required this.previewLabel,
    required this.preview,
    required this.castLabel,
    required this.cast,
    required this.unlockCtaLabel,
    required this.onUnlock,
    this.isScreenTitle = false,
    super.key,
  });

  final String tagLabel;
  final String title;
  final String unlocksForLabel;
  final String costLabel;
  final String previewLabel;
  final String preview;
  final String castLabel;
  final String cast;
  final String unlockCtaLabel;
  final VoidCallback onUnlock;

  /// Marks [title] as the screen's own heading, for a caller with no other
  /// `ScreenTitle` of its own.
  final bool isScreenTitle;

  @override
  Widget build(BuildContext context) {
    return ExclusiveUnlockShell(
      tagLabel: tagLabel,
      title: title,
      unlocksForLabel: unlocksForLabel,
      costLabel: costLabel,
      isScreenTitle: isScreenTitle,
      bottom: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          ExclusivePreviewCard(
            previewLabel: previewLabel,
            preview: preview,
            castLabel: castLabel,
            cast: cast,
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
                onPressed: onUnlock,
                child: Text(unlockCtaLabel),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
