import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'storage_service.dart';

/// Secure storage service using FlutterSecureStorage
/// Use this for sensitive data like tokens, passwords, API keys, etc.
/// Data is encrypted and stored securely on the device.
///
/// USAGE EXAMPLES:
///
/// Example 1: Store and retrieve auth tokens
/// ```dart
/// final secureStorage = SecureStorageService();
///
/// // Store token after login
/// await secureStorage.write(StorageKeys.accessToken, 'your_jwt_token');
/// await secureStorage.write(StorageKeys.refreshToken, 'your_refresh_token');
///
/// // Retrieve token for API calls
/// final token = await secureStorage.read<String>(StorageKeys.accessToken);
/// if (token != null) {
///   httpClient.setAuthToken(token);
/// }
///
/// // Delete tokens on logout
/// await secureStorage.delete(StorageKeys.accessToken);
/// await secureStorage.delete(StorageKeys.refreshToken);
/// ```
///
/// Example 2: Store user credentials (if remember me is enabled)
/// ```dart
/// class AuthRepository {
///   final SecureStorageService _secureStorage = SecureStorageService();
///
///   Future<void> saveCredentials(String email, String password) async {
///     await _secureStorage.write('saved_email', email);
///     await _secureStorage.write('saved_password', password);
///   }
///
///   Future<Map<String, String>?> getSavedCredentials() async {
///     final email = await _secureStorage.read<String>('saved_email');
///     final password = await _secureStorage.read<String>('saved_password');
///
///     if (email != null && password != null) {
///       return {'email': email, 'password': password};
///     }
///     return null;
///   }
///
///   Future<void> clearSavedCredentials() async {
///     await _secureStorage.delete('saved_email');
///     await _secureStorage.delete('saved_password');
///   }
/// }
/// ```
///
/// Example 3: Store API keys securely
/// ```dart
/// // Store API key
/// await secureStorage.write('stripe_secret_key', 'sk_test_...');
///
/// // Retrieve when needed
/// final apiKey = await secureStorage.read<String>('stripe_secret_key');
/// ```
class SecureStorageService implements StorageService {
  final FlutterSecureStorage _storage;

  SecureStorageService()
    : _storage = const FlutterSecureStorage(
        aOptions: AndroidOptions(encryptedSharedPreferences: true),
        iOptions: IOSOptions(accessibility: KeychainAccessibility.first_unlock),
      );

  @override
  Future<void> write<T>(String key, T value) async {
    if (value == null) {
      await delete(key);
      return;
    }

    // Convert value to string
    final stringValue = value.toString();
    await _storage.write(key: key, value: stringValue);
  }

  @override
  Future<T?> read<T>(String key) async {
    final value = await _storage.read(key: key);

    if (value == null) return null;

    // Return as string (SecureStorage only stores strings)
    // Caller needs to parse if needed
    if (T == String) {
      return value as T;
    }

    // For other types, return the string and let caller parse
    return value as T?;
  }

  @override
  Future<void> delete(String key) async {
    await _storage.delete(key: key);
  }

  @override
  Future<void> clear() async {
    await _storage.deleteAll();
  }

  @override
  Future<bool> containsKey(String key) async {
    return await _storage.containsKey(key: key);
  }

  @override
  Future<List<String>> getAllKeys() async {
    final all = await _storage.readAll();
    return all.keys.toList();
  }

  /// Read string value
  Future<String?> readString(String key) async {
    return await _storage.read(key: key);
  }

  /// Write string value
  Future<void> writeString(String key, String value) async {
    await _storage.write(key: key, value: value);
  }

  /// Read all values as Map
  Future<Map<String, String>> readAll() async {
    return await _storage.readAll();
  }

  /// Delete multiple keys
  Future<void> deleteMultiple(List<String> keys) async {
    for (final key in keys) {
      await delete(key);
    }
  }
}
