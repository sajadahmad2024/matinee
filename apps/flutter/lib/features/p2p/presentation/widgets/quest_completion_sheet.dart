import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:matinee/core/assets/assets.dart';
import 'package:matinee/core/l10n/l10n.dart';
import 'package:matinee/core/responsive/responsive.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/core/widgets/screen_title.dart';
import 'package:matinee/core/widgets/sheet_surface.dart';
import 'package:matinee/core/widgets/svg_icon.dart';
import 'package:matinee/features/p2p/presentation/widgets/reward_stat_card.dart';

/// The box the design puts the trophy glyph in.
const double _iconBoxSize = 64;

/// The dot beside the eyebrow, which says 'done' with a colour and a shape.
const double _dotSize = 6;

///
/// Announces a finished quest over its tracker. The reward is already paid by
/// the time it opens, so it has nothing to report back.
///
Future<void> showQuestCompletionSheet(
  BuildContext context, {
  required String questTitle,
  required String pointsLabel,
  required String badgeName,
}) {
  return showModalBottomSheet<void>(
    context: context,
    useRootNavigator: true,
    backgroundColor: context.appColors.sheet.routeBackground,
    showDragHandle: false,
    builder: (_) => QuestCompletionSheet(
      questTitle: questTitle,
      pointsLabel: pointsLabel,
      badgeName: badgeName,
    ),
  );
}

@visibleForTesting
class QuestCompletionSheet extends StatelessWidget {
  const QuestCompletionSheet({
    required this.questTitle,
    required this.pointsLabel,
    required this.badgeName,
    super.key,
  });

  final String questTitle;
  final String pointsLabel;
  final String badgeName;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final colors = context.appColors;
    return SheetSurface(
      isModal: true,
      child: ContentContainer(
        maxWidth: ContentContainer.form,
        // Hugging, not filling: the sheet is as tall as its copy, which is
        // what the design draws.
        shrinkWrapHeight: true,
        child: SingleChildScrollView(
          padding: EdgeInsets.only(
            left: AppScreenPadding.modal,
            right: AppScreenPadding.modal,
            bottom: context.bottomInset(AppSpacing.xxxl),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Padding(
                padding: const EdgeInsets.only(top: AppSpacing.xl),
                child: _Heading(questTitle: questTitle),
              ),
              Padding(
                padding: const EdgeInsets.only(top: AppSpacing.xl),
                child: Text(
                  l10n.questModalBody(questTitle),
                  style: AppTextStyle.bodySmall.copyWith(color: colors.text.secondary),
                ),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(vertical: AppSpacing.xl),
                child: Divider(height: 0, color: colors.card.backgroundRaised),
              ),
              // IntrinsicHeight, or stretching the children asks a Row inside a
              // Column to fill a height that has no bound.
              IntrinsicHeight(
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  spacing: AppSpacing.md,
                  children: [
                    Expanded(
                      child: RewardStatCard.figure(
                        label: l10n.questModalPointsLabel,
                        value: l10n.questModalPoints(pointsLabel),
                        unit: l10n.questModalPointsUnit,
                        summary: l10n.p2pPointsSummary(pointsLabel),
                      ),
                    ),
                    Expanded(
                      child: RewardStatCard.name(
                        label: l10n.questModalBadgeLabel,
                        name: badgeName,
                        summary: l10n.questModalBadgeSummary(badgeName),
                      ),
                    ),
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.only(top: AppSpacing.xxl),
                child: FilledButton(
                  onPressed: () => Navigator.of(context).pop(),
                  child: Text(l10n.questModalClaim),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Heading extends StatelessWidget {
  const _Heading({required this.questTitle});

  final String questTitle;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final colors = context.appColors;
    return Semantics(
      // The sheet arrives without being asked for, so its heading interrupts
      // rather than waiting to be reached.
      role: SemanticsRole.alert,
      container: true,
      child: Row(
        spacing: AppSpacing.lg,
        children: [
          Container(
            width: _iconBoxSize,
            height: _iconBoxSize,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: colors.card.background,
              border: Border.all(color: colors.card.border),
              borderRadius: const BorderRadius.all(Radius.circular(AppRadius.lg)),
            ),
            child: SvgIcon(
              AppIconAssets.star,
              size: AppIconSize.xl,
              color: colors.icon.accent,
            ),
          ),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisSize: MainAxisSize.min,
                  spacing: AppSpacing.sm,
                  children: [
                    DecoratedBox(
                      decoration: BoxDecoration(
                        color: colors.status.success,
                        shape: BoxShape.circle,
                      ),
                      child: const SizedBox.square(dimension: _dotSize),
                    ),
                    Text(
                      l10n.questModalEyebrow,
                      style: AppTextStyle.overline.copyWith(color: colors.text.success),
                    ),
                  ],
                ),
                Padding(
                  padding: const EdgeInsets.only(top: AppSpacing.xs),
                  child: ScreenTitle(
                    label: l10n.questModalTitle,
                    child: Text(
                      l10n.questModalTitle,
                      style: AppTextStyle.headlineMedium.copyWith(color: colors.text.primary),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
