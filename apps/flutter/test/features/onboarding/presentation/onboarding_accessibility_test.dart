import 'package:bloc_test/bloc_test.dart';
import 'package:flutter/material.dart';
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
  group(OnboardingView, () {
    testWidgets('meets the tap target and labelling guidelines', (tester) async {
      tester.view.physicalSize = const Size(1170, 2532);
      tester.view.devicePixelRatio = 3;
      addTearDown(tester.view.reset);

      const slide = OnboardingSlide(
        imageAsset: 'assets/images/onboarding-1.jpg',
        eyebrow: 'DISCOVER',
        heading: 'Watch Trailers Instantly',
        body: 'Swipe through upcoming movies.',
        statValue: '10M+',
        statCaption: 'trailers watched monthly',
        highlights: [OnboardingHighlight(emoji: '🎬', label: '500+ Trailers')],
      );
      final cubit = _MockOnboardingCubit();
      when(() => cubit.state).thenReturn(
        const OnboardingState.success(OnboardingData(slides: [slide], index: 0)),
      );

      await tester.pumpApp(
        BlocProvider<OnboardingCubit>.value(value: cubit, child: const OnboardingView()),
      );

      await expectLater(tester, meetsGuideline(androidTapTargetGuideline));
      await expectLater(tester, meetsGuideline(iOSTapTargetGuideline));
      await expectLater(tester, meetsGuideline(labeledTapTargetGuideline));
    });
  });
}
