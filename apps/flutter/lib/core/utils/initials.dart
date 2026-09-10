///
/// The first letter of each of the first two words, which is what a name
/// without a photo shows on an avatar.
///
String initialsOf(String name) {
  final words = name.trim().split(_whitespace).where((word) => word.isNotEmpty);
  return words.take(2).map((word) => word[0].toUpperCase()).join();
}

/// Compiled once: a RegExp literal is not const, so this would rebuild per call.
final RegExp _whitespace = RegExp(r'\s+');
