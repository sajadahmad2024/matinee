/// Repository interface for authentication operations.
///
/// This is part of the domain layer and defines the contract for
/// authentication operations. The actual implementation should be
/// in the data layer.
///
/// IMPORTANT: This is a placeholder. Actual repository methods
/// should be defined when implementing authentication features.
library;

import '../entities/auth_token.dart';
import '../entities/user.dart';

abstract class AuthRepository {
  /// Get the current authenticated user.
  /// Returns a record with either a Failure or User data.
  Future<User?> getCurrentUser();

  /// Sign in with email and password.
  /// Returns a record with either a Failure or User data.
  Future<User> signInWithEmailAndPassword({
    required String email,
    required String password,
  });

  /// Register a new user with email and password.
  /// Returns a record with either a Failure or User data.
  Future<User> registerWithEmailAndPassword({
    required String email,
    required String password,
    required String name,
  });

  /// Sign out the current user.
  /// Returns a record with either a Failure or void.
  Future<void> signOut();

  /// Check if user is currently authenticated.
  Future<bool> isAuthenticated();

  /// Refresh the authentication token.
  /// Returns a record with either a Failure or updated AuthToken.
  Future<AuthToken?> refreshAuthToken({required String refreshToken});

  /// Send a verification email to the current user.
  /// Returns a record with either a Failure or void.
  Future<void> sendEmailVerification();

  /// Check if the user's email is verified.
  /// Returns a record with either a Failure or the verification status.
  Future<bool> isEmailVerified();
}
