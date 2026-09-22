import 'package:matinee/core/assets/assets.dart';
import 'package:matinee/core/storage/preferences_service.dart';

///
/// Remembers whether the intro has been seen. The slide copy is localised, so
/// only the completion flag and the per-slide assets live here.
///
class OnboardingRepository {
  const OnboardingRepository(this._preferences);

  ///
  /// TEMPORARY, FOR DEMOS. While true the intro opens every launch and the
  /// stored flag is ignored. Set it false, then delete it and its branches.
  ///
  static const bool alwaysShowIntro = true;

  static const String _completedKey = 'onboarding_completed';

  final PreferencesService _preferences;

  Future<bool> hasCompleted() async {
    if (alwaysShowIntro) {
      return false;
    }
    return await _preferences.getBool(_completedKey) ?? false;
  }

  Future<void> markCompleted() async {
    if (alwaysShowIntro) {
      return;
    }
    await _preferences.setBool(_completedKey, value: true);
  }
}

///
/// The per-slide values localisation does not touch, kept together so a slide
/// cannot be given an image without its emoji.
///
typedef OnboardingSlideAssets = ({String image, List<String> emoji});

/// The three slides' assets in the order the design shows them.
abstract final class OnboardingSlideContent {
  static const List<OnboardingSlideAssets> slides = [
    (image: AppImageAssets.onboardingSlide1, emoji: ['🎬', '🌍', '✨']),
    (image: AppImageAssets.onboardingSlide2, emoji: ['🧠', '🔮', '🔥']),
    (image: AppImageAssets.onboardingSlide3, emoji: ['🎟️', '🤝', '💎']),
  ];
}
