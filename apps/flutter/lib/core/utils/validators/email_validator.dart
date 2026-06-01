/// Email validator utility class
///
/// Provides methods for validating email addresses.
///
/// USAGE EXAMPLES:
///
/// Example 1: Basic email validation
/// ```dart
/// final email = 'user@example.com';
///
/// if (EmailValidator.isValid(email)) {
///   print('Valid email');
/// } else {
///   print('Invalid email');
/// }
/// ```
///
/// Example 2: Get validation message
/// ```dart
/// final email = 'invalid-email';
/// final message = EmailValidator.validate(email);
///
/// if (message != null) {
///   print('Error: $message'); // "Please enter a valid email address"
/// }
/// ```
///
/// Example 3: Use in TextFormField
/// ```dart
/// TextFormField(
///   keyboardType: TextInputType.emailAddress,
///   decoration: InputDecoration(
///     labelText: 'Email',
///     hintText: 'Enter your email',
///   ),
///   validator: EmailValidator.validate,
/// )
/// ```
///
/// Example 4: Check specific conditions
/// ```dart
/// final email = 'user@example.com';
///
/// if (!EmailValidator.hasValidFormat(email)) {
///   print('Invalid email format');
/// }
///
/// if (!EmailValidator.hasValidDomain(email)) {
///   print('Invalid domain');
/// }
/// ```
class EmailValidator {
  EmailValidator._();

  /// Regular expression for email validation
  static final RegExp _emailRegex = RegExp(
    r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
  );

  /// Validate email address
  ///
  /// Returns null if valid, error message if invalid
  /// Use this method with TextFormField validator
  static String? validate(String? email) {
    if (email == null || email.trim().isEmpty) {
      return 'Email is required';
    }

    if (!isValid(email)) {
      return 'Please enter a valid email address';
    }

    return null;
  }

  /// Check if email is valid
  ///
  /// Returns true if valid, false otherwise
  static bool isValid(String email) {
    if (email.trim().isEmpty) return false;

    // Check basic format
    if (!_emailRegex.hasMatch(email.trim())) return false;

    // Additional checks
    if (!hasValidLength(email)) return false;
    if (!hasValidFormat(email)) return false;
    if (!hasValidDomain(email)) return false;

    return true;
  }

  /// Check if email has valid length
  ///
  /// Email should be between 5 and 254 characters
  static bool hasValidLength(String email) {
    final length = email.trim().length;
    return length >= 5 && length <= 254;
  }

  /// Check if email has valid format
  ///
  /// Checks for:
  /// - No spaces
  /// - Contains @ symbol
  /// - Has username before @
  /// - Has domain after @
  static bool hasValidFormat(String email) {
    final trimmed = email.trim();

    // No spaces allowed
    if (trimmed.contains(' ')) return false;

    // Must contain @
    if (!trimmed.contains('@')) return false;

    // Split by @
    final parts = trimmed.split('@');

    // Must have exactly one @
    if (parts.length != 2) return false;

    // Username (before @) should not be empty
    if (parts[0].isEmpty) return false;

    // Domain (after @) should not be empty
    if (parts[1].isEmpty) return false;

    return true;
  }

  /// Check if email has valid domain
  ///
  /// Checks if domain contains a dot and valid TLD
  static bool hasValidDomain(String email) {
    final trimmed = email.trim();

    if (!trimmed.contains('@')) return false;

    final domain = trimmed.split('@')[1];

    // Domain should contain at least one dot
    if (!domain.contains('.')) return false;

    // Get TLD (top-level domain)
    final tld = domain.split('.').last;

    // TLD should be at least 2 characters
    if (tld.length < 2) return false;

    // TLD should only contain letters
    if (!RegExp(r'^[a-zA-Z]+$').hasMatch(tld)) return false;

    return true;
  }

  /// Check if email is from a specific domain
  ///
  /// Example:
  /// ```dart
  /// EmailValidator.isFromDomain('user@gmail.com', 'gmail.com') // true
  /// EmailValidator.isFromDomain('user@yahoo.com', 'gmail.com') // false
  /// ```
  static bool isFromDomain(String email, String domain) {
    if (!isValid(email)) return false;

    final emailDomain = email.split('@')[1].toLowerCase();
    return emailDomain == domain.toLowerCase();
  }

  /// Get domain from email
  ///
  /// Returns null if email is invalid
  static String? getDomain(String email) {
    if (!isValid(email)) return null;
    return email.split('@')[1];
  }

  /// Get username from email
  ///
  /// Returns null if email is invalid
  static String? getUsername(String email) {
    if (!isValid(email)) return null;
    return email.split('@')[0];
  }

  /// Normalize email address
  ///
  /// Converts to lowercase and trims whitespace
  static String normalize(String email) {
    return email.trim().toLowerCase();
  }
}
