import 'dart:convert';

import 'encrypted_storage_service.dart';
import 'local_storage_service.dart';
import 'secure_storage_service.dart';

/// Centralized storage manager that provides unified access to all storage types.
///
/// Automatically routes data to appropriate storage based on sensitivity:
/// - Preferences → LocalStorage (SharedPreferences)
/// - Sensitive → SecureStorage (FlutterSecureStorage)
/// - Highly Sensitive → EncryptedStorage (Double encryption)
///
/// BENEFITS:
/// - Single entry point for all storage operations
/// - Automatic storage type selection
/// - Consistent API across storage types
/// - Easy to test and mock
/// - Centralized storage logic
///
/// USAGE EXAMPLES:
///
/// Example 1: Automatic storage type selection
/// ```dart
/// final storageManager = getIt<StorageManager>();
///
/// // Automatically uses LocalStorage for preferences
/// await storageManager.savePreference('theme', 'dark');
/// final theme = await storageManager.getPreference<String>('theme');
///
/// // Automatically uses SecureStorage for tokens
/// await storageManager.saveSecure('auth_token', 'jwt_token_here');
/// final token = await storageManager.getSecure<String>('auth_token');
///
/// // Automatically uses EncryptedStorage for sensitive data
/// await storageManager.saveEncrypted('ssn', '123-45-6789');
/// final ssn = await storageManager.getEncrypted<String>('ssn');
/// ```
///
/// Example 2: Auth token management
/// ```dart
/// class AuthManager {
///   final StorageManager _storage;
///
///   AuthManager(this._storage);
///
///   Future<void> saveAuthTokens(String access, String refresh) async {
///     await _storage.saveSecure('access_token', access);
///     await _storage.saveSecure('refresh_token', refresh);
///   }
///
///   Future<String?> getAccessToken() async {
///     return await _storage.getSecure<String>('access_token');
///   }
///
///   Future<void> clearAuthTokens() async {
///     await _storage.deleteSecure('access_token');
///     await _storage.deleteSecure('refresh_token');
///   }
/// }
/// ```
///
/// Example 3: User data management
/// ```dart
/// class UserDataManager {
///   final StorageManager _storage;
///
///   UserDataManager(this._storage);
///
///   // Save user preferences (non-sensitive)
///   Future<void> saveUserPreferences(Map<String, dynamic> prefs) async {
///     await _storage.savePreferenceJson('user_prefs', prefs);
///   }
///
///   // Save user profile (contains email, name)
///   Future<void> saveUserProfile(Map<String, dynamic> profile) async {
///     await _storage.saveSecureJson('user_profile', profile);
///   }
///
///   // Save payment info (highly sensitive)
///   Future<void> savePaymentInfo(Map<String, dynamic> payment) async {
///     await _storage.saveEncryptedJson('payment_info', payment);
///   }
/// }
/// ```
class StorageManager {
  final LocalStorageService _localStorage;
  final SecureStorageService _secureStorage;
  final EncryptedStorageService? _encryptedStorage;

  StorageManager({
    required LocalStorageService localStorage,
    required SecureStorageService secureStorage,
    EncryptedStorageService? encryptedStorage,
  }) : _localStorage = localStorage,
       _secureStorage = secureStorage,
       _encryptedStorage = encryptedStorage;

  // ========== LOCAL STORAGE (SharedPreferences) ==========
  // Use for non-sensitive data like user preferences, settings

  /// Save preference to local storage
  Future<void> savePreference<T>(String key, T value) async {
    await _localStorage.write(key, value);
  }

  /// Get preference from local storage
  Future<T?> getPreference<T>(String key) async {
    return await _localStorage.read<T>(key);
  }

  /// Delete preference from local storage
  Future<void> deletePreference(String key) async {
    await _localStorage.delete(key);
  }

  /// Save JSON to local storage
  Future<void> savePreferenceJson(String key, Map<String, dynamic> data) async {
    await _localStorage.write(key, jsonEncode(data));
  }

  /// Get JSON from local storage
  Future<Map<String, dynamic>?> getPreferenceJson(String key) async {
    final jsonString = await _localStorage.read<String>(key);
    if (jsonString == null) return null;
    return jsonDecode(jsonString) as Map<String, dynamic>;
  }

  // ========== SECURE STORAGE (FlutterSecureStorage) ==========
  // Use for sensitive data like tokens, API keys, passwords

