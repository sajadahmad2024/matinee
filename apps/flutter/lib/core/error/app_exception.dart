///
/// The closed set of failures the UI can react to. Repositories throw these
/// and nothing else; cubits catch `on AppException` and emit a failure state.
/// Programming errors are never wrapped in one.
///
sealed class AppException implements Exception {
  const AppException();
}

final class NetworkException extends AppException {
  const NetworkException();
}

final class CancelledException extends AppException {
  const CancelledException();
}

final class AuthException extends AppException {
  const AuthException(this.statusCode);

  final int statusCode;
}

final class NotFoundException extends AppException {
  const NotFoundException();
}

final class ValidationException extends AppException {
  const ValidationException(this.statusCode, {this.message});

  final int statusCode;

  // Filled by a project that parses its backend's error body; the mapper leaves it
  // null and the UI falls back to a generic string.
  final String? message;
}

final class ServerException extends AppException {
  const ServerException(this.statusCode);

  final int statusCode;
}
