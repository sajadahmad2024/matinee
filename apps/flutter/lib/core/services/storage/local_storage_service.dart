import 'package:shared_preferences/shared_preferences.dart';
import 'storage_service.dart';

/// Local storage service using SharedPreferences
///
/// Use this for non-sensitive data like user preferences, settings, etc.
/// For sensitive data (tokens, passwords), use SecureStorageService instead.
///
/// USAGE EXAMPLES:
///
/// Example 1: Basic usage
/// ```dart
/// final storage = LocalStorageService();
///
/// // Store data
/// await storage.write('theme', 'dark');
/// await storage.write('fontSize', 16);
/// await storage.write('notificationsEnabled', true);
///
/// // Read data
/// final theme = await storage.read<String>('theme') ?? 'light';
/// final fontSize = await storage.read<int>('fontSize') ?? 14;
/// final notificationsEnabled = await storage.read<bool>('notificationsEnabled') ?? true;
/// ```
///
/// Example 2: Store user preferences
/// ```dart
/// class UserPreferences {
///   final LocalStorageService _storage = LocalStorageService();
///
///   Future<void> saveLanguage(String language) async {
///     await _storage.write(StorageKeys.language, language);
///   }
///
///   Future<String> getLanguage() async {
///     return await _storage.read<String>(StorageKeys.language) ?? 'en';
///   }
///
///   Future<void> saveThemeMode(String mode) async {
///     await _storage.write(StorageKeys.themeMode, mode);
///   }
///
///   Future<String> getThemeMode() async {
///     return await _storage.read<String>(StorageKeys.themeMode) ?? 'system';
///   }
/// }
/// ```
///
/// Example 3: Store list of strings
/// ```dart
/// // Save recent searches
/// final searches = ['flutter', 'dart', 'firebase'];
/// await storage.write('recentSearches', searches);
///
/// // Retrieve recent searches
/// final recentSearches = await storage.read<List<String>>('recentSearches') ?? [];
/// ```
class LocalStorageService implements StorageService {
  SharedPreferences? _prefs;

  /// Get SharedPreferences instance
  Future<SharedPreferences> get _instance async {
    _prefs ??= await SharedPreferences.getInstance();
    return _prefs!;
  }

  @override
  Future<void> write<T>(String key, T value) async {
    final prefs = await _instance;

    if (value is String) {
      await prefs.setString(key, value);
    } else if (value is int) {
      await prefs.setInt(key, value);
    } else if (value is double) {
      await prefs.setDouble(key, value);
    } else if (value is bool) {
      await prefs.setBool(key, value);
    } else if (value is List<String>) {
      await prefs.setStringList(key, value);
    } else {
      throw Exception(
        'Unsupported type: ${value.runtimeType}. '
        'Supported types: String, int, double, bool, List<String>',
      );
    }
  }

  @override
  Future<T?> read<T>(String key) async {
    final prefs = await _instance;

    final value = prefs.get(key);

    if (value == null) return null;

    // Type checking and casting
    if (value is T) {
      return value as T;
    }

    return null;
  }

  @override
  Future<void> delete(String key) async {
    final prefs = await _instance;
    await prefs.remove(key);
  }

  @override
  Future<void> clear() async {
    final prefs = await _instance;
    await prefs.clear();
  }

  @override
  Future<bool> containsKey(String key) async {
    final prefs = await _instance;
    return prefs.containsKey(key);
  }

  @override
  Future<List<String>> getAllKeys() async {
    final prefs = await _instance;
    return prefs.getKeys().toList();
  }

  /// Get string value
  Future<String?> getString(String key) async {
    return await read<String>(key);
  }

  /// Get int value
  Future<int?> getInt(String key) async {
    return await read<int>(key);
  }

  /// Get double value
  Future<double?> getDouble(String key) async {
    return await read<double>(key);
  }

  /// Get bool value
  Future<bool?> getBool(String key) async {
    return await read<bool>(key);
  }

  /// Get string list value
  Future<List<String>?> getStringList(String key) async {
    return await read<List<String>>(key);
  }

  /// Set string value
  Future<void> setString(String key, String value) async {
    await write(key, value);
  }

  /// Set int value
  Future<void> setInt(String key, int value) async {
    await write(key, value);
  }

  /// Set double value
  Future<void> setDouble(String key, double value) async {
    await write(key, value);
  }

  /// Set bool value
  Future<void> setBool(String key, bool value) async {
    await write(key, value);
  }

  /// Set string list value
  Future<void> setStringList(String key, List<String> value) async {
    await write(key, value);
  }
}
