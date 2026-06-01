/// General application constants
///
/// This file contains app-wide constants that don't change across environments.
/// For environment-specific values, use EnvironmentConfig instead.
class AppConstants {
  // Prevent instantiation
  AppConstants._();

  // ========== App Information ==========
  static const String appName = 'Flutter Boilerplate';
  static const String packageName = 'com.example.flutter_boilerplate';
  static const String version = '1.0.0';
  static const int buildNumber = 1;

  // ========== API Configuration ==========
  static const Duration apiTimeout = Duration(seconds: 30);
  static const Duration connectTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);
  static const int maxRetryAttempts = 3;
  static const Duration retryDelay = Duration(seconds: 2);

  // ========== Pagination ==========
  static const int defaultPageSize = 20;
  static const int maxPageSize = 100;
  static const int initialPage = 1;

  // ========== Cache Configuration ==========
  static const Duration cacheValidity = Duration(hours: 24);
  static const int maxCacheSize = 50 * 1024 * 1024; // 50 MB

  // ========== Image Configuration ==========
  static const int maxImageSize = 5 * 1024 * 1024; // 5 MB
  static const List<String> allowedImageFormats = [
    'jpg',
    'jpeg',
    'png',
    'webp',
  ];
  static const int imageQuality = 85; // 0-100

  // ========== Validation Rules ==========
  static const int minPasswordLength = 8;
  static const int maxPasswordLength = 32;
  static const int otpLength = 6;
  static const Duration otpValidityDuration = Duration(minutes: 5);
  static const int minUsernameLength = 3;
  static const int maxUsernameLength = 20;

  // ========== UI Configuration ==========
  static const Duration animationDuration = Duration(milliseconds: 300);
  static const Duration splashDuration = Duration(seconds: 2);
  static const Duration debounceDelay = Duration(milliseconds: 500);
  static const Duration toastDuration = Duration(seconds: 3);
  static const double borderRadius = 8.0;
  static const double cardElevation = 2.0;

  // ========== Date & Time Formats ==========
  static const String dateFormat = 'dd/MM/yyyy';
  static const String dateTimeFormat = 'dd/MM/yyyy HH:mm';
  static const String timeFormat = 'HH:mm';
  static const String apiDateFormat = 'yyyy-MM-dd';
  static const String apiDateTimeFormat = 'yyyy-MM-ddTHH:mm:ss';

  // ========== Regular Expressions ==========
  static final RegExp emailRegex = RegExp(
    r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
  );
  static final RegExp phoneRegex = RegExp(r'^\+?[1-9]\d{1,14}$');
  static final RegExp passwordRegex = RegExp(
    r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]',
  );
}
