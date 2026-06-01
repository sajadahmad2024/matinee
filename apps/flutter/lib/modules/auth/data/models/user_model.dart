/// Model class for user data storage and conversion.
///
/// Handles serialization, deserialization, and mapping to/from the [User]
/// domain entity. This lives in the data layer and is responsible for
/// JSON (and other persistence) representations of a user.
import '../../domain/entities/user.dart';

/// Immutable data layer representation of a user.
///
/// This model is used for APIs, local storage, and other external
/// representations, and can be converted to/from the domain [User] entity.
class UserModel {
  /// Unique identifier for the user.
  final String id;

  /// Email of the user.
  final String email;

  /// Name of the user.
  final String name;

  /// Optional phone number.
  final String? phoneNumber;

  /// Optional status (e.g. active/inactive).
  final String? status;

  /// When the user model was created.
  final DateTime createdAt;

  /// When the user model was last updated, if available.
  final DateTime? updatedAt;

  /// Create a [UserModel].
  const UserModel({
    required this.id,
    required this.email,
    required this.name,
    this.phoneNumber,
    this.status,
    required this.createdAt,
    this.updatedAt,
  });

  /// Create model from JSON map.
  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] as String,
      email: json['email'] as String,
      name: json['name'] as String,
      phoneNumber: json['phoneNumber'] as String?,
      status: json['status'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'] as String)
          : null,
    );
  }

  /// Convert to JSON map.
  Map<String, dynamic> toJson() => {
        'id': id,
        'email': email,
        'name': name,
        'phoneNumber': phoneNumber,
        'status': status,
        'createdAt': createdAt.toIso8601String(),
        'updatedAt': updatedAt?.toIso8601String(),
      };

  /// Convert this model to the domain [User] entity.
  User toEntity() {
    return User(
      id: id,
      email: email,
      name: name,
      phoneNumber: phoneNumber,
      status: status,
      createdAt: createdAt,
      updatedAt: updatedAt,
    );
  }

  /// Create from domain [User] entity.
  factory UserModel.fromEntity(User entity) {
    return UserModel(
      id: entity.id,
      email: entity.email,
      name: entity.name,
      phoneNumber: entity.phoneNumber,
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is UserModel &&
          runtimeType == other.runtimeType &&
          id == other.id &&
          email == other.email &&
          name == other.name &&
          phoneNumber == other.phoneNumber &&
          status == other.status &&
          createdAt == other.createdAt &&
          updatedAt == other.updatedAt;

  @override
  int get hashCode =>
      id.hashCode ^
      email.hashCode ^
      name.hashCode ^
      (phoneNumber?.hashCode ?? 0) ^
      (status?.hashCode ?? 0) ^
      createdAt.hashCode ^
      (updatedAt?.hashCode ?? 0);
}

/// Extension to convert domain [User] to [UserModel].
extension UserToModel on User {
  UserModel toModel() => UserModel.fromEntity(this);
}
