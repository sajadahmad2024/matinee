import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:matinee/core/assets/assets.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/core/widgets/svg_icon.dart';
import 'package:matinee/features/earns/data/models/earned_badge.dart';

/// The disc the design draws at 40 with an 18 glyph inside it.
const double _discSize = AppAvatarSize.badgeDiscSm;

///
/// One tile of the badge grid. The three states differ in more than colour —
/// each carries its own glyph, so the status survives without it.
///
class BadgeTile extends StatelessWidget {
  const BadgeTile({
    required this.name,
    required this.requirement,
    required this.status,
    required this.semanticLabel,
    super.key,
  });

  final String name;

  /// What the badge takes to earn, or what earned it.
  final String requirement;

  final BadgeStatus status;

  ///
  /// The tile as one sentence, and the one place the state is spelled out: the
  /// design says 'locked' with a padlock and a grey, neither of which reads.
  ///
  final String semanticLabel;

  static String _glyph(BadgeStatus status) {
    return switch (status) {
      BadgeStatus.earned => AppIconAssets.check,
      BadgeStatus.current => AppIconAssets.trophyMedal,
      BadgeStatus.locked => AppIconAssets.lock,
    };
  }

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    final isLocked = status == BadgeStatus.locked;
    final isCurrent = status == BadgeStatus.current;
    return Semantics(
      // One of the grid's items, so a screen reader can say which of how many.
      role: SemanticsRole.listItem,
      label: semanticLabel,
      container: true,
      excludeSemantics: true,
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: isCurrent ? colors.card.backgroundGoldTint : colors.card.background,
          border: Border.all(
            color: isCurrent ? colors.card.borderHighlight : colors.card.border,
          ),
          borderRadius: BorderRadius.circular(AppRadius.lg),
        ),
        child: Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.md,
            vertical: AppSpacing.lg,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: _discSize,
                height: _discSize,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: switch (status) {
                    BadgeStatus.earned => colors.tag.goldBackground,
                    BadgeStatus.current => colors.card.backgroundGoldTint,
                    BadgeStatus.locked => colors.card.backgroundRaised,
                  },
                  border: Border.all(
                    color: isLocked ? colors.card.border : colors.card.borderHighlight,
                  ),
                  borderRadius: BorderRadius.circular(AppRadius.md),
                ),
                child: SvgIcon(
                  _glyph(status),
                  size: isLocked ? AppIconSize.sm : AppIconSize.md,
                  // Muted, not disabled: the padlock is the only thing that
                  // draws the locked state, and the disabled tone reaches
                  // 2.19:1 against this disc where a glyph needs 3:1.
                  color: isLocked ? colors.icon.muted : colors.icon.accent,
                ),
              ),
              Padding(
                padding: const EdgeInsets.only(top: AppSpacing.md),
                child: Text(
                  name,
                  style: Theme.of(context).textTheme.labelMedium?.copyWith(
                    // A locked badge is content, not an inactive control, so
                    // it takes no exemption from the 4.5:1 minimum: the
                    // design's disabled tone reads 2.38:1 on this card.
                    color: switch (status) {
                      BadgeStatus.earned => colors.text.primary,
                      BadgeStatus.current => colors.text.numeral,
                      BadgeStatus.locked => colors.text.muted,
                    },
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.only(top: AppSpacing.xxs),
                child: Text(
                  requirement,
                  style: AppTextStyle.caption.copyWith(color: colors.text.muted),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
