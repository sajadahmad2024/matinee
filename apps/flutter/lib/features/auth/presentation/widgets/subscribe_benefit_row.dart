import 'package:flutter/material.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';

/// A 'Why Subscribe?' bullet: the gold check disc and the line it ticks off.
class SubscribeBenefitRow extends StatelessWidget {
  const SubscribeBenefitRow({required this.label, super.key});

  final String label;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      spacing: AppSpacing.md,
      children: [
        Container(
          width: AppIconSize.md,
          height: AppIconSize.md,
          decoration: BoxDecoration(
            color: colors.tag.goldBackground,
            border: Border.all(color: colors.icon.accent),
            borderRadius: const BorderRadius.all(Radius.circular(AppRadius.full)),
          ),
          child: Icon(Icons.check, size: AppIconSize.xs, color: colors.icon.accent),
        ),
        Expanded(
          child: Text(
            label,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(color: colors.auth.onSurfaceVariant),
          ),
        ),
      ],
    );
  }
}
