class AppException implements Exception {
  final String message;

  const AppException(this.message);

  @override
  String toString() => message;
}

/// Server exception - API returned an error
///
/// Use this when:
/// - API returns 4xx or 5xx status code
/// - Server response indicates an error
///
/// Example:
/// ```dart
/// if (response.statusCode >= 400) {
///   throw ServerException('Server error: ${response.data['message']}');
/// }
/// ```
class ServerException extends AppException {
  const ServerException(super.message);
}

/// Network exception - No internet connection
///
/// Use this when:
/// - Device has no internet
/// - Request timeout
/// - Cannot reach server
///
/// Example:
/// ```dart
/// final isConnected = await networkInfo.isConnected;
/// if (!isConnected) {
///   throw NetworkException('No internet connection');
/// }
/// ```
class NetworkException extends AppException {
  const NetworkException(super.message);
}

/// Cache exception - Local storage error
///
/// Use this when:
/// - Cannot read from local storage
/// - Cannot write to local storage
/// - Data corruption
///
/// Example:
/// ```dart
/// try {
///   final data = await localStorage.read('user_data');
/// } catch (e) {
///   throw CacheException('Failed to read local data');
/// }
/// ```
class CacheException extends AppException {
  const CacheException(super.message);
}

/// Authentication exception - Auth-related errors
///
/// Use this when:
/// - Login fails
/// - Token is invalid
/// - Session expired
///
/// Example:
/// ```dart
/// if (response.statusCode == 401) {
///   throw AuthException('Invalid credentials');
/// }
/// ```
class AuthException extends AppException {
  const AuthException(super.message);
}

/// Validation exception - Invalid input
///
/// Use this when:
/// - Form validation fails
/// - Required field is empty
/// - Invalid format
///
/// Example:
/// ```dart
/// if (email.isEmpty || !email.contains('@')) {
///   throw ValidationException('Invalid email format');
/// }
/// ```
class ValidationException extends AppException {
  const ValidationException(super.message);
}

/// Request timeout exception - request took too long.
///
/// Use when request exceeds timeout or server doesn't respond.
/// Named RequestTimeoutException to avoid clash with dart:async.TimeoutException.
class RequestTimeoutException extends AppException {
  const RequestTimeoutException(super.message);
}
