import 'package:flutter/material.dart';
import 'package:matinee/core/assets/assets.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/core/widgets/progress_bar.dart';
import 'package:matinee/core/widgets/svg_icon.dart';
import 'package:matinee/features/earns/data/models/earn_source.dart';

///
/// One row of My Earns: glyph, source and its latest activity, the points it
/// has produced, and the share of the balance those points are.
///
class EarnRow extends StatelessWidget {
  const EarnRow({
    required this.title,
    required this.activity,
    required this.points,
    required this.share,
    required this.shareCaption,
    required this.semanticLabel,
    required this.kind,
    super.key,
  });

  final String title;
  final String activity;

  /// Formatted by the caller, which owns the locale's thousands separator.
  final String points;

  final double share;

  /// The 'pts · 38%' line the design sets under the value.
  final String shareCaption;

  ///
  /// The row as one sentence. Four texts and a bar otherwise read as five
  /// stops, and the bar repeats what the percentage already says.
  ///
  final String semanticLabel;

  final EarnSourceKind kind;

  ///
  /// The glyph the frame draws for this source. Weekly Quests really is a
  /// circled question mark in the design file.
  ///
  static String _glyph(EarnSourceKind kind) {
    return switch (kind) {
      EarnSourceKind.dailyStreaks => AppIconAssets.fire,
      EarnSourceKind.weeklyQuests => AppIconAssets.helpCircle,
      EarnSourceKind.predictionGames => AppIconAssets.puzzle,
      EarnSourceKind.auctionWins => AppIconAssets.trophyCup,
    };
  }

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    final text = Theme.of(context).textTheme;
    return Semantics(
      label: semanticLabel,
      container: true,
      excludeSemantics: true,
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: colors.card.background,
          border: Border.all(color: colors.card.border),
          borderRadius: BorderRadius.circular(AppRadius.lg),
        ),
        child: Padding(
          padding: AppSpacing.cardPadding,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            spacing: AppSpacing.md,
            children: [
              Row(
                spacing: AppSpacing.md,
                children: [
                  SvgIcon(_glyph(kind), size: AppIconSize.lg, color: colors.icon.accent),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(title, style: text.titleSmall?.copyWith(color: colors.text.primary)),
                        Padding(
                          padding: const EdgeInsets.only(top: AppSpacing.xxs),
                          child: Text(
                            activity,
                            style: AppTextStyle.caption.copyWith(color: colors.text.muted),
                          ),
                        ),
                      ],
                    ),
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        points,
                        style: AppTextStyle.numeralSm.copyWith(color: colors.text.numeral),
                      ),
                      Padding(
                        padding: const EdgeInsets.only(top: AppSpacing.xxs),
                        child: Text(
                          shareCaption,
                          style: AppTextStyle.caption.copyWith(color: colors.text.muted),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              ProgressBar(value: share, tone: ProgressTone.soft, isRaised: true),
            ],
          ),
        ),
      ),
    );
  }
}
