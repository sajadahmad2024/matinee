import 'package:flutter/material.dart';
import 'package:matinee/core/theme/app_gradients.dart';
import 'package:matinee/core/theme/app_palette.dart';

///
/// The app colour roles, grouped as the design system groups them. Each group
/// is one immutable dark instance, read as `context.appColors.<group>.<role>`.
///

class AppTextColors {
  const AppTextColors({
    required this.primary,
    required this.secondary,
    required this.muted,
    required this.disabled,
    required this.inverse,
    required this.link,
    required this.numeral,
    required this.numeralGradient,
    required this.onImageSubtitle,
    required this.success,
    required this.warning,
    required this.error,
  });

  static final AppTextColors dark = AppTextColors(
    primary: AppPalette.white,
    secondary: AppPalette.textSecondary,
    muted: AppPalette.textMuted,
    disabled: AppPalette.textDisabled,
    inverse: AppPalette.surface,
    link: AppPalette.gold,
    numeral: AppPalette.goldLight,
    numeralGradient: AppGradients.goldNumeral,
    onImageSubtitle: AppPalette.white.a60,
    success: AppPalette.success,
    warning: AppPalette.yellow,
    error: AppPalette.error,
  );

  final Color primary;
  final Color secondary;
  final Color muted;

  ///
  /// The label of an inactive control, which WCAG exempts from the 4.5:1
  /// minimum. It reads 2.0-2.6:1 on every surface, so content never takes it —
  /// a greyed-out *value* is a contrast failure, not a disabled control.
  ///
  final Color disabled;

  final Color inverse;
  final Color link;
  final Color numeral;

  /// Fills the hero total-points numeral, the one gradient-filled text role.
  final LinearGradient numeralGradient;

  final Color onImageSubtitle;
  final Color success;
  final Color warning;
  final Color error;
}

class AppIconColors {
  const AppIconColors({
    required this.primary,
    required this.secondary,
    required this.muted,
    required this.accent,
    required this.disabled,
  });

  static const AppIconColors dark = AppIconColors(
    primary: AppPalette.white,
    secondary: AppPalette.textSecondary,
    muted: AppPalette.textMuted,
    accent: AppPalette.gold,
    disabled: AppPalette.textDisabled,
  );

  final Color primary;
  final Color secondary;
  final Color muted;
  final Color accent;
  final Color disabled;
}

class AppBarColors {
  const AppBarColors({
    required this.background,
    required this.title,
    required this.backButtonBackground,
    required this.backButtonBorder,
    required this.backButtonIcon,
  });

  static const AppBarColors dark = AppBarColors(
    background: AppPalette.surface,
    title: AppPalette.white,
    backButtonBackground: AppPalette.authContainer,
    backButtonBorder: AppPalette.authOutline,
    backButtonIcon: AppPalette.gold,
  );

  final Color background;
  final Color title;
  final Color backButtonBackground;
  final Color backButtonBorder;
  final Color backButtonIcon;
}

class AppBottomNavColors {
  const AppBottomNavColors({
    required this.background,
    required this.border,
    required this.active,
    required this.inactive,
    required this.indicator,
    required this.indicatorGlow,
  });

  static final AppBottomNavColors dark = AppBottomNavColors(
    background: AppPalette.navBar,
    border: AppPalette.navBarOutline,
    active: AppPalette.goldDeep,
    inactive: AppPalette.navInactive,
    indicator: AppPalette.goldCta,
    indicatorGlow: AppPalette.goldCta.a50,
  );

  final Color background;
  final Color border;
  final Color active;
  final Color inactive;
  final Color indicator;
  final Color indicatorGlow;
}

class AppCardColors {
  const AppCardColors({
    required this.background,
    required this.border,
    required this.borderHighlight,
    required this.borderSuccess,
    required this.backgroundRaised,
    required this.backgroundGoldTint,
    required this.backgroundHighlight,
    required this.backgroundLocked,
    required this.auctionStat,
    required this.imageHairline,
  });

