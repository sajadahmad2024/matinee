import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/features/earns/presentation/widgets/award_footer.dart';
import 'package:matinee/features/earns/presentation/widgets/status_badge.dart';

/// One week of quests: when it ran, how much of it landed, and what it paid.
class QuestHistoryCard extends StatelessWidget {
  const QuestHistoryCard({
    required this.title,
    required this.range,
    required this.progress,
    required this.statusLabel,
    required this.statusIcon,
    required this.isClaimed,
    required this.points,
    required this.isAwarded,
    required this.pointsUnit,
    required this.semanticLabel,
    super.key,
    this.badgeName,
  });

  final String title;
  final String range;
  final String progress;

  final String statusLabel;

  /// A glyph from `AppIconAssets`, the tick or the star the design draws.
  final String statusIcon;

  final bool isClaimed;

  final String points;

  /// An entry that paid nothing steps its figure back to the caption grey.
  final bool isAwarded;

  final String pointsUnit;

  /// The card as one sentence, since its status is a colour and a word apart.
  final String semanticLabel;

  final String? badgeName;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    return Semantics(
      label: semanticLabel,
      // The list around these announces a position only if its children say
      // they are items in it.
      role: SemanticsRole.listItem,
      container: true,
      excludeSemantics: true,
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: colors.card.background,
          // The design rings the weeks that earned a badge.
          border: Border.all(
            color: badgeName == null ? colors.card.border : colors.card.borderHighlight,
          ),
          borderRadius: const BorderRadius.all(Radius.circular(AppRadius.lg)),
        ),
        child: Padding(
          padding: AppSpacing.cardPadding,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                spacing: AppSpacing.sm,
                children: [
                  Flexible(
                    child: Text(
                      range,
                      style: AppTextStyle.caption.copyWith(color: colors.text.muted),
                    ),
                  ),
                  StatusBadge(
                    label: statusLabel,
                    // Gold, not red: a part-finished week is unclaimed rather
                    // than failed, which is how the design tints it.
                    tone: isClaimed ? StatusTone.success : StatusTone.gold,
                    icon: statusIcon,
                  ),
                ],
              ),
              Padding(
                padding: const EdgeInsets.only(top: AppSpacing.md),
                child: Text(
                  title,
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                    color: colors.text.primary,
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.only(top: AppSpacing.xs),
                child: Text(
                  progress,
                  style: AppTextStyle.caption.copyWith(color: colors.text.muted),
                ),
              ),
              Padding(
                padding: const EdgeInsets.only(top: AppSpacing.md, bottom: AppSpacing.md),
                child: Divider(height: 0, color: colors.divider),
              ),
              AwardFooter(
                points: points,
                unitLabel: pointsUnit,
                isAwarded: isAwarded,
                badgeName: badgeName,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
