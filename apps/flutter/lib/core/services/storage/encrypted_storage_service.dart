import 'dart:convert';
import '../../security/encryption_service.dart';
import 'secure_storage_service.dart';
import 'storage_service.dart';

/// Encrypted storage service that adds an extra layer of encryption
/// on top of FlutterSecureStorage.
///
/// Use this for highly sensitive data that needs double encryption:
/// 1. First encrypted by FlutterSecureStorage (platform encryption)
/// 2. Then encrypted by EncryptionService (AES-256-GCM)
///
/// WHEN TO USE:
/// - Highly sensitive personal data (SSN, credit cards, etc.)
/// - Data that requires compliance (HIPAA, GDPR, etc.)
/// - When you need extra protection beyond platform security
/// - When you want encryption keys managed separately
///
/// WHEN NOT TO USE:
/// - Regular auth tokens (SecureStorageService is enough)
/// - User preferences (use LocalStorageService)
/// - Non-sensitive data
///
/// USAGE EXAMPLES:
///
/// Example 1: Store sensitive user data
/// ```dart
/// final encryptedStorage = getIt<EncryptedStorageService>();
///
/// // Store highly sensitive data
/// await encryptedStorage.write('ssn', '123-45-6789');
/// await encryptedStorage.write('credit_card', '4111-1111-1111-1111');
///
/// // Retrieve and decrypt
/// final ssn = await encryptedStorage.read<String>('ssn');
/// print('SSN: $ssn'); // Decrypted automatically
/// ```
///
/// Example 2: Store encrypted JSON objects
/// ```dart
/// // Store user's medical data
/// final medicalData = {
///   'bloodType': 'O+',
///   'allergies': ['peanuts', 'shellfish'],
///   'conditions': ['diabetes'],
/// };
///
/// await encryptedStorage.writeJson('medical_data', medicalData);
///
/// // Retrieve and decrypt
/// final data = await encryptedStorage.readJson('medical_data');
/// print(data['bloodType']); // O+
/// ```
///
/// Example 3: Store encrypted files/documents
/// ```dart
/// // Store encrypted document
/// final documentContent = await File('document.pdf').readAsBytes();
/// final base64Content = base64Encode(documentContent);
/// await encryptedStorage.write('encrypted_document', base64Content);
///
/// // Retrieve and decrypt
/// final encrypted = await encryptedStorage.read<String>('encrypted_document');
/// final bytes = base64Decode(encrypted!);
/// await File('decrypted.pdf').writeAsBytes(bytes);
/// ```
class EncryptedStorageService implements StorageService {
  final SecureStorageService _secureStorage;
  final EncryptionService _encryptionService;

  EncryptedStorageService(
    this._secureStorage,
    this._encryptionService,
  );

  /// Writes encrypted data to secure storage
  ///
  /// Process:
  /// 1. Converts value to string
  /// 2. Encrypts with AES-256-GCM
  /// 3. Stores encrypted value in secure storage
  @override
  Future<void> write<T>(String key, T value) async {
    if (value == null) {
      await delete(key);
      return;
    }

    // Convert to string
    final stringValue = value.toString();
    
    // Encrypt
    final encrypted = await _encryptionService.encrypt(stringValue);
    
    // Store in secure storage
    await _secureStorage.writeString(key, encrypted);
  }

  /// Reads and decrypts data from secure storage
  ///
  /// Process:
  /// 1. Reads encrypted value from secure storage
  /// 2. Decrypts with AES-256-GCM
  /// 3. Returns decrypted value
  @override
  Future<T?> read<T>(String key) async {
    // Read encrypted value
    final encrypted = await _secureStorage.readString(key);
    if (encrypted == null) return null;

    // Decrypt
    final decrypted = await _encryptionService.decrypt(encrypted);
    
    // Return as requested type
    if (T == String) {
      return decrypted as T;
    }
    
    return decrypted as T?;
  }

  @override
  Future<void> delete(String key) async {
    await _secureStorage.delete(key);
  }

  @override
  Future<void> clear() async {
    await _secureStorage.clear();
  }

  @override
  Future<bool> containsKey(String key) async {
    return await _secureStorage.containsKey(key);
  }

  @override
  Future<List<String>> getAllKeys() async {
    return await _secureStorage.getAllKeys();
  }

  /// Writes encrypted JSON data
  ///
  /// Encrypts Map/List as JSON before storing
  Future<void> writeJson(String key, Map<String, dynamic> data) async {
    final encrypted = await _encryptionService.encryptJson(data);
    await _secureStorage.writeString(key, encrypted);
  }

  /// Reads and decrypts JSON data
  ///
  /// Returns decrypted Map
  Future<Map<String, dynamic>?> readJson(String key) async {
    final encrypted = await _secureStorage.readString(key);
    if (encrypted == null) return null;
    
    return await _encryptionService.decryptJson(encrypted);
  }

  /// Writes encrypted list
  Future<void> writeList(String key, List<String> data) async {
    final jsonString = jsonEncode(data);
    await write(key, jsonString);
  }

  /// Reads and decrypts list
  Future<List<String>?> readList(String key) async {
    final jsonString = await read<String>(key);
    if (jsonString == null) return null;
    
    final decoded = jsonDecode(jsonString);
    return List<String>.from(decoded as List);
  }

  /// Batch write multiple encrypted values
  Future<void> writeMultiple(Map<String, String> data) async {
    for (final entry in data.entries) {
      await write(entry.key, entry.value);
    }
  }

  /// Batch read multiple encrypted values
  Future<Map<String, String>> readMultiple(List<String> keys) async {
    final result = <String, String>{};
    
    for (final key in keys) {
      final value = await read<String>(key);
      if (value != null) {
        result[key] = value;
      }
    }
    
    return result;
  }

  /// Checks if encrypted data exists and is valid
  Future<bool> hasValidData(String key) async {
    try {
      final value = await read<String>(key);
      return value != null && value.isNotEmpty;
    } catch (e) {
      // Decryption failed = invalid/corrupted data
      return false;
    }
  }
}
