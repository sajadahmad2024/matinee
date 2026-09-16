import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:matinee/core/assets/assets.dart';
import 'package:matinee/core/l10n/l10n.dart';
import 'package:matinee/core/responsive/responsive.dart';
import 'package:matinee/core/theme/app_elevation.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/core/widgets/screen_title.dart';
import 'package:matinee/core/widgets/sheet_surface.dart';
import 'package:matinee/core/widgets/svg_icon.dart';
import 'package:matinee/features/p2p/presentation/widgets/reward_stat_card.dart';

/// The glowing disc the design puts the flame in.
const double _badgeDiscSize = 80;

///
/// Announces a finished streak level over the streak screen: what it paid and
/// the standing it earned.
///
Future<void> showStreakLevelSheet(
  BuildContext context, {
  required int days,
  required String pointsLabel,
}) {
  return showModalBottomSheet<void>(
    context: context,
    useRootNavigator: true,
    backgroundColor: context.appColors.sheet.routeBackground,
    showDragHandle: false,
    builder: (_) => StreakLevelSheet(days: days, pointsLabel: pointsLabel),
  );
}

@visibleForTesting
class StreakLevelSheet extends StatelessWidget {
  const StreakLevelSheet({required this.days, required this.pointsLabel, super.key});

  final int days;
  final String pointsLabel;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final colors = context.appColors;
    final title = l10n.streakLevelDoneTitle(days);
    return SheetSurface(
      isModal: true,
      child: ContentContainer(
        maxWidth: ContentContainer.form,
        // Hugging, not filling: the drawer is as tall as its copy.
        shrinkWrapHeight: true,
        child: SingleChildScrollView(
          padding: EdgeInsets.only(
            left: AppScreenPadding.modal,
            right: AppScreenPadding.modal,
            bottom: context.bottomInset(AppSpacing.xxxl),
          ),
          child: Semantics(
            // The drawer arrives without being asked for, so it interrupts
            // rather than waiting to be reached.
            role: SemanticsRole.alert,
            container: true,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Padding(
                  padding: EdgeInsets.only(top: AppSpacing.lg),
                  child: Center(child: _Flame()),
                ),
                Padding(
                  padding: const EdgeInsets.only(top: AppSpacing.xl),
                  child: ScreenTitle(
                    label: title,
                    child: Text(
                      title,
                      textAlign: TextAlign.center,
                      style: AppTextStyle.titleLarge.copyWith(color: colors.text.primary),
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.only(top: AppSpacing.sm),
                  child: Text(
                    l10n.streakLevelDoneBody,
                    textAlign: TextAlign.center,
                    style: AppTextStyle.bodyMedium.copyWith(color: colors.text.secondary),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.only(top: AppSpacing.xl),
                  child: // IntrinsicHeight, or stretching the children asks a Row inside a
                      // Column to fill a height that has no bound.
                      IntrinsicHeight(
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          spacing: AppSpacing.lg,
                          children: [
                            Expanded(
                              child: RewardStatCard.figure(
                                label: l10n.streakLevelDoneRewardLabel,
                                value: l10n.streakLevelDonePoints(pointsLabel),
                                unit: l10n.streakLevelDonePointsUnit,
                                isHighlighted: true,
                                summary: l10n.streakLevelDoneRewardSummary(pointsLabel),
                              ),
                            ),
                            Expanded(
                              child: RewardStatCard.name(
                                label: l10n.streakLevelDoneStatusLabel,
                                name: l10n.streakLevelDoneStatus,
                                summary: l10n.streakLevelDoneStatusSummary(l10n.streakLevelDoneStatus),
                              ),
                            ),
                          ],
                        ),
                      ),
                ),
                Padding(
                  padding: const EdgeInsets.only(top: AppSpacing.xxl),
                  child: FilledButton(
                    onPressed: () => Navigator.of(context).pop(),
                    child: Text(l10n.streakLevelDoneClaim),
                  ),
                ),
                Center(
                  child: TextButton(
                    onPressed: () => Navigator.of(context).pop(),
                    style: TextButton.styleFrom(foregroundColor: colors.text.muted),
                    child: Text(l10n.streakLevelDoneDismiss),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _Flame extends StatelessWidget {
  const _Flame();

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    return Container(
      width: _badgeDiscSize,
      height: _badgeDiscSize,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: colors.text.warning,
        shape: BoxShape.circle,
        boxShadow: AppElevation.glowCta,
      ),
      child: SvgIcon(
        AppIconAssets.fire,
        size: AppIconSize.xl,
        color: colors.text.inverse,
      ),
    );
  }
}
