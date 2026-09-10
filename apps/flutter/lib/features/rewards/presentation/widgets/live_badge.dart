import 'package:flutter/material.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';

///
/// The red LIVE badge above the auction title, dot and all.
///
class LiveBadge extends StatelessWidget {
  const LiveBadge({required this.label, super.key});

  static const double _dotSize = 6;

  final String label;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors.badge;
    return DecoratedBox(
      decoration: BoxDecoration(
        color: colors.liveBackground,
        borderRadius: const BorderRadius.all(Radius.circular(AppRadius.pill)),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm, vertical: AppSpacing.xs),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          spacing: AppSpacing.xs,
          children: [
            Container(
              width: _dotSize,
              height: _dotSize,
              decoration: BoxDecoration(color: colors.liveLabel, shape: BoxShape.circle),
            ),
            Text(label, style: AppTextStyle.labelSmall.copyWith(color: colors.liveLabel)),
          ],
        ),
      ),
    );
  }
}
