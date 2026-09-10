import 'package:bloc_test/bloc_test.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/features/onboarding/data/models/onboarding_slide.dart';
import 'package:matinee/features/onboarding/presentation/cubit/onboarding_cubit.dart';
import 'package:matinee/features/onboarding/presentation/cubit/onboarding_state.dart';
import 'package:matinee/features/onboarding/presentation/onboarding_screen.dart';
import 'package:mocktail/mocktail.dart';

import '../../../helpers/helpers.dart';

class _MockOnboardingCubit extends MockCubit<OnboardingState> implements OnboardingCubit {}

void main() {
  const slide = OnboardingSlide(
    imageAsset: 'assets/images/onboarding-1.jpg',
    eyebrow: 'DISCOVER',
    heading: 'Watch Trailers Instantly',
    body: 'Swipe through upcoming movies.',
    statValue: '10M+',
    statCaption: 'trailers watched monthly',
    highlights: [OnboardingHighlight(emoji: '🎬', label: '500+ Trailers')],
  );

  group(OnboardingView, () {
    testWidgets('meets the tap target and labelling guidelines', (tester) async {
      usePhoneSurface(tester);
      final cubit = _MockOnboardingCubit();
      when(() => cubit.state).thenReturn(
        const OnboardingState.success(OnboardingData(slides: [slide], index: 0)),
      );

      await tester.pumpApp(
        BlocProvider<OnboardingCubit>.value(value: cubit, child: const OnboardingView()),
      );

      await expectMeetsGuidelines(tester);
    });

    testWidgets('says which slide of how many', (tester) async {
      usePhoneSurface(tester);
      final handle = tester.ensureSemantics();
      final cubit = _MockOnboardingCubit();
      when(() => cubit.state).thenReturn(
        const OnboardingState.success(
          OnboardingData(slides: [slide, slide, slide], index: 1),
        ),
      );

      await tester.pumpApp(
        BlocProvider<OnboardingCubit>.value(value: cubit, child: const OnboardingView()),
      );

      // The carousel shows its position only by what is on screen.
      expect(find.bySemanticsLabel('Slide 2 of 3'), findsOne);
      handle.dispose();
    });

    testWidgets("leaves the tiles' stand-in emoji unread", (tester) async {
      usePhoneSurface(tester);
      final handle = tester.ensureSemantics();
      final cubit = _MockOnboardingCubit();
      when(() => cubit.state).thenReturn(
        const OnboardingState.success(OnboardingData(slides: [slide], index: 0)),
      );

      await tester.pumpApp(
        BlocProvider<OnboardingCubit>.value(value: cubit, child: const OnboardingView()),
      );

      // The emoji is drawn at icon size where a glyph would go, so announcing
      // its name reads out the decoration.
      expect(find.bySemanticsLabel('500+ Trailers'), findsOne);
      expect(find.bySemanticsLabel('🎬\n500+ Trailers'), findsNothing);
      handle.dispose();
    });

    testWidgets('reaches back and skip before the slide copy', (tester) async {
      usePhoneSurface(tester);
      final handle = tester.ensureSemantics();
      final cubit = _MockOnboardingCubit();
      when(() => cubit.state).thenReturn(
        const OnboardingState.success(OnboardingData(slides: [slide, slide], index: 1)),
      );

      await tester.pumpApp(
        BlocProvider<OnboardingCubit>.value(value: cubit, child: const OnboardingView()),
      );

      // The bar is painted over the slide, so in tree order it comes last and
      // a screen reader would read the whole slide before finding the way out.
      final skip = tester.getSemantics(find.bySemanticsLabel('Skip'));
      final position = tester.getSemantics(find.bySemanticsLabel('Slide 2 of 2'));
      expect(skip.sortKey, isNotNull);
      expect(position.sortKey, isNotNull);
      expect(
        (skip.sortKey! as OrdinalSortKey).order,
        lessThan((position.sortKey! as OrdinalSortKey).order),
      );
      handle.dispose();
    });
  });
}
