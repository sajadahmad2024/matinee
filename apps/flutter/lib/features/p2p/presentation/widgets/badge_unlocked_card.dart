import 'package:flutter/material.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/core/widgets/glyph_box.dart';

/// The box the design puts the badge's emoji in.
const double _glyphBoxSize = 52;

/// The badge a finished quest awarded, with what it was awarded for.
class BadgeUnlockedCard extends StatelessWidget {
  const BadgeUnlockedCard({
    required this.glyph,
    required this.label,
    required this.name,
    required this.caption,
    required this.summary,
    super.key,
  });

  /// The emoji the design uses as the mark, until the icon font carries it.
  final String glyph;

  final String label;
  final String name;
  final String caption;

  /// The card as one sentence, so its three lines read as one thing.
  final String summary;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    return Semantics(
      label: summary,
      container: true,
      excludeSemantics: true,
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: colors.card.background,
          border: Border.all(color: colors.card.border),
          borderRadius: const BorderRadius.all(Radius.circular(AppRadius.lg)),
        ),
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Row(
            spacing: AppSpacing.lg,
            children: [
              GlyphBox(glyph: glyph, size: _glyphBoxSize),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      label,
                      style: AppTextStyle.overline.copyWith(color: colors.text.muted),
                    ),
                    Padding(
                      padding: const EdgeInsets.only(top: AppSpacing.xs),
                      child: Text(
                        name,
                        style: AppTextStyle.titleMedium.copyWith(color: colors.text.link),
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.only(top: AppSpacing.xs),
                      child: Text(
                        caption,
                        style: AppTextStyle.caption.copyWith(color: colors.text.muted),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
