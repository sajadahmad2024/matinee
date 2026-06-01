library;

import '../models/user_model.dart';
import '../models/auth_token_model.dart';

/// Abstract interface for remote authentication data source.
///
/// Handles all remote API calls for authentication.
/// Methods throw AppException on errors instead of returning Failures.
abstract class AuthRemoteDataSource {
  /// Gets the current authenticated user and token from the remote source.
  ///
  /// Throws [AppException] on error.
  Future<({UserModel? userModel, AuthTokenModel? tokenModel})> getCurrentUser();

  /// Signs in with email and password remotely and returns user and token models.
  ///
  /// Throws [AppException] on error.
  Future<({UserModel? userModel, AuthTokenModel? tokenModel})> signInWithEmailAndPassword({
    required String email,
    required String password,
  });

  /// Registers a user with email, password, and name remotely and returns user and token models.
  ///
  /// Throws [AppException] on error.
  Future<({UserModel? userModel, AuthTokenModel? tokenModel})> registerWithEmailAndPassword({
    required String email,
    required String password,
    required String name,
  });

  /// Signs out remotely.
  ///
  /// Throws [AppException] on error.
  Future<void> signOut();

  /// Refreshes authentication token remotely.
  ///
  /// Throws [AppException] on error.
  Future<AuthTokenModel?> refreshAuthToken({required String refreshToken});

  /// Sends an email verification to the current user.
  ///
  /// Throws [AppException] on error.
  Future<void> sendEmailVerification();

  /// Checks if the current user's email is verified.
  ///
  /// Throws [AppException] on error.
  Future<bool> isEmailVerified();
}

/// Implementation of [AuthRemoteDataSource].
///
/// NOTE: In production, inject your remote API dependencies (e.g. FirebaseAuth) into this class.
/// This stub exists so the repository and domain contracts remain connected.
class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  // TODO: Inject actual remote API dependencies in constructor (e.g. FirebaseAuth, Dio, etc.)

  AuthRemoteDataSourceImpl();

  @override
  Future<({UserModel? userModel, AuthTokenModel? tokenModel})> getCurrentUser() {
    // TODO: Implement remote call and mapping logic.
    throw UnimplementedError();
  }

  @override
  Future<({UserModel? userModel, AuthTokenModel? tokenModel})> signInWithEmailAndPassword({
    required String email,
    required String password,
  }) {
    // TODO: Implement remote call and mapping logic.
    throw UnimplementedError();
  }

  @override
  Future<({UserModel? userModel, AuthTokenModel? tokenModel})> registerWithEmailAndPassword({
    required String email,
    required String password,
    required String name,
  }) {
    // TODO: Implement remote call and mapping logic.
    throw UnimplementedError();
  }

  @override
  Future<void> signOut() {
    // TODO: Implement remote sign out.
    throw UnimplementedError();
  }

  @override
  Future<AuthTokenModel?> refreshAuthToken({required String refreshToken}) {
    // TODO: Implement remote token refresh.
    throw UnimplementedError();
  }

  @override
  Future<void> sendEmailVerification() {
    // TODO: Implement email verification remote call.
    throw UnimplementedError();
  }

  @override
  Future<bool> isEmailVerified() {
    // TODO: Implement remote email verification check.
    throw UnimplementedError();
  }
}