  static final AppCardColors dark = AppCardColors(
    background: AppPalette.surfaceCard,
    border: AppPalette.outline,
    borderHighlight: AppPalette.gold.a30,
    borderSuccess: AppPalette.success.a30,
    backgroundRaised: AppPalette.surfaceRaised,
    backgroundGoldTint: AppPalette.gold.a10,
    backgroundHighlight: AppGradients.highlightCard,
    backgroundLocked: AppPalette.outline,
    auctionStat: AppGradients.auctionBidCard,
    imageHairline: AppPalette.white.a10,
  );

  final Color background;
  final Color border;
  final Color borderHighlight;
  final Color borderSuccess;
  final Color backgroundRaised;
  final Color backgroundGoldTint;

  /// Wash behind a card the design singles out, such as the current badge.
  final LinearGradient backgroundHighlight;

  /// Fill of a locked exclusive-content tile, which the design paints in the
  /// outline tone rather than the raised one.
  final Color backgroundLocked;

  /// Fill of the auction's two bid cards, which are washed rather than flat.
  final LinearGradient auctionStat;

  final Color imageHairline;
}

class AppButtonColors {
  const AppButtonColors({
    required this.primaryBackground,
    required this.primaryLabel,
    required this.primaryGlow,
    required this.primaryDisabledBackground,
    required this.primaryDisabledLabel,
    required this.secondaryBackground,
    required this.secondaryBorder,
    required this.secondaryLabel,
    required this.tonalBackground,
    required this.tonalBorder,
    required this.tonalLabel,
    required this.outlineBorder,
    required this.outlineLabel,
    required this.outlineGoldBackground,
    required this.outlineGoldBorder,
    required this.outlineGoldLabel,
    required this.socialBackground,
    required this.socialBorder,
    required this.socialLabel,
    required this.textLabel,
    required this.destructiveLabel,
  });

  static final AppButtonColors dark = AppButtonColors(
    primaryBackground: AppPalette.goldCta,
    primaryLabel: AppPalette.surface,
    primaryGlow: AppPalette.gold.a40,
    primaryDisabledBackground: AppPalette.gold.a30,
    primaryDisabledLabel: AppPalette.gold.a50,
    secondaryBackground: AppPalette.surfaceRaised,
    secondaryBorder: AppPalette.outline,
    secondaryLabel: AppPalette.textSecondary,
    tonalBackground: AppPalette.surfaceRaised,
    tonalBorder: AppPalette.gold.a10,
    tonalLabel: AppPalette.gold,
    outlineBorder: AppPalette.gold.a30,
    outlineLabel: AppPalette.goldLight,
    outlineGoldBackground: AppPalette.gold.a10,
    outlineGoldBorder: AppPalette.gold,
    outlineGoldLabel: AppPalette.gold,
    socialBackground: AppPalette.authContainer,
    socialBorder: AppPalette.authOutline,
    socialLabel: AppPalette.white,
    textLabel: AppPalette.gold,
    destructiveLabel: AppPalette.error,
  );

  final Color primaryBackground;
  final Color primaryLabel;
  final Color primaryGlow;
  final Color primaryDisabledBackground;
  final Color primaryDisabledLabel;
  final Color secondaryBackground;
  final Color secondaryBorder;
  final Color secondaryLabel;
  final Color tonalBackground;
  final Color tonalBorder;
  final Color tonalLabel;
  final Color outlineBorder;
  final Color outlineLabel;
  final Color outlineGoldBackground;
  final Color outlineGoldBorder;
  final Color outlineGoldLabel;
  final Color socialBackground;
  final Color socialBorder;
  final Color socialLabel;
  final Color textLabel;
  final Color destructiveLabel;
}

class AppChipColors {
  const AppChipColors({
    required this.filterActiveBackground,
    required this.filterActiveLabel,
    required this.filterInactiveBackground,
    required this.filterInactiveLabel,
  });

