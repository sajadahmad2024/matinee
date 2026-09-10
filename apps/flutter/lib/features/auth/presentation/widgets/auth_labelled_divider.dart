import 'package:flutter/material.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';

/// The 'or continue with' rule: a hairline either side of a caption.
class AuthLabelledDivider extends StatelessWidget {
  const AuthLabelledDivider({required this.label, super.key});

  final String label;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    return Row(
      spacing: AppSpacing.md,
      children: [
        Expanded(child: Divider(color: colors.dividerAuth)),
        Text(label, style: AppTextStyle.caption.copyWith(color: colors.auth.onSurfaceVariant)),
        Expanded(child: Divider(color: colors.dividerAuth)),
      ],
    );
  }
}
