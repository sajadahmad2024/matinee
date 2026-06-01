import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';
import 'package:flutter_boilerplate/core/security/encryption_service.dart';

import 'encryption_service_test.mocks.dart';

@GenerateMocks([FlutterSecureStorage])
void main() {
  late EncryptionService encryptionService;
  late MockFlutterSecureStorage mockSecureStorage;

  setUp(() {
    mockSecureStorage = MockFlutterSecureStorage();
    encryptionService = EncryptionService(mockSecureStorage);
  });

  group('EncryptionService', () {
    group('initialize', () {
      test('should generate new key when no key exists', () async {
        // Arrange
        when(
          mockSecureStorage.read(key: anyNamed('key')),
        ).thenAnswer((_) async => null);
        when(
          mockSecureStorage.write(
            key: anyNamed('key'),
            value: anyNamed('value'),
          ),
        ).thenAnswer((_) async => {});

        // Act
        await encryptionService.initialize();

        // Assert
        expect(encryptionService.isInitialized, true);
        verify(
          mockSecureStorage.write(key: 'encryption_master_key', value: any),
        ).called(1);
      });

      test('should use existing key when key exists', () async {
        // Arrange
        final existingKey = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=';
        when(
          mockSecureStorage.read(key: 'encryption_master_key'),
        ).thenAnswer((_) async => existingKey);

        // Act
        await encryptionService.initialize();

        // Assert
        expect(encryptionService.isInitialized, true);
        verifyNever(mockSecureStorage.write(key: any, value: any));
      });

      test('should only initialize once', () async {
        // Arrange
        when(
          mockSecureStorage.read(key: anyNamed('key')),
        ).thenAnswer((_) async => null);
        when(
          mockSecureStorage.write(
            key: anyNamed('key'),
            value: anyNamed('value'),
          ),
        ).thenAnswer((_) async => {});

        // Act
        await encryptionService.initialize();
        await encryptionService.initialize(); // Second call

        // Assert
        verify(mockSecureStorage.write(key: any, value: any)).called(1);
      });
    });

    group('encrypt', () {
      setUp(() async {
        when(
          mockSecureStorage.read(key: anyNamed('key')),
        ).thenAnswer((_) async => null);
        when(
          mockSecureStorage.write(
            key: anyNamed('key'),
            value: anyNamed('value'),
          ),
        ).thenAnswer((_) async => {});
        await encryptionService.initialize();
      });

      test('should encrypt plain text', () async {
        // Arrange
        const plainText = 'Hello World';

        // Act
        final encrypted = await encryptionService.encrypt(plainText);

        // Assert
        expect(encrypted, isNotEmpty);
        expect(
          encrypted.contains(':'),
          true,
        ); // Should have IV:encrypted format
      });

      test('should produce different ciphertexts for same input', () async {
        // Arrange
        const plainText = 'Hello World';

        // Act
        final encrypted1 = await encryptionService.encrypt(plainText);
        final encrypted2 = await encryptionService.encrypt(plainText);

        // Assert
        expect(encrypted1, isNot(equals(encrypted2))); // Different IVs
      });

      test('should throw when not initialized', () async {
        // Arrange
        final uninitializedService = EncryptionService(mockSecureStorage);

        // Act & Assert
        expect(() => uninitializedService.encrypt('test'), throwsException);
      });
    });

    group('decrypt', () {
      setUp(() async {
        when(
          mockSecureStorage.read(key: anyNamed('key')),
        ).thenAnswer((_) async => null);
        when(
          mockSecureStorage.write(
            key: anyNamed('key'),
            value: anyNamed('value'),
          ),
        ).thenAnswer((_) async => {});
        await encryptionService.initialize();
      });

      test('should decrypt encrypted data', () async {
        // Arrange
        const plainText = 'Hello World';
        final encrypted = await encryptionService.encrypt(plainText);

        // Act
        final decrypted = await encryptionService.decrypt(encrypted);

        // Assert
        expect(decrypted, equals(plainText));
      });

      test('should handle special characters', () async {
        // Arrange
        const plainText = 'Special chars: @#\$%^&*()_+{}[]|\\:";\'<>?,./~`';
        final encrypted = await encryptionService.encrypt(plainText);

        // Act
        final decrypted = await encryptionService.decrypt(encrypted);

        // Assert
        expect(decrypted, equals(plainText));
      });

      test('should throw on invalid format', () async {
        // Arrange
        const invalidEncrypted = 'invalid_format_no_colon';

        // Act & Assert
        expect(
          () => encryptionService.decrypt(invalidEncrypted),
          throwsException,
        );
      });

      test('should throw on corrupted data', () async {
        // Arrange
        const corruptedEncrypted = 'AAAA:BBBB'; // Invalid base64

        // Act & Assert
        expect(
          () => encryptionService.decrypt(corruptedEncrypted),
          throwsException,
        );
      });
    });

    group('encryptJson', () {
      setUp(() async {
        when(
          mockSecureStorage.read(key: anyNamed('key')),
        ).thenAnswer((_) async => null);
        when(
          mockSecureStorage.write(
            key: anyNamed('key'),
            value: anyNamed('value'),
          ),
        ).thenAnswer((_) async => {});
        await encryptionService.initialize();
      });

      test('should encrypt and decrypt JSON data', () async {
        // Arrange
        final data = {'name': 'John Doe', 'age': 30, 'active': true};

        // Act
        final encrypted = await encryptionService.encryptJson(data);
        final decrypted = await encryptionService.decryptJson(encrypted);

        // Assert
        expect(decrypted, equals(data));
      });

      test('should handle nested JSON', () async {
        // Arrange
        final data = {
          'user': {
            'name': 'John',
            'address': {'street': '123 Main St', 'city': 'Boston'},
          },
          'tags': ['flutter', 'dart'],
        };

        // Act
        final encrypted = await encryptionService.encryptJson(data);
        final decrypted = await encryptionService.decryptJson(encrypted);

        // Assert
        expect(decrypted, equals(data));
      });
    });
  });
}