  static const AppChipColors dark = AppChipColors(
    filterActiveBackground: AppPalette.gold,
    filterActiveLabel: AppPalette.surface,
    filterInactiveBackground: AppPalette.surfaceRaised,
    filterInactiveLabel: AppPalette.textSecondary,
  );

  final Color filterActiveBackground;
  final Color filterActiveLabel;
  final Color filterInactiveBackground;
  final Color filterInactiveLabel;
}

///
/// The brand marks the refer sheet's share targets carry. They are the one
/// place the app paints somebody else's colour, so they are named, not inlined.
///
class AppShareColors {
  const AppShareColors({
    required this.whatsapp,
    required this.telegram,
    required this.instagram,
  });

  static const AppShareColors dark = AppShareColors(
    whatsapp: AppBrandColors.whatsapp,
    telegram: AppBrandColors.telegram,
    instagram: AppBrandColors.instagram,
  );

  final Color whatsapp;
  final Color telegram;
  final Color instagram;
}

class AppTagColors {
  const AppTagColors({
    required this.genreBackground,
    required this.genreBorder,
    required this.genreLabel,
    required this.goldBackground,
    required this.goldBorder,
    required this.goldLabel,
    required this.goldSubtleBackground,
    required this.goldSubtleBorder,
    required this.goldSubtleLabel,
  });

  static final AppTagColors dark = AppTagColors(
    genreBackground: AppPalette.surfaceRaised,
    genreBorder: AppPalette.outline,
    genreLabel: AppPalette.textSecondary,
    goldBackground: AppPalette.gold.a20,
    goldBorder: AppPalette.gold.a40,
    goldLabel: AppPalette.goldLight,
    goldSubtleBackground: AppPalette.gold.a10,
    goldSubtleBorder: AppPalette.gold.a30,
    goldSubtleLabel: AppPalette.gold,
  );

  final Color genreBackground;
  final Color genreBorder;
  final Color genreLabel;
  final Color goldBackground;
  final Color goldBorder;
  final Color goldLabel;
  final Color goldSubtleBackground;
  final Color goldSubtleBorder;
  final Color goldSubtleLabel;
}

class AppBadgeColors {
  const AppBadgeColors({
    required this.successBackground,
    required this.successBorder,
    required this.successLabel,
    required this.errorBackground,
    required this.errorBorder,
    required this.errorLabel,
    required this.level2Background,
    required this.level2Border,
    required this.level2Label,
    required this.level1Background,
    required this.level1Border,
    required this.level1Label,
    required this.neutralBackground,
    required this.neutralBorder,
    required this.neutralLabel,
    required this.liveBackground,
    required this.liveLabel,
    required this.discGradient,
  });

  static final AppBadgeColors dark = AppBadgeColors(
    successBackground: AppPalette.success.a10,
    successBorder: AppPalette.success.a30,
    successLabel: AppPalette.success,
    errorBackground: AppPalette.error.a10,
    errorBorder: AppPalette.error.a30,
    errorLabel: AppPalette.error,
    level2Background: AppPalette.yellow.a10,
    level2Border: AppPalette.yellow.a30,
    level2Label: AppPalette.yellow,
    level1Background: AppPalette.goldLevel1.a10,
    level1Border: AppPalette.goldLevel1.a30,
    level1Label: AppPalette.goldLevel1,
    neutralBackground: AppPalette.white.a10,
    neutralBorder: AppPalette.white.a10,
    neutralLabel: AppPalette.white.a60,
    liveBackground: AppPalette.errorDeep,
    liveLabel: AppPalette.white,
    discGradient: AppGradients.goldDisc,
  );

  final Color successBackground;
  final Color successBorder;
  final Color successLabel;
  final Color errorBackground;
  final Color errorBorder;
  final Color errorLabel;
  final Color level2Background;
  final Color level2Border;
  final Color level2Label;
  final Color level1Background;
  final Color level1Border;
  final Color level1Label;
  final Color neutralBackground;
  final Color neutralBorder;
  final Color neutralLabel;
  final Color liveBackground;
  final Color liveLabel;

