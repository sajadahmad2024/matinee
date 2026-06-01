/// Model for authentication token for API requests.
///
/// Handles conversion between JSON and the [AuthToken] domain entity.
/// Implements value equality and immutability using pure Dart (no Freezed).
import '../../domain/entities/auth_token.dart';

class AuthTokenModel {
  /// Primary access token for authentication.
  final String accessToken;

  /// Token used to refresh the access token.
  final String refreshToken;

  /// Expiry time of the access token.
  final DateTime expiresAt;

  /// Creates an immutable [AuthTokenModel].
  const AuthTokenModel({
    required this.accessToken,
    required this.refreshToken,
    required this.expiresAt,
  });

  /// Factory to create model from JSON map.
  factory AuthTokenModel.fromJson(Map<String, dynamic> json) => AuthTokenModel(
    accessToken: json['accessToken'] as String,
    refreshToken: json['refreshToken'] as String,
    expiresAt: DateTime.parse(json['expiresAt'] as String),
  );

  /// Convert model to JSON map.
  Map<String, dynamic> toJson() => {
    'accessToken': accessToken,
    'refreshToken': refreshToken,
    'expiresAt': expiresAt.toIso8601String(),
  };

  /// Create a model from domain entity.
  factory AuthTokenModel.fromEntity(AuthToken entity) => AuthTokenModel(
    accessToken: entity.accessToken,
    refreshToken: entity.refreshToken,
    expiresAt: entity.expiresAt,
  );

  /// Convert this model into the domain entity.
  AuthToken toEntity() => AuthToken(
    accessToken: accessToken,
    refreshToken: refreshToken,
    expiresAt: expiresAt,
  );

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is AuthTokenModel &&
          runtimeType == other.runtimeType &&
          accessToken == other.accessToken &&
          refreshToken == other.refreshToken &&
          expiresAt == other.expiresAt;

  @override
  int get hashCode =>
      accessToken.hashCode ^ refreshToken.hashCode ^ expiresAt.hashCode;
}

extension AuthTokenEntityMapper on AuthToken {
  /// Convert domain [AuthToken] to [AuthTokenModel].
  AuthTokenModel toModel() => AuthTokenModel.fromEntity(this);
}
