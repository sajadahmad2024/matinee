///
/// Where a shared reel links to.
///
/// PLACEHOLDER: there is no public reel page yet, so every share carries a demo link.
///
abstract final class AppShareLinks {
  static Uri reel(String id) => Uri.parse('$_demoBase/$id');

  static const String _demoBase = 'https://matinee.example.com/reels';
}
