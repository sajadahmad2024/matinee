import 'package:flutter/material.dart';
import 'package:matinee/core/theme/app_color_roles.dart';
import 'package:matinee/core/theme/app_palette.dart';

///
/// The app colour roles ColorScheme has no place for: navigation, points pill,
/// badge tiers, the warm auth palette, scrims and the gradients. Read through
/// `context.appColors`; the groups keep the role names close to the design
/// system's own grouping.
///
class AppColors extends ThemeExtension<AppColors> {
  const AppColors({
    required this.text,
    required this.icon,
    required this.appBar,
    required this.bottomNav,
    required this.card,
    required this.button,
    required this.chip,
    required this.tag,
    required this.badge,
    required this.pill,
    required this.segmented,
    required this.tab,
    required this.input,
    required this.auth,
    required this.onboarding,
    required this.progress,
    required this.avatar,
    required this.sheet,
    required this.overlay,
    required this.status,
    required this.voteBar,
    required this.calendar,
    required this.divider,
    required this.dividerAuth,
  });

  static final AppColors dark = AppColors(
    text: AppTextColors.dark,
    icon: AppIconColors.dark,
    appBar: AppBarColors.dark,
    bottomNav: AppBottomNavColors.dark,
    card: AppCardColors.dark,
    button: AppButtonColors.dark,
    chip: AppChipColors.dark,
    tag: AppTagColors.dark,
    badge: AppBadgeColors.dark,
    pill: AppPillColors.dark,
    segmented: AppSegmentedColors.dark,
    tab: AppTabColors.dark,
    input: AppInputColors.dark,
    auth: AppAuthColors.dark,
    onboarding: AppOnboardingColors.dark,
    progress: AppProgressColors.dark,
    avatar: AppAvatarColors.dark,
    sheet: AppSheetColors.dark,
    overlay: AppOverlayColors.dark,
    status: AppStatusColors.dark,
    voteBar: AppVoteBarColors.dark,
    calendar: AppCalendarColors.dark,
    divider: AppPalette.outline,
    dividerAuth: AppPalette.authOutline,
  );

  final AppTextColors text;
  final AppIconColors icon;
  final AppBarColors appBar;
  final AppBottomNavColors bottomNav;
  final AppCardColors card;
  final AppButtonColors button;
  final AppChipColors chip;
  final AppTagColors tag;
  final AppBadgeColors badge;
  final AppPillColors pill;
  final AppSegmentedColors segmented;
  final AppTabColors tab;
  final AppInputColors input;
  final AppAuthColors auth;
  final AppOnboardingColors onboarding;
  final AppProgressColors progress;
  final AppAvatarColors avatar;
  final AppSheetColors sheet;
  final AppOverlayColors overlay;
  final AppStatusColors status;
  final AppVoteBarColors voteBar;
  final AppCalendarColors calendar;
  final Color divider;
  final Color dividerAuth;

  @override
  AppColors copyWith({
    AppTextColors? text,
    AppIconColors? icon,
    AppBarColors? appBar,
    AppBottomNavColors? bottomNav,
    AppCardColors? card,
    AppButtonColors? button,
    AppChipColors? chip,
    AppTagColors? tag,
    AppBadgeColors? badge,
    AppPillColors? pill,
    AppSegmentedColors? segmented,
    AppTabColors? tab,
    AppInputColors? input,
    AppAuthColors? auth,
    AppOnboardingColors? onboarding,
    AppProgressColors? progress,
    AppAvatarColors? avatar,
    AppSheetColors? sheet,
    AppOverlayColors? overlay,
    AppStatusColors? status,
    AppVoteBarColors? voteBar,
    AppCalendarColors? calendar,
    Color? divider,
    Color? dividerAuth,
  }) {
    return AppColors(
      text: text ?? this.text,
      icon: icon ?? this.icon,
      appBar: appBar ?? this.appBar,
      bottomNav: bottomNav ?? this.bottomNav,
      card: card ?? this.card,
      button: button ?? this.button,
      chip: chip ?? this.chip,
      tag: tag ?? this.tag,
      badge: badge ?? this.badge,
      pill: pill ?? this.pill,
      segmented: segmented ?? this.segmented,
      tab: tab ?? this.tab,
      input: input ?? this.input,
      auth: auth ?? this.auth,
      onboarding: onboarding ?? this.onboarding,
      progress: progress ?? this.progress,
      avatar: avatar ?? this.avatar,
      sheet: sheet ?? this.sheet,
      overlay: overlay ?? this.overlay,
      status: status ?? this.status,
      voteBar: voteBar ?? this.voteBar,
      calendar: calendar ?? this.calendar,
      divider: divider ?? this.divider,
      dividerAuth: dividerAuth ?? this.dividerAuth,
    );
  }

  @override
  AppColors lerp(AppColors? other, double t) {
    // The app is dark-only with a single value set, so there is never a second
    // AppColors to cross-fade towards; the roles switch instead of blending.
    if (other is! AppColors) {
      return this;
    }
    return t < 0.5 ? this : other;
  }
}
