///
/// Paths of the icon files bundled with the app.
///
/// The design system's plan is one icon font for the ~40 single-colour glyphs
/// and SVG only for multi-colour marks. That font does not exist yet, so the
/// single-colour glyphs below ship as individual SVGs and fold into the font
/// when it is generated.
///
abstract final class AppIconAssets {
  static const String google = 'assets/icons/google.svg';

  static const String navHome = 'assets/icons/nav_home.svg';
  static const String navHomeActive = 'assets/icons/nav_home_active.svg';
  static const String navP2p = 'assets/icons/nav_p2p.svg';
  static const String navP2pActive = 'assets/icons/nav_p2p_active.svg';

  ///
  /// Rewards and Profile have no filled counterpart: the design's nav
  /// component never drew one. Their selected state reads from the gold tint,
  /// the bolder label and the indicator instead.
  ///
  static const String navRewards = 'assets/icons/nav_rewards.svg';
  static const String navProfile = 'assets/icons/nav_profile.svg';
}
