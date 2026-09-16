import 'package:flutter/material.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';

///
/// The gold pill the design sets over a card image to name its category. The
/// caller supplies upper-case text, as every label role does.
///
class CategoryTag extends StatelessWidget {
  const CategoryTag({required this.label, super.key});

  final String label;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors.tag;
    return DecoratedBox(
      decoration: BoxDecoration(
        color: colors.goldBackground,
        border: Border.all(color: colors.goldBorder),
        borderRadius: const BorderRadius.all(Radius.circular(AppRadius.pill)),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.xs),
        child: Text(label, style: AppTextStyle.labelSmall.copyWith(color: colors.goldLabel)),
      ),
    );
  }
}
