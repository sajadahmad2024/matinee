// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get appTitle => 'Matinee';

  @override
  String get homePlaceholder => 'Replace this screen with the first feature.';

  @override
  String get retry => 'Retry';

  @override
  String get goHome => 'Go to home';

  @override
  String get startupFailed => 'The app could not start. Check your connection and try again.';

  @override
  String pageNotFound(String path) {
    return 'There is nothing at $path.';
  }

  @override
  String get onboardingSkip => 'Skip';

  @override
  String get onboardingContinue => 'Continue';

  @override
  String get onboardingBack => 'Back';

  @override
  String get onboardingSlide1Eyebrow => 'DISCOVER';

  @override
  String get onboardingSlide1Heading => 'Watch Trailers Instantly';

  @override
  String get onboardingSlide1Body => 'Swipe through upcoming movies from around the world, curated daily just for you.';

  @override
  String get onboardingSlide1StatValue => '10M+';

  @override
  String get onboardingSlide1StatCaption => 'trailers watched monthly';

  @override
  String get onboardingSlide1Highlight1 => '500+ Trailers';

  @override
  String get onboardingSlide1Highlight2 => 'Global content';

  @override
  String get onboardingSlide1Highlight3 => 'Daily Picks';

  @override
  String get onboardingSlide2Eyebrow => 'PLAY';

  @override
  String get onboardingSlide2Heading => 'Play Interactive Games';

  @override
  String get onboardingSlide2Body => 'Challenge yourself with trailer-based quizzes and earn CinePoints every day.';

  @override
  String get onboardingSlide2StatValue => '500 CP';

  @override
  String get onboardingSlide2StatCaption => 'earnable per day';

  @override
  String get onboardingSlide2Highlight1 => 'Exclusive Videos';

  @override
  String get onboardingSlide2Highlight2 => 'Predictions';

  @override
  String get onboardingSlide2Highlight3 => 'Daily Streaks';

  @override
  String get onboardingSlide3Eyebrow => 'EARN';

  @override
  String get onboardingSlide3Heading => 'Win Real points Rewards';

  @override
  String get onboardingSlide3Body =>
      'Redeem points for premieres, exclusive content, and once-in-a-lifetime experiences.';

  @override
  String get onboardingSlide3StatValue => '₹50K+';

  @override
  String get onboardingSlide3StatCaption => 'in prizes monthly';

  @override
  String get onboardingSlide3Highlight1 => 'Premieres';

  @override
  String get onboardingSlide3Highlight2 => 'Meet Stars';

  @override
  String get onboardingSlide3Highlight3 => 'Interviews';

  @override
  String get errorNetwork => 'You appear to be offline. Check your connection and try again.';

  @override
  String get errorCancelled => 'The request was cancelled.';

  @override
  String get errorAuth => 'You need to sign in again.';

  @override
  String get errorNotFound => 'We could not find what you were looking for.';

  @override
  String get errorValidation => 'Some of the information provided was not accepted.';

  @override
  String get errorServer => 'Something went wrong on our side. Please try again later.';
}
