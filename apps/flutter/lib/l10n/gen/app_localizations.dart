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

  /// Shown after the Instagram share target copies the referral code, because Instagram takes no shared text from a link.
  ///
  /// In en, this message translates to:
  /// **'Code copied — paste it into Instagram.'**
  String get referCopiedForInstagram;

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

  /// Shown when the typed bid is more than the balance the user holds.
  ///
  /// In en, this message translates to:
  /// **'You have {amount} CP to bid with.'**
  String auctionBidOverBalance(int amount);

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

  /// Announced while a screen is fetching its content.
  ///
  /// In en, this message translates to:
  /// **'Loading'**
  String get a11yLoading;

  /// Accessible name of the one-time code field, which the design draws as unlabelled boxes.
  ///
  /// In en, this message translates to:
  /// **'Verification code'**
  String get authOtpFieldLabel;

  /// Tells a screen reader how long the one-time code is.
  ///
  /// In en, this message translates to:
  /// **'Enter the {length}-digit code'**
  String authOtpFieldHint(int length);

  /// What a quick-add button does, which its bare numeral does not say.
  ///
  /// In en, this message translates to:
  /// **'Raise the bid by {amount}'**
  String auctionBidRaise(String amount);

  /// Marks the bid that currently holds the lot, which the design shows in gold alone.
  ///
  /// In en, this message translates to:
  /// **'Leading bid'**
  String get auctionLeadingBid;

  /// One bid in the history, read as a single row.
  ///
  /// In en, this message translates to:
  /// **'{bidder}, {placedAt}, {amount}'**
  String auctionBidSummary(String bidder, String placedAt, String amount);

  /// The countdown spelled out to the minute. The clock face reads poorly, and a value that changed every second would be re-announced every second to anyone resting on the card.
  ///
  /// In en, this message translates to:
  /// **'about {hours}h {minutes}m'**
  String auctionTimeRemainingValue(int hours, int minutes);

  /// The countdown under an hour, so it is not read as 'about 0h 6m'.
  ///
  /// In en, this message translates to:
  /// **'about {minutes}m'**
  String auctionTimeRemainingMinutes(int minutes);

  /// The countdown's last minute, which rounding to the minute would otherwise announce as zero.
  ///
  /// In en, this message translates to:
  /// **'less than a minute'**
  String get auctionTimeRemainingUnderMinute;

  /// The resend wait, rounded so the announcement does not change every second.
  ///
  /// In en, this message translates to:
  /// **'Resend available in about {seconds} seconds'**
  String authOtpResendInCoarse(int seconds);

  /// Stands in for the lot photograph until the data carries its own description.
  ///
  /// In en, this message translates to:
  /// **'Photograph of {title}'**
  String auctionLotImage(String title);

  /// Announced when the carousel moves.
  ///
  /// In en, this message translates to:
  /// **'Slide {position} of {total}'**
  String onboardingSlidePosition(int position, int total);

  /// Names the portrait where no name sits beside it.
  ///
  /// In en, this message translates to:
  /// **'Profile photo of {name}'**
  String profileAvatarLabel(String name);

  /// One top-up pack read as a single option.
  ///
  /// In en, this message translates to:
  /// **'{points} points for {price}'**
  String topUpPackOption(String points, String price);

  /// One profile counter read as a single figure with its unit.
  ///
  /// In en, this message translates to:
  /// **'{value} {label}'**
  String profileStatValue(String value, String label);

  /// The points balance read as one figure.
  ///
  /// In en, this message translates to:
  /// **'{label}: {value} {unit}'**
  String rewardsBalanceSummary(String label, String value, String unit);

  /// The badge standing read as one block.
  ///
  /// In en, this message translates to:
  /// **'{label}: {name}. {caption}'**
  String rewardsBadgeSummary(String label, String name, String caption);

  /// No description provided for @earnsTitle.
  ///
  /// In en, this message translates to:
  /// **'My Earns'**
  String get earnsTitle;

  /// No description provided for @earnsBack.
  ///
  /// In en, this message translates to:
  /// **'Back to profile'**
  String get earnsBack;

  /// No description provided for @earnsSegmentEarns.
  ///
  /// In en, this message translates to:
  /// **'Earns'**
  String get earnsSegmentEarns;

  /// No description provided for @earnsSegmentBadges.
  ///
  /// In en, this message translates to:
  /// **'Badges'**
  String get earnsSegmentBadges;

  /// The unit and the share of the balance an earn row accounts for, under its value.
  ///
  /// In en, this message translates to:
  /// **'{unit} · {share}'**
  String earnsShareCaption(String unit, double share);

  /// One earn row read as a single sentence, since its bar repeats the share.
  ///
  /// In en, this message translates to:
  /// **'{title}: {points} {unit}, {share} of your points. {activity}'**
  String earnsRowSummary(String title, String points, String unit, double share, String activity);

  /// No description provided for @earnsCurrentBadge.
  ///
  /// In en, this message translates to:
  /// **'CURRENT BADGE'**
  String get earnsCurrentBadge;

  /// The current-badge card read as one block.
  ///
  /// In en, this message translates to:
  /// **'Current badge: {name}. {caption}'**
  String earnsCurrentBadgeSummary(String name, String caption);

  /// No description provided for @earnsAllBadges.
  ///
  /// In en, this message translates to:
  /// **'ALL BADGES'**
  String get earnsAllBadges;

  /// No description provided for @earnsFilterEarned.
  ///
  /// In en, this message translates to:
  /// **'Earned'**
  String get earnsFilterEarned;

  /// No description provided for @earnsFilterLocked.
  ///
  /// In en, this message translates to:
  /// **'Locked'**
  String get earnsFilterLocked;

  /// An earned badge tile, whose state the design shows only as a tick.
  ///
  /// In en, this message translates to:
  /// **'{name}, earned. {requirement}'**
  String earnsBadgeEarnedSummary(String name, String requirement);

  /// The tile of the badge the balance currently sits on.
  ///
  /// In en, this message translates to:
  /// **'{name}, your current badge. {requirement}'**
  String earnsBadgeCurrentSummary(String name, String requirement);

  /// A locked badge tile, whose state the design shows only as a padlock and a grey.
  ///
  /// In en, this message translates to:
  /// **'{name}, locked. {requirement}'**
  String earnsBadgeLockedSummary(String name, String requirement);

  /// No description provided for @earnsNoEarnedBadges.
  ///
  /// In en, this message translates to:
  /// **'No badges earned yet.'**
  String get earnsNoEarnedBadges;

  /// No description provided for @earnsNoLockedBadges.
  ///
  /// In en, this message translates to:
  /// **'Every badge is earned.'**
  String get earnsNoLockedBadges;

  /// No description provided for @earnsStreaksTitle.
  ///
  /// In en, this message translates to:
  /// **'Daily Streaks'**
  String get earnsStreaksTitle;

  /// No description provided for @earnsAuctionTitle.
  ///
  /// In en, this message translates to:
  /// **'Live Auctions'**
  String get earnsAuctionTitle;

  /// No description provided for @earnsPredictionsTitle.
  ///
  /// In en, this message translates to:
  /// **'Prediction Games'**
  String get earnsPredictionsTitle;

  /// No description provided for @earnsQuestsTitle.
  ///
  /// In en, this message translates to:
  /// **'Weekly Quest'**
  String get earnsQuestsTitle;

  /// No description provided for @earnsStreaksEyebrow.
  ///
  /// In en, this message translates to:
  /// **'DAILY STREAKS'**
  String get earnsStreaksEyebrow;

  /// No description provided for @earnsAuctionEyebrow.
  ///
  /// In en, this message translates to:
  /// **'AUCTION WINS'**
  String get earnsAuctionEyebrow;

  /// No description provided for @earnsPredictionsEyebrow.
  ///
  /// In en, this message translates to:
  /// **'PREDICTION GAMES'**
  String get earnsPredictionsEyebrow;

  /// No description provided for @earnsDetailPointsEarned.
  ///
  /// In en, this message translates to:
  /// **'pts earned'**
  String get earnsDetailPointsEarned;

  /// The total a source has paid, read as one sentence rather than three stops.
  ///
  /// In en, this message translates to:
  /// **'{title}: {points} {unit} earned'**
  String earnsDetailTotalSummary(String title, String points, String unit);

  /// The stat beside the total. The caption is empty on the screens that draw none.
  ///
  /// In en, this message translates to:
  /// **'{label}: {value}. {caption}'**
  String earnsDetailStatSummary(String label, String value, String caption);

  /// No description provided for @earnsStreaksStatLabel.
  ///
  /// In en, this message translates to:
  /// **'Active days'**
  String get earnsStreaksStatLabel;

  /// No description provided for @earnsAuctionStatLabel.
  ///
  /// In en, this message translates to:
  /// **'Total wins'**
  String get earnsAuctionStatLabel;

  /// No description provided for @earnsPredictionsStatLabel.
  ///
  /// In en, this message translates to:
  /// **'Accuracy'**
  String get earnsPredictionsStatLabel;

  /// No description provided for @earnsQuestsStatLabel.
  ///
  /// In en, this message translates to:
  /// **'Completed'**
  String get earnsQuestsStatLabel;

  /// The share of settled predictions that were right.
  ///
  /// In en, this message translates to:
  /// **'{percent}%'**
  String earnsPredictionsAccuracy(int percent);

  /// How the accuracy was reached.
  ///
  /// In en, this message translates to:
  /// **'{correct}/{total} correct'**
  String earnsPredictionsAccuracyCaption(int correct, int total);

  /// Weeks claimed out of the weeks in the history.
  ///
  /// In en, this message translates to:
  /// **'{completed}/{total}'**
  String earnsQuestsCompleted(int completed, int total);

  /// No description provided for @earnsActivityLog.
  ///
  /// In en, this message translates to:
  /// **'ACTIVITY LOG'**
  String get earnsActivityLog;

  /// No description provided for @earnsWinHistory.
  ///
  /// In en, this message translates to:
  /// **'WIN HISTORY'**
  String get earnsWinHistory;

  /// No description provided for @earnsPredictionHistory.
  ///
  /// In en, this message translates to:
  /// **'PREDICTION HISTORY'**
  String get earnsPredictionHistory;

  /// No description provided for @earnsQuestHistory.
  ///
  /// In en, this message translates to:
  /// **'QUEST HISTORY'**
  String get earnsQuestHistory;

  /// One rung of the watch-time ladder.
  ///
  /// In en, this message translates to:
  /// **'Lv {level} · {minutes} min'**
  String earnsStreakLevelChip(int level, int minutes);

  /// A ladder rung the log has met, which the design shows only as a coloured dot.
  ///
  /// In en, this message translates to:
  /// **'Lv {level}, {minutes} minutes a day, reached'**
  String earnsStreakLevelReached(int level, int minutes);

  /// A ladder rung the log has not met, which the design shows only as a grey.
  ///
  /// In en, this message translates to:
  /// **'Lv {level}, {minutes} minutes a day, not reached yet'**
  String earnsStreakLevelLocked(int level, int minutes);

  /// The level pill beside a log entry.
  ///
  /// In en, this message translates to:
  /// **'LV {level}'**
  String earnsStreakLevelBadge(int level);

  /// The streak length on a log entry tile.
  ///
  /// In en, this message translates to:
  /// **'{days}d'**
  String earnsStreakDayCount(int days);

  /// What the day earned its points for.
  ///
  /// In en, this message translates to:
  /// **'{minutes} min watched'**
  String earnsStreakMinutes(int minutes);

  /// The badge a streak day reached.
  ///
  /// In en, this message translates to:
  /// **'Badge unlocked: {name}'**
  String earnsStreakBadgeUnlocked(String name);

  /// One streak log entry as a single sentence; its tile, pill and glyph say none of this.
  ///
  /// In en, this message translates to:
  /// **'{date}, day {dayCount} of the streak. {minutes} minutes watched, {award}. {level} {badge}'**
  String earnsStreakDaySummary(String date, int dayCount, int minutes, String award, String level, String badge);

  /// No description provided for @earnsPointsAwarded.
  ///
  /// In en, this message translates to:
  /// **'pts awarded'**
  String get earnsPointsAwarded;

  /// A points award, which the design always writes signed.
  ///
  /// In en, this message translates to:
  /// **'+{points}'**
  String earnsPointsAdded(String points);

  /// Stands in for the award on an entry that paid nothing.
  ///
  /// In en, this message translates to:
  /// **'—'**
  String get earnsNoPoints;

  /// An award read aloud.
  ///
  /// In en, this message translates to:
  /// **'{points} {unit} awarded'**
  String earnsAwardSummary(String points, String unit);

  /// Read in place of the dash the design draws.
  ///
  /// In en, this message translates to:
  /// **'no points awarded'**
  String get earnsNoAwardSummary;

  /// The badge chip on a history card.
  ///
  /// In en, this message translates to:
  /// **'Badge earned: {name}.'**
  String earnsBadgeAwardSummary(String name);

  /// No description provided for @earnsStatusWon.
  ///
  /// In en, this message translates to:
  /// **'WON'**
  String get earnsStatusWon;

  /// No description provided for @earnsStatusCorrect.
  ///
  /// In en, this message translates to:
  /// **'CORRECT'**
  String get earnsStatusCorrect;

  /// No description provided for @earnsStatusIncorrect.
  ///
  /// In en, this message translates to:
  /// **'INCORRECT'**
  String get earnsStatusIncorrect;

  /// No description provided for @earnsStatusClaimed.
  ///
  /// In en, this message translates to:
  /// **'CLAIMED'**
  String get earnsStatusClaimed;

  /// No description provided for @earnsStatusPartial.
  ///
  /// In en, this message translates to:
  /// **'PARTIAL'**
  String get earnsStatusPartial;

  /// No description provided for @earnsLotMemorabilia.
  ///
  /// In en, this message translates to:
  /// **'MEMORABILIA'**
  String get earnsLotMemorabilia;

  /// No description provided for @earnsLotExperience.
  ///
  /// In en, this message translates to:
  /// **'EXPERIENCE'**
  String get earnsLotExperience;

  /// No description provided for @earnsLotTicket.
  ///
  /// In en, this message translates to:
  /// **'TICKET'**
  String get earnsLotTicket;

  /// No description provided for @earnsLotContent.
  ///
  /// In en, this message translates to:
  /// **'CONTENT'**
  String get earnsLotContent;

  /// No description provided for @earnsWinningBidLabel.
  ///
  /// In en, this message translates to:
  /// **'Winning bid: '**
  String get earnsWinningBidLabel;

  /// The bid that won the lot, in the auction currency.
  ///
  /// In en, this message translates to:
  /// **'{bid} CP'**
  String earnsWinningBidValue(String bid);

  /// One auction win as a single sentence; the card splits it over an image and two rows.
  ///
  /// In en, this message translates to:
  /// **'{title}, {kind}, won {date}. Winning bid {bid}. {award}. {badge}'**
  String earnsWinSummary(String title, String kind, String date, String bid, String award, String badge);

  /// The stake a prediction game ran at.
  ///
  /// In en, this message translates to:
  /// **'{multiplier}X'**
  String earnsPredictionMultiplier(int multiplier);

  /// No description provided for @earnsPredictionYourVote.
  ///
  /// In en, this message translates to:
  /// **'YOUR VOTE'**
  String get earnsPredictionYourVote;

  /// No description provided for @earnsPredictionOutcome.
  ///
  /// In en, this message translates to:
  /// **'RESULT'**
  String get earnsPredictionOutcome;

  /// No description provided for @earnsVoteYes.
  ///
  /// In en, this message translates to:
  /// **'YES'**
  String get earnsVoteYes;

  /// No description provided for @earnsVoteNo.
  ///
  /// In en, this message translates to:
  /// **'NO'**
  String get earnsVoteNo;

  /// One settled prediction as a single sentence; the card colours the result rather than saying it.
  ///
  /// In en, this message translates to:
  /// **'{title}, {status}. {question} Your vote: {vote}. Result: {outcome}. {award}. {badge}'**
  String earnsPredictionSummary(
    String title,
    String status,
    String question,
    String vote,
    String outcome,
    String award,
    String badge,
  );

  /// The week a quest ran.
  ///
  /// In en, this message translates to:
  /// **'{start} – {end}'**
  String earnsQuestRange(String start, String end);

  /// How much of the week the user finished.
  ///
  /// In en, this message translates to:
  /// **'{completed} of {total} actions completed · Done {date}'**
  String earnsQuestProgress(int completed, int total, String date);

  /// One quest week as a single sentence.
  ///
  /// In en, this message translates to:
  /// **'{title}, {status}, {range}. {progress}. {award}. {badge}'**
  String earnsQuestSummary(String title, String status, String range, String progress, String award, String badge);

  /// What tapping an earn row does, which the design shows with no chevron.
  ///
  /// In en, this message translates to:
  /// **'See its history'**
  String get earnsRowOpen;

  /// The level a streak day reached, empty on a day that reached none.
  ///
  /// In en, this message translates to:
  /// **'Level {level} reached.'**
  String earnsStreakLevelSummary(int level);

  /// No description provided for @earnsNoStreakDays.
  ///
  /// In en, this message translates to:
  /// **'No streak days logged yet.'**
  String get earnsNoStreakDays;

  /// No description provided for @earnsNoWins.
  ///
  /// In en, this message translates to:
  /// **'No auction wins yet.'**
  String get earnsNoWins;

  /// No description provided for @earnsNoPredictions.
  ///
  /// In en, this message translates to:
  /// **'No settled predictions yet.'**
  String get earnsNoPredictions;

  /// No description provided for @earnsNoQuests.
  ///
  /// In en, this message translates to:
  /// **'No quest weeks yet.'**
  String get earnsNoQuests;

  /// No description provided for @p2pRankLabel.
  ///
  /// In en, this message translates to:
  /// **'Rank'**
  String get p2pRankLabel;

  /// No description provided for @p2pStreakLabel.
  ///
  /// In en, this message translates to:
  /// **'Streak'**
  String get p2pStreakLabel;

  /// No description provided for @p2pPointsLabel.
  ///
  /// In en, this message translates to:
  /// **'Points'**
  String get p2pPointsLabel;

  /// No description provided for @p2pPointsUnit.
  ///
  /// In en, this message translates to:
  /// **'PTS'**
  String get p2pPointsUnit;

  /// The rank, which the design always writes with a hash.
  ///
  /// In en, this message translates to:
  /// **'#{rank}'**
  String p2pRankValue(String rank);

  /// How many places the user climbed over the week.
  ///
  /// In en, this message translates to:
  /// **'+{places} wk'**
  String p2pRankGain(int places);

  /// The longest run so far, abbreviated as the design writes it.
  ///
  /// In en, this message translates to:
  /// **'Best {days}d'**
  String p2pBestStreak(int days);

  /// Points into the current badge tier over the tier's width.
  ///
  /// In en, this message translates to:
  /// **'{earned} / {span}'**
  String p2pBadgeProgress(String earned, String span);

  /// What the next badge still costs.
  ///
  /// In en, this message translates to:
  /// **'{points} pts to {badge}'**
  String p2pNextBadge(String points, String badge);

  /// The caption once the ladder has no rung above.
  ///
  /// In en, this message translates to:
  /// **'Top badge reached'**
  String get p2pTopBadge;

  /// No description provided for @p2pGamesSection.
  ///
  /// In en, this message translates to:
  /// **'GAMES'**
  String get p2pGamesSection;

  /// The rank column as one sentence; its glyph and caption say none of this.
  ///
  /// In en, this message translates to:
  /// **'Rank {rank}, up {places} places this week.'**
  String p2pRankSummary(String rank, int places);

  /// The streak column as one sentence.
  ///
  /// In en, this message translates to:
  /// **'Streak: {points} points, best run {days} days.'**
  String p2pStreakSummary(String points, int days);

  /// The points column as one sentence.
  ///
  /// In en, this message translates to:
  /// **'{points} points earned.'**
  String p2pPointsSummary(String points);

  /// The badge row as one sentence, because its bar announces nothing.
  ///
  /// In en, this message translates to:
  /// **'Badge {badge}, {earned} of {span} points. {points} points to {nextBadge}.'**
  String p2pBadgeSummary(String badge, String earned, String span, String points, String nextBadge);

  /// No description provided for @questsTitle.
  ///
  /// In en, this message translates to:
  /// **'Weekly Quests'**
  String get questsTitle;

  /// No description provided for @questsAllSection.
  ///
  /// In en, this message translates to:
  /// **'ALL WEEKLY QUESTS'**
  String get questsAllSection;

  /// No description provided for @questsActiveBadge.
  ///
  /// In en, this message translates to:
  /// **'ACTIVE'**
  String get questsActiveBadge;

  /// The active pill, spoken. Upper case is read out letter by letter.
  ///
  /// In en, this message translates to:
  /// **'Active'**
  String get questsActiveBadgeSpoken;

  /// A quest's reward over its still, which the design sets upper case.
  ///
  /// In en, this message translates to:
  /// **'{points} PTS'**
  String questsPointsReward(String points);

  /// A quest's reward in a list row.
  ///
  /// In en, this message translates to:
  /// **'{points} pts'**
  String questsPointsValue(String points);

  /// How long a quest is still open, such as '2d 14h left'.
  ///
  /// In en, this message translates to:
  /// **'{time} left'**
  String questsTimeLeft(String time);

  /// A remaining span the design abbreviates to days and hours.
  ///
  /// In en, this message translates to:
  /// **'{days}d {hours}h'**
  String questsTimeLeftDays(int days, int hours);

  /// A remaining span under a day.
  ///
  /// In en, this message translates to:
  /// **'{hours}h {minutes}m'**
  String questsTimeLeftHours(int hours, int minutes);

  /// Actions done over actions in the quest.
  ///
  /// In en, this message translates to:
  /// **'{done} / {total}'**
  String questsProgressFraction(int done, int total);

  /// No description provided for @questsTrackProgress.
  ///
  /// In en, this message translates to:
  /// **'Track Progress'**
  String get questsTrackProgress;

  /// No description provided for @questsStartQuest.
  ///
  /// In en, this message translates to:
  /// **'Start Quest'**
  String get questsStartQuest;

  /// No description provided for @questsRewardClaimed.
  ///
  /// In en, this message translates to:
  /// **'REWARD CLAIMED'**
  String get questsRewardClaimed;

  /// The claimed pill, spoken.
  ///
  /// In en, this message translates to:
  /// **'Reward claimed'**
  String get questsRewardClaimedSpoken;

  /// No description provided for @questsEmpty.
  ///
  /// In en, this message translates to:
  /// **'No quests are running this week.'**
  String get questsEmpty;

  /// The featured quest card as one sentence.
  ///
  /// In en, this message translates to:
  /// **'{title}. {description} {done} of {total} actions done, {points} points, {time} left.'**
  String questsHeroSummary(String title, String description, int done, int total, String points, String time);

  /// A quest list row as one sentence.
  ///
  /// In en, this message translates to:
  /// **'{title}. {description} Pays {points} points. {action}'**
  String questsRowSummary(String title, String description, String points, String action);

  /// The tracker's headline.
  ///
  /// In en, this message translates to:
  /// **'{done} of {total} actions done'**
  String questProgressActionsDone(int done, int total);

  /// What finishing the quest pays.
  ///
  /// In en, this message translates to:
  /// **'Complete all actions to earn {points} pts'**
  String questProgressEarnCaption(String points);

  /// No description provided for @questProgressYourActions.
  ///
  /// In en, this message translates to:
  /// **'YOUR ACTIONS'**
  String get questProgressYourActions;

  /// No description provided for @questProgressCuratedContent.
  ///
  /// In en, this message translates to:
  /// **'CURATED CONTENT'**
  String get questProgressCuratedContent;

  /// One action's own count, drawn as a chip.
  ///
  /// In en, this message translates to:
  /// **'{done}/{total}'**
  String questProgressCounter(int done, int total);

  /// The ring's centre label.
  ///
  /// In en, this message translates to:
  /// **'{percent}%'**
  String questProgressPercent(int percent);

  /// No description provided for @questProgressWatch.
  ///
  /// In en, this message translates to:
  /// **'Watch'**
  String get questProgressWatch;

  /// No description provided for @questProgressDone.
  ///
  /// In en, this message translates to:
  /// **'DONE'**
  String get questProgressDone;

  /// No description provided for @questProgressClaim.
  ///
  /// In en, this message translates to:
  /// **'Claim Reward'**
  String get questProgressClaim;

  /// One action card as one sentence.
  ///
  /// In en, this message translates to:
  /// **'{title}. {description} {done} of {total} done.'**
  String questProgressActionSummary(String title, String description, int done, int total);

  /// What the button beside a curated row does.
  ///
  /// In en, this message translates to:
  /// **'Watch {title}'**
  String questProgressWatchItem(String title);

  /// A curated row already done.
  ///
  /// In en, this message translates to:
  /// **'{title}, watched'**
  String questProgressItemWatched(String title);

  /// No description provided for @questModalEyebrow.
  ///
  /// In en, this message translates to:
  /// **'QUEST COMPLETED'**
  String get questModalEyebrow;

  /// No description provided for @questModalTitle.
  ///
  /// In en, this message translates to:
  /// **'Congratulations'**
  String get questModalTitle;

  /// The modal's paragraph.
  ///
  /// In en, this message translates to:
  /// **'You\'\'ve completed {quest} and earned your weekly reward.'**
  String questModalBody(String quest);

  /// No description provided for @questModalPointsLabel.
  ///
  /// In en, this message translates to:
  /// **'POINTS EARNED'**
  String get questModalPointsLabel;

  /// No description provided for @questModalBadgeLabel.
  ///
  /// In en, this message translates to:
  /// **'BADGE UNLOCKED'**
  String get questModalBadgeLabel;

  /// The modal's badge card as one sentence.
  ///
  /// In en, this message translates to:
  /// **'Badge unlocked: {badge}.'**
  String questModalBadgeSummary(String badge);

  /// The award, which the design always writes signed.
  ///
  /// In en, this message translates to:
  /// **'+{points}'**
  String questModalPoints(String points);

  /// No description provided for @questModalPointsUnit.
  ///
  /// In en, this message translates to:
  /// **'pts'**
  String get questModalPointsUnit;

  /// No description provided for @questModalClaim.
  ///
  /// In en, this message translates to:
  /// **'Claim Reward'**
  String get questModalClaim;

  /// No description provided for @questClaimedBadge.
  ///
  /// In en, this message translates to:
  /// **'REWARD CLAIMED'**
  String get questClaimedBadge;

  /// No description provided for @questClaimedEyebrow.
  ///
  /// In en, this message translates to:
  /// **'COMPLETED QUEST'**
  String get questClaimedEyebrow;

  /// No description provided for @questClaimedTitle.
  ///
  /// In en, this message translates to:
  /// **'Congratulations! 🎉'**
  String get questClaimedTitle;

  /// No description provided for @questClaimedBody.
  ///
  /// In en, this message translates to:
  /// **'You successfully completed all actions and claimed your reward for this week\'\'s quest.'**
  String get questClaimedBody;

  /// No description provided for @questClaimedPointsLabel.
  ///
  /// In en, this message translates to:
  /// **'POINTS EARNED'**
  String get questClaimedPointsLabel;

  /// No description provided for @questClaimedDaysLabel.
  ///
  /// In en, this message translates to:
  /// **'COMPLETED IN'**
  String get questClaimedDaysLabel;

  /// No description provided for @questClaimedActionsLabel.
  ///
  /// In en, this message translates to:
  /// **'ACTIONS DONE'**
  String get questClaimedActionsLabel;

  /// No description provided for @questClaimedDaysUnit.
  ///
  /// In en, this message translates to:
  /// **'DAYS'**
  String get questClaimedDaysUnit;

  /// The days card as one sentence.
  ///
  /// In en, this message translates to:
  /// **'Completed in {days} days.'**
  String questClaimedDaysSummary(int days);

  /// The denominator beside the actions figure.
  ///
  /// In en, this message translates to:
  /// **'/ {total}'**
  String questClaimedActionsOf(int total);

  /// No description provided for @questClaimedBadgeUnlocked.
  ///
  /// In en, this message translates to:
  /// **'BADGE UNLOCKED'**
  String get questClaimedBadgeUnlocked;

  /// What the badge was given for.
  ///
  /// In en, this message translates to:
  /// **'Awarded for completing {quest}'**
  String questClaimedBadgeCaption(String quest);

  /// No description provided for @questClaimedActionsSection.
  ///
  /// In en, this message translates to:
  /// **'COMPLETED ACTIONS'**
  String get questClaimedActionsSection;

  /// No description provided for @questClaimedActionDone.
  ///
  /// In en, this message translates to:
  /// **'Done'**
  String get questClaimedActionDone;

  /// No description provided for @questClaimedShare.
  ///
  /// In en, this message translates to:
  /// **'Share Achievement'**
  String get questClaimedShare;

  /// The badge card as one sentence.
  ///
  /// In en, this message translates to:
  /// **'Badge unlocked: {badge}. {caption}'**
  String questClaimedBadgeSummary(String badge, String caption);

  /// No description provided for @streakIntroEyebrow.
  ///
  /// In en, this message translates to:
  /// **'DAILY STREAKS'**
  String get streakIntroEyebrow;

  /// No description provided for @streakIntroTitle.
  ///
  /// In en, this message translates to:
  /// **'The Daily Ritual'**
  String get streakIntroTitle;

  /// The first rung's ask.
  ///
  /// In en, this message translates to:
  /// **'Spend {minutes} mins daily'**
  String streakIntroCardTitle(int minutes);

  /// How the streak works.
  ///
  /// In en, this message translates to:
  /// **'Every day you spend at least {minutes} minutes on Matinee counts as a streak day. Miss a day and your streak resets.'**
  String streakIntroCardBody(int minutes);

  /// No description provided for @streakIntroBody.
  ///
  /// In en, this message translates to:
  /// **'Longer streaks unlock exclusive badges and CinePoints multipliers.'**
  String get streakIntroBody;

  /// No description provided for @streakIntroCta.
  ///
  /// In en, this message translates to:
  /// **'Start My Streak'**
  String get streakIntroCta;

  /// No description provided for @streakTitle.
  ///
  /// In en, this message translates to:
  /// **'Daily Streaks'**
  String get streakTitle;

  /// No description provided for @streakCurrentLevel.
  ///
  /// In en, this message translates to:
  /// **'CURRENT LEVEL'**
  String get streakCurrentLevel;

  /// The level the streak has reached.
  ///
  /// In en, this message translates to:
  /// **'Level {level}'**
  String streakLevelName(int level);

  /// What the current level asks for.
  ///
  /// In en, this message translates to:
  /// **'{minutes} min/day for {days} days'**
  String streakLevelRequirement(int minutes, int days);

  /// No description provided for @streakThisWeek.
  ///
  /// In en, this message translates to:
  /// **'This week'**
  String get streakThisWeek;

  /// No description provided for @streakDaysDone.
  ///
  /// In en, this message translates to:
  /// **'days done'**
  String get streakDaysDone;

  /// Days cleared this week over the days the level needs.
  ///
  /// In en, this message translates to:
  /// **'{done}/{total}'**
  String streakWeekFraction(int done, int total);

  /// What the next level still needs.
  ///
  /// In en, this message translates to:
  /// **'Complete {days} more days to unlock Level {level} ({minutes} min/day)'**
  String streakUnlockCaption(int days, int level, int minutes);

  /// No description provided for @streakTopLevelCaption.
  ///
  /// In en, this message translates to:
  /// **'You have reached the top level. Keep the run going.'**
  String get streakTopLevelCaption;

  /// No description provided for @streakLevelTrack.
  ///
  /// In en, this message translates to:
  /// **'LEVEL TRACK'**
  String get streakLevelTrack;

  /// One rung of the ladder.
  ///
  /// In en, this message translates to:
  /// **'{minutes} min/day'**
  String streakTierLabel(int minutes);

  /// No description provided for @streakTodaySession.
  ///
  /// In en, this message translates to:
  /// **'TODAY\'\'S SESSION'**
  String get streakTodaySession;

  /// The minutes today's session is measured against.
  ///
  /// In en, this message translates to:
  /// **'/ {minutes} min'**
  String streakSessionTarget(int minutes);

  /// How much of today's session is still to go.
  ///
  /// In en, this message translates to:
  /// **'{minutes} MIN LEFT'**
  String streakMinutesLeft(int minutes);

  /// No description provided for @streakSessionMet.
  ///
  /// In en, this message translates to:
  /// **'TODAY IS DONE'**
  String get streakSessionMet;

  /// Why today's target is what it is.
  ///
  /// In en, this message translates to:
  /// **'Level {level} requires {minutes} min/day to keep your streak alive'**
  String streakSessionCaption(int level, int minutes);

  /// The CTA that counts today towards the streak, until a session tracker exists.
  ///
  /// In en, this message translates to:
  /// **'Complete Today'**
  String get streakCompleteDay;

  /// No description provided for @streakNowLabel.
  ///
  /// In en, this message translates to:
  /// **'STREAK NOW'**
  String get streakNowLabel;

  /// The current run as one sentence.
  ///
  /// In en, this message translates to:
  /// **'Current streak: {days} days.'**
  String streakNowSummary(int days);

  /// No description provided for @streakBestLabel.
  ///
  /// In en, this message translates to:
  /// **'BEST STREAK'**
  String get streakBestLabel;

  /// The longest run as one sentence.
  ///
  /// In en, this message translates to:
  /// **'Best streak: {days} days.'**
  String streakBestSummary(int days);

  /// No description provided for @streakActiveLabel.
  ///
  /// In en, this message translates to:
  /// **'ACTIVE DAYS'**
  String get streakActiveLabel;

  /// How many days were active, as one sentence.
  ///
  /// In en, this message translates to:
  /// **'Active days: {days}.'**
  String streakActiveSummary(int days);

  /// No description provided for @streakDaysUnit.
  ///
  /// In en, this message translates to:
  /// **'days'**
  String get streakDaysUnit;

  /// The current-level card as one sentence.
  ///
  /// In en, this message translates to:
  /// **'Current level {level}, {minutes} minutes a day for {days} days. {done} of {days} days done this week.'**
  String streakLevelCardSummary(int level, int minutes, int days, int done);

  /// A cleared rung of the ladder.
  ///
  /// In en, this message translates to:
  /// **'Level {level}, {minutes} minutes a day. Reached.'**
  String streakTierSummaryDone(int level, int minutes);

  /// The rung the streak is on.
  ///
  /// In en, this message translates to:
  /// **'Level {level}, {minutes} minutes a day. Current level.'**
  String streakTierSummaryCurrent(int level, int minutes);

  /// A rung not yet reached.
  ///
  /// In en, this message translates to:
  /// **'Level {level}, {minutes} minutes a day. Locked.'**
  String streakTierSummaryLocked(int level, int minutes);

  /// The session card as one sentence.
  ///
  /// In en, this message translates to:
  /// **'Today\'\'s session: {minutes} of {target} minutes.'**
  String streakSessionSummary(int minutes, int target);

  /// The drawer's headline.
  ///
  /// In en, this message translates to:
  /// **'{days}-Day Ritual Complete!'**
  String streakLevelDoneTitle(int days);

  /// No description provided for @streakLevelDoneBody.
  ///
  /// In en, this message translates to:
  /// **'You\'\'ve mastered the daily ritual. Keep the momentum going for exclusive multipliers.'**
  String get streakLevelDoneBody;

  /// No description provided for @streakLevelDoneRewardLabel.
  ///
  /// In en, this message translates to:
  /// **'REWARD'**
  String get streakLevelDoneRewardLabel;

  /// The drawer's reward card as one sentence.
  ///
  /// In en, this message translates to:
  /// **'Reward: {points} points.'**
  String streakLevelDoneRewardSummary(String points);

  /// No description provided for @streakLevelDoneStatusLabel.
  ///
  /// In en, this message translates to:
  /// **'NEW STATUS'**
  String get streakLevelDoneStatusLabel;

  /// The drawer's status card as one sentence.
  ///
  /// In en, this message translates to:
  /// **'New status: {status}.'**
  String streakLevelDoneStatusSummary(String status);

  /// The award, written signed.
  ///
  /// In en, this message translates to:
  /// **'+{points}'**
  String streakLevelDonePoints(String points);

  /// No description provided for @streakLevelDonePointsUnit.
  ///
  /// In en, this message translates to:
  /// **'Points'**
  String get streakLevelDonePointsUnit;

  /// No description provided for @streakLevelDoneStatus.
  ///
  /// In en, this message translates to:
  /// **'Streak Master'**
  String get streakLevelDoneStatus;

  /// No description provided for @streakLevelDoneClaim.
  ///
  /// In en, this message translates to:
  /// **'Claim Reward'**
  String get streakLevelDoneClaim;

  /// No description provided for @streakLevelDoneDismiss.
  ///
  /// In en, this message translates to:
  /// **'CONTINUE WATCHING'**
  String get streakLevelDoneDismiss;

  /// No description provided for @predictionsTitle.
  ///
  /// In en, this message translates to:
  /// **'Prediction Games'**
  String get predictionsTitle;

  /// No description provided for @predictionsSection.
  ///
  /// In en, this message translates to:
  /// **'PREDICTIONS'**
  String get predictionsSection;

  /// How many predictions are still open.
  ///
  /// In en, this message translates to:
  /// **'{count} ACTIVE'**
  String predictionsActiveBadge(int count);

  /// How many predictions are open, spoken.
  ///
  /// In en, this message translates to:
  /// **'{count} active'**
  String predictionsActiveBadgeSpoken(int count);

  /// What a correct call multiplies by, over the still.
  ///
  /// In en, this message translates to:
  /// **'{multiplier}X MULTIPLIER'**
  String predictionsMultiplier(int multiplier);

  /// What a correct call pays, over the still.
  ///
  /// In en, this message translates to:
  /// **'+{points} PTS'**
  String predictionsPointsReward(String points);

  /// No description provided for @predictionsResultIn.
  ///
  /// In en, this message translates to:
  /// **'RESULT IN'**
  String get predictionsResultIn;

  /// The settled pill, spoken.
  ///
  /// In en, this message translates to:
  /// **'Result is in'**
  String get predictionsResultInSpoken;

  /// The yes share of votes cast.
  ///
  /// In en, this message translates to:
  /// **'YES {percent}%'**
  String predictionsYesShare(int percent);

  /// The no share of votes cast.
  ///
  /// In en, this message translates to:
  /// **'NO {percent}%'**
  String predictionsNoShare(int percent);

  /// How much of the audience has voted.
  ///
  /// In en, this message translates to:
  /// **'{percent}% of players voted'**
  String predictionsTurnout(int percent);

  /// No description provided for @predictionsCastVote.
  ///
  /// In en, this message translates to:
  /// **'Cast Your Vote'**
  String get predictionsCastVote;

  /// No description provided for @predictionsRewardClaimed.
  ///
  /// In en, this message translates to:
  /// **'Reward Claimed'**
  String get predictionsRewardClaimed;

  /// No description provided for @predictionsEmpty.
  ///
  /// In en, this message translates to:
  /// **'No predictions are open right now.'**
  String get predictionsEmpty;

  /// A prediction card as one sentence; its bar and pills announce none of it.
  ///
  /// In en, this message translates to:
  /// **'{title}. {question} Yes {yes} per cent, no {no} per cent. {turnout} per cent of players voted. Pays {points} points at {multiplier} times.'**
  String predictionsCardSummary(
    String title,
    String question,
    int yes,
    int no,
    int turnout,
    String points,
    int multiplier,
  );

  /// No description provided for @predictionEyebrow.
  ///
  /// In en, this message translates to:
  /// **'PREDICTION'**
  String get predictionEyebrow;

  /// The multiplier, on its own card.
  ///
  /// In en, this message translates to:
  /// **'{multiplier}X'**
  String predictionMultiplierValue(int multiplier);

  /// No description provided for @predictionMultiplierUnit.
  ///
  /// In en, this message translates to:
  /// **'MULTIPLIER'**
  String get predictionMultiplierUnit;

  /// The multiplier card as one sentence.
  ///
  /// In en, this message translates to:
  /// **'{multiplier} times multiplier'**
  String predictionMultiplierSummary(int multiplier);

  /// No description provided for @predictionClosesIn.
  ///
  /// In en, this message translates to:
  /// **'Voting closes in'**
  String get predictionClosesIn;

  /// The countdown as a sentence, because its digits read as one number.
  ///
  /// In en, this message translates to:
  /// **'Voting closes in {hours} hours {minutes} minutes'**
  String predictionCountdownSummary(int hours, int minutes);

  /// No description provided for @predictionClosed.
  ///
  /// In en, this message translates to:
  /// **'Voting has closed'**
  String get predictionClosed;

  /// No description provided for @predictionQuestionLabel.
  ///
  /// In en, this message translates to:
  /// **'THE QUESTION'**
  String get predictionQuestionLabel;

  /// What a prediction pays, drawn in the reward tone inside the vote eyebrow.
  ///
  /// In en, this message translates to:
  /// **'+{points} PTS'**
  String predictionRewardPoints(String points);

  /// The eyebrow over the two vote buttons.
  ///
  /// In en, this message translates to:
  /// **'CAST YOUR VOTE · {reward}'**
  String predictionCastVoteLabel(String reward);

  /// No description provided for @predictionYes.
  ///
  /// In en, this message translates to:
  /// **'YES'**
  String get predictionYes;

  /// The yes option's name. 'YES' is spelled out letter by letter.
  ///
  /// In en, this message translates to:
  /// **'Yes'**
  String get predictionYesSpoken;

  /// No description provided for @predictionNo.
  ///
  /// In en, this message translates to:
  /// **'NO'**
  String get predictionNo;

  /// The no option's name. 'NO' is spelled out letter by letter.
  ///
  /// In en, this message translates to:
  /// **'No'**
  String get predictionNoSpoken;

  /// No description provided for @predictionSubmit.
  ///
  /// In en, this message translates to:
  /// **'Submit'**
  String get predictionSubmit;

  /// No description provided for @predictionVoteRecorded.
  ///
  /// In en, this message translates to:
  /// **'Your vote is in'**
  String get predictionVoteRecorded;

  /// No description provided for @predictionShowAnalysis.
  ///
  /// In en, this message translates to:
  /// **'See how others voted'**
  String get predictionShowAnalysis;

  /// No description provided for @predictionAnalysisEyebrow.
  ///
  /// In en, this message translates to:
  /// **'PREDICTION ANALYSIS'**
  String get predictionAnalysisEyebrow;

  /// No description provided for @predictionAnalysisClose.
  ///
  /// In en, this message translates to:
  /// **'Close'**
  String get predictionAnalysisClose;

  /// One share of the analysis sheet as a sentence.
  ///
  /// In en, this message translates to:
  /// **'{option}: {percent} per cent'**
  String predictionAnalysisOptionSummary(String option, int percent);
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
