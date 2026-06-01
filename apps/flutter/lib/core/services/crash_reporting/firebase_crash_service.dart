import 'package:firebase_crashlytics/firebase_crashlytics.dart';
import 'package:flutter/foundation.dart';
import 'crash_service.dart';
import '../../../config/environment_config.dart';

/// Firebase Crashlytics service implementation
///
/// This service is OPTIONAL. Enable it by setting:
/// - USE_FIREBASE=true
/// - ENABLE_CRASH_REPORTING=true
///
/// Setup Instructions:
/// 1. Add firebase_crashlytics to pubspec.yaml
/// 2. Configure Firebase in your project
/// 3. Set USE_FIREBASE=true and ENABLE_CRASH_REPORTING=true in .env
/// 4. Initialize in main.dart
///
/// USAGE EXAMPLES:
///
/// Example 1: Initialize in main.dart
/// ```dart
/// void main() async {
///   WidgetsFlutterBinding.ensureInitialized();
///   await EnvironmentConfig.initialize(environment: Environment.prod);
///
///   if (EnvironmentConfig.instance.useFirebase) {
///     await Firebase.initializeApp();
///
///     if (EnvironmentConfig.instance.enableCrashReporting) {
///       // Pass all uncaught errors to Crashlytics
///       FlutterError.onError = FirebaseCrashlytics.instance.recordFlutterError;
///
///       // Pass all uncaught async errors
///       PlatformDispatcher.instance.onError = (error, stack) {
///         FirebaseCrashlytics.instance.recordError(error, stack, fatal: true);
///         return true;
///       };
///     }
///   }
///
///   runApp(MyApp());
/// }
/// ```
///
/// Example 2: Track errors in repository
/// ```dart
/// class UserRepository {
///   final CrashService crashService;
///
///   Future<User> getUser(String id) async {
///     await crashService.log('Fetching user: $id');
///     await crashService.setCustomKey('user_id', id);
///
///     try {
///       final response = await httpClient.get('/users/$id');
///       return User.fromJson(response.data);
///     } catch (e, stackTrace) {
///       await crashService.recordError(
///         e,
///         stackTrace,
///         reason: 'Failed to fetch user',
///       );
///       rethrow;
///     }
///   }
/// }
/// ```
///
/// Example 3: Add user context
/// ```dart
/// Future<void> onUserLogin(User user) async {
///   await crashService.setUserIdentifier(user.id);
///   await crashService.setCustomKey('email', user.email);
///   await crashService.setCustomKey('user_type', user.accountType);
///   await crashService.setCustomKey('premium', user.isPremium);
/// }
/// ```
class FirebaseCrashService implements CrashService {
  final FirebaseCrashlytics _crashlytics;

  FirebaseCrashService(this._crashlytics) {
    if (!EnvironmentConfig.instance.useFirebase) {
      if (kDebugMode) {
        debugPrint('⚠️ Firebase Crashlytics is disabled in environment config');
      }
    }
  }

  @override
  bool get isEnabled =>
      EnvironmentConfig.instance.useFirebase &&
      EnvironmentConfig.instance.enableCrashReporting;

  @override
  Future<void> recordError(
    dynamic exception,
    StackTrace? stackTrace, {
    String? reason,
    bool fatal = false,
  }) async {
    if (!isEnabled) return;

    try {
      await _crashlytics.recordError(
        exception,
        stackTrace,
        reason: reason,
        fatal: fatal,
      );

      if (kDebugMode) {
        debugPrint('💥 Crash Reported: $exception');
      }
    } catch (e) {
      if (kDebugMode) {
        debugPrint('❌ Crashlytics Error: $e');
      }
    }
  }

  @override
  Future<void> recordFlutterError(
    FlutterErrorDetails details, {
    bool fatal = false,
  }) async {
    if (!isEnabled) return;

    try {
      await _crashlytics.recordFlutterError(details);

      if (kDebugMode) {
        debugPrint('💥 Flutter Error Reported: ${details.exception}');
      }
    } catch (e) {
      if (kDebugMode) {
        debugPrint('❌ Crashlytics Error: $e');
      }
    }
  }

  @override
  Future<void> log(String message) async {
    if (!isEnabled) return;

    try {
      await _crashlytics.log(message);

      if (kDebugMode) {
        debugPrint('📝 Crash Log: $message');
      }
    } catch (e) {
      if (kDebugMode) {
        debugPrint('❌ Crashlytics Error: $e');
      }
    }
  }

  @override
  Future<void> setCustomKey(String key, dynamic value) async {
    if (!isEnabled) return;

    try {
      if (value is String) {
        await _crashlytics.setCustomKey(key, value);
      } else if (value is int) {
        await _crashlytics.setCustomKey(key, value);
      } else if (value is bool) {
        await _crashlytics.setCustomKey(key, value);
      } else if (value is double) {
        await _crashlytics.setCustomKey(key, value);
      } else {
        await _crashlytics.setCustomKey(key, value.toString());
      }

      if (kDebugMode) {
        debugPrint('🏷️ Crash Custom Key: $key = $value');
      }
    } catch (e) {
      if (kDebugMode) {
        debugPrint('❌ Crashlytics Error: $e');
      }
    }
  }

  @override
  Future<void> setUserIdentifier(String userId) async {
    if (!isEnabled) return;

    try {
      await _crashlytics.setUserIdentifier(userId);

      if (kDebugMode) {
        debugPrint('👤 Crash User ID: $userId');
      }
    } catch (e) {
      if (kDebugMode) {
        debugPrint('❌ Crashlytics Error: $e');
      }
    }
  }

  /// Check if Crashlytics collection is enabled
  Future<bool> isCrashlyticsCollectionEnabled() async {
    if (!isEnabled) return false;
    return _crashlytics.isCrashlyticsCollectionEnabled;
  }

  /// Enable or disable Crashlytics collection
  ///
  /// Useful for respecting user privacy preferences
  Future<void> setCrashlyticsCollectionEnabled(bool enabled) async {
    if (!isEnabled) return;
    await _crashlytics.setCrashlyticsCollectionEnabled(enabled);
  }

  /// Send unsent reports
  ///
  /// Manually trigger sending any queued crash reports
  Future<void> sendUnsentReports() async {
    if (!isEnabled) return;
    await _crashlytics.sendUnsentReports();
  }

  /// Delete unsent reports
  ///
  /// Delete any queued crash reports without sending
  Future<void> deleteUnsentReports() async {
    if (!isEnabled) return;
    await _crashlytics.deleteUnsentReports();
  }
}
