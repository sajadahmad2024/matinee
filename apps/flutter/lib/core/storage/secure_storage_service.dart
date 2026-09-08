import 'package:flutter_secure_storage/flutter_secure_storage.dart';

///
/// Keychain on Apple platforms, Keystore-backed storage on Android. The only
/// place tokens or other sensitive values may be persisted.
///
class SecureStorageService {
  const SecureStorageService([this._storage = const FlutterSecureStorage()]);

  final FlutterSecureStorage _storage;

  Future<String?> read(String key) => _storage.read(key: key);

  Future<void> write(String key, String value) => _storage.write(key: key, value: value);

  Future<void> delete(String key) => _storage.delete(key: key);
}