  /// Fills the disc that carries the badge glyph on the current-badge card.
  final LinearGradient discGradient;
}

class AppPillColors {
  const AppPillColors({
    required this.pointsBackground,
    required this.pointsBorder,
    required this.pointsIcon,
    required this.pointsValue,
    required this.overImageBackground,
    required this.overImageBorder,
    required this.overImageLabel,
  });

  static final AppPillColors dark = AppPillColors(
    pointsBackground: AppPalette.pointsPillBg.a80,
    pointsBorder: AppGradients.pointsPillStroke,
    pointsIcon: AppPalette.gold,
    pointsValue: AppPalette.white,
    overImageBackground: AppPalette.surface.a70,
    overImageBorder: AppPalette.gold.a40,
    overImageLabel: AppPalette.goldLight,
  );

  final Color pointsBackground;
  final LinearGradient pointsBorder;
  final Color pointsIcon;
  final Color pointsValue;
  final Color overImageBackground;
  final Color overImageBorder;
  final Color overImageLabel;
}

class AppSegmentedColors {
  const AppSegmentedColors({
    required this.trackBackground,
    required this.trackBorder,
    required this.activeBackground,
    required this.activeLabel,
    required this.inactiveLabel,
  });

  static const AppSegmentedColors dark = AppSegmentedColors(
    trackBackground: AppPalette.surface,
    trackBorder: AppPalette.outline,
    activeBackground: AppGradients.goldSegment,
    activeLabel: AppPalette.surface,
    inactiveLabel: AppPalette.textMuted,
  );

  final Color trackBackground;
  final Color trackBorder;
  final LinearGradient activeBackground;
  final Color activeLabel;
  final Color inactiveLabel;
}

class AppTabColors {
  const AppTabColors({
    required this.activeBorder,
    required this.activeLabel,
    required this.inactiveBackground,
    required this.inactiveBorder,
    required this.inactiveLabel,
  });

  static const AppTabColors dark = AppTabColors(
    activeBorder: AppPalette.gold,
    activeLabel: AppPalette.gold,
    inactiveBackground: AppPalette.surfaceCard,
    inactiveBorder: AppPalette.outline,
    inactiveLabel: AppPalette.textMuted,
  );

  final Color activeBorder;
  final Color activeLabel;
  final Color inactiveBackground;
  final Color inactiveBorder;
  final Color inactiveLabel;
}

class AppInputColors {
  const AppInputColors({
    required this.background,
    required this.border,
    required this.text,
    required this.placeholder,
    required this.label,
    required this.focusBorder,
    required this.focusGlow,
    required this.errorBorder,
    required this.errorGlow,
  });

  static final AppInputColors dark = AppInputColors(
    background: AppPalette.surfaceRaised,
    border: Colors.transparent,
    text: AppPalette.white,
    placeholder: AppPalette.white.a50,
    label: AppPalette.textSecondary,
    focusBorder: AppPalette.gold.a30,
    focusGlow: AppPalette.gold.a20,
    errorBorder: AppPalette.error,
    errorGlow: AppPalette.error.a20,
  );

  final Color background;
  final Color border;
  final Color text;
  final Color placeholder;
  final Color label;
  final Color focusBorder;
  final Color focusGlow;
  final Color errorBorder;
  final Color errorGlow;
}

///
/// The warm palette scoped to auth and onboarding: app roles, not a second
/// ColorScheme, read instead of the surface and outline roles.
///
class AppAuthColors {
  const AppAuthColors({
    required this.surface,
    required this.surfaceContainer,
    required this.outline,
    required this.onSurface,
    required this.onSurfaceVariant,
    required this.onSurfaceMuted,
    required this.inputBackground,
    required this.inputBorder,
    required this.inputPlaceholder,
    required this.inputLabel,
    required this.otpDigit,
  });

