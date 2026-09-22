import 'package:flutter/material.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/core/utils/emphasise.dart';
import 'package:matinee/core/widgets/screen_title.dart';

/// The title and supporting line every auth screen opens with.
class AuthHeading extends StatelessWidget {
  const AuthHeading({required this.title, required this.subtitle, super.key, this.subtitleEmphasis});

  final String title;
  final String subtitle;

  /// A run inside [subtitle] the design sets in the brighter text colour, such
  /// as the number a code was sent to.
  final String? subtitleEmphasis;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors.auth;
    final textTheme = Theme.of(context).textTheme;
    final base = textTheme.bodySmall?.copyWith(color: colors.onSurfaceVariant);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      spacing: AppSpacing.sm,
      children: [
        ScreenTitle(
          label: title,
          child: Text(title, style: textTheme.headlineMedium?.copyWith(color: colors.onSurface)),
        ),
        Text.rich(
          TextSpan(children: emphasise(subtitle, subtitleEmphasis, base?.copyWith(color: colors.onSurface))),
          style: base,
        ),
      ],
    );
  }
}
