/// How many native players the feed keeps alive.
///
/// The package keeps a player for the focused reel and [radius] reels on each
/// side, so swiping to a neighbour plays at once. At most `2 * radius + 1`
/// players exist, however long the feed is.
///
/// Set once on `ReelFeedController`; it cannot change later, so it can never
/// tear down players by accident.
class ReelWindow {
  /// Creates a window. The default, 2, keeps 5 players.
  const ReelWindow({this.radius = 2})
    : assert(radius >= 0, 'ReelWindow.radius must be 0 or more.');

  /// Reels kept ready on each side of the focused reel.
  final int radius;

  /// Most players that can exist at once.
  int get maxPlayers => radius * 2 + 1;
}
