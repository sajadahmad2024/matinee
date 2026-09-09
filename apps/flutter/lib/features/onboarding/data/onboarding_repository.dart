import 'package:matinee/core/assets/assets.dart';
import 'package:matinee/core/storage/preferences_service.dart';

///
/// Remembers whether the intro has been seen. The slide copy is localised, so
/// it is not stored here; this repository owns the completion flag and the
/// per-slide assets, which localisation does not touch.
///
class OnboardingRepository {
  const OnboardingRepository(this._preferences);

  ///
  /// TEMPORARY, FOR DEMOS. While true the intro opens on every launch: the
  /// stored flag is ignored and never written. Set it to false to restore
  /// normal behaviour, then delete it and these two branches.
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
/// The per-slide values the design fixes and localisation does not: the
/// background image and the three tile emoji, kept together so a slide cannot
/// be given an image without its emoji.
///
typedef OnboardingSlideAssets = ({String image, List<String> emoji});

///
/// The three slides' assets in the order the design shows them.
///
abstract final class OnboardingSlideContent {
  static const List<OnboardingSlideAssets> slides = [
    (image: AppImageAssets.onboardingSlide1, emoji: ['🎬', '🌍', '✨']),
    (image: AppImageAssets.onboardingSlide2, emoji: ['🧠', '🔮', '🔥']),
    (image: AppImageAssets.onboardingSlide3, emoji: ['🎟️', '🤝', '💎']),
  ];
}
