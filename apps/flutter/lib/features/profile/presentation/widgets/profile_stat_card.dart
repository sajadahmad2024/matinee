import 'package:flutter/material.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';

/// One of the three counters under the name: a gold numeral over its label.
class ProfileStatCard extends StatelessWidget {
  const ProfileStatCard({
    required this.value,
    required this.label,
    required this.semanticLabel,
    super.key,
  });

  final String value;
  final String label;

  /// The figure and its unit as one phrase. Read instead of the two texts,
  /// which a screen reader offers as a bare number and a stray word.
  final String semanticLabel;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    return Semantics(
      label: semanticLabel,
      container: true,
      excludeSemantics: true,
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: colors.card.background,
          border: Border.all(color: colors.card.border),
          borderRadius: const BorderRadius.all(Radius.circular(AppRadius.md)),
        ),
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.md),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            spacing: AppSpacing.xxs,
            children: [
              Text(
                value,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: AppTextStyle.numeralMd.copyWith(color: colors.text.numeral),
              ),
              Text(
                label,
                textAlign: TextAlign.center,
                style: AppTextStyle.caption.copyWith(color: colors.text.secondary),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
