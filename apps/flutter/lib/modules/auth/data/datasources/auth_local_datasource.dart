library;

import 'dart:convert';

import '../../../../core/services/storage/secure_storage_service.dart';
import '../../../../core/services/storage/local_storage_service.dart';
import '../../../../config/constants/storage_keys.dart';
import '../models/user_model.dart';
import '../models/auth_token_model.dart';

/// Abstract interface for local authentication data source.
///
/// This datasource handles local storage of authentication data.
/// Uses SecureStorageService for sensitive data (tokens).
/// Uses LocalStorageService for non-sensitive data (user info).
abstract class AuthLocalDataSource {
  Future<void> saveUser(UserModel user);
  Future<void> saveAuthToken(AuthTokenModel token);
  Future<UserModel?> getCachedUser();
  Future<AuthTokenModel?> getCachedToken();
  Future<bool> hasValidAuthToken();
  Future<void> clearAuthData();
}

/// Implementation of AuthLocalDataSource.
///
/// Uses SecureStorageService for tokens and LocalStorageService for user info.
/// All storage keys must be from StorageKeys constants.
class AuthLocalDataSourceImpl implements AuthLocalDataSource {
  final SecureStorageService _secureStorage;
  final LocalStorageService _localStorage;

  AuthLocalDataSourceImpl(this._secureStorage, this._localStorage);

  @override
  Future<void> saveUser(UserModel user) async {
    await _localStorage.write(
      StorageKeys.user,
      jsonEncode(user.toJson()),
    );
  }

  @override
  Future<void> saveAuthToken(AuthTokenModel token) async {
    await _secureStorage.write(
      StorageKeys.authToken,
      jsonEncode(token.toJson()),
    );
  }

  @override
  Future<UserModel?> getCachedUser() async {
    final data = await _localStorage.read<String>(StorageKeys.user);
    if (data == null) return null;
    try {
      return UserModel.fromJson(jsonDecode(data));
    } catch (_) {
      return null;
    }
  }

  @override
  Future<AuthTokenModel?> getCachedToken() async {
    final data = await _secureStorage.read(StorageKeys.authToken);
    if (data == null) return null;
    try {
      return AuthTokenModel.fromJson(jsonDecode(data));
    } catch (_) {
      return null;
    }
  }

  @override
  Future<bool> hasValidAuthToken() async {
    final tokenModel = await getCachedToken();
    if (tokenModel == null) return false;
    // Check if token has expired
    return tokenModel.expiresAt.isAfter(DateTime.now());
  }

  @override
  Future<void> clearAuthData() async {
    await _secureStorage.delete(StorageKeys.authToken);
    await _localStorage.delete(StorageKeys.user);
  }
}
