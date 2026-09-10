import 'package:flutter/material.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';

///
/// The upper-case eyebrow the design sets over a section. The caller supplies
/// upper-case text, as every label role does.
///
class SectionLabel extends StatelessWidget {
  const SectionLabel({required this.label, super.key, this.isMuted = false});

  final String label;

  /// Inside a card the eyebrow steps back a shade from the section headings.
  final bool isMuted;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors.text;
    return Text(
      label,
      style: AppTextStyle.overline.copyWith(color: isMuted ? colors.muted : colors.secondary),
    );
  }
}
