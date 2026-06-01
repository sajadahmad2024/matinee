/// Storage keys constants for consistent key naming across the app.
///
/// USAGE:
/// ```dart
/// // Instead of magic strings
/// await storage.write('access_token', token); // ❌ Bad
///
/// // Use constants
/// await storage.write(StorageKeys.accessToken, token); // ✅ Good
/// ```
///
/// BENEFITS:
/// - Prevents typos
/// - Auto-complete support
/// - Easy to refactor
/// - Self-documenting
/// - Compile-time checking
class StorageKeys {
  StorageKeys._(); // Private constructor to prevent instantiation

  // ========== AUTHENTICATION ==========
  
  /// Access token (JWT) for API authentication
  /// Storage: SecureStorage
  /// 
  
  static const String accessToken = 'access_token';

   static const String authToken = 'auth_token';

  /// Refresh token for token renewal
  /// Storage: SecureStorage
  static const String refreshToken = 'refresh_token';

  /// Token expiration timestamp
  /// Storage: SecureStorage
  static const String tokenExpiry = 'token_expiry';

  /// Current authenticated user data
  /// Storage: SecureStorage (JSON)
  static const String currentUser = 'current_user';

  /// User ID
  /// Storage: SecureStorage
  static const String userId = 'user_id';

    static const String user = 'user_data';

  /// Remember me flag
  /// Storage: LocalStorage
  static const String rememberMe = 'remember_me';

  /// Saved email for remember me
  /// Storage: SecureStorage
  static const String savedEmail = 'saved_email';

  /// Biometric authentication enabled
  /// Storage: LocalStorage
  static const String biometricEnabled = 'biometric_enabled';

  // ========== USER PREFERENCES ==========

  /// App theme (light, dark, system)
  /// Storage: LocalStorage
  static const String theme = 'theme';

  /// App language code (en, es, fr, etc.)
  /// Storage: LocalStorage
  static const String language = 'language';

  /// Font size preference
  /// Storage: LocalStorage
  static const String fontSize = 'font_size';

  /// Notifications enabled
  /// Storage: LocalStorage
  static const String notificationsEnabled = 'notifications_enabled';

  /// Sound enabled
  /// Storage: LocalStorage
  static const String soundEnabled = 'sound_enabled';

  /// Vibration enabled
  /// Storage: LocalStorage
  static const String vibrationEnabled = 'vibration_enabled';

  /// Push notifications enabled
  /// Storage: LocalStorage
  static const String pushNotificationsEnabled = 'push_notifications_enabled';

  /// Email notifications enabled
  /// Storage: LocalStorage
  static const String emailNotificationsEnabled = 'email_notifications_enabled';

  // ========== ONBOARDING & FIRST RUN ==========

  /// User has completed onboarding
  /// Storage: LocalStorage
  static const String onboardingCompleted = 'onboarding_completed';

  /// App first launch timestamp
  /// Storage: LocalStorage
  static const String firstLaunchTime = 'first_launch_time';

  /// App install date
  /// Storage: LocalStorage
  static const String installDate = 'install_date';

  /// Last app version
  /// Storage: LocalStorage
  static const String lastAppVersion = 'last_app_version';

  // ========== CACHE & TEMPORARY ==========

  /// Last sync timestamp
  /// Storage: LocalStorage
  static const String lastSyncTime = 'last_sync_time';

  /// Cached data timestamp
  /// Storage: LocalStorage
  static const String cacheTimestamp = 'cache_timestamp';

  /// Recent searches
  /// Storage: LocalStorage (List)
  static const String recentSearches = 'recent_searches';

  /// Search history
  /// Storage: LocalStorage (List)
  static const String searchHistory = 'search_history';

  // ========== API & NETWORK ==========

  /// API base URL (for environment switching)
  /// Storage: LocalStorage
  static const String apiBaseUrl = 'api_base_url';

  /// API key (if needed)
  /// Storage: SecureStorage
  static const String apiKey = 'api_key';

