/// Phone validator utility class
///
/// Provides methods for validating phone numbers.
///
/// USAGE EXAMPLES:
///
/// Example 1: Basic phone validation
/// ```dart
/// final phone = '+1234567890';
///
/// if (PhoneValidator.isValid(phone)) {
///   print('Valid phone number');
/// } else {
///   print('Invalid phone number');
/// }
/// ```
///
/// Example 2: Get validation message
/// ```dart
/// final phone = '123';
/// final message = PhoneValidator.validate(phone);
///
/// if (message != null) {
///   print('Error: $message'); // "Please enter a valid phone number"
/// }
/// ```
///
/// Example 3: Use in TextFormField
/// ```dart
/// TextFormField(
///   keyboardType: TextInputType.phone,
///   decoration: InputDecoration(
///     labelText: 'Phone Number',
///     hintText: '+1234567890',
///   ),
///   validator: PhoneValidator.validate,
/// )
/// ```
///
/// Example 4: Validate with country code
/// ```dart
/// final phone = '+911234567890';
///
/// if (PhoneValidator.isValidWithCountryCode(phone, '+91')) {
///   print('Valid Indian phone number');
/// }
/// ```
///
/// Example 5: Format phone number
/// ```dart
/// final phone = '1234567890';
/// final formatted = PhoneValidator.format(phone);
/// print(formatted); // "(123) 456-7890"
/// ```
class PhoneValidator {
  PhoneValidator._();

  /// Basic phone regex (international format with optional +)
  static final RegExp _phoneRegex = RegExp(r'^\+?[1-9]\d{1,14}$');

  /// US phone regex
  static final RegExp _usPhoneRegex = RegExp(r'^\+?1?\d{10}$');

  /// India phone regex
  static final RegExp _indiaPhoneRegex = RegExp(r'^\+?91\d{10}$');

  /// Validate phone number
  ///
  /// Returns null if valid, error message if invalid
  /// Use this method with TextFormField validator
  static String? validate(String? phone) {
    if (phone == null || phone.trim().isEmpty) {
      return 'Phone number is required';
    }

    if (!isValid(phone)) {
      return 'Please enter a valid phone number';
    }

    return null;
  }

  /// Check if phone number is valid
  ///
  /// Returns true if valid, false otherwise
  static bool isValid(String phone) {
    final cleaned = cleanPhoneNumber(phone);

    if (cleaned.isEmpty) return false;

    // Check basic format
    if (!_phoneRegex.hasMatch(cleaned)) return false;

    // Check length (should be between 10-15 digits including country code)
    final digitsOnly = cleaned.replaceAll(RegExp(r'[^\d]'), '');
    if (digitsOnly.length < 10 || digitsOnly.length > 15) return false;

    return true;
  }

  /// Check if US phone number is valid
  static bool isValidUS(String phone) {
    final cleaned = cleanPhoneNumber(phone);
    return _usPhoneRegex.hasMatch(cleaned);
  }

  /// Check if Indian phone number is valid
  static bool isValidIndia(String phone) {
    final cleaned = cleanPhoneNumber(phone);
    return _indiaPhoneRegex.hasMatch(cleaned);
  }

  /// Check if phone has valid country code
  ///
  /// Example:
  /// ```dart
  /// PhoneValidator.isValidWithCountryCode('+911234567890', '+91') // true
  /// ```
  static bool isValidWithCountryCode(String phone, String countryCode) {
    if (!isValid(phone)) return false;

    final cleaned = cleanPhoneNumber(phone);
    return cleaned.startsWith(countryCode);
  }

  /// Clean phone number (remove spaces, dashes, parentheses)
  ///
  /// Example:
  /// ```dart
  /// PhoneValidator.cleanPhoneNumber('(123) 456-7890') // '1234567890'
  /// ```
  static String cleanPhoneNumber(String phone) {
    return phone
        .trim()
        .replaceAll(RegExp(r'[\s\-\(\)]'), '')
        .replaceAll(RegExp(r'[^\d\+]'), '');
  }

  /// Format phone number for display
  ///
  /// Example:
  /// ```dart
  /// PhoneValidator.format('1234567890') // "(123) 456-7890"
  /// PhoneValidator.format('+911234567890') // "+91 12345 67890"
  /// ```
  static String format(String phone) {
    final cleaned = cleanPhoneNumber(phone);

    // If starts with +, assume international format
    if (cleaned.startsWith('+')) {
      return formatInternational(cleaned);
    }

    // Format as US number if 10 digits
    if (cleaned.length == 10) {
      return formatUS(cleaned);
    }

    // Return cleaned version if can't format
    return cleaned;
  }

  /// Format as US phone number
  ///
  /// Example: "1234567890" -> "(123) 456-7890"
  static String formatUS(String phone) {
    final cleaned = cleanPhoneNumber(phone);

    if (cleaned.length != 10) return cleaned;

    return '(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6)}';
  }

  /// Format as international phone number
  ///
  /// Example: "+911234567890" -> "+91 12345 67890"
  static String formatInternational(String phone) {
    final cleaned = cleanPhoneNumber(phone);

    if (!cleaned.startsWith('+')) return cleaned;

    // Get country code (1-3 digits after +)
    final countryCodeMatch = RegExp(r'^\+(\d{1,3})').firstMatch(cleaned);
    if (countryCodeMatch == null) return cleaned;

    final countryCode = countryCodeMatch.group(1)!;
    final number = cleaned.substring(countryCode.length + 1);

    // Split number into groups of 5
    final groups = <String>[];
    for (int i = 0; i < number.length; i += 5) {
      final end = i + 5;
      groups.add(
        number.substring(i, end > number.length ? number.length : end),
      );
    }

    return '+$countryCode ${groups.join(' ')}';
  }

  /// Get country code from phone number
  ///
  /// Returns null if no country code found
  static String? getCountryCode(String phone) {
    final cleaned = cleanPhoneNumber(phone);

    if (!cleaned.startsWith('+')) return null;

    final match = RegExp(r'^\+(\d{1,3})').firstMatch(cleaned);
    return match?.group(1);
  }

  /// Remove country code from phone number
  ///
  /// Example:
  /// ```dart
  /// PhoneValidator.removeCountryCode('+911234567890') // '1234567890'
  /// ```
  static String removeCountryCode(String phone) {
    final cleaned = cleanPhoneNumber(phone);

    if (!cleaned.startsWith('+')) return cleaned;

    final match = RegExp(r'^\+\d{1,3}').firstMatch(cleaned);
    if (match == null) return cleaned;

    return cleaned.substring(match.end);
  }

  /// Add country code to phone number
  ///
  /// Example:
  /// ```dart
  /// PhoneValidator.addCountryCode('1234567890', '+91') // '+911234567890'
  /// ```
  static String addCountryCode(String phone, String countryCode) {
    final cleaned = cleanPhoneNumber(phone);
    final cleanedCode = countryCode.startsWith('+')
        ? countryCode
        : '+$countryCode';

    // If already has country code, return as is
    if (cleaned.startsWith('+')) return cleaned;

    return '$cleanedCode$cleaned';
  }

  /// Check if phone number has country code
  static bool hasCountryCode(String phone) {
    final cleaned = cleanPhoneNumber(phone);
    return cleaned.startsWith('+');
  }

  /// Get phone number length (digits only)
  static int getLength(String phone) {
    final digitsOnly = cleanPhoneNumber(phone).replaceAll('+', '');
    return digitsOnly.length;
  }
}
