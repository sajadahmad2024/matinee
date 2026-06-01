library;

import '../../../../core/errors/exceptions.dart';
import '../../../../core/errors/failures.dart';
import '../../../../core/security/input_sanitizer.dart';
import '../../domain/entities/auth_token.dart';
import '../../domain/entities/user.dart';
import '../../domain/repositories/auth_repository.dart';
import '../datasources/auth_local_datasource.dart';
import '../datasources/auth_remote_datasource.dart';
import '../models/auth_token_model.dart';
import '../models/user_model.dart';

/// Implementation of AuthRepository.
///
/// This class bridges the data layer and domain layer.
/// It orchestrates remote and local data sources and converts exceptions to failures.
/// Handles all authentication-related operations.

class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDataSource _remoteDataSource;
  final AuthLocalDataSource _localDataSource;

  AuthRepositoryImpl(this._remoteDataSource, this._localDataSource);

  /// Map low-level [AppException]s from the data layer to
  /// domain-level [Failure] types.
  Failure _mapExceptionToFailure(AppException exception) {
    if (exception is NetworkException) {
      return NetworkFailure(exception.message);
    } else if (exception is CacheException) {
      return CacheFailure(exception.message);
    } else if (exception is ValidationException) {
      return ValidationFailure(exception.message);
    } else if (exception is RequestTimeoutException) {
      return TimeoutFailure(exception.message);
    } else if (exception is AuthException) {
      return AuthFailure(exception.message);
    } else if (exception is ServerException) {
      return ServerFailure(exception.message);
    } else {
      return UnknownFailure(exception.message);
    }
  }

  @override
  Future<User?> getCurrentUser() async {
    try {
      final ({UserModel? userModel, AuthTokenModel? tokenModel}) remoteResult =
          await _remoteDataSource.getCurrentUser();
      final User? user = remoteResult.userModel?.toEntity();
      final AuthToken? token = remoteResult.tokenModel?.toEntity();

      if (user != null && token != null) {
        await _localDataSource.saveUser(user.toModel());
        await _localDataSource.saveAuthToken(token.toModel());
      }

      return user;
    } on AppException catch (e) {
      throw _mapExceptionToFailure(e);
    } catch (e) {
      throw UnknownFailure('Unexpected error: ${e.toString()}');
    }
  }

  @override
  Future<User> signInWithEmailAndPassword({
    required String email,
    required String password,
  }) async {
    try {
      final String sanitizedEmail = InputSanitizer.sanitizeEmail(email);
      final String sanitizedPassword =
          InputSanitizer.removeControlCharacters(password);
      final ({UserModel? userModel, AuthTokenModel? tokenModel}) remoteResult =
          await _remoteDataSource.signInWithEmailAndPassword(
        email: sanitizedEmail,
        password: sanitizedPassword,
      );
      final User? user = remoteResult.userModel?.toEntity();
      final AuthToken? token = remoteResult.tokenModel?.toEntity();

      if (user == null || token == null) {
        throw UnknownFailure(
          'Login succeeded but user or token was missing.',
        );
      }

      await _localDataSource.saveUser(user.toModel());
      await _localDataSource.saveAuthToken(token.toModel());

      return user;
    } on AppException catch (e) {
      throw _mapExceptionToFailure(e);
    } catch (e) {
      throw UnknownFailure('Unexpected error: ${e.toString()}');
    }
  }

  @override
  Future<User> registerWithEmailAndPassword({
    required String email,
    required String password,
    required String name,
  }) async {
    try {
      final String sanitizedEmail = InputSanitizer.sanitizeEmail(email);
      final String sanitizedPassword =
          InputSanitizer.removeControlCharacters(password);
      final ({UserModel? userModel, AuthTokenModel? tokenModel}) remoteResult =
          await _remoteDataSource.registerWithEmailAndPassword(
        email: sanitizedEmail,
        password: sanitizedPassword,
        name: name,
      );
      final User? user = remoteResult.userModel?.toEntity();
      final AuthToken? token = remoteResult.tokenModel?.toEntity();

      if (user == null || token == null) {
        throw UnknownFailure(
          'Registration succeeded but user or token was missing.',
        );
      }

      await _localDataSource.saveUser(user.toModel());
      await _localDataSource.saveAuthToken(token.toModel());

      return user;
    } on AppException catch (e) {
      throw _mapExceptionToFailure(e);
    } catch (e) {
      throw UnknownFailure('Unexpected error: ${e.toString()}');
    }
  }

  @override
  Future<void> signOut() async {
    try {
      await _remoteDataSource.signOut();
      await _localDataSource.clearAuthData();
    } on AppException catch (e) {
      throw _mapExceptionToFailure(e);
    } catch (e) {
      throw UnknownFailure('Unexpected error: ${e.toString()}');
    }
  }

  @override
  Future<bool> isAuthenticated() async {
    try {
      final AuthTokenModel? tokenModel = await _localDataSource.getCachedToken();
      if (tokenModel == null) {
        return false;
      }
      return tokenModel.expiresAt.isAfter(DateTime.now());
    } on AppException catch (e) {
      throw _mapExceptionToFailure(e);
    } catch (e) {
      throw UnknownFailure('Unexpected error: ${e.toString()}');
    }
  }

  @override
  Future<AuthToken?> refreshAuthToken({
    required String refreshToken,
  }) async {
    try {
      final AuthTokenModel? tokenModel =
          await _remoteDataSource.refreshAuthToken(
        refreshToken: refreshToken,
      );
      final AuthToken? token = tokenModel?.toEntity();
      if (token != null) {
        await _localDataSource.saveAuthToken(token.toModel());
      }
      return token;
    } on AppException catch (e) {
      throw _mapExceptionToFailure(e);
    } catch (e) {
      throw UnknownFailure('Unexpected error: ${e.toString()}');
    }
  }

  @override
  Future<void> sendEmailVerification() async {
    try {
      await _remoteDataSource.sendEmailVerification();
    } on AppException catch (e) {
      throw _mapExceptionToFailure(e);
    } catch (e) {
      throw UnknownFailure('Unexpected error: ${e.toString()}');
    }
  }

  @override
  Future<bool> isEmailVerified() async {
    try {
      final bool isVerified = await _remoteDataSource.isEmailVerified();
      return isVerified;
    } on AppException catch (e) {
      throw _mapExceptionToFailure(e);
    } catch (e) {
      throw UnknownFailure('Unexpected error: ${e.toString()}');
    }
  }
}
