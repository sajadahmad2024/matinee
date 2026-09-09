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
  String get navHome => 'Home';

  @override
  String get navP2p => 'P2P';

  @override
  String get navRewards => 'Rewards';

  @override
  String get navProfile => 'Profile';

  @override
  String tabPlaceholder(String tab) {
    return '$tab is not built yet.';
  }

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

  @override
  String get authSignInHeader => 'Sign In';

  @override
  String get authSignInTitle => 'What\'s your phone number?';

  @override
  String get authSignInSubtitle => 'We\'ll send you a one-time verification code to confirm your identity.';

  @override
  String get authPhoneLabel => 'Phone Number';

  @override
  String get authPhoneHint => 'Enter phone number';

  @override
  String get authDialCodeLabel => 'Country dialling code';

  @override
  String get authDialCodeSheetTitle => 'Select country';

  @override
  String get authCountryIN => 'India';

  @override
  String get authCountryUS => 'United States';

  @override
  String get authCountryGB => 'United Kingdom';

  @override
  String get authCountryAU => 'Australia';

  @override
  String get authCountrySG => 'Singapore';

  @override
  String get authCountryAE => 'United Arab Emirates';

  @override
  String get authContinue => 'Continue';

  @override
  String get authGetOtp => 'Get OTP';

  @override
  String get authDividerLabel => 'or continue with';

  @override
  String get authContinueWithGoogle => 'Continue with Google';

  @override
  String get authContinueWithApple => 'Continue with Apple';

  @override
  String authLegal(String terms, String privacy) {
    return 'By continuing, you agree to our $terms and $privacy';
  }

  @override
  String get authLegalTerms => 'Terms of Service';

  @override
  String get authLegalPrivacy => 'Privacy Policy';

  @override
  String get authBack => 'Back';

  @override
  String get authPhoneRequired => 'Enter your phone number.';

  @override
  String authPhoneInvalid(int length) {
    return 'Enter the $length digits of your number, without the dialling code.';
  }

  @override
  String get authVerifyHeader => 'Verify OTP';

  @override
  String get authVerifyTitle => 'Enter Verification Code';

  @override
  String authVerifySubtitle(int length, String phoneNumber) {
    return 'We\'ve sent a $length-digit OTP to $phoneNumber';
  }

  @override
  String authOtpIncomplete(int length) {
    return 'Enter all $length digits of the code.';
  }

  @override
  String get authOtpResend => 'Resend Code';

  @override
  String authOtpResendIn(String countdown) {
    return 'Resend Code in $countdown';
  }

  @override
  String get authOtpResent => 'We sent a new code.';

  @override
  String get authCreateAccountHeader => 'Create Account';

  @override
  String get authCreateAccountTitle => 'Tell us a little bit about yourself';

  @override
  String get authCreateAccountSubtitle => 'Your username is how other members will see you.';

  @override
  String get authNameLabel => 'NAME';

  @override
  String get authNameHint => '@yourusername';

  @override
  String get authNameRequired => 'Enter your name.';

  @override
  String authNameTooShort(int length) {
    return 'Use at least $length characters.';
  }

  @override
  String authNameTooLong(int length) {
    return 'Use no more than $length characters.';
  }

  @override
  String get authReferralLabel => 'Referral Code';

  @override
  String get authFieldOptional => '(optional)';

  @override
  String get authReferralHint => 'Enter referral code';

  @override
  String get authReferralCodeInvalid => 'Referral codes are 4 to 12 letters and numbers.';

  @override
  String get authCreateAccount => 'Create Account';

  @override
  String get subscribeEyebrow => 'PREMIUM ACCESS';

  @override
  String get subscribeSkip => 'Skip for now';

  @override
  String get subscribeTitle => 'Level Up Your Cinema Experience';

  @override
  String get subscribeUnlockChip => 'UNLOCK';

  @override
  String get subscribeFeature1Title => 'Daily Streaks';

  @override
  String get subscribeFeature1Subtitle => 'Earn points by engaging daily';

  @override
  String get subscribeFeature2Title => 'Weekly Quests';

  @override
  String get subscribeFeature2Subtitle => 'Complete missions for big rewards';

  @override
  String get subscribeFeature3Title => 'Predictive Games';

  @override
  String get subscribeFeature3Subtitle => 'Test your cinematic intuition';

  @override
  String get subscribeWhyTitle => 'WHY SUBSCRIBE?';

  @override
  String get subscribeBenefit1 => 'Access to exclusive movie premieres and events';

  @override
  String get subscribeBenefit2 => 'Multiplier boosts on all earned Points';

  @override
  String get subscribeBenefit3 => 'Priority access to Live Auctions';

  @override
  String get subscribeBenefit4 => 'Monthly badge unlocks and collectibles';

  @override
  String get subscribeBenefit5 => 'Ad-free premium content experience';

  @override
  String get subscribeCta => 'Subscribe Now';
}
