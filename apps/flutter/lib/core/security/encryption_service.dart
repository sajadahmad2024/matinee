import 'dart:convert';
import 'dart:math';
import 'dart:typed_data';

import 'package:encrypt/encrypt.dart' as enc;
import 'package:flutter/services.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Service for encrypting/decrypting sensitive data at rest.
///
/// Uses AES-256-GCM encryption with secure key management.
/// Protects user data even if device storage is compromised.
///
/// USAGE:
/// ```dart
/// final encryptionService = getIt<EncryptionService>();
/// await encryptionService.initialize();
///
/// // Encrypt
/// final encrypted = await encryptionService.encrypt('sensitive data');
///
/// // Decrypt
/// final decrypted = await encryptionService.decrypt(encrypted);
/// ```
class EncryptionService {
  final FlutterSecureStorage _secureStorage;

  static const String _keyStorageKey = 'encryption_master_key';

  enc.Key? _masterKey;
  bool _isInitialized = false;

  EncryptionService(this._secureStorage);

  /// Initializes encryption service and generates/retrieves master key
  ///
  /// Must be called before any encryption/decryption operations
  Future<void> initialize() async {
    if (_isInitialized) return;

    String? storedKey;

    // Try to retrieve existing key from secure storage.
    //
    // On some desktop platforms (notably macOS without the proper
    // Keychain entitlements), secure storage access can fail with
    // a PlatformException: "A required entitlement isn't present."
    //
    // In that case we gracefully fall back to an in-memory key so
    // the app can continue to run without crashing, accepting that
    // encryption keys will not persist across app launches.
    try {
      storedKey = await _secureStorage.read(key: _keyStorageKey);
    } on PlatformException catch (e) {
      final message = e.message ?? '';

      final missingEntitlement = message.contains('A required entitlement');
      final hasSecurityCode = message.contains('-34018');

      if (!missingEntitlement && !hasSecurityCode) {
        // Unknown platform/storage error – surface it so it can be fixed.
        rethrow;
      }
    }

    if (storedKey != null) {
      // Use existing key
      _masterKey = enc.Key.fromBase64(storedKey);
    } else {
      // Generate new key
      _masterKey = _generateKey();

      // Attempt to store securely. If this fails due to missing
      // entitlements (common on macOS desktop without Keychain
      // configuration), we keep using the in-memory key only.
      try {
        await _secureStorage.write(
          key: _keyStorageKey,
          value: _masterKey!.base64,
        );
      } on PlatformException catch (e) {
        final message = e.message ?? '';

        final missingEntitlement = message.contains('A required entitlement');
        final hasSecurityCode = message.contains('-34018');

        if (!missingEntitlement && !hasSecurityCode) {
          // Any other error should be handled explicitly by the caller.
          rethrow;
        }
      }
    }

    _isInitialized = true;
  }

  /// Encrypts plain text data using AES-256-GCM
  ///
  /// Returns: base64(IV):base64(encrypted) format
  ///
  /// Example:
  /// ```dart
  /// final encrypted = await service.encrypt('Hello World');
  /// // Returns: "IVBASE64:ENCRYPTEDBASE64"
  /// ```
  Future<String> encrypt(String plainText) async {
    _ensureInitialized();

    // Generate random IV for this encryption
    final iv = _generateIV();

    // Create encrypter
    final encrypter = enc.Encrypter(
      enc.AES(_masterKey!, mode: enc.AESMode.gcm),
    );

    // Encrypt
    final encrypted = encrypter.encrypt(plainText, iv: iv);

    // Return IV:encrypted format (both base64)
    return '${iv.base64}:${encrypted.base64}';
  }

  /// Decrypts encrypted data
  ///
  /// Expects format: base64(IV):base64(encrypted)
  ///
  /// Example:
  /// ```dart
  /// final decrypted = await service.decrypt(encryptedData);
  /// print(decrypted); // "Hello World"
  /// ```
  Future<String> decrypt(String encryptedData) async {
    _ensureInitialized();

    try {
      // Split IV and encrypted data
      final parts = encryptedData.split(':');
      if (parts.length != 2) {
        throw Exception('Invalid encrypted data format');
      }

      final iv = enc.IV.fromBase64(parts[0]);
      final encrypted = enc.Encrypted.fromBase64(parts[1]);

      // Create encrypter
      final encrypter = enc.Encrypter(
        enc.AES(_masterKey!, mode: enc.AESMode.gcm),
      );

      // Decrypt
      return encrypter.decrypt(encrypted, iv: iv);
    } catch (e) {
      throw Exception('Decryption failed: $e');
    }
  }

  /// Encrypts JSON data
  ///
  /// Converts Map to JSON string and encrypts
  ///
  /// Example:
  /// ```dart
  /// final data = {'name': 'John', 'ssn': '123-45-6789'};
  /// final encrypted = await service.encryptJson(data);
  /// ```
  Future<String> encryptJson(Map<String, dynamic> data) async {
    final jsonString = jsonEncode(data);
    return await encrypt(jsonString);
  }

  /// Decrypts to JSON data
  ///
  /// Decrypts and parses JSON string to Map
  ///
  /// Example:
  /// ```dart
  /// final data = await service.decryptJson(encrypted);
  /// print(data['name']); // "John"
  /// ```
  Future<Map<String, dynamic>> decryptJson(String encryptedData) async {
    final decrypted = await decrypt(encryptedData);
    return jsonDecode(decrypted) as Map<String, dynamic>;
  }

  /// Encrypts list of strings
  Future<String> encryptList(List<String> data) async {
    final jsonString = jsonEncode(data);
    return await encrypt(jsonString);
  }

  /// Decrypts to list of strings
  Future<List<String>> decryptList(String encryptedData) async {
    final decrypted = await decrypt(encryptedData);
    final decoded = jsonDecode(decrypted);
    return List<String>.from(decoded as List);
  }

  /// Generates a secure 256-bit (32-byte) encryption key
  enc.Key _generateKey() {
    final random = Random.secure();
    final bytes = List<int>.generate(32, (_) => random.nextInt(256));
    return enc.Key(Uint8List.fromList(bytes));
  }

  /// Generates a random 128-bit (16-byte) IV
  enc.IV _generateIV() {
    final random = Random.secure();
    final bytes = List<int>.generate(16, (_) => random.nextInt(256));
    return enc.IV(Uint8List.fromList(bytes));
  }

  /// Ensures service is initialized before use
  void _ensureInitialized() {
    if (!_isInitialized || _masterKey == null) {
      throw Exception(
        'EncryptionService not initialized. Call initialize() first.',
      );
    }
  }

  /// Rotates encryption key (re-encrypts all data with new key)
  ///
  /// WARNING: Requires re-encrypting all encrypted data
  /// Should only be used when key compromise is suspected
  Future<void> rotateKey() async {
    // Generate new key
    _masterKey = _generateKey();

    // Store new key
    await _secureStorage.write(key: _keyStorageKey, value: _masterKey!.base64);

    // Note: Caller must re-encrypt all existing data
  }

  /// Clears encryption keys from storage
  ///
  /// WARNING: All encrypted data will become unrecoverable
  Future<void> clearKeys() async {
    await _secureStorage.delete(key: _keyStorageKey);
    _masterKey = null;
    _isInitialized = false;
  }

  /// Checks if service is initialized
  bool get isInitialized => _isInitialized;
}