  static final AppAuthColors dark = AppAuthColors(
    surface: AppPalette.authSurface,
    surfaceContainer: AppPalette.authContainer,
    outline: AppPalette.authOutline,
    onSurface: AppPalette.white,
    onSurfaceVariant: AppPalette.authTextSecondary,
    onSurfaceMuted: AppPalette.authTextMuted,
    inputBackground: AppPalette.authContainer,
    inputBorder: AppPalette.authOutline,
    inputPlaceholder: AppPalette.white.a50,
    inputLabel: AppPalette.authTextSecondary,
    otpDigit: AppPalette.goldLight,
  );

  final Color surface;
  final Color surfaceContainer;
  final Color outline;
  final Color onSurface;
  final Color onSurfaceVariant;
  final Color onSurfaceMuted;
  final Color inputBackground;
  final Color inputBorder;
  final Color inputPlaceholder;
  final Color inputLabel;
  final Color otpDigit;
}

class AppOnboardingColors {
  const AppOnboardingColors({
    required this.statTileBackground,
    required this.statTileBorder,
    required this.statTileLabel,
    required this.statPillBackground,
    required this.statPillValue,
    required this.statPillCaption,
  });

  static final AppOnboardingColors dark = AppOnboardingColors(
    statTileBackground: AppPalette.white.a10,
    statTileBorder: AppPalette.white.a10,
    statTileLabel: AppPalette.white.a80,
    statPillBackground: AppPalette.gold.a10,
    statPillValue: AppPalette.goldLight,
    statPillCaption: AppPalette.authTextSecondary,
  );

  final Color statTileBackground;
  final Color statTileBorder;
  final Color statTileLabel;
  final Color statPillBackground;
  final Color statPillValue;
  final Color statPillCaption;
}

class AppProgressColors {
  const AppProgressColors({
    required this.track,
    required this.trackRaised,
    required this.fill,
    required this.fillSoft,
    required this.fillSuccess,
    required this.fillWarning,
  });

  static final AppProgressColors dark = AppProgressColors(
    track: AppPalette.outline,
    trackRaised: AppPalette.surfaceRaised,
    fill: AppGradients.progressGold,
    fillSoft: AppGradients.progressGoldSoft,
    fillSuccess: AppPalette.success,
    fillWarning: AppPalette.yellow,
  );

  final Color track;

  /// The track inside a card, which the design lifts off the card's own fill.
  final Color trackRaised;

  final LinearGradient fill;

  /// Held-back fill for the bars that repeat down the My Earns list.
  final LinearGradient fillSoft;

  final Color fillSuccess;
  final Color fillWarning;
}

class AppAvatarColors {
  const AppAvatarColors({
    required this.ring,
    required this.ringEmphasis,
    required this.background,
  });

  static final AppAvatarColors dark = AppAvatarColors(
    ring: AppPalette.gold.a30,
    ringEmphasis: AppPalette.gold,
    background: AppPalette.pointsPillBg,
  );

  final Color ring;
  final Color ringEmphasis;
  final Color background;
}

class AppSheetColors {
  const AppSheetColors({
    required this.background,
    required this.border,
    required this.handle,
    required this.handleModal,
    required this.closeBackground,
    required this.routeBackground,
    required this.shadow,
    required this.scrim,
    required this.auctionBidBar,
  });

  static final AppSheetColors dark = AppSheetColors(
    background: AppPalette.surfaceCard,
    border: AppPalette.outline,
    handle: AppPalette.textMuted,
    handleModal: AppPalette.outline,
    closeBackground: AppPalette.surfaceRaised.a60,
    routeBackground: Colors.transparent,
    shadow: AppPalette.black.a60,
    scrim: AppPalette.surface.a80,
    auctionBidBar: AppGradients.auctionBidBar,
  );

