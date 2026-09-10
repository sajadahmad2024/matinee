///
/// Paths of the icon files bundled with the app.
///
/// The design system plans one icon font for the ~40 single-colour glyphs and
/// SVG for multi-colour marks only. Until it exists, they all ship as SVG.
///
abstract final class AppIconAssets {
  static const String google = 'assets/icons/google.svg';

  static const String navHome = 'assets/icons/nav_home.svg';
  static const String navHomeActive = 'assets/icons/nav_home_active.svg';
  static const String navP2p = 'assets/icons/nav_p2p.svg';
  static const String navP2pActive = 'assets/icons/nav_p2p_active.svg';

  ///
  /// Rewards and Profile have no filled counterpart; the design never drew one.
  /// Their selected state reads from the tint, the bolder label and indicator.
  ///
  static const String navRewards = 'assets/icons/nav_rewards.svg';
  static const String navProfile = 'assets/icons/nav_profile.svg';

  /// The My Earns rows, one glyph per source of points.
  static const String fire = 'assets/icons/fire.svg';
  static const String helpCircle = 'assets/icons/help_circle.svg';
  static const String trophyCup = 'assets/icons/trophy_cup.svg';

  ///
  /// The same glyph the P2P tab draws, exported again at content size. The two
  /// fold into one when the icon font lands.
  ///
  static const String puzzle = 'assets/icons/puzzle.svg';

  /// The badge grid and the current-badge disc.
  static const String trophyMedal = 'assets/icons/trophy_medal.svg';
  static const String check = 'assets/icons/check.svg';
  static const String lock = 'assets/icons/lock.svg';
}
