import 'package:flutter/material.dart';
import 'package:matinee/core/assets/assets.dart';
import 'package:matinee/core/l10n/l10n.dart';
import 'package:matinee/core/responsive/responsive.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/core/widgets/screen_title.dart';

///
/// What the streak screen shows before the first day: the ritual explained over
/// a full-bleed still, and the button that starts it.
///
class StreakIntroView extends StatelessWidget {
  const StreakIntroView({
    required this.minutesPerDay,
    required this.isStarting,
    required this.onStart,
    super.key,
  });

  /// The first rung's daily minutes, which the copy quotes twice.
  final int minutesPerDay;

  final bool isStarting;
  final VoidCallback onStart;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    return Stack(
      fit: StackFit.expand,
      children: [
        // Knocked back by the design's own dim, so the copy over the lower half
        // holds its contrast against a lit still.
        Image.asset(
          AppImageAssets.p2pDailyStreaks,
          fit: BoxFit.cover,
          excludeFromSemantics: true,
          // On the image rather than an `Opacity` above it, which would buy a
          // screen-sized offscreen layer for the same result.
          opacity: AlwaysStoppedAnimation(colors.overlay.imageDimStreakIntro),
        ),
        DecoratedBox(decoration: BoxDecoration(gradient: colors.overlay.onboarding)),
        _Copy(minutesPerDay: minutesPerDay, isStarting: isStarting, onStart: onStart),
      ],
    );
  }
}

class _Copy extends StatelessWidget {
  const _Copy({
    required this.minutesPerDay,
    required this.isStarting,
    required this.onStart,
  });

  final int minutesPerDay;
  final bool isStarting;
  final VoidCallback onStart;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final colors = context.appColors;
    final bottom = context.bottomInset(AppSpacing.screenBottom);
    return ContentContainer(
      maxWidth: ContentContainer.form,
      // The copy sits on the lower half of the still, so the column is given
      // the viewport to align itself in and only scrolls once it outgrows it.
      child: LayoutBuilder(
        builder: (context, constraints) => SingleChildScrollView(
          padding: EdgeInsets.only(
            left: AppScreenPadding.auth,
            right: AppScreenPadding.auth,
            bottom: bottom,
          ),
          child: ConstrainedBox(
            // Less the padding above, or the screen is permanently scrollable
            // by exactly that gap.
            constraints: BoxConstraints(minHeight: constraints.maxHeight - bottom),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                Text(
                  l10n.streakIntroEyebrow,
                  style: AppTextStyle.labelSmall.copyWith(color: colors.text.secondary),
                ),
                Padding(
                  padding: const EdgeInsets.only(top: AppSpacing.sm),
                  // The screen's own heading: the bar holds nothing on the
                  // intro, so this is the top rather than a second level one.
                  child: ScreenTitle(
                    label: l10n.streakIntroTitle,
                    child: Text(
                      l10n.streakIntroTitle,
                      style: AppTextStyle.displayLarge.copyWith(color: colors.text.primary),
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.only(top: AppSpacing.xl),
                  child: _RitualCard(minutesPerDay: minutesPerDay),
                ),
                Padding(
                  padding: const EdgeInsets.only(top: AppSpacing.xl),
                  child: Text(
                    l10n.streakIntroBody,
                    style: AppTextStyle.bodySmall.copyWith(color: colors.text.muted),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.only(top: AppSpacing.xl),
                  child: FilledButton(
                    onPressed: isStarting ? null : onStart,
                    child: Text(l10n.streakIntroCta),
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

class _RitualCard extends StatelessWidget {
  const _RitualCard({required this.minutesPerDay});

  final int minutesPerDay;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final colors = context.appColors;
    return DecoratedBox(
      decoration: BoxDecoration(
        color: colors.card.background,
        border: Border.all(color: colors.card.border),
        borderRadius: const BorderRadius.all(Radius.circular(AppRadius.md)),
      ),
      child: Padding(
        padding: AppSpacing.cardPadding,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              l10n.streakIntroCardTitle(minutesPerDay),
              style: AppTextStyle.titleSmall.copyWith(color: colors.bottomNav.active),
            ),
            Padding(
              padding: const EdgeInsets.only(top: AppSpacing.xs),
              child: Text(
                l10n.streakIntroCardBody(minutesPerDay),
                style: AppTextStyle.caption.copyWith(color: colors.text.muted),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
