/// Abstract storage service interface
///
/// This interface defines methods for storing and retrieving data.
/// Implementations include LocalStorageService and SecureStorageService.
///
/// USAGE EXAMPLES:
///
/// Example 1: Store and retrieve simple data
/// ```dart
/// final storage = LocalStorageService();
///
/// // Store data
/// await storage.write('username', 'john_doe');
/// await storage.write('age', 25);
/// await storage.write('isLoggedIn', true);
///
/// // Retrieve data
/// final username = await storage.read<String>('username');
/// final age = await storage.read<int>('age');
/// final isLoggedIn = await storage.read<bool>('isLoggedIn');
/// ```
///
/// Example 2: Store and retrieve complex objects
/// ```dart
/// // Store user object as JSON
/// final user = {'name': 'John', 'email': 'john@example.com'};
/// await storage.write('user', jsonEncode(user));
///
/// // Retrieve and parse
/// final userJson = await storage.read<String>('user');
/// if (userJson != null) {
///   final user = jsonDecode(userJson);
///   print(user['name']);
/// }
/// ```
///
/// Example 3: Check if key exists and delete
/// ```dart
/// if (await storage.containsKey('token')) {
///   print('Token exists');
///   await storage.delete('token');
/// }
/// ```
abstract class StorageService {
  /// Write data to storage
  Future<void> write<T>(String key, T value);

  /// Read data from storage
  Future<T?> read<T>(String key);

  /// Delete data from storage
  Future<void> delete(String key);

  /// Clear all data from storage
  Future<void> clear();

  /// Check if key exists in storage
  Future<bool> containsKey(String key);

  /// Get all keys from storage
  Future<List<String>> getAllKeys();
}
