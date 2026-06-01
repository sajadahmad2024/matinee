class PiiMask {
  /// Mask email address
  static String maskEmail(String email) {
    if (email.isEmpty) return email;

    final parts = email.split('@');
    if (parts.length != 2) return '***';

    final localPart = parts[0];
    final domain = parts[1];

    if (localPart.length <= 2) {
      return '***@$domain';
    }

    final masked =
        localPart[0] +
        '*' * (localPart.length - 2) +
        localPart[localPart.length - 1];

    return '$masked@$domain';
  }

  /// Mask phone number
  static String maskPhone(String phone) {
    if (phone.length < 4) return '****';
    return '*' * (phone.length - 4) + phone.substring(phone.length - 4);
  }

  /// Mask credit card
  static String maskCard(String card) {
    if (card.length < 4) return '****';
    return '*' * (card.length - 4) + card.substring(card.length - 4);
  }

  /// Mask name
  static String maskName(String name) {
    final parts = name.split(' ');
    return parts
        .map((part) {
          if (part.isEmpty) return part;
          return part[0] + '*' * (part.length - 1);
        })
        .join(' ');
  }

  /// Mask SSN
  static String maskSSN(String ssn) {
    if (ssn.length < 4) return '****';
    return '***-**-' + ssn.substring(ssn.length - 4);
  }

  /// Generic mask - show first and last character only
  static String maskGeneric(String value) {
    if (value.length <= 2) return '*' * value.length;
    return value[0] + '*' * (value.length - 2) + value[value.length - 1];
  }
}

/// Sanitizer for crash reports
class CrashReportSanitizer {
  /// Remove sensitive data from crash report
  static Map<String, dynamic> sanitize(Map<String, dynamic> data) {
    final sanitized = Map<String, dynamic>.from(data);

    // List of sensitive keys to mask
    const sensitiveKeys = [
      'password',
      'token',
      'accessToken',
      'refreshToken',
      'apiKey',
      'secret',
      'email',
      'phone',
      'ssn',
      'cardNumber',
      'creditCard',
      'authorization',
      'authorizationheader',
    ];

    sanitized.forEach((key, value) {
      if (sensitiveKeys.contains(key.toLowerCase())) {
        sanitized[key] = '[REDACTED]';
      } else if (value is Map) {
        sanitized[key] = sanitize(value as Map<String, dynamic>);
      } else if (value is List) {
        sanitized[key] = (value).map((item) {
          if (item is Map) return sanitize(item as Map<String, dynamic>);
          return item;
        }).toList();
      }
    });

    return sanitized;
  }

  /// Sanitize error message
  static String sanitizeMessage(String message) {
    var sanitized = message;

    // Remove sensitive patterns
    sanitized = sanitized.replaceAll(
      RegExp(r'(?<!\w)\d{3}-?\d{2}-?\d{4}(?!\w)'), // SSN
      'XXX-XX-XXXX',
    );

    sanitized = sanitized.replaceAll(
      RegExp(r'Bearer\s+[\w.-]+'), // JWT tokens
      'Bearer [REDACTED]',
    );

    return sanitized;
  }
}
