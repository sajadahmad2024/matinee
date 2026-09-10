import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_en.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'gen/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale) : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations)!;
  }

  static const LocalizationsDelegate<AppLocalizations> delegate = _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates = <LocalizationsDelegate<dynamic>>[
    delegate,
    GlobalMaterialLocalizations.delegate,
    GlobalCupertinoLocalizations.delegate,
    GlobalWidgetsLocalizations.delegate,
  ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[Locale('en')];

  /// No description provided for @appTitle.
  ///
  /// In en, this message translates to:
  /// **'Matinee'**
  String get appTitle;

  /// No description provided for @profileTitle.
  ///
  /// In en, this message translates to:
  /// **'Profile'**
  String get profileTitle;

  /// No description provided for @profileEditAction.
  ///
  /// In en, this message translates to:
  /// **'Edit profile'**
  String get profileEditAction;

  /// No description provided for @profileStatPoints.
  ///
  /// In en, this message translates to:
  /// **'Total Points'**
  String get profileStatPoints;

  /// No description provided for @profileStatStreaks.
  ///
  /// In en, this message translates to:
  /// **'Streaks'**
  String get profileStatStreaks;

  /// No description provided for @profileStatRank.
  ///
  /// In en, this message translates to:
  /// **'Rank'**
  String get profileStatRank;

  /// No description provided for @profileUpgradeTitle.
  ///
  /// In en, this message translates to:
  /// **'Upgrade Subscription'**
  String get profileUpgradeTitle;

  /// Line under the upgrade row naming the current plan and when it lapses.
  ///
  /// In en, this message translates to:
  /// **'{plan} expires {date}'**
  String profileUpgradeSubtitle(String plan, String date);

  /// No description provided for @profileUpgradeCta.
  ///
  /// In en, this message translates to:
  /// **'Upgrade'**
  String get profileUpgradeCta;

  /// No description provided for @profileMenuEarns.
  ///
  /// In en, this message translates to:
  /// **'My Earns'**
  String get profileMenuEarns;

  /// No description provided for @profileMenuRefer.
  ///
  /// In en, this message translates to:
  /// **'Refer a Friend'**
  String get profileMenuRefer;

  /// No description provided for @profileMenuNotifications.
  ///
  /// In en, this message translates to:
  /// **'Notifications'**
  String get profileMenuNotifications;

  /// No description provided for @profileMenuTerms.
  ///
  /// In en, this message translates to:
  /// **'Terms & Conditions'**
  String get profileMenuTerms;

  /// No description provided for @profileMenuPrivacy.
  ///
  /// In en, this message translates to:
  /// **'Privacy Policy'**
  String get profileMenuPrivacy;

  /// No description provided for @profileMenuLogout.
  ///
  /// In en, this message translates to:
  /// **'Logout'**
  String get profileMenuLogout;

  /// No description provided for @editProfileTitle.
  ///
  /// In en, this message translates to:
  /// **'Edit Profile'**
  String get editProfileTitle;

  /// No description provided for @editProfileAboutYou.
  ///
  /// In en, this message translates to:
  /// **'About You'**
  String get editProfileAboutYou;

  /// No description provided for @editProfileNameLabel.
  ///
  /// In en, this message translates to:
  /// **'Full Name'**
  String get editProfileNameLabel;

  /// No description provided for @editProfileEmailLabel.
  ///
  /// In en, this message translates to:
  /// **'Email ID'**
  String get editProfileEmailLabel;

  /// No description provided for @editProfilePhoneLabel.
  ///
  /// In en, this message translates to:
  /// **'Phone No.'**
  String get editProfilePhoneLabel;

  /// No description provided for @editProfileSave.
  ///
  /// In en, this message translates to:
  /// **'Save Changes'**
  String get editProfileSave;

  /// No description provided for @editProfileSaved.
  ///
  /// In en, this message translates to:
  /// **'Profile updated.'**
  String get editProfileSaved;

  /// No description provided for @editProfileNameError.
  ///
  /// In en, this message translates to:
  /// **'Enter your name.'**
  String get editProfileNameError;

  /// No description provided for @editProfileEmailError.
  ///
  /// In en, this message translates to:
  /// **'Enter a valid email address.'**
  String get editProfileEmailError;

  /// No description provided for @editProfilePhoneError.
  ///
  /// In en, this message translates to:
  /// **'Enter a valid phone number.'**
  String get editProfilePhoneError;

  /// No description provided for @referTitle.
  ///
  /// In en, this message translates to:
  /// **'Refer a Friend'**
  String get referTitle;

  /// No description provided for @referClose.
  ///
  /// In en, this message translates to:
  /// **'Close'**
  String get referClose;

  /// No description provided for @referCodeLabel.
  ///
  /// In en, this message translates to:
  /// **'Your Referral Code'**
  String get referCodeLabel;

  /// No description provided for @referCopyCode.
  ///
  /// In en, this message translates to:
  /// **'Copy Code'**
  String get referCopyCode;

  /// No description provided for @referCopied.
  ///
  /// In en, this message translates to:
  /// **'Referral code copied.'**
  String get referCopied;

  /// No description provided for @referShareWhatsapp.
  ///
  /// In en, this message translates to:
  /// **'WhatsApp'**
  String get referShareWhatsapp;

  /// No description provided for @referShareTelegram.
  ///
  /// In en, this message translates to:
  /// **'Telegram'**
  String get referShareTelegram;

  /// No description provided for @referShareInstagram.
  ///
  /// In en, this message translates to:
  /// **'Instagram'**
  String get referShareInstagram;

  /// No description provided for @referShareCopy.
  ///
  /// In en, this message translates to:
  /// **'Copy'**
  String get referShareCopy;

  /// No description provided for @referCta.
  ///
  /// In en, this message translates to:
  /// **'Refer a friend'**
  String get referCta;

  /// No description provided for @navHome.
  ///
  /// In en, this message translates to:
  /// **'Home'**
  String get navHome;

  /// No description provided for @navP2p.
  ///
  /// In en, this message translates to:
  /// **'P2P'**
  String get navP2p;

  /// No description provided for @navRewards.
  ///
  /// In en, this message translates to:
  /// **'Rewards'**
  String get navRewards;

  /// No description provided for @navProfile.
  ///
  /// In en, this message translates to:
  /// **'Profile'**
  String get navProfile;

  /// Body of the stand-in screen behind a bottom-nav tab whose feature does not exist yet.
  ///
  /// In en, this message translates to:
  /// **'{tab} is not built yet.'**
  String tabPlaceholder(String tab);

  /// No description provided for @retry.
  ///
  /// In en, this message translates to:
  /// **'Retry'**
  String get retry;

  /// No description provided for @goHome.
  ///
  /// In en, this message translates to:
  /// **'Go to home'**
  String get goHome;

  /// No description provided for @startupFailed.
  ///
  /// In en, this message translates to:
  /// **'The app could not start. Check your connection and try again.'**
  String get startupFailed;

  /// No description provided for @pageNotFound.
  ///
  /// In en, this message translates to:
  /// **'There is nothing at {path}.'**
  String pageNotFound(String path);

  /// No description provided for @onboardingSkip.
  ///
  /// In en, this message translates to:
  /// **'Skip'**
  String get onboardingSkip;

  /// No description provided for @onboardingContinue.
  ///
  /// In en, this message translates to:
  /// **'Continue'**
  String get onboardingContinue;

  /// No description provided for @onboardingBack.
  ///
  /// In en, this message translates to:
  /// **'Back'**
  String get onboardingBack;

  /// No description provided for @onboardingSlide1Eyebrow.
  ///
  /// In en, this message translates to:
  /// **'DISCOVER'**
  String get onboardingSlide1Eyebrow;

  /// No description provided for @onboardingSlide1Heading.
  ///
  /// In en, this message translates to:
  /// **'Watch Trailers Instantly'**
  String get onboardingSlide1Heading;

  /// No description provided for @onboardingSlide1Body.
  ///
  /// In en, this message translates to:
  /// **'Swipe through upcoming movies from around the world, curated daily just for you.'**
  String get onboardingSlide1Body;

  /// No description provided for @onboardingSlide1StatValue.
  ///
  /// In en, this message translates to:
  /// **'10M+'**
  String get onboardingSlide1StatValue;

  /// No description provided for @onboardingSlide1StatCaption.
  ///
  /// In en, this message translates to:
  /// **'trailers watched monthly'**
  String get onboardingSlide1StatCaption;

  /// No description provided for @onboardingSlide1Highlight1.
  ///
  /// In en, this message translates to:
  /// **'500+ Trailers'**
  String get onboardingSlide1Highlight1;

  /// No description provided for @onboardingSlide1Highlight2.
  ///
  /// In en, this message translates to:
  /// **'Global content'**
  String get onboardingSlide1Highlight2;

  /// No description provided for @onboardingSlide1Highlight3.
  ///
  /// In en, this message translates to:
  /// **'Daily Picks'**
  String get onboardingSlide1Highlight3;

  /// No description provided for @onboardingSlide2Eyebrow.
  ///
  /// In en, this message translates to:
  /// **'PLAY'**
  String get onboardingSlide2Eyebrow;

  /// No description provided for @onboardingSlide2Heading.
  ///
  /// In en, this message translates to:
  /// **'Play Interactive Games'**
  String get onboardingSlide2Heading;

  /// No description provided for @onboardingSlide2Body.
  ///
  /// In en, this message translates to:
  /// **'Challenge yourself with trailer-based quizzes and earn CinePoints every day.'**
  String get onboardingSlide2Body;

  /// No description provided for @onboardingSlide2StatValue.
  ///
  /// In en, this message translates to:
  /// **'500 CP'**
  String get onboardingSlide2StatValue;

  /// No description provided for @onboardingSlide2StatCaption.
  ///
  /// In en, this message translates to:
  /// **'earnable per day'**
  String get onboardingSlide2StatCaption;

  /// No description provided for @onboardingSlide2Highlight1.
  ///
  /// In en, this message translates to:
  /// **'Exclusive Videos'**
  String get onboardingSlide2Highlight1;

  /// No description provided for @onboardingSlide2Highlight2.
  ///
  /// In en, this message translates to:
  /// **'Predictions'**
  String get onboardingSlide2Highlight2;

  /// No description provided for @onboardingSlide2Highlight3.
  ///
  /// In en, this message translates to:
  /// **'Daily Streaks'**
  String get onboardingSlide2Highlight3;

  /// No description provided for @onboardingSlide3Eyebrow.
  ///
  /// In en, this message translates to:
  /// **'EARN'**
  String get onboardingSlide3Eyebrow;

  /// No description provided for @onboardingSlide3Heading.
  ///
  /// In en, this message translates to:
  /// **'Win Real points Rewards'**
  String get onboardingSlide3Heading;

  /// No description provided for @onboardingSlide3Body.
  ///
  /// In en, this message translates to:
  /// **'Redeem points for premieres, exclusive content, and once-in-a-lifetime experiences.'**
  String get onboardingSlide3Body;

  /// No description provided for @onboardingSlide3StatValue.
  ///
  /// In en, this message translates to:
  /// **'₹50K+'**
  String get onboardingSlide3StatValue;

  /// No description provided for @onboardingSlide3StatCaption.
  ///
  /// In en, this message translates to:
  /// **'in prizes monthly'**
  String get onboardingSlide3StatCaption;

  /// No description provided for @onboardingSlide3Highlight1.
  ///
  /// In en, this message translates to:
  /// **'Premieres'**
  String get onboardingSlide3Highlight1;

  /// No description provided for @onboardingSlide3Highlight2.
  ///
  /// In en, this message translates to:
  /// **'Meet Stars'**
  String get onboardingSlide3Highlight2;

  /// No description provided for @onboardingSlide3Highlight3.
  ///
  /// In en, this message translates to:
  /// **'Interviews'**
  String get onboardingSlide3Highlight3;

  /// No description provided for @errorNetwork.
  ///
  /// In en, this message translates to:
  /// **'You appear to be offline. Check your connection and try again.'**
  String get errorNetwork;

  /// No description provided for @errorCancelled.
  ///
  /// In en, this message translates to:
  /// **'The request was cancelled.'**
  String get errorCancelled;

  /// No description provided for @errorAuth.
  ///
  /// In en, this message translates to:
  /// **'You need to sign in again.'**
  String get errorAuth;

  /// No description provided for @errorNotFound.
  ///
  /// In en, this message translates to:
  /// **'We could not find what you were looking for.'**
  String get errorNotFound;

  /// No description provided for @errorValidation.
  ///
  /// In en, this message translates to:
  /// **'Some of the information provided was not accepted.'**
  String get errorValidation;

  /// No description provided for @errorServer.
  ///
  /// In en, this message translates to:
  /// **'Something went wrong on our side. Please try again later.'**
  String get errorServer;

  /// No description provided for @authSignInHeader.
  ///
  /// In en, this message translates to:
  /// **'Sign In'**
  String get authSignInHeader;

  /// No description provided for @authSignInTitle.
  ///
  /// In en, this message translates to:
  /// **'What\'\'s your phone number?'**
  String get authSignInTitle;

  /// No description provided for @authSignInSubtitle.
  ///
  /// In en, this message translates to:
  /// **'We\'\'ll send you a one-time verification code to confirm your identity.'**
  String get authSignInSubtitle;

  /// No description provided for @authPhoneLabel.
  ///
  /// In en, this message translates to:
  /// **'Phone Number'**
  String get authPhoneLabel;

  /// No description provided for @authPhoneHint.
  ///
  /// In en, this message translates to:
  /// **'Enter phone number'**
  String get authPhoneHint;

  /// No description provided for @authDialCodeLabel.
  ///
  /// In en, this message translates to:
  /// **'Country dialling code'**
  String get authDialCodeLabel;

  /// No description provided for @authDialCodeSheetTitle.
  ///
  /// In en, this message translates to:
  /// **'Select country'**
  String get authDialCodeSheetTitle;

  /// No description provided for @authCountryIN.
  ///
  /// In en, this message translates to:
  /// **'India'**
  String get authCountryIN;

  /// No description provided for @authCountryUS.
  ///
  /// In en, this message translates to:
  /// **'United States'**
  String get authCountryUS;

  /// No description provided for @authCountryGB.
  ///
  /// In en, this message translates to:
  /// **'United Kingdom'**
  String get authCountryGB;

  /// No description provided for @authCountryAU.
  ///
  /// In en, this message translates to:
  /// **'Australia'**
  String get authCountryAU;

  /// No description provided for @authCountrySG.
  ///
  /// In en, this message translates to:
  /// **'Singapore'**
  String get authCountrySG;

  /// No description provided for @authCountryAE.
  ///
  /// In en, this message translates to:
  /// **'United Arab Emirates'**
  String get authCountryAE;

  /// No description provided for @authContinue.
  ///
  /// In en, this message translates to:
  /// **'Continue'**
  String get authContinue;

  /// No description provided for @authGetOtp.
  ///
  /// In en, this message translates to:
  /// **'Get OTP'**
  String get authGetOtp;

  /// No description provided for @authDividerLabel.
  ///
  /// In en, this message translates to:
  /// **'or continue with'**
  String get authDividerLabel;

  /// No description provided for @authContinueWithGoogle.
  ///
  /// In en, this message translates to:
  /// **'Continue with Google'**
  String get authContinueWithGoogle;

  /// No description provided for @authContinueWithApple.
  ///
  /// In en, this message translates to:
  /// **'Continue with Apple'**
  String get authContinueWithApple;

  /// Legal line under the auth forms. The markers are replaced by gold document names.
  ///
  /// In en, this message translates to:
  /// **'By continuing, you agree to our {terms} and {privacy}'**
  String authLegal(String terms, String privacy);

  /// No description provided for @authLegalTerms.
  ///
  /// In en, this message translates to:
  /// **'Terms of Service'**
  String get authLegalTerms;

  /// No description provided for @authLegalPrivacy.
  ///
  /// In en, this message translates to:
  /// **'Privacy Policy'**
  String get authLegalPrivacy;

  /// No description provided for @authBack.
  ///
  /// In en, this message translates to:
  /// **'Back'**
  String get authBack;

  /// No description provided for @authPhoneRequired.
  ///
  /// In en, this message translates to:
  /// **'Enter your phone number.'**
  String get authPhoneRequired;

  /// No description provided for @authPhoneInvalid.
  ///
  /// In en, this message translates to:
  /// **'Enter the {length} digits of your number, without the dialling code.'**
  String authPhoneInvalid(int length);

  /// No description provided for @authVerifyHeader.
  ///
  /// In en, this message translates to:
  /// **'Verify OTP'**
  String get authVerifyHeader;

  /// No description provided for @authVerifyTitle.
  ///
  /// In en, this message translates to:
  /// **'Enter Verification Code'**
  String get authVerifyTitle;

  /// No description provided for @authVerifySubtitle.
  ///
  /// In en, this message translates to:
  /// **'We\'\'ve sent a {length}-digit OTP to {phoneNumber}'**
  String authVerifySubtitle(int length, String phoneNumber);

  /// No description provided for @authOtpIncomplete.
  ///
  /// In en, this message translates to:
  /// **'Enter all {length} digits of the code.'**
  String authOtpIncomplete(int length);

  /// No description provided for @authOtpResend.
  ///
  /// In en, this message translates to:
  /// **'Resend Code'**
  String get authOtpResend;

  /// The resend countdown. countdown arrives already formatted, as 0:59s.
  ///
  /// In en, this message translates to:
  /// **'Resend Code in {countdown}'**
  String authOtpResendIn(String countdown);

  /// No description provided for @authOtpResent.
  ///
  /// In en, this message translates to:
  /// **'We sent a new code.'**
  String get authOtpResent;

  /// No description provided for @authCreateAccountHeader.
  ///
  /// In en, this message translates to:
  /// **'Create Account'**
  String get authCreateAccountHeader;

  /// No description provided for @authCreateAccountTitle.
  ///
  /// In en, this message translates to:
  /// **'Tell us a little bit about yourself'**
  String get authCreateAccountTitle;

  /// No description provided for @authCreateAccountSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Your username is how other members will see you.'**
  String get authCreateAccountSubtitle;

  /// No description provided for @authNameLabel.
  ///
  /// In en, this message translates to:
  /// **'NAME'**
  String get authNameLabel;

  /// No description provided for @authNameHint.
  ///
  /// In en, this message translates to:
  /// **'@yourusername'**
  String get authNameHint;

  /// No description provided for @authNameRequired.
  ///
  /// In en, this message translates to:
  /// **'Enter your name.'**
  String get authNameRequired;

  /// No description provided for @authNameTooShort.
  ///
  /// In en, this message translates to:
  /// **'Use at least {length} characters.'**
  String authNameTooShort(int length);

  /// No description provided for @authNameTooLong.
  ///
  /// In en, this message translates to:
  /// **'Use no more than {length} characters.'**
  String authNameTooLong(int length);

  /// No description provided for @authReferralLabel.
  ///
  /// In en, this message translates to:
  /// **'Referral Code'**
  String get authReferralLabel;

  /// No description provided for @authFieldOptional.
  ///
  /// In en, this message translates to:
  /// **'(optional)'**
  String get authFieldOptional;

  /// No description provided for @authReferralHint.
  ///
  /// In en, this message translates to:
  /// **'Enter referral code'**
  String get authReferralHint;

  /// No description provided for @authReferralCodeInvalid.
  ///
  /// In en, this message translates to:
  /// **'Referral codes are 4 to 12 letters and numbers.'**
  String get authReferralCodeInvalid;

  /// No description provided for @authCreateAccount.
  ///
  /// In en, this message translates to:
  /// **'Create Account'**
  String get authCreateAccount;

  /// No description provided for @subscribeEyebrow.
  ///
  /// In en, this message translates to:
  /// **'PREMIUM ACCESS'**
  String get subscribeEyebrow;

  /// No description provided for @subscribeSkip.
  ///
  /// In en, this message translates to:
  /// **'Skip for now'**
  String get subscribeSkip;

  /// No description provided for @subscribeTitle.
  ///
  /// In en, this message translates to:
  /// **'Level Up Your Cinema Experience'**
  String get subscribeTitle;

  /// No description provided for @subscribeUnlockChip.
  ///
  /// In en, this message translates to:
  /// **'UNLOCK'**
  String get subscribeUnlockChip;

  /// No description provided for @subscribeFeature1Title.
  ///
  /// In en, this message translates to:
  /// **'Daily Streaks'**
  String get subscribeFeature1Title;

  /// No description provided for @subscribeFeature1Subtitle.
  ///
  /// In en, this message translates to:
  /// **'Earn points by engaging daily'**
  String get subscribeFeature1Subtitle;

  /// No description provided for @subscribeFeature2Title.
  ///
  /// In en, this message translates to:
  /// **'Weekly Quests'**
  String get subscribeFeature2Title;

  /// No description provided for @subscribeFeature2Subtitle.
  ///
  /// In en, this message translates to:
  /// **'Complete missions for big rewards'**
  String get subscribeFeature2Subtitle;

  /// No description provided for @subscribeFeature3Title.
  ///
  /// In en, this message translates to:
  /// **'Predictive Games'**
  String get subscribeFeature3Title;

  /// No description provided for @subscribeFeature3Subtitle.
  ///
  /// In en, this message translates to:
  /// **'Test your cinematic intuition'**
  String get subscribeFeature3Subtitle;

  /// No description provided for @subscribeWhyTitle.
  ///
  /// In en, this message translates to:
  /// **'WHY SUBSCRIBE?'**
  String get subscribeWhyTitle;

  /// No description provided for @subscribeBenefit1.
  ///
  /// In en, this message translates to:
  /// **'Access to exclusive movie premieres and events'**
  String get subscribeBenefit1;

  /// No description provided for @subscribeBenefit2.
  ///
  /// In en, this message translates to:
  /// **'Multiplier boosts on all earned Points'**
  String get subscribeBenefit2;

  /// No description provided for @subscribeBenefit3.
  ///
  /// In en, this message translates to:
  /// **'Priority access to Live Auctions'**
  String get subscribeBenefit3;

  /// No description provided for @subscribeBenefit4.
  ///
  /// In en, this message translates to:
  /// **'Monthly badge unlocks and collectibles'**
  String get subscribeBenefit4;

  /// No description provided for @subscribeBenefit5.
  ///
  /// In en, this message translates to:
  /// **'Ad-free premium content experience'**
  String get subscribeBenefit5;

  /// No description provided for @subscribeCta.
  ///
  /// In en, this message translates to:
  /// **'Subscribe Now'**
  String get subscribeCta;

  /// No description provided for @rewardsTotalPoints.
  ///
  /// In en, this message translates to:
  /// **'Total Points'**
  String get rewardsTotalPoints;

  /// No description provided for @rewardsPointsUnit.
  ///
  /// In en, this message translates to:
  /// **'pts'**
  String get rewardsPointsUnit;

  /// No description provided for @rewardsBadgeLabel.
  ///
  /// In en, this message translates to:
  /// **'Badge'**
  String get rewardsBadgeLabel;

  /// How far the user is from the next badge tier, under their current one.
  ///
  /// In en, this message translates to:
  /// **'{points} pts to {badge}'**
  String rewardsNextBadge(int points, String badge);

  /// No description provided for @rewardsRedeemSection.
  ///
  /// In en, this message translates to:
  /// **'REDEEM REWARDS'**
  String get rewardsRedeemSection;

  /// No description provided for @rewardsPointsPillTooltip.
  ///
  /// In en, this message translates to:
  /// **'Your points balance'**
  String get rewardsPointsPillTooltip;

  /// No description provided for @auctionEyebrow.
  ///
  /// In en, this message translates to:
  /// **'LIVE AUCTION'**
  String get auctionEyebrow;

  /// No description provided for @auctionLiveBadge.
  ///
  /// In en, this message translates to:
  /// **'LIVE'**
  String get auctionLiveBadge;

  /// How many people are watching the auction right now.
  ///
  /// In en, this message translates to:
  /// **'{count} watching'**
  String auctionWatching(int count);

  /// No description provided for @auctionViewMore.
  ///
  /// In en, this message translates to:
  /// **'View More'**
  String get auctionViewMore;

  /// No description provided for @auctionViewLess.
  ///
  /// In en, this message translates to:
  /// **'View Less'**
  String get auctionViewLess;

  /// No description provided for @auctionCurrentBid.
  ///
  /// In en, this message translates to:
  /// **'CURRENT BID'**
  String get auctionCurrentBid;

  /// No description provided for @auctionTimeRemaining.
  ///
  /// In en, this message translates to:
  /// **'TIME REMAINING'**
  String get auctionTimeRemaining;

  /// No description provided for @auctionEnded.
  ///
  /// In en, this message translates to:
  /// **'ENDED'**
  String get auctionEnded;

  /// No description provided for @auctionBidHistory.
  ///
  /// In en, this message translates to:
  /// **'BID HISTORY'**
  String get auctionBidHistory;

  /// A bid in cinema points, the auction's own currency.
  ///
  /// In en, this message translates to:
  /// **'{amount} CP'**
  String auctionBidAmount(int amount);

  /// No description provided for @auctionBidFieldLabel.
  ///
  /// In en, this message translates to:
  /// **'Your bid'**
  String get auctionBidFieldLabel;

  /// No description provided for @auctionBidAction.
  ///
  /// In en, this message translates to:
  /// **'BID'**
  String get auctionBidAction;

  /// A quick-add button that raises the bid by a fixed amount.
  ///
  /// In en, this message translates to:
  /// **'+{amount}'**
  String auctionBidIncrement(String amount);

  /// Shown when the typed bid is under the smallest raise the lot accepts.
  ///
  /// In en, this message translates to:
  /// **'Bids start at {amount} CP.'**
  String auctionBidTooLow(int amount);

  /// No description provided for @auctionBidPlaced.
  ///
  /// In en, this message translates to:
  /// **'Your bid is in.'**
  String get auctionBidPlaced;

  /// No description provided for @auctionBidJustNow.
  ///
  /// In en, this message translates to:
  /// **'Just now'**
  String get auctionBidJustNow;

  /// How long ago a bid was placed, for bids under an hour old.
  ///
  /// In en, this message translates to:
  /// **'{count, plural, =1{1 minute ago} other{{count} minutes ago}}'**
  String auctionBidMinutesAgo(int count);

  /// How long ago a bid was placed, for bids under a day old.
  ///
  /// In en, this message translates to:
  /// **'{count, plural, =1{1 hour ago} other{{count} hours ago}}'**
  String auctionBidHoursAgo(int count);

  /// No description provided for @auctionBack.
  ///
  /// In en, this message translates to:
  /// **'Back to rewards'**
  String get auctionBack;

  /// No description provided for @topUpTooltip.
  ///
  /// In en, this message translates to:
  /// **'Top up points'**
  String get topUpTooltip;

  /// No description provided for @topUpTitle.
  ///
  /// In en, this message translates to:
  /// **'Top Up Points'**
  String get topUpTitle;

  /// No description provided for @topUpSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Select a pack to stake on predictions.'**
  String get topUpSubtitle;

  /// No description provided for @topUpPointsLabel.
  ///
  /// In en, this message translates to:
  /// **'POINTS'**
  String get topUpPointsLabel;

  /// Buys the selected pack; the price carries its own currency symbol.
  ///
  /// In en, this message translates to:
  /// **'Continue to Pay {price}'**
  String topUpCta(String price);

  /// No description provided for @topUpClose.
  ///
  /// In en, this message translates to:
  /// **'Close'**
  String get topUpClose;

  /// No description provided for @topUpSuccessTitle.
  ///
  /// In en, this message translates to:
  /// **'Payment Successful'**
  String get topUpSuccessTitle;

  /// Confirms how many points the purchase added.
  ///
  /// In en, this message translates to:
  /// **'+{points} PTS Credited'**
  String topUpCredited(int points);

  /// No description provided for @topUpDone.
  ///
  /// In en, this message translates to:
  /// **'Done'**
  String get topUpDone;

  /// No description provided for @exclusiveTitle.
  ///
  /// In en, this message translates to:
  /// **'Exclusive Content'**
  String get exclusiveTitle;

  /// No description provided for @exclusiveLocked.
  ///
  /// In en, this message translates to:
  /// **'Locked'**
  String get exclusiveLocked;

  /// No description provided for @exclusiveUnlocksFor.
  ///
  /// In en, this message translates to:
  /// **'Unlocks for'**
  String get exclusiveUnlocksFor;

  /// What unlocking a piece of exclusive content costs.
  ///
  /// In en, this message translates to:
  /// **'{points} POINTS'**
  String exclusivePointsCost(int points);

  /// No description provided for @exclusivePreview.
  ///
  /// In en, this message translates to:
  /// **'PREVIEW'**
  String get exclusivePreview;

  /// No description provided for @exclusiveCastAndCrew.
  ///
  /// In en, this message translates to:
  /// **'CAST & CREW'**
  String get exclusiveCastAndCrew;

  /// No description provided for @exclusiveUnlockCta.
  ///
  /// In en, this message translates to:
  /// **'Unlock Now'**
  String get exclusiveUnlockCta;

  /// No description provided for @exclusiveTag.
  ///
  /// In en, this message translates to:
  /// **'EXCLUSIVE CONTENT'**
  String get exclusiveTag;
}

class _AppLocalizationsDelegate extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) => <String>['en'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'en':
      return AppLocalizationsEn();
  }

  throw FlutterError(
    'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
    'an issue with the localizations generation tool. Please file an issue '
    'on GitHub with a reproducible sample app and the gen-l10n configuration '
    'that was used.',
  );
}
