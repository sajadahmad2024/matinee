import 'dart:async';
import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:matinee/app/router/app_routes.dart';
import 'package:matinee/core/l10n/l10n.dart';
import 'package:matinee/core/responsive/responsive.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/core/widgets/back_disc_button.dart';
import 'package:matinee/di/service_locator.dart';
import 'package:matinee/features/onboarding/data/models/onboarding_slide.dart';
import 'package:matinee/features/onboarding/data/onboarding_repository.dart';
import 'package:matinee/features/onboarding/presentation/cubit/onboarding_cubit.dart';
import 'package:matinee/features/onboarding/presentation/cubit/onboarding_state.dart';
import 'package:matinee/features/onboarding/presentation/widgets/onboarding_slide_view.dart';
import 'package:matinee/l10n/gen/app_localizations.dart';

class OnboardingScreen extends StatelessWidget {
  const OnboardingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final slides = buildOnboardingSlides(context.l10n);
    return BlocProvider(
      create: (_) {
        final cubit = OnboardingCubit(getIt<OnboardingRepository>());
        unawaited(cubit.load(slides));
        return cubit;
      },
      child: const OnboardingView(),
    );
  }
}

///
/// The intro copy, assembled from the localised strings and the assets the data
/// layer owns. It lives here because the data layer cannot translate.
///
List<OnboardingSlide> buildOnboardingSlides(AppLocalizations l10n) {
  final copy = [
    (
      eyebrow: l10n.onboardingSlide1Eyebrow,
      heading: l10n.onboardingSlide1Heading,
      body: l10n.onboardingSlide1Body,
      statValue: l10n.onboardingSlide1StatValue,
      statCaption: l10n.onboardingSlide1StatCaption,
      labels: [
        l10n.onboardingSlide1Highlight1,
        l10n.onboardingSlide1Highlight2,
        l10n.onboardingSlide1Highlight3,
      ],
    ),
    (
      eyebrow: l10n.onboardingSlide2Eyebrow,
      heading: l10n.onboardingSlide2Heading,
      body: l10n.onboardingSlide2Body,
      statValue: l10n.onboardingSlide2StatValue,
      statCaption: l10n.onboardingSlide2StatCaption,
      labels: [
        l10n.onboardingSlide2Highlight1,
        l10n.onboardingSlide2Highlight2,
        l10n.onboardingSlide2Highlight3,
      ],
    ),
    (
      eyebrow: l10n.onboardingSlide3Eyebrow,
      heading: l10n.onboardingSlide3Heading,
      body: l10n.onboardingSlide3Body,
      statValue: l10n.onboardingSlide3StatValue,
      statCaption: l10n.onboardingSlide3StatCaption,
      labels: [
        l10n.onboardingSlide3Highlight1,
        l10n.onboardingSlide3Highlight2,
        l10n.onboardingSlide3Highlight3,
      ],
    ),
  ];
  // Zipped rather than indexed, so copy and assets that fall out of step
  // produce a shorter carousel instead of a RangeError at build time.
  const assets = OnboardingSlideContent.slides;
  return [
    for (var i = 0; i < math.min(copy.length, assets.length); i++)
      OnboardingSlide(
        imageAsset: assets[i].image,
        eyebrow: copy[i].eyebrow,
        heading: copy[i].heading,
        body: copy[i].body,
        statValue: copy[i].statValue,
        statCaption: copy[i].statCaption,
        highlights: [
          for (var t = 0; t < math.min(copy[i].labels.length, assets[i].emoji.length); t++)
            OnboardingHighlight(emoji: assets[i].emoji[t], label: copy[i].labels[t]),
        ],
      ),
  ];
}

@visibleForTesting
class OnboardingView extends StatefulWidget {
  const OnboardingView({super.key});

  @override
  State<OnboardingView> createState() => _OnboardingViewState();
}

class _OnboardingViewState extends State<OnboardingView> {
  final PageController _pager = PageController();

  ///
  /// The page the pager was last told to show. The live animated position would
  /// drop a second tap landing while the first animation still runs.
  ///
  int _requestedPage = 0;

  @override
  void dispose() {
    _pager.dispose();
    super.dispose();
  }

