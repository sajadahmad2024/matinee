import 'package:flutter/semantics.dart';
import 'package:material_ui/material_ui.dart';
import 'package:matinee/core/assets/app_icon_assets.dart';
import 'package:matinee/core/l10n/l10n.dart';
import 'package:matinee/core/responsive/responsive.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/core/widgets/app_bottom_sheet.dart';
import 'package:matinee/core/widgets/progress_bar.dart';
import 'package:matinee/core/widgets/screen_title.dart';
import 'package:matinee/core/widgets/svg_icon.dart';

///
/// Opens [PointsEarnedSheet] after a share, and resolves true when the viewer
/// chose Subscribe Now, so the caller can move on to the premium offer.
///
Future<bool> showPointsEarnedSheet(
  BuildContext context, {
  required int earnedPoints,
  required int balance,
  required int levelTarget,
}) async {
  final subscribe = await showAppBottomSheet<bool>(
    context,
    builder: (_) => PointsEarnedSheet(earnedPoints: earnedPoints, balance: balance, levelTarget: levelTarget),
  );
  return subscribe ?? false;
}

/// What a share paid, and how far the balance now is from the next level.
class PointsEarnedSheet extends StatelessWidget {
  const PointsEarnedSheet({required this.earnedPoints, required this.balance, required this.levelTarget, super.key});

  final int earnedPoints;
  final int balance;
  final int levelTarget;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final colors = context.appColors;
    final format = context.decimalFormat;
    final earned = format.format(earnedPoints);
    return AppBottomSheet(
      isModal: true,
      closeLabel: l10n.reelsPointsEarnedClose,
      body: ContentContainer(
        maxWidth: ContentContainer.form,
        // Hugging, not filling: the sheet is as tall as its copy.
        shrinkWrapHeight: true,
        child: SingleChildScrollView(
          padding: EdgeInsets.only(
            left: AppScreenPadding.sheet,
            right: AppScreenPadding.sheet,
            bottom: context.bottomInset(AppSpacing.xxxl),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Semantics(
                // The sheet arrives without being asked for, so it interrupts
                // rather than waiting to be reached.
                role: SemanticsRole.alert,
                container: true,
                child: Column(
                  children: [
                    _EarnedChip(label: l10n.reelsPointsEarnedChip(earned)),
                    Padding(
                      padding: const EdgeInsets.only(top: AppSpacing.lg),
                      child: ScreenTitle(
                        label: l10n.reelsPointsEarnedTitle,
                        child: Text(
                          l10n.reelsPointsEarnedTitle,
                          textAlign: TextAlign.center,
                          style: AppTextStyle.headlineSmall.copyWith(color: colors.text.warning),
                        ),
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.only(top: AppSpacing.sm),
                      child: Text(
                        l10n.reelsPointsEarnedBody(earned),
                        textAlign: TextAlign.center,
                        style: AppTextStyle.bodySmall.copyWith(color: colors.text.secondary),
                      ),
                    ),
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.only(top: AppSpacing.xxl),
                child: _LevelProgress(balance: balance, target: levelTarget),
              ),
              Padding(
                padding: const EdgeInsets.only(top: AppSpacing.xxl),
                child: FilledButton(
                  onPressed: () => Navigator.of(context).pop(true),
                  child: Text(l10n.reelsPointsEarnedCta),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// The gold pill naming what the share paid.
class _EarnedChip extends StatelessWidget {
  const _EarnedChip({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    return DecoratedBox(
      decoration: BoxDecoration(
        color: colors.tag.goldBackground,
        border: Border.all(color: colors.tag.goldBorder),
        borderRadius: const BorderRadius.all(Radius.circular(AppRadius.pill)),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.sm),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          spacing: AppSpacing.sm,
          children: [
            SvgIcon(AppIconAssets.star, size: AppIconSize.sm, color: colors.icon.accent),
            Text(label, style: AppTextStyle.titleSmall.copyWith(color: colors.tag.goldLabel)),
          ],
        ),
      ),
    );
  }
}

/// The balance against the next level's target: a label row over a bar.
class _LevelProgress extends StatelessWidget {
  const _LevelProgress({required this.balance, required this.target});

  final int balance;
  final int target;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final colors = context.appColors;
    final format = context.decimalFormat;
    final points = format.format(balance);
    final goal = format.format(target);
    return Semantics(
      label: l10n.reelsPointsEarnedProgressSummary(points, goal),
      container: true,
      excludeSemantics: true,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        spacing: AppSpacing.sm,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            spacing: AppSpacing.sm,
            children: [
              Expanded(
                child: Text(
                  l10n.reelsPointsEarnedProgressLabel,
                  style: AppTextStyle.caption.copyWith(color: colors.text.secondary),
                ),
              ),
              Text.rich(
                TextSpan(
                  children: [
                    TextSpan(
                      text: points,
                      style: AppTextStyle.labelSmall.copyWith(color: colors.text.numeral),
                    ),
                    TextSpan(text: l10n.reelsPointsEarnedProgressTarget(goal)),
                  ],
                ),
                style: AppTextStyle.labelSmall.copyWith(color: colors.text.muted),
              ),
            ],
          ),
          ProgressBar(value: target == 0 ? 0 : balance / target, height: AppControlHeight.progressBarThick),
        ],
      ),
    );
  }
}
