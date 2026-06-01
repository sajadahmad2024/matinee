library;

/// User entity representing a user in the domain layer.
///
/// Entities are framework-agnostic and should not contain any platform-specific code.
/// They represent the core business objects of the application and must be immutable.
class User {
  /// Unique identifier for the user.
  final String id;

  /// Name of the user.
  final String name;

  /// Phone number associated with the user.
  final String? phoneNumber;

  /// Email address of the user.
  final String email;

  /// Current status of the user (e.g., active, inactive).
  final String? status;

  /// When the user was created.
  final DateTime createdAt;

  /// Last updated timestamp for the user, if available.
  final DateTime? updatedAt;

  /// Creates an immutable [User] entity.
  const User({
    required this.id,
    required this.name,
    this.phoneNumber,
    required this.email,
    this.status,
    required this.createdAt,
    this.updatedAt,
  });

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is User &&
          runtimeType == other.runtimeType &&
          id == other.id &&
          name == other.name &&
          phoneNumber == other.phoneNumber &&
          email == other.email &&
          status == other.status &&
          createdAt == other.createdAt &&
          updatedAt == other.updatedAt;

  @override
  int get hashCode =>
      id.hashCode ^
      name.hashCode ^
      (phoneNumber?.hashCode ?? 0) ^
      email.hashCode ^
      (status?.hashCode ?? 0) ^
      createdAt.hashCode ^
      (updatedAt?.hashCode ?? 0);
}
