/// Service for sanitizing user inputs to prevent injection attacks.
///
/// Removes potentially harmful characters and patterns from user input
/// to prevent XSS, SQL injection, and other attacks.

class InputSanitizer {
  /// Sanitizes string input by removing potentially harmful characters
  /// 
  /// Removes:
  /// - HTML tags
  /// - Script tags
  /// - Event handlers
  /// - JavaScript: protocol
  static String sanitizeString(String input) {
    return input
        .trim()
        .replaceAll(RegExp(r'<script.*?>.*?</script>', caseSensitive: false), '')
        .replaceAll(RegExp(r'<.*?>'), '') // Remove HTML tags
        .replaceAll(RegExp(r'javascript:', caseSensitive: false), '')
        .replaceAll(RegExp(r'on\w+\s*=', caseSensitive: false), ''); // Remove event handlers
  }

  /// Sanitizes email input
  /// 
  /// Converts to lowercase and trims whitespace
  static String sanitizeEmail(String email) {
    return email.trim().toLowerCase();
  }

  /// Sanitizes phone number
  /// 
  /// Removes all non-digit characters except +
  static String sanitizePhone(String phone) {
    return phone.replaceAll(RegExp(r'[^\d+]'), '');
  }

  /// Validates and sanitizes URL
  /// 
  /// Returns null if URL is invalid or uses non-http(s) protocol
  static String? sanitizeUrl(String url) {
    try {
      final uri = Uri.parse(url);
      if (uri.scheme != 'http' && uri.scheme != 'https') {
        return null;
      }
      return uri.toString();
    } catch (e) {
      return null;
    }
  }

  /// Escapes SQL-like patterns (if using local SQLite)
  /// 
  /// Doubles single quotes to prevent SQL injection
  static String escapeSql(String input) {
    return input.replaceAll("'", "''");
  }

  /// Removes null bytes and control characters
  /// 
  /// Strips characters that could cause parsing issues
  static String removeControlCharacters(String input) {
    return input.replaceAll(RegExp(r'[\x00-\x1F\x7F]'), '');
  }

  /// TODO: Add additional sanitization methods as needed:
  /// - sanitizeName() - for user names
  /// - sanitizeAddress() - for addresses
  /// - sanitizeJson() - for JSON strings
}
