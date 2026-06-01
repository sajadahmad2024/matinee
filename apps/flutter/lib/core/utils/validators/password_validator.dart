import 'dart:ui';

import 'package:flutter/material.dart';

import '../../../config/constants/app_constants.dart';

/// Password validator utility class
///
/// Provides methods for validating password strength and requirements.
///
/// USAGE EXAMPLES:
///
/// Example 1: Basic password validation
/// ```dart
/// final password = 'MyP@ssw0rd';
///
/// if (PasswordValidator.isValid(password)) {
///   print('Valid password');
/// } else {
///   print('Invalid password');
/// }
/// ```
///
/// Example 2: Get validation message
/// ```dart
/// final password = '123';
/// final message = PasswordValidator.validate(password);
///
/// if (message != null) {
///   print('Error: $message'); // "Password must be at least 8 characters"
/// }
/// ```
///
/// Example 3: Use in TextFormField
/// ```dart
/// TextFormField(
///   obscureText: true,
///   decoration: InputDecoration(
///     labelText: 'Password',
///     hintText: 'Enter your password',
///   ),
///   validator: PasswordValidator.validate,
/// )
/// ```
///
/// Example 4: Check password strength
/// ```dart
/// final password = 'MyP@ssw0rd123';
/// final strength = PasswordValidator.getStrength(password);
///
/// switch (strength) {
///   case PasswordStrength.weak:
///     print('Weak password');
///     break;
///   case PasswordStrength.medium:
///     print('Medium password');
///     break;
///   case PasswordStrength.strong:
///     print('Strong password');
///     break;
///   case PasswordStrength.veryStrong:
///     print('Very strong password');
///     break;
/// }
/// ```
///
/// Example 5: Validate password confirmation
/// ```dart
/// final password = 'MyP@ssw0rd';
/// final confirmPassword = 'MyP@ssw0rd';
///
/// final message = PasswordValidator.validateConfirmation(
///   password,
///   confirmPassword,
/// );
///
/// if (message != null) {
///   print('Error: $message');
/// }
/// ```
class PasswordValidator {
  PasswordValidator._();

  /// Validate password
  ///
  /// Returns null if valid, error message if invalid
  /// Use this method with TextFormField validator
  static String? validate(String? password) {
    if (password == null || password.isEmpty) {
      return 'Password is required';
    }

    if (!hasMinLength(password)) {
      return 'Password must be at least ${AppConstants.minPasswordLength} characters';
    }

    if (!hasMaxLength(password)) {
      return 'Password must not exceed ${AppConstants.maxPasswordLength} characters';
    }

    if (!hasUppercase(password)) {
      return 'Password must contain at least one uppercase letter';
    }

    if (!hasLowercase(password)) {
      return 'Password must contain at least one lowercase letter';
    }

    if (!hasDigit(password)) {
      return 'Password must contain at least one number';
    }

    if (!hasSpecialChar(password)) {
      return 'Password must contain at least one special character';
    }

    return null;
  }

  /// Check if password is valid
  ///
  /// Returns true if all requirements are met
  static bool isValid(String password) {
    return hasMinLength(password) &&
        hasMaxLength(password) &&
        hasUppercase(password) &&
        hasLowercase(password) &&
        hasDigit(password) &&
        hasSpecialChar(password);
  }

  /// Check if password has minimum length
  static bool hasMinLength(String password) {
    return password.length >= AppConstants.minPasswordLength;
  }

  /// Check if password has maximum length
  static bool hasMaxLength(String password) {
    return password.length <= AppConstants.maxPasswordLength;
  }

  /// Check if password contains uppercase letter
  static bool hasUppercase(String password) {
    return password.contains(RegExp(r'[A-Z]'));
  }

  /// Check if password contains lowercase letter
  static bool hasLowercase(String password) {
    return password.contains(RegExp(r'[a-z]'));
  }

  /// Check if password contains digit
  static bool hasDigit(String password) {
    return password.contains(RegExp(r'[0-9]'));
  }

  /// Check if password contains special character
  static bool hasSpecialChar(String password) {
    return password.contains(RegExp(r'[!@#$%^&*(),.?":{}|<>]'));
  }

  /// Validate password confirmation
  ///
  /// Returns null if passwords match, error message otherwise
  static String? validateConfirmation(
    String? password,
    String? confirmPassword,
  ) {
    if (confirmPassword == null || confirmPassword.isEmpty) {
      return 'Please confirm your password';
    }

    if (password != confirmPassword) {
      return 'Passwords do not match';
    }

    return null;
  }

  /// Get password strength
  ///
  /// Returns PasswordStrength enum based on criteria met
  static PasswordStrength getStrength(String password) {
    int score = 0;

    // Length check
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (password.length >= 16) score++;

    // Character variety checks
    if (hasUppercase(password)) score++;
    if (hasLowercase(password)) score++;
    if (hasDigit(password)) score++;
    if (hasSpecialChar(password)) score++;

    // Return strength based on score
    if (score >= 7) return PasswordStrength.veryStrong;
    if (score >= 5) return PasswordStrength.strong;
    if (score >= 3) return PasswordStrength.medium;
    return PasswordStrength.weak;
  }

  /// Get password strength percentage (0-100)
  static int getStrengthPercentage(String password) {
    final strength = getStrength(password);

    switch (strength) {
      case PasswordStrength.weak:
        return 25;
      case PasswordStrength.medium:
        return 50;
      case PasswordStrength.strong:
        return 75;
      case PasswordStrength.veryStrong:
        return 100;
    }
  }

  /// Get password strength color
  ///
  /// Useful for showing visual feedback
  static Color getStrengthColor(String password) {
    final strength = getStrength(password);

    switch (strength) {
      case PasswordStrength.weak:
        return Colors.red;
      case PasswordStrength.medium:
        return Colors.orange;
      case PasswordStrength.strong:
        return Colors.blue;
      case PasswordStrength.veryStrong:
        return Colors.green;
    }
  }

  /// Get password strength text
  static String getStrengthText(String password) {
    final strength = getStrength(password);

    switch (strength) {
      case PasswordStrength.weak:
        return 'Weak';
      case PasswordStrength.medium:
        return 'Medium';
      case PasswordStrength.strong:
        return 'Strong';
      case PasswordStrength.veryStrong:
        return 'Very Strong';
    }
  }

  /// Get list of unmet requirements
  ///
  /// Returns list of strings describing what's missing
  static List<String> getUnmetRequirements(String password) {
    final requirements = <String>[];

    if (!hasMinLength(password)) {
      requirements.add('At least ${AppConstants.minPasswordLength} characters');
    }
    if (!hasUppercase(password)) {
      requirements.add('One uppercase letter');
    }
    if (!hasLowercase(password)) {
      requirements.add('One lowercase letter');
    }
    if (!hasDigit(password)) {
      requirements.add('One number');
    }
    if (!hasSpecialChar(password)) {
      requirements.add('One special character (!@#\$%^&*)');
    }

    return requirements;
  }
}

/// Password strength enum
enum PasswordStrength { weak, medium, strong, veryStrong }
