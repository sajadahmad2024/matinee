import 'package:flutter/foundation.dart';
import 'package:sentry_flutter/sentry_flutter.dart';

/// Handles uncaught exceptions and platform errors
class GlobalErrorHandler {
  static void initialize() {
    // Handle Flutter framework errors
    FlutterError.onError = _handleFlutterError;

    // Handle platform errors (in main.dart, needs await SentryFlutter.init)
    if (!kDebugMode) {
      PlatformDispatcher.instance.onError = _handlePlatformError;
    }
  }

  static void _handleFlutterError(FlutterErrorDetails details) {
    // Send to Sentry
    Sentry.captureException(details.exception, stackTrace: details.stack);

    // Log to console
    print('❌ Flutter Error: ${details.exception}');
    print('Stack: ${details.stack}');
  }

  static bool _handlePlatformError(Object error, StackTrace stack) {
    // Send to Sentry
    Sentry.captureException(error, stackTrace: stack);

    // Log to console
    print('❌ Platform Error: $error');
    print('Stack: $stack');

    return true;
  }
}
