import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_boilerplate/core/security/input_sanitizer.dart';

void main() {
  group('InputSanitizer', () {
    group('sanitizeString', () {
      test('should remove script tags', () {
        // Arrange
        const input = 'Hello <script>alert("XSS")</script> World';

        // Act
        final result = InputSanitizer.sanitizeString(input);

        // Assert
        expect(result, 'Hello  World');
        expect(result.contains('<script>'), false);
      });

      test('should remove HTML tags', () {
        // Arrange
        const input = 'Hello <div>World</div>';

        // Act
        final result = InputSanitizer.sanitizeString(input);

        // Assert
        expect(result, 'Hello World');
      });

      test('should remove event handlers', () {
        // Arrange
        const input = '<img onerror="alert()" src="x">';

        // Act
        final result = InputSanitizer.sanitizeString(input);

        // Assert
        expect(result.contains('onerror'), false);
      });

      test('should handle empty string', () {
        // Act
        final result = InputSanitizer.sanitizeString('');

        // Assert
        expect(result, '');
      });

      test('should trim whitespace', () {
        // Arrange
        const input = '  Hello World  ';

        // Act
        final result = InputSanitizer.sanitizeString(input);

        // Assert
        expect(result, 'Hello World');
      });
    });

    group('sanitizeEmail', () {
      test('should convert to lowercase', () {
        // Arrange
        const input = 'User@Example.COM';

        // Act
        final result = InputSanitizer.sanitizeEmail(input);

        // Assert
        expect(result, 'user@example.com');
      });

      test('should trim whitespace', () {
        // Arrange
        const input = '  user@example.com  ';

        // Act
        final result = InputSanitizer.sanitizeEmail(input);

        // Assert
        expect(result, 'user@example.com');
      });
    });

    group('sanitizePhone', () {
      test('should keep only digits and plus', () {
        // Arrange
        const input = '+1 (234) 567-8900';

        // Act
        final result = InputSanitizer.sanitizePhone(input);

        // Assert
        expect(result, '+12345678900');
      });

      test('should remove letters', () {
        // Arrange
        const input = '123-ABC-4567';

        // Act
        final result = InputSanitizer.sanitizePhone(input);

        // Assert
        expect(result, '1234567');
      });
    });

    group('sanitizeUrl', () {
      test('should accept valid https URL', () {
        // Arrange
        const input = 'https://example.com';

        // Act
        final result = InputSanitizer.sanitizeUrl(input);

        // Assert
        expect(result, 'https://example.com');
      });

      test('should accept valid http URL', () {
        // Arrange
        const input = 'http://example.com';

        // Act
        final result = InputSanitizer.sanitizeUrl(input);

        // Assert
        expect(result, 'http://example.com');
      });

      test('should reject javascript protocol', () {
        // Arrange
        const input = 'javascript:alert("XSS")';

        // Act
        final result = InputSanitizer.sanitizeUrl(input);

        // Assert
        expect(result, null);
      });

      test('should reject invalid URL', () {
        // Arrange
        const input = 'not a url';

        // Act
        final result = InputSanitizer.sanitizeUrl(input);

        // Assert
        expect(result, null);
      });
    });
  });
}
