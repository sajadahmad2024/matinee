library;

/// Base class for all failures.
///
/// Failures represent domain‑level error conditions that can be
/// thrown from repositories and use cases instead of low‑level
/// exceptions. Each concrete subclass models a specific category.
abstract class Failure {
  final String message;
  Failure(this.message);

  @override
  String toString() => message;
}

/// Server‑side failure for API errors (4xx/5xx responses).
class ServerFailure extends Failure {
  ServerFailure(super.message);
}

/// Authentication failure (login, token, or permissions issues).
class AuthFailure extends Failure {
  AuthFailure(super.message);
}

/// Network failure (no internet, DNS issues, or connection problems).
class NetworkFailure extends Failure {
  NetworkFailure(super.message);
}

/// Cache failure for local storage read/write or corruption problems.
class CacheFailure extends Failure {
  CacheFailure(super.message);
}

/// Validation failure when user input or parameters are invalid.
class ValidationFailure extends Failure {
  ValidationFailure(super.message);
}

/// Timeout failure when a request exceeds its allowed duration.
class TimeoutFailure extends Failure {
  TimeoutFailure(super.message);
}

/// Unknown failure used as a fallback for unexpected errors.
class UnknownFailure extends Failure {
  UnknownFailure(super.message);
}
