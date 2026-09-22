import 'package:flutter/material.dart';
import 'package:matinee/core/assets/assets.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/core/widgets/progress_bar.dart';
import 'package:matinee/core/widgets/svg_icon.dart';

/// The disc the design draws at 52 with a 26 glyph inside it.
const double _discSize = 52;

///
/// The badge the balance currently sits on, with how far the next one is. The
/// design singles it out with a gold wash rather than the flat card fill.
///
class CurrentBadgeCard extends StatelessWidget {
  const CurrentBadgeCard({
    required this.eyebrow,
    required this.badgeName,
    required this.progress,
    required this.caption,
    required this.semanticLabel,
    super.key,
  });

  final String eyebrow;
  final String badgeName;
  final double progress;

  /// The '918 pts to Cinematic Loyalist' line under the bar.
  final String caption;

  /// The card as one sentence, so the eyebrow, name and caption are one stop.
  final String semanticLabel;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    return Semantics(
      label: semanticLabel,
      container: true,
      excludeSemantics: true,
      child: DecoratedBox(
        decoration: BoxDecoration(
          gradient: colors.card.backgroundHighlight,
          border: Border.all(color: colors.card.borderHighlight),
          borderRadius: BorderRadius.circular(AppRadius.lg),
        ),
        child: Padding(
          padding: AppSpacing.cardPadding,
          child: Row(
            spacing: AppSpacing.lg,
            children: [
              Container(
                width: _discSize,
                height: _discSize,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  gradient: colors.badge.discGradient,
                  borderRadius: BorderRadius.circular(AppRadius.lg),
                ),
                child: SvgIcon(
                  AppIconAssets.trophyMedal,
                  size: AppIconSize.lg,
                  color: colors.text.inverse,
                ),
              ),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      eyebrow,
                      style: AppTextStyle.overline.copyWith(color: colors.text.muted),
                    ),
                    Padding(
                      padding: const EdgeInsets.only(top: AppSpacing.xs),
                      child: Text(
                        badgeName,
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          color: colors.text.numeral,
                        ),
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.only(top: AppSpacing.sm),
                      child: ProgressBar(value: progress),
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
