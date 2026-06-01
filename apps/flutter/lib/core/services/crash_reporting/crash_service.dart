import 'package:flutter/foundation.dart';

/// Abstract crash reporting service interface
///
/// This interface defines methods for tracking crashes and errors.
/// Implementations include FirebaseCrashService and MockCrashService.
///
/// USAGE EXAMPLES:
///
/// Example 1: Record error manually
/// ```dart
/// try {
///   await riskyOperation();
/// } catch (e, stackTrace) {
///   await crashService.recordError(e, stackTrace);
///   rethrow;
/// }
/// ```
///
/// Example 2: Add custom context
/// ```dart
/// await crashService.setCustomKey('user_id', user.id);
/// await crashService.setCustomKey('screen', 'checkout');
/// await crashService.setCustomKey('cart_items', cart.items.length);
/// ```
///
/// Example 3: Log messages
/// ```dart
/// await crashService.log('User started checkout process');
/// ```
abstract class CrashService {
  /// Record an error
  ///
  /// [exception] - The exception to record
  /// [stackTrace] - Stack trace (optional)
  /// [reason] - Additional context (optional)
  /// [fatal] - Whether this is a fatal error (optional)
  Future<void> recordError(
    dynamic exception,
    StackTrace? stackTrace, {
    String? reason,
    bool fatal = false,
  });

  /// Record Flutter error
  ///
  /// [details] - Flutter error details
  /// [fatal] - Whether this is a fatal error (optional)
  Future<void> recordFlutterError(
    FlutterErrorDetails details, {
    bool fatal = false,
  });

  /// Log a message
  ///
  /// [message] - Message to log
  Future<void> log(String message);

  /// Set custom key
  ///
  /// [key] - Key name
  /// [value] - Value (String, int, bool, or double)
  Future<void> setCustomKey(String key, dynamic value);

  /// Set user identifier
  ///
  /// [userId] - User ID
  Future<void> setUserIdentifier(String userId);

  /// Check if crash reporting is enabled
  bool get isEnabled;
}
