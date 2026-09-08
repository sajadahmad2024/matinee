import 'package:bloc_test/bloc_test.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/features/onboarding/data/models/onboarding_slide.dart';
import 'package:matinee/features/onboarding/presentation/cubit/onboarding_cubit.dart';
import 'package:matinee/features/onboarding/presentation/cubit/onboarding_state.dart';
import 'package:matinee/features/onboarding/presentation/onboarding_screen.dart';
import 'package:matinee/features/onboarding/presentation/widgets/onboarding_back_button.dart';
import 'package:matinee/features/onboarding/presentation/widgets/onboarding_eyebrow.dart';
import 'package:matinee/features/onboarding/presentation/widgets/onboarding_stat_pill.dart';
import 'package:mocktail/mocktail.dart';

import '../../../helpers/helpers.dart';

class _MockOnboardingCubit extends MockCubit<OnboardingState> implements OnboardingCubit {}

void main() {
  group(OnboardingView, () {
    late OnboardingCubit cubit;

    const slide = OnboardingSlide(
      imageAsset: 'assets/images/onboarding-1.jpg',
      eyebrow: 'DISCOVER',
      heading: 'Watch Trailers Instantly',
      body: 'Swipe through upcoming movies.',
      statValue: '10M+',
      statCaption: 'trailers watched monthly',
      highlights: [
        OnboardingHighlight(emoji: '🎬', label: '500+ Trailers'),
        OnboardingHighlight(emoji: '🌍', label: 'Global content'),
        OnboardingHighlight(emoji: '✨', label: 'Daily Picks'),
      ],
    );

    setUp(() {
      cubit = _MockOnboardingCubit();
    });

    Future<void> pumpView(WidgetTester tester) {
      return tester.pumpApp(
        BlocProvider<OnboardingCubit>.value(value: cubit, child: const OnboardingView()),
      );
    }

    void whenShowingFirstSlide() {
      when(() => cubit.state).thenReturn(
        const OnboardingState.success(OnboardingData(slides: [slide], index: 0)),
      );
    }

    group('renders', () {
      testWidgets('the slide copy when the state is success', (tester) async {
        whenShowingFirstSlide();

        await pumpView(tester);

        expect(find.text('Watch Trailers Instantly'), findsOneWidget);
        expect(find.byType(OnboardingEyebrow), findsOneWidget);
        expect(find.byType(OnboardingStatPill), findsOneWidget);
        expect(find.text('500+ Trailers'), findsOneWidget);
      });

      testWidgets('nothing while the slides are loading', (tester) async {
        when(() => cubit.state).thenReturn(const OnboardingState.loading());

        await pumpView(tester);

        expect(find.byType(OnboardingEyebrow), findsNothing);
      });

      testWidgets('the heading and CTA at a text scale of 1.3', (tester) async {
        tester.view.physicalSize = const Size(1170, 2532);
        tester.view.devicePixelRatio = 3;
        addTearDown(tester.view.reset);
        whenShowingFirstSlide();

        await tester.pumpApp(
          MediaQuery(
            data: const MediaQueryData(textScaler: TextScaler.linear(1.3)),
            child: BlocProvider<OnboardingCubit>.value(
              value: cubit,
              child: const OnboardingView(),
            ),
          ),
        );

        // The copy scrolls rather than overflowing, so the check that matters is
        // that it is still on screen and the CTA has not been pushed off it.
        expect(tester.takeException(), isNull);
        expect(find.text('Watch Trailers Instantly'), findsOneWidget);
        final cta = tester.getRect(find.byType(FilledButton));
        expect(cta.bottom, lessThanOrEqualTo(tester.getRect(find.byType(OnboardingView)).bottom));
        expect(cta.height, greaterThanOrEqualTo(52));
      });
    });

    group('calls next', () {
      testWidgets('when the continue button is tapped', (tester) async {
        whenShowingFirstSlide();
        when(cubit.next).thenAnswer((_) async {});

        await pumpView(tester);
        await tester.tap(find.byType(FilledButton));
        await tester.pump();

        verify(cubit.next).called(1);
      });
    });

    group('calls complete', () {
      testWidgets('when skip is tapped', (tester) async {
        whenShowingFirstSlide();
        when(cubit.complete).thenAnswer((_) async {});

        await pumpView(tester);
        await tester.tap(find.text('SKIP'));
        await tester.pump();

        verify(cubit.complete).called(1);
      });
    });

    group('calls previous', () {
      testWidgets('when the back button is tapped on a later slide', (tester) async {
        when(() => cubit.state).thenReturn(
          const OnboardingState.success(OnboardingData(slides: [slide, slide], index: 1)),
        );
        when(cubit.previous).thenAnswer((_) async {});

        await pumpView(tester);
        await tester.tap(find.byType(OnboardingBackButton));
        await tester.pump();

        verify(cubit.previous).called(1);
      });

      testWidgets('never from the first slide, where back is disabled', (tester) async {
        whenShowingFirstSlide();

        await pumpView(tester);
        await tester.tap(find.byType(OnboardingBackButton));
        await tester.pump();

        verifyNever(cubit.previous);
      });
    });
  });
}
