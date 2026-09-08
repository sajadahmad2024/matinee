import 'package:freezed_annotation/freezed_annotation.dart';

part 'onboarding_slide.freezed.dart';

///
/// One intro slide. The design fixes the number of stat tiles at three and the
/// copy ships with the app, so the slides are built in the repository rather
/// than fetched.
///
@freezed
abstract class OnboardingSlide with _$OnboardingSlide {
  const factory OnboardingSlide({
    required String imageAsset,
    required String eyebrow,
    required String heading,
    required String body,
    required String statValue,
    required String statCaption,
    required List<OnboardingHighlight> highlights,
  }) = _OnboardingSlide;
}

///
/// One of the three tiles under the paragraph: an emoji and a short label.
///
@freezed
abstract class OnboardingHighlight with _$OnboardingHighlight {
  const factory OnboardingHighlight({
    required String emoji,
    required String label,
  }) = _OnboardingHighlight;
}