  /// FCM token for push notifications
  /// Storage: SecureStorage
  static const String fcmToken = 'fcm_token';

  /// Device ID
  /// Storage: LocalStorage
  static const String deviceId = 'device_id';

  // ========== FEATURES & FLAGS ==========

  /// Feature flags (JSON)
  /// Storage: LocalStorage
  static const String featureFlags = 'feature_flags';

  /// A/B test variant
  /// Storage: LocalStorage
  static const String abTestVariant = 'ab_test_variant';

  /// Beta features enabled
  /// Storage: LocalStorage
  static const String betaFeaturesEnabled = 'beta_features_enabled';

  // ========== ANALYTICS ==========

  /// Analytics enabled
  /// Storage: LocalStorage
  static const String analyticsEnabled = 'analytics_enabled';

  /// Crash reporting enabled
  /// Storage: LocalStorage
  static const String crashReportingEnabled = 'crash_reporting_enabled';

  /// User session ID
  /// Storage: LocalStorage
  static const String sessionId = 'session_id';

  /// Last analytics sync
  /// Storage: LocalStorage
  static const String lastAnalyticsSync = 'last_analytics_sync';

  // ========== SENSITIVE DATA (Use EncryptedStorage) ==========

  /// Social Security Number (example - use with care!)
  /// Storage: EncryptedStorage
  /// WARNING: Consider if you really need to store this
  static const String ssn = 'ssn_encrypted';

  /// Payment information (example - prefer tokenization!)
  /// Storage: EncryptedStorage
  /// WARNING: Use payment provider tokens instead
  static const String paymentInfo = 'payment_info_encrypted';

  /// Medical records (example)
  /// Storage: EncryptedStorage
  static const String medicalRecords = 'medical_records_encrypted';

  // ========== DEBUG & DEVELOPMENT ==========

  /// Debug mode enabled
  /// Storage: LocalStorage
  static const String debugMode = 'debug_mode';

  /// Mock data enabled
  /// Storage: LocalStorage
  static const String mockDataEnabled = 'mock_data_enabled';

  /// Environment (dev, staging, prod)
  /// Storage: LocalStorage
  static const String environment = 'environment';

  // ========== HELPER METHODS ==========

  /// Get all authentication-related keys
  static List<String> get authKeys => [
        accessToken,
        refreshToken,
        tokenExpiry,
        currentUser,
        userId,
      ];

  /// Get all user preference keys
  static List<String> get preferenceKeys => [
        theme,
        language,
        fontSize,
        notificationsEnabled,
        soundEnabled,
        vibrationEnabled,
      ];

  /// Get all sensitive data keys
  static List<String> get sensitiveKeys => [
        ssn,
        paymentInfo,
        medicalRecords,
      ];

  /// Check if key is for sensitive data
  static bool isSensitiveKey(String key) {
    return sensitiveKeys.contains(key);
  }

  /// Check if key is for authentication
  static bool isAuthKey(String key) {
    return authKeys.contains(key);
  }

  /// Check if key is for preferences
  static bool isPreferenceKey(String key) {
    return preferenceKeys.contains(key);
  }
}

/// USAGE EXAMPLES:
///
/// Example 1: Save auth token
/// ```dart
/// await secureStorage.write(StorageKeys.accessToken, token);
/// ```
///
/// Example 2: Get theme preference
/// ```dart
/// final theme = await localStorage.read<String>(StorageKeys.theme) ?? 'light';
/// ```
///
/// Example 3: Clear all auth data
/// ```dart
/// for (final key in StorageKeys.authKeys) {
///   await secureStorage.delete(key);
/// }
/// ```
///
/// Example 4: Check if storing sensitive data
/// ```dart
/// if (StorageKeys.isSensitiveKey(key)) {
///   await encryptedStorage.write(key, value);
/// } else {
///   await secureStorage.write(key, value);
/// }
/// ```
