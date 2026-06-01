import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

import '../core/utils/constants/log_constants.dart';

enum Environment { dev, staging, prod }

class EnvironmentConfig {
  final Environment environment;
  final String name;
  final String apiBaseUrl;
  final bool enableLogging;
  final bool useFirebase;
  final bool enableCrashReporting;
  final bool enableAnalytics;
  final Map<String, dynamic> values;

  EnvironmentConfig._({
    required this.environment,
    required this.name,
    required this.apiBaseUrl,
    required this.enableLogging,
    required this.useFirebase,
    required this.enableCrashReporting,
    required this.enableAnalytics,
    this.values = const {},
  });

  static EnvironmentConfig? _instance;

  static EnvironmentConfig get instance {
    if (_instance == null) {
      throw Exception(
        'EnvironmentConfig has not been initialized. '
        'Call EnvironmentConfig.initialize() first.',
      );
    }
    return _instance!;
  }

  /// Initialize environment configuration from .env file
  static Future<void> initialize({required Environment environment}) async {
    // Load appropriate .env file
    String envFile;
    switch (environment) {
      case Environment.dev:
        envFile = '.env.example';
        break;
      case Environment.staging:
        envFile = '.env.staging';
        break;
      case Environment.prod:
        envFile = '.env.prod';
        break;
    }

    try {
      await dotenv.load(fileName: envFile);
    } catch (e) {
      if (kDebugMode) {
        debugPrint('⚠️  Failed to load $envFile: $e');
        debugPrint('💡 Make sure to create $envFile from .env.example');
      }
      rethrow;
    }

    _instance = EnvironmentConfig._(
      environment: environment,
      name: dotenv.env['APP_NAME'] ?? 'Flutter Boilerplate',
      apiBaseUrl: dotenv.env['API_BASE_URL'] ?? '',
      enableLogging: dotenv.env['ENABLE_LOGGING'] == 'true',
      useFirebase: dotenv.env['USE_FIREBASE'] == 'true',
      enableCrashReporting: dotenv.env['ENABLE_CRASH_REPORTING'] == 'true',
      enableAnalytics: dotenv.env['ENABLE_ANALYTICS'] == 'true',
      values: {
        'googleWebClientId': dotenv.env['GOOGLE_WEB_CLIENT_ID'] ?? '',
        'firebaseApiKey': dotenv.env['FIREBASE_API_KEY'] ?? '',
        'firebaseProjectId': dotenv.env['FIREBASE_PROJECT_ID'] ?? '',
        'sentryDsn': dotenv.env['SENTRY_DSN'] ?? '',
        'apiTimeout': int.tryParse(dotenv.env['API_TIMEOUT'] ?? '30') ?? 30,
        'apiSecret': dotenv.env['API_SECRET'] ?? '',
      },
    );

    if (kDebugMode && LogConstants.enableDebugLogs) {
      debugPrint(
        '[${LogConstants.tagEnvironment}] Environment: ${_instance!.name}',
      );
      debugPrint(
        '[${LogConstants.tagEnvironment}] API Base URL: ${_instance!.apiBaseUrl}',
      );
      debugPrint(
        '[${LogConstants.tagEnvironment}] Logging: ${_instance!.enableLogging}',
      );
      debugPrint(
        '[${LogConstants.tagEnvironment}] Firebase: ${_instance!.useFirebase}',
      );
      debugPrint(
        '[${LogConstants.tagEnvironment}] Analytics: ${_instance!.enableAnalytics}',
      );
      debugPrint(
        '[${LogConstants.tagEnvironment}] Crash Reporting: ${_instance!.enableCrashReporting}',
      );
    }
  }

  // Convenience getters
  bool get isDevelopment => environment == Environment.dev;
  bool get isStaging => environment == Environment.staging;
  bool get isProduction => environment == Environment.prod;

  String get googleWebClientId => values['googleWebClientId'] ?? '';
  String get firebaseApiKey => values['firebaseApiKey'] ?? '';
  String get firebaseProjectId => values['firebaseProjectId'] ?? '';
  String get sentryDsn => values['sentryDsn'] ?? '';
  int get apiTimeout => values['apiTimeout'] ?? 30;
  String get apiSecret => values['apiSecret'] as String? ?? '';
}
