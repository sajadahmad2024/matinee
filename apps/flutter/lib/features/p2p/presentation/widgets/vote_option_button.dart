import 'package:flutter/material.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';

/// The height the design gives each of the two vote buttons.
const double _optionHeight = 56;

///
/// One side of a prediction. The picked one takes the gold ring, so the choice
/// reads without relying on the fill alone.
///
class VoteOptionButton extends StatelessWidget {
  const VoteOptionButton({
    required this.label,
    required this.semanticLabel,
    required this.isSelected,
    required this.onPressed,
    super.key,
  });

  final String label;

  /// Spoken in place of [label], which the design sets in upper case.
  final String semanticLabel;
  final bool isSelected;

  /// Null once the vote is cast or the poll has closed.
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    return Semantics(
      // The pair is a choice, so a screen reader says which one is picked
      // rather than reading two unrelated buttons.
      selected: isSelected,
      // And that picking one drops the other, which `selected` alone leaves
      // sounding like two independent toggles.
      inMutuallyExclusiveGroup: true,
      label: semanticLabel,
      button: true,
      enabled: onPressed != null,
      // Excluding the subtree takes the button's tap action with it, leaving a
      // node that reports being chosen and cannot be chosen.
      onTap: onPressed,
      container: true,
      excludeSemantics: true,
      child: OutlinedButton(
        onPressed: onPressed,
        style: OutlinedButton.styleFrom(
          backgroundColor: isSelected ? colors.button.outlineGoldBackground : colors.card.backgroundRaised,
          foregroundColor: isSelected ? colors.text.link : colors.text.primary,
          side: BorderSide(
            color: isSelected ? colors.button.outlineGoldBorder : colors.card.border,
            width: isSelected ? AppBorderWidth.emphasis : AppBorderWidth.hairline,
          ),
          minimumSize: const Size(0, _optionHeight),
          alignment: AlignmentDirectional.centerStart,
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
          shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.all(Radius.circular(AppRadius.md)),
          ),
          textStyle: AppTextStyle.titleMedium,
        ),
        child: Text(label),
      ),
    );
  }
}