  /// Save data to secure storage
  Future<void> saveSecure(String key, String value) async {
    await _secureStorage.writeString(key, value);
  }

  /// Get data from secure storage
  Future<String?> getSecure(String key) async {
    return await _secureStorage.readString(key);
  }

  /// Delete data from secure storage
  Future<void> deleteSecure(String key) async {
    await _secureStorage.delete(key);
  }

  /// Save JSON to secure storage
  Future<void> saveSecureJson(String key, Map<String, dynamic> data) async {
    await _secureStorage.writeString(key, jsonEncode(data));
  }

  /// Get JSON from secure storage
  Future<Map<String, dynamic>?> getSecureJson(String key) async {
    final jsonString = await _secureStorage.readString(key);
    if (jsonString == null) return null;
    return jsonDecode(jsonString) as Map<String, dynamic>;
  }

  // ========== ENCRYPTED STORAGE (Double Encryption) ==========
  // Use for highly sensitive data like SSN, credit cards, medical data

  /// Save data to encrypted storage
  Future<void> saveEncrypted(String key, String value) async {
    if (_encryptedStorage == null) {
      throw Exception(
        'EncryptedStorageService not initialized. '
        'Please implement encryption service first.',
      );
    }
    await _encryptedStorage.write(key, value);
  }

  /// Get data from encrypted storage
  Future<String?> getEncrypted(String key) async {
    if (_encryptedStorage == null) {
      return null;
    }
    return await _encryptedStorage.read<String>(key);
  }

  /// Delete data from encrypted storage
  Future<void> deleteEncrypted(String key) async {
    if (_encryptedStorage == null) return;
    await _encryptedStorage.delete(key);
  }

  /// Save JSON to encrypted storage
  Future<void> saveEncryptedJson(String key, Map<String, dynamic> data) async {
    if (_encryptedStorage == null) {
      throw Exception('EncryptedStorageService not initialized');
    }
    await _encryptedStorage.writeJson(key, data);
  }

  /// Get JSON from encrypted storage
  Future<Map<String, dynamic>?> getEncryptedJson(String key) async {
    if (_encryptedStorage == null) {
      return null;
    }
    return _encryptedStorage.readJson(key);
  }

  // ========== BULK OPERATIONS ==========

  /// Clear all storage (use with caution!)
  Future<void> clearAll() async {
    await _localStorage.clear();
    await _secureStorage.clear();
    if (_encryptedStorage != null) {
      await _encryptedStorage.clear();
    }
  }

  /// Clear only secure and encrypted storage (keep preferences)
  Future<void> clearSecureData() async {
    await _secureStorage.clear();
    if (_encryptedStorage != null) {
      await _encryptedStorage.clear();
    }
  }

  /// Get all keys from local storage
  Future<List<String>> getAllPreferenceKeys() async =>
      _localStorage.getAllKeys();

  /// Get all keys from secure storage
  Future<List<String>> getAllSecureKeys() async => _secureStorage.getAllKeys();

  /// Check if key exists in any storage
  Future<bool> hasKey(String key) async =>
      await _localStorage.containsKey(key) ||
      await _secureStorage.containsKey(key) ||
      (_encryptedStorage != null && await _encryptedStorage.containsKey(key));

  // ========== MIGRATION HELPERS ==========

  /// Migrate data from local to secure storage
  Future<void> migrateToSecure(String key) async {
    final String? value = await _localStorage.read<String>(key);
    if (value != null) {
      await _secureStorage.writeString(key, value);
      await _localStorage.delete(key);
    }
  }

  /// Migrate data from secure to encrypted storage
  Future<void> migrateToEncrypted(String key) async {
    if (_encryptedStorage == null) {
      return;
    }

    final String? value = await _secureStorage.readString(key);
    if (value != null) {
      await _encryptedStorage.write(key, value);
      await _secureStorage.delete(key);
    }
  }

  // ========== BACKUP & RESTORE ==========

  /// Create backup of all secure data
  Future<Map<String, String>> backupSecureData() async =>
      _secureStorage.readAll();

  /// Restore secure data from backup
  Future<void> restoreSecureData(Map<String, String> backup) async {
    for (final MapEntry<String, String> entry in backup.entries) {
      await _secureStorage.writeString(entry.key, entry.value);
    }
  }
}
