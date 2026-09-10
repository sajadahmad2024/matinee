import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:matinee/features/onboarding/data/models/onboarding_slide.dart';

part 'onboarding_state.freezed.dart';

@freezed
sealed class OnboardingState with _$OnboardingState {
  const factory OnboardingState.initial() = OnboardingInitial;
  const factory OnboardingState.loading() = OnboardingLoading;
  const factory OnboardingState.success(OnboardingData data) = OnboardingSuccess;
}

// There is no failure variant: the slides ship with the app, and the only write
// is a best-effort flag whose PlatformException belongs on the global net.

///
/// The slides plus which one is showing. [finished] flips once the last slide
/// is confirmed or the intro skipped, and the screen listens for it to leave.
///
@freezed
abstract class OnboardingData with _$OnboardingData {
  const factory OnboardingData({
    required List<OnboardingSlide> slides,
    required int index,
    @Default(false) bool finished,
  }) = _OnboardingData;

  const OnboardingData._();

  bool get isLastSlide => index == slides.length - 1;
}
