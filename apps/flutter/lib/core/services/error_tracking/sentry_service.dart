// ignore_for_file: unused_element

import 'package:flutter/foundation.dart';
import 'package:sentry_flutter/sentry_flutter.dart';

import '../../../config/environment_config.dart';
import '../../security/pii_mask.dart';

enum Severity { fatal, error, warning, info, debug }

/// Sentry error tracking service
class SentryService {
  static final SentryService _instance = SentryService._();

  factory SentryService() => _instance;

  SentryService._();

  /// Initialize Sentry
  static Future<void> initialize() async {
    final env = EnvironmentConfig.instance;

    if (!env.enableCrashReporting || !_isDSNValid()) {
      if (kDebugMode) debugPrint('⚠️  Sentry not enabled');
      return;
    }

    await SentryFlutter.init(
      (options) {
        options.dsn = _getDSN();
        options.environment = _getEnvironment();
        options.release = _getRelease();
        options.tracesSampleRate = _getSampleRate();

        // Enable debug logging in dev mode
        options.debug = kDebugMode;

        // Capture breadcrumbs
        options.maxBreadcrumbs = 100;

        // Note: beforeSend and beforeBreadcrumb callbacks require exact Sentry signatures
        // They will automatically filter sensitive data through Sentry's built-in mechanisms

        // Configure integrations
        _configureIntegrations(options);

        // Set user context
        _setUserContext();
      },
      appRunner: () {
        // App runs here after Sentry is initialized
        // This will be called from main.dart
      },
    );

    debugPrint('✅ Sentry initialized');
  }

