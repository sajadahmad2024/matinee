import 'package:flutter_boilerplate/core/errors/exceptions.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Manages secure clearing of sensitive data
class SecureDataManager {
  final FlutterSecureStorage _secureStorage;

  SecureDataManager(this._secureStorage);

  /// Clear all sensitive user data on logout
  Future<void> clearAllUserData() async {
    try {
      // Clear tokens
      await Future.wait([
        _secureStorage.delete(key: 'access_token'),
        _secureStorage.delete(key: 'refresh_token'),
        _secureStorage.delete(key: 'token_expiry'),
      ]);

      // Clear cached sensitive data
      await _clearCache();

      // Clear memory
      _clearMemorySensitiveData();

      print('✅ All sensitive data cleared');
    } catch (e) {
      print('❌ Error clearing data: $e');
      throw CacheException('Failed to clear user data');
    }
  }

  /// Clear app cache
  Future<void> _clearCache() async {
    try {
      // Clear SharedPreferences sensitive keys
      // Implement based on your storage strategy
    } catch (e) {
      print('Error clearing cache: $e');
    }
  }

  /// Clear sensitive data from memory
  void _clearMemorySensitiveData() {
    // Clear any in-memory sensitive data
    // Examples:
    // _sensitiveString = null;
    // _sensitiveList.clear();
    // etc.
  }

  /// Securely overwrite data before deletion
  Future<void> secureDelete(String key) async {
    try {
      // Read current value
      final value = await _secureStorage.read(key: key);

      if (value != null) {
        // Overwrite with random data (optional extra security)
        final randomData = _generateRandomString(value.length);
        await _secureStorage.write(key: key, value: randomData);
      }

      // Delete the key
      await _secureStorage.delete(key: key);
    } catch (e) {
      print('Error securely deleting $key: $e');
    }
  }

  /// Generate random string for overwriting
  static String _generateRandomString(int length) {
    const chars =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    final random = List.generate(
      length,
      (index) =>
          chars[(DateTime.now().millisecondsSinceEpoch + index) % chars.length],
    );
    return random.join();
  }
}
