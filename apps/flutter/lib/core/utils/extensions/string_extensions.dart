/// Extensions on String for common operations
extension StringExtensions on String {
  /// Check if string is null or empty
  bool get isNullOrEmpty => trim().isEmpty;

  /// Check if string is not null and not empty
  bool get isNotNullOrEmpty => trim().isNotEmpty;

  /// Capitalize first letter
  String get capitalize {
    if (isEmpty) return this;
    return '${this[0].toUpperCase()}${substring(1).toLowerCase()}';
  }

  /// Capitalize first letter of each word
  String get capitalizeWords {
    if (isEmpty) return this;
    return split(' ').map((word) => word.capitalize).join(' ');
  }

  /// Convert to title case
  String get toTitleCase => capitalizeWords;

  /// Check if string is a valid email
  bool get isValidEmail {
    final emailRegex = RegExp(
      r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
    );
    return emailRegex.hasMatch(this);
  }

  /// Check if string is a valid phone number (basic check)
  bool get isValidPhone {
    final phoneRegex = RegExp(r'^\+?[1-9]\d{1,14}$');
    return phoneRegex.hasMatch(trim());
  }

  /// Check if string is a valid URL
  bool get isValidUrl {
    final urlRegex = RegExp(
      r'^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$',
    );
    return urlRegex.hasMatch(this);
  }

  /// Check if string contains only numbers
  bool get isNumeric {
    return RegExp(r'^[0-9]+$').hasMatch(this);
  }

  /// Check if string contains only alphabets
  bool get isAlpha {
    return RegExp(r'^[a-zA-Z]+$').hasMatch(this);
  }

  /// Check if string is alphanumeric
  bool get isAlphaNumeric {
    return RegExp(r'^[a-zA-Z0-9]+$').hasMatch(this);
  }

  /// Remove all whitespace
  String get removeWhitespace => replaceAll(RegExp(r'\s+'), '');

  /// Truncate string to specified length with ellipsis
  String truncate(int maxLength, {String ellipsis = '...'}) {
    if (length <= maxLength) return this;
    return '${substring(0, maxLength)}$ellipsis';
  }

  /// Reverse string
  String get reverse => split('').reversed.join('');

  /// Check if string is palindrome
  bool get isPalindrome {
    final cleaned = removeWhitespace.toLowerCase();
    return cleaned == cleaned.reverse;
  }

  /// Convert to int (returns null if invalid)
  int? get toIntOrNull => int.tryParse(this);

  /// Convert to double (returns null if invalid)
  double? get toDoubleOrNull => double.tryParse(this);

  /// Convert string to slug (URL-friendly)
  String get toSlug {
    return toLowerCase()
        .replaceAll(RegExp(r'[^\w\s-]'), '')
        .replaceAll(RegExp(r'[\s_-]+'), '-')
        .replaceAll(RegExp(r'^-+|-+$'), '');
  }

  /// Add ellipsis in the middle of the string
  String ellipsisMiddle(int maxLength) {
    if (length <= maxLength) return this;
    final half = (maxLength / 2).floor() - 2;
    return '${substring(0, half)}...${substring(length - half)}';
  }

  /// Mask string (for sensitive data like passwords)
  String mask({String maskChar = '*', int visibleChars = 4}) {
    if (length <= visibleChars) return this;
    return substring(0, visibleChars) + maskChar * (length - visibleChars);
  }

  /// Extract numbers from string
  String get extractNumbers => replaceAll(RegExp(r'[^0-9]'), '');

  /// Extract alphabets from string
  String get extractAlphabets => replaceAll(RegExp(r'[^a-zA-Z]'), '');

  /// Count words in string
  int get wordCount => trim().split(RegExp(r'\s+')).length;

  /// Check if string contains substring (case insensitive)
  bool containsIgnoreCase(String substring) {
    return toLowerCase().contains(substring.toLowerCase());
  }

  /// Replace first occurrence
  String replaceFirst(String from, String to) {
    return replaceRange(indexOf(from), indexOf(from) + from.length, to);
  }
}

/// Nullable string extensions
extension NullableStringExtensions on String? {
  /// Check if string is null or empty
  bool get isNullOrEmpty => this == null || this!.trim().isEmpty;

  /// Check if string is not null and not empty
  bool get isNotNullOrEmpty => !isNullOrEmpty;

  /// Get string or default value
  String orDefault(String defaultValue) => this ?? defaultValue;

  /// Get string or empty string
  String get orEmpty => this ?? '';
}
