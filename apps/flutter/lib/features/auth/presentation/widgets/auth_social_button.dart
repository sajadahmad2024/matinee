import 'package:flutter/material.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';

///
/// A provider sign-in button: dark container, hairline outline, mark and
/// label. The mark is supplied by the caller because Google's is a four-colour
/// image while Apple's is a glyph.
///
class AuthSocialButton extends StatelessWidget {
  const AuthSocialButton({required this.icon, required this.label, required this.onPressed, super.key});

  final Widget icon;
  final String label;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors.button;
    return SizedBox(
      width: double.infinity,
      child: OutlinedButton.icon(
        onPressed: onPressed,
        style: OutlinedButton.styleFrom(
          backgroundColor: colors.socialBackground,
          foregroundColor: colors.socialLabel,
          side: BorderSide(color: colors.socialBorder),
          minimumSize: const Size(0, AppControlHeight.cta),
          iconSize: AppIconSize.md,
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
          textStyle: Theme.of(context).textTheme.bodyMedium,
          shape: const RoundedRectangleBorder(borderRadius: BorderRadius.all(Radius.circular(AppRadius.md))),
        ),
        icon: icon,
        label: Text(label),
      ),
    );
  }
}
