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
  String get profileTitle => 'Profile';

  @override
  String get profileEditAction => 'Edit profile';

  @override
  String get profileStatPoints => 'Total Points';

  @override
  String get profileStatStreaks => 'Streaks';

  @override
  String get profileStatRank => 'Rank';

  @override
  String get profileUpgradeTitle => 'Upgrade Subscription';

  @override
  String profileUpgradeSubtitle(String plan, String date) {
    return '$plan expires $date';
  }

  @override
  String get profileUpgradeCta => 'Upgrade';

  @override
  String get profileMenuEarns => 'My Earns';

  @override
  String get profileMenuRefer => 'Refer a Friend';

  @override
  String get profileMenuNotifications => 'Notifications';

  @override
  String get profileMenuTerms => 'Terms & Conditions';

  @override
  String get profileMenuPrivacy => 'Privacy Policy';

  @override
  String get profileMenuLogout => 'Logout';

  @override
  String get editProfileTitle => 'Edit Profile';

  @override
  String get editProfileAboutYou => 'About You';

  @override
  String get editProfileNameLabel => 'Full Name';

  @override
  String get editProfileEmailLabel => 'Email ID';

  @override
  String get editProfilePhoneLabel => 'Phone No.';

  @override
  String get editProfileSave => 'Save Changes';

  @override
  String get editProfileSaved => 'Profile updated.';

  @override
  String get editProfileNameError => 'Enter your name.';

  @override
  String get editProfileEmailError => 'Enter a valid email address.';

  @override
  String get editProfilePhoneError => 'Enter a valid phone number.';

  @override
  String get referTitle => 'Refer a Friend';

  @override
  String get referClose => 'Close';

  @override
  String get referCodeLabel => 'Your Referral Code';

  @override
  String get referCopyCode => 'Copy Code';

  @override
  String get referCopied => 'Referral code copied.';

  @override
  String get referCopiedForInstagram => 'Code copied — paste it into Instagram.';

  @override
  String get referShareWhatsapp => 'WhatsApp';

  @override
  String get referShareTelegram => 'Telegram';

  @override
  String get referShareInstagram => 'Instagram';

  @override
  String get referShareCopy => 'Copy';

  @override
  String get referCta => 'Refer a friend';

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

  @override
  String get rewardsTotalPoints => 'Total Points';

  @override
  String get rewardsPointsUnit => 'pts';

  @override
  String get rewardsBadgeLabel => 'Badge';

  @override
  String rewardsNextBadge(int points, String badge) {
    final intl.NumberFormat pointsNumberFormat = intl.NumberFormat.decimalPattern(localeName);
    final String pointsString = pointsNumberFormat.format(points);

    return '$pointsString pts to $badge';
  }

  @override
  String get rewardsRedeemSection => 'REDEEM REWARDS';

  @override
  String get rewardsPointsPillTooltip => 'Your points balance';

  @override
  String get auctionEyebrow => 'LIVE AUCTION';

  @override
  String get auctionLiveBadge => 'LIVE';

  @override
  String auctionWatching(int count) {
    final intl.NumberFormat countNumberFormat = intl.NumberFormat.decimalPattern(localeName);
    final String countString = countNumberFormat.format(count);

    return '$countString watching';
  }

  @override
  String get auctionViewMore => 'View More';

  @override
  String get auctionViewLess => 'View Less';

  @override
  String get auctionCurrentBid => 'CURRENT BID';

  @override
  String get auctionTimeRemaining => 'TIME REMAINING';

  @override
  String get auctionEnded => 'ENDED';

  @override
  String get auctionBidHistory => 'BID HISTORY';

  @override
  String auctionBidAmount(int amount) {
    final intl.NumberFormat amountNumberFormat = intl.NumberFormat.decimalPattern(localeName);
    final String amountString = amountNumberFormat.format(amount);

    return '$amountString CP';
  }

  @override
  String get auctionBidFieldLabel => 'Your bid';

  @override
  String get auctionBidAction => 'BID';

  @override
  String auctionBidIncrement(String amount) {
    return '+$amount';
  }

  @override
  String auctionBidTooLow(int amount) {
    final intl.NumberFormat amountNumberFormat = intl.NumberFormat.decimalPattern(localeName);
    final String amountString = amountNumberFormat.format(amount);

    return 'Bids start at $amountString CP.';
  }

  @override
  String auctionBidOverBalance(int amount) {
    final intl.NumberFormat amountNumberFormat = intl.NumberFormat.decimalPattern(localeName);
    final String amountString = amountNumberFormat.format(amount);

    return 'You have $amountString CP to bid with.';
  }

  @override
  String get auctionBidPlaced => 'Your bid is in.';

  @override
  String get auctionBidJustNow => 'Just now';

  @override
  String auctionBidMinutesAgo(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count minutes ago',
      one: '1 minute ago',
    );
    return '$_temp0';
  }

  @override
  String auctionBidHoursAgo(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count hours ago',
      one: '1 hour ago',
    );
    return '$_temp0';
  }

  @override
  String get auctionBack => 'Back to rewards';

  @override
  String get topUpTooltip => 'Top up points';

  @override
  String get topUpTitle => 'Top Up Points';

  @override
  String get topUpSubtitle => 'Select a pack to stake on predictions.';

  @override
  String get topUpPointsLabel => 'POINTS';

  @override
  String topUpCta(String price) {
    return 'Continue to Pay $price';
  }

  @override
  String get topUpClose => 'Close';

  @override
  String get topUpSuccessTitle => 'Payment Successful';

  @override
  String topUpCredited(int points) {
    final intl.NumberFormat pointsNumberFormat = intl.NumberFormat.decimalPattern(localeName);
    final String pointsString = pointsNumberFormat.format(points);

    return '+$pointsString PTS Credited';
  }

  @override
  String get topUpDone => 'Done';

  @override
  String get exclusiveTitle => 'Exclusive Content';

  @override
  String get exclusiveLocked => 'Locked';

  @override
  String get exclusiveUnlocksFor => 'Unlocks for';

  @override
  String exclusivePointsCost(int points) {
    final intl.NumberFormat pointsNumberFormat = intl.NumberFormat.decimalPattern(localeName);
    final String pointsString = pointsNumberFormat.format(points);

    return '$pointsString POINTS';
  }

  @override
  String get exclusivePreview => 'PREVIEW';

  @override
  String get exclusiveCastAndCrew => 'CAST & CREW';

  @override
  String get exclusiveUnlockCta => 'Unlock Now';

  @override
  String get exclusiveTag => 'EXCLUSIVE CONTENT';

  @override
  String get a11yLoading => 'Loading';

  @override
  String get authOtpFieldLabel => 'Verification code';

  @override
  String authOtpFieldHint(int length) {
    return 'Enter the $length-digit code';
  }

  @override
  String auctionBidRaise(String amount) {
    return 'Raise the bid by $amount';
  }

  @override
  String get auctionLeadingBid => 'Leading bid';

  @override
  String auctionBidSummary(String bidder, String placedAt, String amount) {
    return '$bidder, $placedAt, $amount';
  }

  @override
  String auctionTimeRemainingValue(int hours, int minutes) {
    return 'about ${hours}h ${minutes}m';
  }

  @override
  String auctionTimeRemainingMinutes(int minutes) {
    return 'about ${minutes}m';
  }

  @override
  String get auctionTimeRemainingUnderMinute => 'less than a minute';

  @override
  String authOtpResendInCoarse(int seconds) {
    return 'Resend available in about $seconds seconds';
  }

  @override
  String auctionLotImage(String title) {
    return 'Photograph of $title';
  }

  @override
  String onboardingSlidePosition(int position, int total) {
    return 'Slide $position of $total';
  }

  @override
  String profileAvatarLabel(String name) {
    return 'Profile photo of $name';
  }

  @override
  String topUpPackOption(String points, String price) {
    return '$points points for $price';
  }

  @override
  String profileStatValue(String value, String label) {
    return '$value $label';
  }

  @override
  String rewardsBalanceSummary(String label, String value, String unit) {
    return '$label: $value $unit';
  }

  @override
  String rewardsBadgeSummary(String label, String name, String caption) {
    return '$label: $name. $caption';
  }

  @override
  String get earnsTitle => 'My Earns';

  @override
  String get earnsBack => 'Back to profile';

  @override
  String get earnsSegmentEarns => 'Earns';

  @override
  String get earnsSegmentBadges => 'Badges';

  @override
  String earnsShareCaption(String unit, double share) {
    final intl.NumberFormat shareNumberFormat = intl.NumberFormat.percentPattern(localeName);
    final String shareString = shareNumberFormat.format(share);

    return '$unit · $shareString';
  }

  @override
  String earnsRowSummary(String title, String points, String unit, double share, String activity) {
    final intl.NumberFormat shareNumberFormat = intl.NumberFormat.percentPattern(localeName);
    final String shareString = shareNumberFormat.format(share);

    return '$title: $points $unit, $shareString of your points. $activity';
  }

  @override
  String get earnsCurrentBadge => 'CURRENT BADGE';

  @override
  String earnsCurrentBadgeSummary(String name, String caption) {
    return 'Current badge: $name. $caption';
  }

  @override
  String get earnsAllBadges => 'ALL BADGES';

  @override
  String get earnsFilterEarned => 'Earned';

  @override
  String get earnsFilterLocked => 'Locked';

  @override
  String earnsBadgeEarnedSummary(String name, String requirement) {
    return '$name, earned. $requirement';
  }

  @override
  String earnsBadgeCurrentSummary(String name, String requirement) {
    return '$name, your current badge. $requirement';
  }

  @override
  String earnsBadgeLockedSummary(String name, String requirement) {
    return '$name, locked. $requirement';
  }

  @override
  String get earnsNoEarnedBadges => 'No badges earned yet.';

  @override
  String get earnsNoLockedBadges => 'Every badge is earned.';

  @override
  String get earnsStreaksTitle => 'Daily Streaks';

  @override
  String get earnsAuctionTitle => 'Live Auctions';

  @override
  String get earnsPredictionsTitle => 'Prediction Games';

  @override
  String get earnsQuestsTitle => 'Weekly Quest';

  @override
  String get earnsStreaksEyebrow => 'DAILY STREAKS';

  @override
  String get earnsAuctionEyebrow => 'AUCTION WINS';

  @override
  String get earnsPredictionsEyebrow => 'PREDICTION GAMES';

  @override
  String get earnsDetailPointsEarned => 'pts earned';

  @override
  String earnsDetailTotalSummary(String title, String points, String unit) {
    return '$title: $points $unit earned';
  }

  @override
  String earnsDetailStatSummary(String label, String value, String caption) {
    return '$label: $value. $caption';
  }

  @override
  String get earnsStreaksStatLabel => 'Active days';

  @override
  String get earnsAuctionStatLabel => 'Total wins';

  @override
  String get earnsPredictionsStatLabel => 'Accuracy';

  @override
  String get earnsQuestsStatLabel => 'Completed';

  @override
  String earnsPredictionsAccuracy(int percent) {
    return '$percent%';
  }

  @override
  String earnsPredictionsAccuracyCaption(int correct, int total) {
    return '$correct/$total correct';
  }

  @override
  String earnsQuestsCompleted(int completed, int total) {
    return '$completed/$total';
  }

  @override
  String get earnsActivityLog => 'ACTIVITY LOG';

  @override
  String get earnsWinHistory => 'WIN HISTORY';

  @override
  String get earnsPredictionHistory => 'PREDICTION HISTORY';

  @override
  String get earnsQuestHistory => 'QUEST HISTORY';

  @override
  String earnsStreakLevelChip(int level, int minutes) {
    return 'Lv $level · $minutes min';
  }

  @override
  String earnsStreakLevelReached(int level, int minutes) {
    return 'Lv $level, $minutes minutes a day, reached';
  }

  @override
  String earnsStreakLevelLocked(int level, int minutes) {
    return 'Lv $level, $minutes minutes a day, not reached yet';
  }

  @override
  String earnsStreakLevelBadge(int level) {
    return 'LV $level';
  }

  @override
  String earnsStreakDayCount(int days) {
    return '${days}d';
  }

  @override
  String earnsStreakMinutes(int minutes) {
    return '$minutes min watched';
  }

  @override
  String earnsStreakBadgeUnlocked(String name) {
    return 'Badge unlocked: $name';
  }

  @override
  String earnsStreakDaySummary(String date, int dayCount, int minutes, String award, String level, String badge) {
    return '$date, day $dayCount of the streak. $minutes minutes watched, $award. $level $badge';
  }

  @override
  String get earnsPointsAwarded => 'pts awarded';

  @override
  String earnsPointsAdded(String points) {
    return '+$points';
  }

  @override
  String get earnsNoPoints => '—';

  @override
  String earnsAwardSummary(String points, String unit) {
    return '$points $unit awarded';
  }

  @override
  String get earnsNoAwardSummary => 'no points awarded';

  @override
  String earnsBadgeAwardSummary(String name) {
    return 'Badge earned: $name.';
  }

  @override
  String get earnsStatusWon => 'WON';

  @override
  String get earnsStatusCorrect => 'CORRECT';

  @override
  String get earnsStatusIncorrect => 'INCORRECT';

  @override
  String get earnsStatusClaimed => 'CLAIMED';

  @override
  String get earnsStatusPartial => 'PARTIAL';

  @override
  String get earnsLotMemorabilia => 'MEMORABILIA';

  @override
  String get earnsLotExperience => 'EXPERIENCE';

  @override
  String get earnsLotTicket => 'TICKET';

  @override
  String get earnsLotContent => 'CONTENT';

  @override
  String get earnsWinningBidLabel => 'Winning bid: ';

  @override
  String earnsWinningBidValue(String bid) {
    return '$bid CP';
  }

  @override
  String earnsWinSummary(String title, String kind, String date, String bid, String award, String badge) {
    return '$title, $kind, won $date. Winning bid $bid. $award. $badge';
  }

  @override
  String earnsPredictionMultiplier(int multiplier) {
    return '${multiplier}X';
  }

  @override
  String get earnsPredictionYourVote => 'YOUR VOTE';

  @override
  String get earnsPredictionOutcome => 'RESULT';

  @override
  String get earnsVoteYes => 'YES';

  @override
  String get earnsVoteNo => 'NO';

  @override
  String earnsPredictionSummary(
    String title,
    String status,
    String question,
    String vote,
    String outcome,
    String award,
    String badge,
  ) {
    return '$title, $status. $question Your vote: $vote. Result: $outcome. $award. $badge';
  }

  @override
  String earnsQuestRange(String start, String end) {
    return '$start – $end';
  }

  @override
  String earnsQuestProgress(int completed, int total, String date) {
    return '$completed of $total actions completed · Done $date';
  }

  @override
  String earnsQuestSummary(String title, String status, String range, String progress, String award, String badge) {
    return '$title, $status, $range. $progress. $award. $badge';
  }

  @override
  String get earnsRowOpen => 'See its history';

  @override
  String earnsStreakLevelSummary(int level) {
    return 'Level $level reached.';
  }

  @override
  String get earnsNoStreakDays => 'No streak days logged yet.';

  @override
  String get earnsNoWins => 'No auction wins yet.';

  @override
  String get earnsNoPredictions => 'No settled predictions yet.';

  @override
  String get earnsNoQuests => 'No quest weeks yet.';

  @override
  String get p2pRankLabel => 'Rank';

  @override
  String get p2pStreakLabel => 'Streak';

  @override
  String get p2pPointsLabel => 'Points';

  @override
  String get p2pPointsUnit => 'PTS';

  @override
  String p2pRankValue(String rank) {
    return '#$rank';
  }

  @override
  String p2pRankGain(int places) {
    return '+$places wk';
  }

  @override
  String p2pBestStreak(int days) {
    return 'Best ${days}d';
  }

  @override
  String p2pBadgeProgress(String earned, String span) {
    return '$earned / $span';
  }

  @override
  String p2pNextBadge(String points, String badge) {
    return '$points pts to $badge';
  }

  @override
  String get p2pTopBadge => 'Top badge reached';

  @override
  String get p2pGamesSection => 'GAMES';

  @override
  String p2pRankSummary(String rank, int places) {
    return 'Rank $rank, up $places places this week.';
  }

  @override
  String p2pStreakSummary(String points, int days) {
    return 'Streak: $points points, best run $days days.';
  }

  @override
  String p2pPointsSummary(String points) {
    return '$points points earned.';
  }

  @override
  String p2pBadgeSummary(String badge, String earned, String span, String points, String nextBadge) {
    return 'Badge $badge, $earned of $span points. $points points to $nextBadge.';
  }

  @override
  String get questsTitle => 'Weekly Quests';

  @override
  String get questsAllSection => 'ALL WEEKLY QUESTS';

  @override
  String get questsActiveBadge => 'ACTIVE';

  @override
  String get questsActiveBadgeSpoken => 'Active';

  @override
  String questsPointsReward(String points) {
    return '$points PTS';
  }

  @override
  String questsPointsValue(String points) {
    return '$points pts';
  }

  @override
  String questsTimeLeft(String time) {
    return '$time left';
  }

  @override
  String questsTimeLeftDays(int days, int hours) {
    return '${days}d ${hours}h';
  }

  @override
  String questsTimeLeftHours(int hours, int minutes) {
    return '${hours}h ${minutes}m';
  }

  @override
  String questsProgressFraction(int done, int total) {
    return '$done / $total';
  }

  @override
  String get questsTrackProgress => 'Track Progress';

  @override
  String get questsStartQuest => 'Start Quest';

  @override
  String get questsRewardClaimed => 'REWARD CLAIMED';

  @override
  String get questsRewardClaimedSpoken => 'Reward claimed';

  @override
  String get questsEmpty => 'No quests are running this week.';

  @override
  String questsHeroSummary(String title, String description, int done, int total, String points, String time) {
    return '$title. $description $done of $total actions done, $points points, $time left.';
  }

  @override
  String questsRowSummary(String title, String description, String points, String action) {
    return '$title. $description Pays $points points. $action';
  }

  @override
  String questProgressActionsDone(int done, int total) {
    return '$done of $total actions done';
  }

  @override
  String questProgressEarnCaption(String points) {
    return 'Complete all actions to earn $points pts';
  }

  @override
  String get questProgressYourActions => 'YOUR ACTIONS';

  @override
  String get questProgressCuratedContent => 'CURATED CONTENT';

  @override
  String questProgressCounter(int done, int total) {
    return '$done/$total';
  }

  @override
  String questProgressPercent(int percent) {
    return '$percent%';
  }

  @override
  String get questProgressWatch => 'Watch';

  @override
  String get questProgressDone => 'DONE';

  @override
  String get questProgressClaim => 'Claim Reward';

  @override
  String questProgressActionSummary(String title, String description, int done, int total) {
    return '$title. $description $done of $total done.';
  }

  @override
  String questProgressWatchItem(String title) {
    return 'Watch $title';
  }

  @override
  String questProgressItemWatched(String title) {
    return '$title, watched';
  }

  @override
  String get questModalEyebrow => 'QUEST COMPLETED';

  @override
  String get questModalTitle => 'Congratulations';

  @override
  String questModalBody(String quest) {
    return 'You\'ve completed $quest and earned your weekly reward.';
  }

  @override
  String get questModalPointsLabel => 'POINTS EARNED';

  @override
  String get questModalBadgeLabel => 'BADGE UNLOCKED';

  @override
  String questModalBadgeSummary(String badge) {
    return 'Badge unlocked: $badge.';
  }

  @override
  String questModalPoints(String points) {
    return '+$points';
  }

  @override
  String get questModalPointsUnit => 'pts';

  @override
  String get questModalClaim => 'Claim Reward';

  @override
  String get questClaimedBadge => 'REWARD CLAIMED';

  @override
  String get questClaimedEyebrow => 'COMPLETED QUEST';

  @override
  String get questClaimedTitle => 'Congratulations! 🎉';

  @override
  String get questClaimedBody =>
      'You successfully completed all actions and claimed your reward for this week\'s quest.';

  @override
  String get questClaimedPointsLabel => 'POINTS EARNED';

  @override
  String get questClaimedDaysLabel => 'COMPLETED IN';

  @override
  String get questClaimedActionsLabel => 'ACTIONS DONE';

  @override
  String get questClaimedDaysUnit => 'DAYS';

  @override
  String questClaimedDaysSummary(int days) {
    return 'Completed in $days days.';
  }

  @override
  String questClaimedActionsOf(int total) {
    return '/ $total';
  }

  @override
  String get questClaimedBadgeUnlocked => 'BADGE UNLOCKED';

  @override
  String questClaimedBadgeCaption(String quest) {
    return 'Awarded for completing $quest';
  }

  @override
  String get questClaimedActionsSection => 'COMPLETED ACTIONS';

  @override
  String get questClaimedActionDone => 'Done';

  @override
  String get questClaimedShare => 'Share Achievement';

  @override
  String questClaimedBadgeSummary(String badge, String caption) {
    return 'Badge unlocked: $badge. $caption';
  }

  @override
  String get streakIntroEyebrow => 'DAILY STREAKS';

  @override
  String get streakIntroTitle => 'The Daily Ritual';

  @override
  String streakIntroCardTitle(int minutes) {
    return 'Spend $minutes mins daily';
  }

  @override
  String streakIntroCardBody(int minutes) {
    return 'Every day you spend at least $minutes minutes on Matinee counts as a streak day. Miss a day and your streak resets.';
  }

  @override
  String get streakIntroBody => 'Longer streaks unlock exclusive badges and CinePoints multipliers.';

  @override
  String get streakIntroCta => 'Start My Streak';

  @override
  String get streakTitle => 'Daily Streaks';

  @override
  String get streakCurrentLevel => 'CURRENT LEVEL';

  @override
  String streakLevelName(int level) {
    return 'Level $level';
  }

  @override
  String streakLevelRequirement(int minutes, int days) {
    return '$minutes min/day for $days days';
  }

  @override
  String get streakThisWeek => 'This week';

  @override
  String get streakDaysDone => 'days done';

  @override
  String streakWeekFraction(int done, int total) {
    return '$done/$total';
  }

  @override
  String streakUnlockCaption(int days, int level, int minutes) {
    return 'Complete $days more days to unlock Level $level ($minutes min/day)';
  }

  @override
  String get streakTopLevelCaption => 'You have reached the top level. Keep the run going.';

  @override
  String get streakLevelTrack => 'LEVEL TRACK';

  @override
  String streakTierLabel(int minutes) {
    return '$minutes min/day';
  }

  @override
  String get streakTodaySession => 'TODAY\'S SESSION';

  @override
  String streakSessionTarget(int minutes) {
    return '/ $minutes min';
  }

  @override
  String streakMinutesLeft(int minutes) {
    return '$minutes MIN LEFT';
  }

  @override
  String get streakSessionMet => 'TODAY IS DONE';

  @override
  String streakSessionCaption(int level, int minutes) {
    return 'Level $level requires $minutes min/day to keep your streak alive';
  }

  @override
  String get streakCompleteDay => 'Complete Today';

  @override
  String get streakNowLabel => 'STREAK NOW';

  @override
  String streakNowSummary(int days) {
    return 'Current streak: $days days.';
  }

  @override
  String get streakBestLabel => 'BEST STREAK';

  @override
  String streakBestSummary(int days) {
    return 'Best streak: $days days.';
  }

  @override
  String get streakActiveLabel => 'ACTIVE DAYS';

  @override
  String streakActiveSummary(int days) {
    return 'Active days: $days.';
  }

  @override
  String get streakDaysUnit => 'days';

  @override
  String streakLevelCardSummary(int level, int minutes, int days, int done) {
    return 'Current level $level, $minutes minutes a day for $days days. $done of $days days done this week.';
  }

  @override
  String streakTierSummaryDone(int level, int minutes) {
    return 'Level $level, $minutes minutes a day. Reached.';
  }

  @override
  String streakTierSummaryCurrent(int level, int minutes) {
    return 'Level $level, $minutes minutes a day. Current level.';
  }

  @override
  String streakTierSummaryLocked(int level, int minutes) {
    return 'Level $level, $minutes minutes a day. Locked.';
  }

  @override
  String streakSessionSummary(int minutes, int target) {
    return 'Today\'s session: $minutes of $target minutes.';
  }

  @override
  String streakLevelDoneTitle(int days) {
    return '$days-Day Ritual Complete!';
  }

  @override
  String get streakLevelDoneBody =>
      'You\'ve mastered the daily ritual. Keep the momentum going for exclusive multipliers.';

  @override
  String get streakLevelDoneRewardLabel => 'REWARD';

  @override
  String streakLevelDoneRewardSummary(String points) {
    return 'Reward: $points points.';
  }

  @override
  String get streakLevelDoneStatusLabel => 'NEW STATUS';

  @override
  String streakLevelDoneStatusSummary(String status) {
    return 'New status: $status.';
  }

  @override
  String streakLevelDonePoints(String points) {
    return '+$points';
  }

  @override
  String get streakLevelDonePointsUnit => 'Points';

  @override
  String get streakLevelDoneStatus => 'Streak Master';

  @override
  String get streakLevelDoneClaim => 'Claim Reward';

  @override
  String get streakLevelDoneDismiss => 'CONTINUE WATCHING';

  @override
  String get predictionsTitle => 'Prediction Games';

  @override
  String get predictionsSection => 'PREDICTIONS';

  @override
  String predictionsActiveBadge(int count) {
    return '$count ACTIVE';
  }

  @override
  String predictionsActiveBadgeSpoken(int count) {
    return '$count active';
  }

  @override
  String predictionsMultiplier(int multiplier) {
    return '${multiplier}X MULTIPLIER';
  }

  @override
  String predictionsPointsReward(String points) {
    return '+$points PTS';
  }

  @override
  String get predictionsResultIn => 'RESULT IN';

  @override
  String get predictionsResultInSpoken => 'Result is in';

  @override
  String predictionsYesShare(int percent) {
    return 'YES $percent%';
  }

  @override
  String predictionsNoShare(int percent) {
    return 'NO $percent%';
  }

  @override
  String predictionsTurnout(int percent) {
    return '$percent% of players voted';
  }

  @override
  String get predictionsCastVote => 'Cast Your Vote';

  @override
  String get predictionsRewardClaimed => 'Reward Claimed';

  @override
  String get predictionsEmpty => 'No predictions are open right now.';

  @override
  String predictionsCardSummary(
    String title,
    String question,
    int yes,
    int no,
    int turnout,
    String points,
    int multiplier,
  ) {
    return '$title. $question Yes $yes per cent, no $no per cent. $turnout per cent of players voted. Pays $points points at $multiplier times.';
  }

  @override
  String get predictionEyebrow => 'PREDICTION';

  @override
  String predictionMultiplierValue(int multiplier) {
    return '${multiplier}X';
  }

  @override
  String get predictionMultiplierUnit => 'MULTIPLIER';

  @override
  String predictionMultiplierSummary(int multiplier) {
    return '$multiplier times multiplier';
  }

  @override
  String get predictionClosesIn => 'Voting closes in';

  @override
  String predictionCountdownSummary(int hours, int minutes) {
    return 'Voting closes in $hours hours $minutes minutes';
  }

  @override
  String get predictionClosed => 'Voting has closed';

  @override
  String get predictionQuestionLabel => 'THE QUESTION';

  @override
  String predictionRewardPoints(String points) {
    return '+$points PTS';
  }

  @override
  String predictionCastVoteLabel(String reward) {
    return 'CAST YOUR VOTE · $reward';
  }

  @override
  String get predictionYes => 'YES';

  @override
  String get predictionYesSpoken => 'Yes';

  @override
  String get predictionNo => 'NO';

  @override
  String get predictionNoSpoken => 'No';

  @override
  String get predictionSubmit => 'Submit';

  @override
  String get predictionVoteRecorded => 'Your vote is in';

  @override
  String get predictionShowAnalysis => 'See how others voted';

  @override
  String get predictionAnalysisEyebrow => 'PREDICTION ANALYSIS';

  @override
  String get predictionAnalysisClose => 'Close';

  @override
  String predictionAnalysisOptionSummary(String option, int percent) {
    return '$option: $percent per cent';
  }
}
