import 'package:material_ui/material_ui.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/core/widgets/exclusive_unlock_content.dart';
import 'package:matinee/features/reels/presentation/widgets/exclusive_unlock_confirm.dart';

///
/// A darkened panel that covers a locked reel — tag, offer, preview and CTA
/// — over a scrim, not a screen's own chrome.
///
/// Takes plain strings, not a Rewards `ExclusiveItem`: a feature never
/// depends on another feature's model.
///
/// Tapping the CTA moves to a confirm step that spends the points, unless
/// [onUnlock] is given, in which case it runs directly with no confirm step.
///
class UnlockOverlay extends StatefulWidget {
  const UnlockOverlay({
    required this.tagLabel,
    required this.title,
    required this.unlocksForLabel,
    required this.costLabel,
    required this.previewLabel,
    required this.preview,
    required this.castLabel,
    required this.cast,
    required this.unlockCtaLabel,
    required this.confirmTitle,
    required this.confirmMessage,
    required this.pointDeductionLabel,
    required this.confirmCtaLabel,
    required this.confirmAndUnlock,
    this.onUnlock,
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
  final String confirmTitle;
  final String confirmMessage;
  final String pointDeductionLabel;
  final String confirmCtaLabel;

  /// Spends the points and unlocks the content, from the confirm step.
  final VoidCallback confirmAndUnlock;

  /// Overrides the confirm step: when given, the CTA calls this instead of
  /// showing it.
  final VoidCallback? onUnlock;

  @override
  State<UnlockOverlay> createState() => _UnlockOverlayState();
}

class _UnlockOverlayState extends State<UnlockOverlay> {
  bool _confirming = false;

  void _handleUnlockCta() {
    final onUnlock = widget.onUnlock;
    if (onUnlock != null) {
      onUnlock();
      return;
    }
    setState(() => _confirming = true);
  }

  @override
  Widget build(BuildContext context) {
    return ColoredBox(
      color: context.appColors.sheet.background,
      child: SafeArea(
        child: _confirming
            ? ExclusiveUnlockConfirm(
                tagLabel: widget.tagLabel,
                title: widget.title,
                unlocksForLabel: widget.unlocksForLabel,
                costLabel: widget.costLabel,
                confirmTitle: widget.confirmTitle,
                confirmMessage: widget.confirmMessage,
                pointDeductionLabel: widget.pointDeductionLabel,
                pointDeductionValue: widget.costLabel,
                confirmCtaLabel: widget.confirmCtaLabel,
                onConfirm: widget.confirmAndUnlock,
              )
            : ExclusiveUnlockContent(
                tagLabel: widget.tagLabel,
                title: widget.title,
                unlocksForLabel: widget.unlocksForLabel,
                costLabel: widget.costLabel,
                previewLabel: widget.previewLabel,
                preview: widget.preview,
                castLabel: widget.castLabel,
                cast: widget.cast,
                unlockCtaLabel: widget.unlockCtaLabel,
                onUnlock: _handleUnlockCta,
              ),
      ),
    );
  }
}
