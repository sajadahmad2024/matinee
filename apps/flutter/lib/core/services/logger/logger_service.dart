import 'package:flutter/foundation.dart';
import 'package:logger/logger.dart';
import '../../../config/environment_config.dart';
import '../error_tracking/sentry_service.dart';

/// Logger service with Sentry integration
class LoggerService {
  static LoggerService? _instance;
  late final Logger _logger;

  static LoggerService get instance {
    _instance ??= LoggerService._();
    return _instance!;
  }

  LoggerService._() {
    _logger = Logger(
      filter: ProductionFilter(),
      printer: PrettyPrinter(),
      output: ConsoleOutput(),
    );
  }

  void d(String message, [dynamic error, StackTrace? stackTrace]) {
    _logger.d(message);
    _addBreadcrumb(message, LogLevel.debug, error, stackTrace);
  }

  void i(String message, [dynamic error, StackTrace? stackTrace]) {
    _logger.i(message);
    _addBreadcrumb(message, LogLevel.info, error, stackTrace);
  }

  void w(String message, [dynamic error, StackTrace? stackTrace]) {
    _logger.w(message);
    _addBreadcrumb(message, LogLevel.warning, error, stackTrace);
  }

  void e(String message, [dynamic error, StackTrace? stackTrace]) {
    _logger.e(message, error: error, stackTrace: stackTrace);
    _addBreadcrumb(message, LogLevel.error, error, stackTrace);

    // Send error to Sentry
    if (EnvironmentConfig.instance.enableCrashReporting) {
      SentryService.captureException(
        error ?? message,
        stackTrace: stackTrace,
        message: message,
      );
    }
  }

  void _addBreadcrumb(
    String message,
    LogLevel level,
    dynamic error,
    StackTrace? stackTrace,
  ) {
    if (!EnvironmentConfig.instance.enableCrashReporting) return;

    SentryService.addBreadcrumb(
      message: message,
      category: 'log',
      level: _mapLogLevelToSeverity(level),
      data: error != null ? {'error': error.toString()} : null,
    );
  }

  Severity _mapLogLevelToSeverity(LogLevel level) {
    switch (level) {
      case LogLevel.debug:
        return Severity.debug;
      case LogLevel.info:
        return Severity.info;
      case LogLevel.warning:
        return Severity.warning;
      case LogLevel.error:
        return Severity.error;
      case LogLevel.wtf:
        return Severity.fatal;
    }
  }
}

enum LogLevel { debug, info, warning, error, wtf }

class ConsoleOutput extends LogOutput {
  @override
  void output(OutputEvent event) {
    for (var line in event.lines) {
      print(line);
    }
  }
}

class ProductionFilter extends LogFilter {
  @override
  bool shouldLog(LogEvent event) {
    if (kReleaseMode) {
      return event.level.index >= LogLevel.warning.index;
    }
    return true;
  }
}
