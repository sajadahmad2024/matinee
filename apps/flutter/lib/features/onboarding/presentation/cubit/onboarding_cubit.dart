import 'package:matinee/core/bloc/safe_cubit.dart';
import 'package:matinee/features/onboarding/data/models/onboarding_slide.dart';
import 'package:matinee/features/onboarding/data/onboarding_repository.dart';
import 'package:matinee/features/onboarding/presentation/cubit/onboarding_state.dart';

class OnboardingCubit extends SafeCubit<OnboardingState> {
  OnboardingCubit(this._repository) : super(const OnboardingState.initial());

  final OnboardingRepository _repository;

  ///
  /// The slides are localised, so the screen resolves the copy and hands it in
  /// rather than the repository composing text it cannot translate.
  ///
  Future<void> load(List<OnboardingSlide> slides) async {
    emit(const OnboardingState.loading());
    emit(OnboardingState.success(OnboardingData(slides: slides, index: 0)));
  }

  /// Advances one slide, or completes the intro when the last one is confirmed.
  Future<void> next() async {
    final current = state;
    if (current is! OnboardingSuccess) {
      return;
    }
    if (current.data.isLastSlide) {
      await complete();
      return;
    }
    emit(OnboardingState.success(current.data.copyWith(index: current.data.index + 1)));
  }

  ///
  /// Steps back one slide. The first slide has nowhere to go, so the back
  /// control is hidden there rather than emitting an unchanged state.
  ///
  Future<void> previous() async {
    final current = state;
    if (current is! OnboardingSuccess || current.data.index == 0) {
      return;
    }
    emit(OnboardingState.success(current.data.copyWith(index: current.data.index - 1)));
  }

  ///
  /// Jumps to the slide the pager settled on, so a swipe and the CTA stay in
  /// step.
  ///
  Future<void> selectSlide(int index) async {
    final current = state;
    if (current is! OnboardingSuccess || current.data.index == index) {
      return;
    }
    emit(OnboardingState.success(current.data.copyWith(index: index)));
  }

  ///
  /// Marks the intro seen and flips [OnboardingData.finished] so the screen
  /// navigates away. Reached by Skip and by the last slide's CTA.
  ///
  /// The write is unguarded: a preferences PlatformException belongs on the
  /// global net, not in a failure state the user would have to retry out of.
  ///
  Future<void> complete() async {
    final current = state;
    if (current is! OnboardingSuccess) {
      return;
    }
    await _repository.markCompleted();
    emit(OnboardingState.success(current.data.copyWith(finished: true)));
  }
}