  ///
  /// A swipe settles the pager itself, so the recorded target follows it rather
  /// than the controller being told to animate back to where it already is.
  ///
  void _onPageChanged(int index) {
    _requestedPage = index;
    unawaited(context.read<OnboardingCubit>().selectSlide(index));
  }

  ///
  /// The cubit owns the index, so a state change that did not come from a swipe
  /// still moves the pager.
  ///
  void _syncPager(int index) {
    if (!_pager.hasClients || _requestedPage == index) {
      return;
    }
    _requestedPage = index;
    // A jump, not an animation, when the platform asks for reduced motion: the
    // slide travel is the largest movement in the app.
    if (MediaQuery.disableAnimationsOf(context)) {
      _pager.jumpToPage(index);
      return;
    }
    _pager.animateToPage(index, duration: Durations.medium2, curve: Curves.easeOut);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.appColors.auth.surface,
      body: BlocConsumer<OnboardingCubit, OnboardingState>(
        listener: (context, state) {
          if (state is! OnboardingSuccess) {
            return;
          }
          if (state.data.finished) {
            const SignInRoute().go(context);
            return;
          }
          _syncPager(state.data.index);
        },
        builder: (context, state) => switch (state) {
          OnboardingInitial() || OnboardingLoading() => const SizedBox.shrink(),
          OnboardingSuccess(:final data) => _Slides(data: data, pager: _pager, onPageChanged: _onPageChanged),
        },
      ),
    );
  }
}

class _Slides extends StatelessWidget {
  const _Slides({required this.data, required this.pager, required this.onPageChanged});

  final OnboardingData data;
  final PageController pager;
  final ValueChanged<int> onPageChanged;

  @override
  Widget build(BuildContext context) {
    // The bar and the CTA are painted over the slide, so in tree order they come
    // after it; the sort keys put traversal back into layout order.
    return FocusTraversalGroup(
      policy: OrderedTraversalPolicy(),
      child: Stack(
        children: [
          Semantics(
            sortKey: const OrdinalSortKey(1),
            // Says which slide of how many, which the carousel shows only by
            // what is on screen.
            label: context.l10n.onboardingSlidePosition(
              data.index + 1,
              data.slides.length,
            ),
            child: PageView.builder(
              controller: pager,
              itemCount: data.slides.length,
              onPageChanged: onPageChanged,
              itemBuilder: (context, index) => OnboardingSlideView(slide: data.slides[index]),
            ),
          ),
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: Semantics(
              sortKey: const OrdinalSortKey(0),
              child: _TopBar(isFirstSlide: data.index == 0),
            ),
          ),
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Semantics(sortKey: const OrdinalSortKey(2), child: const _Cta()),
          ),
        ],
      ),
    );
  }
}

class _TopBar extends StatelessWidget {
  const _TopBar({required this.isFirstSlide});

  final bool isFirstSlide;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final cubit = context.read<OnboardingCubit>();
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: AppScreenPadding.onboarding),
        child: ContentContainer(
          maxWidth: ContentContainer.form,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // The first slide has nowhere to go back to, so the control is
              // disabled rather than silently doing nothing when tapped.
              BackDiscButton(
                tooltip: l10n.onboardingBack,
                onPressed: isFirstSlide ? null : () => unawaited(cubit.previous()),
              ),
              // Announced from here: the label is upper case, and screen readers
              // spell a short capitalised run out letter by letter.
              Semantics(
                label: l10n.onboardingSkip,
                button: true,
                excludeSemantics: true,
                child: TextButton(
                  onPressed: () => unawaited(cubit.complete()),
                  child: Text(l10n.onboardingSkip.toUpperCase()),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Cta extends StatelessWidget {
  const _Cta();

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      bottom: false,
      child: Padding(
        padding: EdgeInsets.only(
          left: AppScreenPadding.onboarding,
          right: AppScreenPadding.onboarding,
          bottom: context.bottomInset(AppSpacing.xxl),
        ),
        child: ContentContainer(
          maxWidth: ContentContainer.form,
          child: SizedBox(
            width: double.infinity,
            child: FilledButton.icon(
              onPressed: () => unawaited(context.read<OnboardingCubit>().next()),
              iconAlignment: IconAlignment.end,
              icon: const Icon(Icons.chevron_right, size: AppIconSize.sm),
              label: Text(context.l10n.onboardingContinue),
            ),
          ),
        ),
      ),
    );
  }
}
