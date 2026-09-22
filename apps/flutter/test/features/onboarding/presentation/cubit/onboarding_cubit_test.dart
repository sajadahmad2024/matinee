import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/features/onboarding/data/models/onboarding_slide.dart';
import 'package:matinee/features/onboarding/data/onboarding_repository.dart';
import 'package:matinee/features/onboarding/presentation/cubit/onboarding_cubit.dart';
import 'package:matinee/features/onboarding/presentation/cubit/onboarding_state.dart';
import 'package:mocktail/mocktail.dart';

class _MockOnboardingRepository extends Mock implements OnboardingRepository {}

OnboardingSlide slideAt(int index) {
  return OnboardingSlide(
    imageAsset: 'assets/images/onboarding-${index + 1}.jpg',
    eyebrow: 'EYEBROW',
    heading: 'Heading',
    body: 'Body',
    statValue: '10M+',
    statCaption: 'caption',
    highlights: const [OnboardingHighlight(emoji: '🎬', label: 'Label')],
  );
}

void main() {
  group(OnboardingCubit, () {
    late _MockOnboardingRepository repository;
    final slides = [slideAt(0), slideAt(1), slideAt(2)];

    setUp(() {
      repository = _MockOnboardingRepository();
    });

    OnboardingCubit build() => OnboardingCubit(repository);

    OnboardingState successAt(int index, {bool finished = false}) {
      return OnboardingState.success(
        OnboardingData(slides: slides, index: index, finished: finished),
      );
    }

    group('load', () {
      blocTest<OnboardingCubit, OnboardingState>(
        'emits [loading, success] on the first slide',
        build: build,
        act: (cubit) => cubit.load(slides),
        expect: () => [const OnboardingState.loading(), successAt(0)],
      );
    });

    group('next', () {
      blocTest<OnboardingCubit, OnboardingState>(
        'advances one slide when more remain',
        build: build,
        act: (cubit) async {
          await cubit.load(slides);
          await cubit.next();
        },
        skip: 2,
        expect: () => [successAt(1)],
      );

      blocTest<OnboardingCubit, OnboardingState>(
        'completes the intro on the last slide',
        setUp: () => when(repository.markCompleted).thenAnswer((_) async {}),
        build: build,
        act: (cubit) async {
          await cubit.load(slides);
          await cubit.selectSlide(2);
          await cubit.next();
        },
        skip: 3,
        expect: () => [successAt(2, finished: true)],
        verify: (_) => verify(repository.markCompleted).called(1),
      );

      blocTest<OnboardingCubit, OnboardingState>(
        'emits nothing before the slides are loaded',
        build: build,
        act: (cubit) => cubit.next(),
        expect: () => const <OnboardingState>[],
      );
    });

    group('previous', () {
      blocTest<OnboardingCubit, OnboardingState>(
        'steps back one slide',
        build: build,
        act: (cubit) async {
          await cubit.load(slides);
          await cubit.selectSlide(1);
          await cubit.previous();
        },
        skip: 3,
        expect: () => [successAt(0)],
      );

      blocTest<OnboardingCubit, OnboardingState>(
        'emits nothing on the first slide',
        build: build,
        act: (cubit) async {
          await cubit.load(slides);
          await cubit.previous();
        },
        skip: 2,
        expect: () => const <OnboardingState>[],
      );
    });

    group('selectSlide', () {
      blocTest<OnboardingCubit, OnboardingState>(
        'emits nothing when the index has not changed',
        build: build,
        act: (cubit) async {
          await cubit.load(slides);
          await cubit.selectSlide(0);
        },
        skip: 2,
        expect: () => const <OnboardingState>[],
      );
    });

    group('complete', () {
      blocTest<OnboardingCubit, OnboardingState>(
        'marks the intro seen and finishes',
        setUp: () => when(repository.markCompleted).thenAnswer((_) async {}),
        build: build,
        act: (cubit) async {
          await cubit.load(slides);
          await cubit.complete();
        },
        skip: 2,
        expect: () => [successAt(0, finished: true)],
      );
    });
  });
}
