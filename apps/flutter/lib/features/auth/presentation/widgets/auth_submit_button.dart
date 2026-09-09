import 'package:flutter/material.dart';
import 'package:matinee/core/theme/app_elevation.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';

///
/// The gold CTA every auth screen ends with. It is disabled until the form is
/// valid, and swaps its label for a spinner while the call is in flight so a
/// second tap cannot start a second one.
///
class AuthSubmitButton extends StatelessWidget {
  const AuthSubmitButton({
    required this.label,
    required this.onPressed,
    super.key,
    this.isLoading = false,
  });

  static const double _spinnerStroke = 2;

  final String label;
  final VoidCallback? onPressed;
  final bool isLoading;

  @override
  Widget build(BuildContext context) {
    // The design gives the gold CTA a glow, and takes it away while the
    // button is disabled or busy.
    final isEnabled = onPressed != null && !isLoading;
    return DecoratedBox(
      decoration: BoxDecoration(
        borderRadius: const BorderRadius.all(Radius.circular(AppRadius.md)),
        boxShadow: isEnabled ? AppElevation.glowCta : const [],
      ),
      child: SizedBox(
        width: double.infinity,
        child: FilledButton(
          onPressed: isLoading ? null : onPressed,
          child: isLoading
              ? SizedBox.square(
                  dimension: AppIconSize.md,
                  child: CircularProgressIndicator(
                    strokeWidth: _spinnerStroke,
                    color: context.appColors.button.primaryDisabledLabel,
                  ),
                )
              : Text(label),
        ),
      ),
    );
  }
}
