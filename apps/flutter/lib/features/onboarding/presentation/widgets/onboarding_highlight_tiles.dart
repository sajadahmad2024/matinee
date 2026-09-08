import 'package:flutter/material.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/features/onboarding/data/models/onboarding_slide.dart';

///
/// The row of equal tiles below the stat pill. The design draws three; the row
/// divides the width evenly so a longer or shorter list still fits.
///
class OnboardingHighlightTiles extends StatelessWidget {
  const OnboardingHighlightTiles({required this.highlights, super.key});

  final List<OnboardingHighlight> highlights;

  @override
  Widget build(BuildContext context) {
    // The tiles are equal width and share the tallest one's height, so a label
    // that wraps does not leave its neighbours short.
    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        spacing: AppSpacing.sm,
        children: [
          for (final highlight in highlights) Expanded(child: _Tile(highlight: highlight)),
        ],
      ),
    );
  }
}

class _Tile extends StatelessWidget {
  const _Tile({required this.highlight});

  final OnboardingHighlight highlight;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors.onboarding;
    return DecoratedBox(
      decoration: BoxDecoration(
        color: colors.statTileBackground,
        border: Border.all(color: colors.statTileBorder),
        borderRadius: const BorderRadius.all(Radius.circular(AppRadius.md)),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm, vertical: AppSpacing.md),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          spacing: AppSpacing.sm,
          children: [
            // The design system treats these as icons rendered in the platform
            // emoji font, so they take an icon size rather than a text role.
            // They draw as tofu on the iOS simulator, which ships no colour
            // emoji font, and correctly on a real device.
            Text(highlight.emoji, style: const TextStyle(fontSize: AppIconSize.lg, height: 1)),
            Text(
              highlight.label,
              textAlign: TextAlign.center,
              style: AppTextStyle.caption.copyWith(
                fontWeight: FontWeight.w600,
                color: colors.statTileLabel,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
