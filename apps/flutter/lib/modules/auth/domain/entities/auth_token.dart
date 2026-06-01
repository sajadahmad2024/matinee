library;

/// AuthToken entity representing authentication tokens.
///
/// This entity stores authentication tokens used for API requests.
/// - [accessToken]: The primary access token for authenticated API requests.
/// - [refreshToken]: The token used to obtain a new access token after expiry.
/// - [expiresAt]: Expiration date and time of the access token.
///
/// Entities should be immutable, framework-agnostic, and provide override
/// for equality/hashCode.
class AuthToken {
  /// The primary access token used for API authentication.
  final String accessToken;

  /// The refresh token used to obtain a new access token.
  final String refreshToken;

  /// When the access token expires.
  final DateTime expiresAt;

  /// Creates an immutable [AuthToken] entity.
  const AuthToken({
    required this.accessToken,
    required this.refreshToken,
    required this.expiresAt,
  });

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is AuthToken &&
          runtimeType == other.runtimeType &&
          accessToken == other.accessToken &&
          refreshToken == other.refreshToken &&
          expiresAt == other.expiresAt;

  @override
  int get hashCode =>
      accessToken.hashCode ^ refreshToken.hashCode ^ expiresAt.hashCode;
}
