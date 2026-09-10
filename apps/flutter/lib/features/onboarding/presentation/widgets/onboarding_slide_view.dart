import 'package:flutter/material.dart';
import 'package:matinee/core/responsive/responsive.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/features/onboarding/data/models/onboarding_slide.dart';
import 'package:matinee/features/onboarding/presentation/widgets/onboarding_eyebrow.dart';
import 'package:matinee/features/onboarding/presentation/widgets/onboarding_highlight_tiles.dart';
import 'package:matinee/features/onboarding/presentation/widgets/onboarding_stat_pill.dart';

///
/// The gap the design leaves between the copy and the CTA below it.
///
const double _ctaGap = AppSpacing.xl;

///
/// The vertical room the floating CTA needs: its own height, the gap above it,
/// and the clearance beneath it. The last term is the device's, so this has to
/// be read per build rather than fixed as a constant — and it has to match
/// what the CTA itself uses, or the copy and the button drift apart.
///
double _ctaReserve(BuildContext context) => AppControlHeight.cta + _ctaGap + context.bottomInset(AppSpacing.xxl);

///
/// One intro slide: the dimmed still with its two scrims, bleeding to every
/// edge, and the copy block inset over it. The design anchors the copy to the
/// bottom of the frame with the CTA below it, so the column sits at the bottom
/// rather than at a fixed y.
///
class OnboardingSlideView extends StatelessWidget {
  const OnboardingSlideView({required this.slide, super.key});

  final OnboardingSlide slide;

  @override
  Widget build(BuildContext context) {
    final overlay = context.appColors.overlay;
    return Stack(
      fit: StackFit.expand,
      children: [
        Opacity(
          opacity: overlay.imageDimOnboarding,
          child: Image.asset(
            slide.imageAsset,
            fit: BoxFit.cover,
            excludeFromSemantics: true,
            // A missing still leaves the scrims to carry the slide rather than
            // painting Flutter's error box behind the copy.
            errorBuilder: (context, error, stackTrace) => const SizedBox.shrink(),
          ),
        ),
        DecoratedBox(decoration: BoxDecoration(gradient: overlay.onboarding)),
        DecoratedBox(decoration: BoxDecoration(gradient: overlay.onboardingVignette)),
        // The CTA floats over the slide inside the same safe area, so the copy
        // reserves the button height plus the gaps the design leaves above and
        // below it.
        SafeArea(
          bottom: false,
          child: Padding(
            padding: EdgeInsets.only(bottom: _ctaReserve(context)),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: AppScreenPadding.onboarding),
              child: ContentContainer(
                maxWidth: ContentContainer.form,
                child: _Content(slide: slide),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _Content extends StatelessWidget {
  const _Content({required this.slide});

  final OnboardingSlide slide;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors.auth;
    final textTheme = Theme.of(context).textTheme;
    // The column sits at the bottom of the frame the way the design draws it,
    // and scrolls instead of overflowing once the copy outgrows the space.
    return LayoutBuilder(
      builder: (context, constraints) => SingleChildScrollView(
        child: ConstrainedBox(
          constraints: BoxConstraints(minHeight: constraints.maxHeight),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.end,
            spacing: AppSpacing.md,
            children: [
              OnboardingEyebrow(label: slide.eyebrow),
              Text(
                slide.heading,
                style: textTheme.displayLarge?.copyWith(color: colors.onSurface),
              ),
              Text(
                slide.body,
                style: textTheme.bodyMedium?.copyWith(color: colors.onSurfaceVariant),
              ),
              OnboardingStatPill(value: slide.statValue, caption: slide.statCaption),
              Padding(
                padding: const EdgeInsets.only(top: AppSpacing.lg),
                child: OnboardingHighlightTiles(highlights: slide.highlights),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
