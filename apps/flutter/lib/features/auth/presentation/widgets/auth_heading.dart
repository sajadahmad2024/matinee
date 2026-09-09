import 'package:flutter/material.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';

///
/// Splits [sentence] around [emphasis] so that run can carry [emphasisStyle]
/// while the rest inherits the surrounding style.
///
List<TextSpan> emphasise(String sentence, String? emphasis, TextStyle? emphasisStyle) {
  if (emphasis == null || emphasis.isEmpty) {
    return [TextSpan(text: sentence)];
  }
  final at = sentence.indexOf(emphasis);
  if (at < 0) {
    return [TextSpan(text: sentence)];
  }
  return [
    TextSpan(text: sentence.substring(0, at)),
    TextSpan(text: emphasis, style: emphasisStyle),
    TextSpan(text: sentence.substring(at + emphasis.length)),
  ];
}

///
/// The title and supporting line every auth screen opens with.
///
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
        Text(title, style: textTheme.headlineMedium?.copyWith(color: colors.onSurface)),
        Text.rich(
          TextSpan(children: emphasise(subtitle, subtitleEmphasis, base?.copyWith(color: colors.onSurface))),
          style: base,
        ),
      ],
    );
  }
}