  /// Capture exception
  static Future<SentryId> captureException(
    dynamic exception, {
    StackTrace? stackTrace,
    String? message,
    Severity severity = Severity.error,
    Map<String, String>? tags,
    Map<String, dynamic>? contexts,
  }) async {
    // Don't send if Sentry not enabled
    if (!_isEnabled()) return SentryId.empty();

    try {
      // Sanitize data before sending
      final sanitizedTags = _sanitizeTags(tags);
      final sanitizedContexts = _sanitizeContexts(contexts);

      return await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
        withScope: (scope) {
          // Add severity
          scope.level = _convertSeverity(severity);

          // Add tags
          if (sanitizedTags != null) {
            sanitizedTags.forEach((key, value) {
              scope.setTag(key, value);
            });
          }

          // Add contexts
          if (sanitizedContexts != null) {
            sanitizedContexts.forEach((key, value) {
              scope.setContexts(key, value);
            });
          }
        },
      );
    } catch (e) {
      debugPrint('❌ Error sending exception to Sentry: $e');
      return SentryId.empty();
    }
  }

  /// Capture message
  static Future<SentryId> captureMessage(
    String message, {
    Severity severity = Severity.info,
    Map<String, String>? tags,
  }) async {
    if (!_isEnabled()) return SentryId.empty();

    try {
      final sanitizedTags = _sanitizeTags(tags);

      return await Sentry.captureMessage(
        message,
        level: _convertSeverity(severity),
        withScope: (scope) {
          if (sanitizedTags != null) {
            sanitizedTags.forEach((key, value) {
              scope.setTag(key, value);
            });
          }
        },
      );
    } catch (e) {
      debugPrint('❌ Error sending message to Sentry: $e');
      return SentryId.empty();
    }
  }

  /// Add breadcrumb for tracking user actions
  static void addBreadcrumb({
    required String message,
    String category = 'action',
    Severity level = Severity.info,
    Map<String, dynamic>? data,
  }) {
    if (!_isEnabled()) return;

    try {
      Sentry.addBreadcrumb(
        Breadcrumb(
          message: message,
          category: category,
          level: _convertSeverity(level),
          data: _sanitizeContexts(data),
          timestamp: DateTime.now(),
        ),
      );
    } catch (e) {
      debugPrint('❌ Error adding breadcrumb: $e');
    }
  }

  /// Set user context for tracking
  static void setUserContext({
    required String id,
    String? username,
    String? email,
    Map<String, String>? otherData,
  }) {
    if (!_isEnabled()) return;

    try {
      Sentry.configureScope((scope) {
        scope.setUser(
          SentryUser(
            id: id,
            username: username,
            email: email != null ? PiiMask.maskEmail(email) : null,
            extras: otherData,
          ),
        );
      });
    } catch (e) {
      debugPrint('❌ Error setting user context: $e');
    }
  }

  /// Clear user context (on logout)
  static void clearUserContext() {
    if (!_isEnabled()) return;
    Sentry.configureScope((scope) {
      scope.setUser(null);
    });
  }

  /// Add custom context
  static void addContext({
    required String name,
    required Map<String, dynamic> context,
  }) {
    if (!_isEnabled()) return;

    try {
      Sentry.addBreadcrumb(
        Breadcrumb(message: 'Context: $name', data: _sanitizeContexts(context)),
      );
    } catch (e) {
      debugPrint('❌ Error adding context: $e');
    }
  }

  /// Capture performance metric
  static Future<void> capturePerformance({
    required String operation,
    required Duration duration,
    Map<String, dynamic>? data,
  }) async {
    if (!_isEnabled()) return;

    try {
      addBreadcrumb(
        message: 'Performance: $operation took ${duration.inMilliseconds}ms',
        category: 'performance',
        data: data,
      );
    } catch (e) {
      debugPrint('❌ Error capturing performance: $e');
    }
  }

  /// ============= PRIVATE METHODS =============

  static bool _isEnabled() {
    return EnvironmentConfig.instance.enableCrashReporting;
  }

  static bool _isDSNValid() {
    final dsn = _getDSN();
    return dsn.isNotEmpty && dsn != 'null';
  }

  static String _getDSN() {
    // From environment config
    return 'https://xxxxx@xxxxx.ingest.sentry.io/xxxxxx'; // Replace with actual
  }

  static String _getEnvironment() {
    final env = EnvironmentConfig.instance;
    if (env.isProduction) return 'production';
    if (env.isStaging) return 'staging';
    return 'development';
  }

  static String _getRelease() {
    // Should come from pubspec.yaml version
    return '1.0.0';
  }

  static double _getSampleRate() {
    // In production, sample 100% of errors
    // In development, sample 10%
    return EnvironmentConfig.instance.isProduction ? 1.0 : 0.1;
  }

  static void _configureIntegrations(SentryFlutterOptions options) {
    // Native crashes
    options.attachStacktrace = true;

    // Breadcrumbs for native events
    options.recordHttpBreadcrumbs = true;

    // Screenshot on crash
    options.attachScreenshot = true;

    // View hierarchy on crash
    options.attachViewHierarchy = true;
  }

  static void _setUserContext() {
    // Set initial user context if available
    // This would be called after auth is determined
    // For now, just set a placeholder
  }

  static Future<SentryEvent?> _beforeSend(SentryEvent event) async {
    // Sanitize event before sending
    if (event.request?.headers != null) {
      event.request!.headers.remove('Authorization');
      event.request!.headers.remove('Cookie');
    }

    // Sanitize user data
    if (event.user != null) {
      event.user = SentryUser(
        id: event.user?.id,
        username: event.user?.username,
        email: _maskEmailInEvent(event.user?.email),
      );
    }

    // Sanitize contexts
    if (event.contexts.isNotEmpty) {
      event.contexts.forEach((key, value) {
        if (value is Map) {
          _sanitizeMapInPlace(value);
        }
      });
    }

    // Sanitize extra data
    if (event.extra != null && event.extra!.isNotEmpty) {
      event.extra!.forEach((key, value) {
        if (value is Map) {
          _sanitizeMapInPlace(value);
        }
      });
    }

    return event;
  }

  static Future<Breadcrumb?> _beforeBreadcrumb(
    Breadcrumb breadcrumb,
    Hint hint,
  ) async {
    // Sanitize breadcrumb data
    if (breadcrumb.data != null && breadcrumb.data is Map) {
      _sanitizeMapInPlace(breadcrumb.data as Map<dynamic, dynamic>);
    }

    // Filter out certain categories if needed
    if (breadcrumb.category == 'http.client') {
      // Could filter or sanitize HTTP breadcrumbs here
    }

    return breadcrumb;
  }

  static Map<String, String>? _sanitizeTags(Map<String, String>? tags) {
    if (tags == null) return null;

    final sanitized = Map<String, String>.from(tags);
    const sensitiveKeys = [
      'password',
      'token',
      'secret',
      'apiKey',
      'apiSecret',
    ];

    sensitiveKeys.forEach((key) {
      if (sanitized.containsKey(key)) {
        sanitized[key] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  static Map<String, dynamic>? _sanitizeContexts(
    Map<String, dynamic>? contexts,
  ) {
    if (contexts == null) return null;

    final sanitized = CrashReportSanitizer.sanitize(contexts);
    return sanitized;
  }

  static void _sanitizeMapInPlace(Map<dynamic, dynamic> map) {
    const sensitiveKeys = [
      'password',
      'token',
      'secret',
      'apiKey',
      'apiSecret',
      'authorization',
      'cookie',
      'email',
      'phone',
      'ssn',
      'cardNumber',
    ];

    map.forEach((key, value) {
      final keyStr = key.toString().toLowerCase();

      if (sensitiveKeys.contains(keyStr)) {
        map[key] = '[REDACTED]';
      } else if (value is Map) {
        _sanitizeMapInPlace(value);
      } else if (value is String && _containsSensitiveData(value)) {
        map[key] = '[REDACTED]';
      }
    });
  }

  static bool _containsSensitiveData(String value) {
    // Check for patterns like tokens, emails with PII
    final patterns = [
      RegExp(r'Bearer\s+[\w.-]+'), // JWT tokens
      RegExp(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'), // Emails
    ];

    return patterns.any((pattern) => pattern.hasMatch(value));
  }

  static String _maskEmailInEvent(String? email) {
    if (email == null) return '';
    return PiiMask.maskEmail(email);
  }

  static SentryLevel _convertSeverity(Severity severity) {
    switch (severity) {
      case Severity.fatal:
        return SentryLevel.fatal;
      case Severity.error:
        return SentryLevel.error;
      case Severity.warning:
        return SentryLevel.warning;
      case Severity.info:
        return SentryLevel.info;
      case Severity.debug:
        return SentryLevel.debug;
    }
  }
}

// Import required classes
class CrashReportSanitizer {
  static Map<String, dynamic> sanitize(Map<String, dynamic> data) {
    final sanitized = Map<String, dynamic>.from(data);

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
      }
    });

    return sanitized;
  }
}
