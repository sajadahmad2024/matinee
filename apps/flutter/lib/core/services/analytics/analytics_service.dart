/// Abstract analytics service interface
///
/// This interface defines methods for tracking analytics events.
/// Implementations include FirebaseAnalyticsService and MockAnalyticsService.
///
/// USAGE EXAMPLES:
///
/// Example 1: Track screen views
/// ```dart
/// class HomePage extends StatelessWidget {
///   final analytics = getIt<AnalyticsService>();
///
///   @override
///   void initState() {
///     super.initState();
///     analytics.logScreenView(screenName: 'Home');
///   }
/// }
/// ```
///
/// Example 2: Track user actions
/// ```dart
/// void onButtonPressed() {
///   analytics.logEvent(
///     name: 'button_pressed',
///     parameters: {
///       'button_name': 'submit',
///       'screen': 'login',
///     },
///   );
/// }
/// ```
///
/// Example 3: Track user properties
/// ```dart
/// Future<void> onUserLogin(User user) async {
///   await analytics.setUserId(user.id);
///   await analytics.setUserProperty(
///     name: 'user_type',
///     value: user.isPremium ? 'premium' : 'free',
///   );
/// }
/// ```
abstract class AnalyticsService {
  /// Log a custom event
  ///
  /// [name] - Event name (e.g., 'button_clicked', 'item_purchased')
  /// [parameters] - Event parameters (optional)
  Future<void> logEvent({
    required String name,
    Map<String, dynamic>? parameters,
  });

  /// Log screen view
  ///
  /// [screenName] - Name of the screen
  /// [screenClass] - Class name (optional)
  Future<void> logScreenView({required String screenName, String? screenClass});

  /// Log login event
  ///
  /// [method] - Login method (e.g., 'email', 'google', 'facebook')
  Future<void> logLogin({String? method});

  /// Log sign up event
  ///
  /// [method] - Sign up method (e.g., 'email', 'google', 'facebook')
  Future<void> logSignUp({String? method});

  /// Log purchase event
  ///
  /// [value] - Purchase value
  /// [currency] - Currency code (e.g., 'USD', 'EUR')
  /// [items] - List of items purchased (optional)
  Future<void> logPurchase({
    required double value,
    required String currency,
    List<Map<String, dynamic>>? items,
  });

  /// Log search event
  ///
  /// [searchTerm] - The search query
  Future<void> logSearch({required String searchTerm});

  /// Set user ID
  ///
  /// [userId] - Unique user identifier
  Future<void> setUserId(String? userId);

  /// Set user property
  ///
  /// [name] - Property name
  /// [value] - Property value
  Future<void> setUserProperty({required String name, required String value});

  /// Reset analytics data
  ///
  /// Call this when user logs out
  Future<void> resetAnalyticsData();
}
