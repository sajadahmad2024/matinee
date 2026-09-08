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

  /// No description provided for @homePlaceholder.
  ///
  /// In en, this message translates to:
  /// **'Replace this screen with the first feature.'**
  String get homePlaceholder;

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