  final Color background;
  final Color border;
  final Color handle;

  /// The dimmer handle a modal sheet draws, where the sheet is the whole view.
  final Color handleModal;

  /// The disc behind a modal sheet's close button.
  final Color closeBackground;

  ///
  /// What the route and scaffold behind a self-drawing sheet paint. Those
  /// sheets hug their content, so an opaque backdrop would cover the screen.
  ///
  final Color routeBackground;

  final Color shadow;
  final Color scrim;

  /// Fill of the auction's pinned bid bar, which warms as it falls.
  final LinearGradient auctionBidBar;
}

///
/// Scrims over imagery, plus [header] and [splash], which sit under a screen
/// rather than over a still. The two `imageDim` roles are opacities, not colours.
///
class AppOverlayColors {
  const AppOverlayColors({
    required this.hero,
    required this.topBar,
    required this.gameCard,
    required this.gameCardBottom,
    required this.onboarding,
    required this.onboardingVignette,
    required this.auctionHero,
    required this.header,
    required this.splash,
    required this.imageDimOnboarding,
    required this.imageDimStreakIntro,
  });

  static final AppOverlayColors dark = AppOverlayColors(
    hero: AppGradients.heroScrim,
    topBar: AppGradients.topBarScrim,
    gameCard: AppGradients.gameCardScrim,
    gameCardBottom: AppGradients.gameCardScrimBottom,
    onboarding: AppGradients.onboardingScrim,
    onboardingVignette: AppGradients.onboardingVignette,
    auctionHero: AppGradients.auctionHeroScrim,
    header: AppGradients.headerFade,
    splash: AppGradients.splashBg,
    imageDimOnboarding: 0.30,
    imageDimStreakIntro: 0.50,
  );

  final LinearGradient hero;
  final LinearGradient topBar;
  final LinearGradient gameCard;
  final LinearGradient gameCardBottom;
  final LinearGradient onboarding;
  final RadialGradient onboardingVignette;

  /// Over the auction still. Darkens throughout, where [hero] clears a band.
  final LinearGradient auctionHero;

  /// Fills the header block on Rewards, P2P and Badges, from the screen top
  /// down past the balance row.
  final LinearGradient header;

  final LinearGradient splash;
  final double imageDimOnboarding;
  final double imageDimStreakIntro;
}

///
/// Status colours. The design draws no informational status, so there is no
/// info role: a screen that needs one is a stop, not a seed-derived guess.
///
class AppStatusColors {
  const AppStatusColors({
    required this.success,
    required this.warning,
    required this.error,
    required this.live,
    required this.liveDot,
  });

  static const AppStatusColors dark = AppStatusColors(
    success: AppPalette.success,
    warning: AppPalette.yellow,
    error: AppPalette.error,
    live: AppPalette.error,
    liveDot: AppPalette.success,
  );

  final Color success;
  final Color warning;
  final Color error;
  final Color live;
  final Color liveDot;
}

class AppVoteBarColors {
  const AppVoteBarColors({required this.yes, required this.no});

  static const AppVoteBarColors dark = AppVoteBarColors(
    yes: AppPalette.success,
    no: AppPalette.error,
  );

  final Color yes;
  final Color no;
}

class AppCalendarColors {
  const AppCalendarColors({
    required this.dayLevel1,
    required this.dayLevel2,
    required this.dayFuture,
    required this.dayTodayBackground,
    required this.dayTodayBorder,
  });

  static final AppCalendarColors dark = AppCalendarColors(
    dayLevel1: AppPalette.goldLevel1,
    dayLevel2: AppGradients.progressGold,
    dayFuture: Colors.transparent,
    dayTodayBackground: AppPalette.gold.a10,
    dayTodayBorder: AppPalette.gold.a40,
  );

  final Color dayLevel1;
  final LinearGradient dayLevel2;
  final Color dayFuture;
  final Color dayTodayBackground;
  final Color dayTodayBorder;
}
