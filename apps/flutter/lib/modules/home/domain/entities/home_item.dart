library;

/// Simple entity representing an item shown on the home screen.
///
/// This is a placeholder domain model you can extend later
/// with real fields (e.g. stats, cards, shortcuts).
class HomeItem {
  /// Unique identifier for the item.
  final String id;

  /// Display title for the item.
  final String title;

  /// Optional description text.
  final String? description;

  /// Create an immutable [HomeItem] entity.
  const HomeItem({
    required this.id,
    required this.title,
    this.description,
  });

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is HomeItem &&
          runtimeType == other.runtimeType &&
          id == other.id &&
          title == other.title &&
          description == other.description;

  @override
  int get hashCode =>
      id.hashCode ^ title.hashCode ^ (description?.hashCode ?? 0);
}

