import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';
import 'package:flutter_boilerplate/core/services/storage/storage_manager.dart';
import 'package:flutter_boilerplate/core/services/storage/local_storage_service.dart';
import 'package:flutter_boilerplate/core/services/storage/secure_storage_service.dart';
import 'package:flutter_boilerplate/core/services/storage/encrypted_storage_service.dart';

import 'storage_manager_test.mocks.dart';

@GenerateMocks([
  LocalStorageService,
  SecureStorageService,
  EncryptedStorageService,
])
void main() {
  late StorageManager storageManager;
  late MockLocalStorageService mockLocalStorage;
  late MockSecureStorageService mockSecureStorage;
  late MockEncryptedStorageService mockEncryptedStorage;

  setUp(() {
    mockLocalStorage = MockLocalStorageService();
    mockSecureStorage = MockSecureStorageService();
    mockEncryptedStorage = MockEncryptedStorageService();

    storageManager = StorageManager(
      localStorage: mockLocalStorage,
      secureStorage: mockSecureStorage,
      encryptedStorage: mockEncryptedStorage,
    );
  });

  group('StorageManager - Local Storage', () {
    test('should save preference to local storage', () async {
      // Arrange
      when(
        mockLocalStorage.write<String>('theme', 'dark'),
      ).thenAnswer((_) async => {});

      // Act
      await storageManager.savePreference('theme', 'dark');

      // Assert
      verify(mockLocalStorage.write('theme', 'dark')).called(1);
    });

    test('should get preference from local storage', () async {
      // Arrange
      when(
        mockLocalStorage.read<String>('theme'),
      ).thenAnswer((_) async => 'dark');

      // Act
      final result = await storageManager.getPreference<String>('theme');

      // Assert
      expect(result, 'dark');
      verify(mockLocalStorage.read<String>('theme')).called(1);
    });

    test('should delete preference from local storage', () async {
      // Arrange
      when(mockLocalStorage.delete('theme')).thenAnswer((_) async => {});

      // Act
      await storageManager.deletePreference('theme');

      // Assert
      verify(mockLocalStorage.delete('theme')).called(1);
    });
  });

  group('StorageManager - Secure Storage', () {
    test('should save data to secure storage', () async {
      // Arrange
      when(
        mockSecureStorage.writeString('token', 'abc123'),
      ).thenAnswer((_) async => {});

      // Act
      await storageManager.saveSecure('token', 'abc123');

      // Assert
      verify(mockSecureStorage.writeString('token', 'abc123')).called(1);
    });

    test('should get data from secure storage', () async {
      // Arrange
      when(
        mockSecureStorage.readString('token'),
      ).thenAnswer((_) async => 'abc123');

      // Act
      final result = await storageManager.getSecure('token');

      // Assert
      expect(result, 'abc123');
    });
  });

  group('StorageManager - Bulk Operations', () {
    test('should clear all storage', () async {
      // Arrange
      when(mockLocalStorage.clear()).thenAnswer((_) async => {});
      when(mockSecureStorage.clear()).thenAnswer((_) async => {});
      when(mockEncryptedStorage.clear()).thenAnswer((_) async => {});

      // Act
      await storageManager.clearAll();

      // Assert
      verify(mockLocalStorage.clear()).called(1);
      verify(mockSecureStorage.clear()).called(1);
      verify(mockEncryptedStorage.clear()).called(1);
    });

    test('should clear only secure data', () async {
      // Arrange
      when(mockSecureStorage.clear()).thenAnswer((_) async => {});
      when(mockEncryptedStorage.clear()).thenAnswer((_) async => {});

      // Act
      await storageManager.clearSecureData();

      // Assert
      verifyNever(mockLocalStorage.clear());
      verify(mockSecureStorage.clear()).called(1);
      verify(mockEncryptedStorage.clear()).called(1);
    });
  });
}
