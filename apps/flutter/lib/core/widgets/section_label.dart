import 'package:flutter/material.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';

/// The upper-case eyebrow the design sets over a section.
class SectionLabel extends StatelessWidget {
  const SectionLabel({required this.label, super.key, this.isMuted = false, this.headingLevel = 2});

  final String label;

  /// Inside a card the eyebrow steps back a shade from the section headings.
  final bool isMuted;

  /// The screen's own title is level 1; a section nested in another passes 3.
  final int headingLevel;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors.text;
    // Without the header flag a screen reader has nothing to jump between, so
    // reaching the next section means swiping through every row of this one.
    return Semantics(
      header: true,
      // The flag alone ranks every section level 1, flat with the screen title.
      headingLevel: headingLevel,
      // Otherwise the label merges into the node above it, siblings and all.
      container: true,
      child: Text(
        label,
        style: AppTextStyle.overline.copyWith(color: isMuted ? colors.muted : colors.secondary),
      ),
    );
  }
}
