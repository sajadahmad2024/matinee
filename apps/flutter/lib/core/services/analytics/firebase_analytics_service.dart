import 'package:firebase_analytics/firebase_analytics.dart';
import 'package:flutter/foundation.dart';
import 'analytics_service.dart';
// import '../../../config/environment_config.dart';

/// Firebase Analytics service implementation
///
/// This service is OPTIONAL. Enable it by setting USE_FIREBASE=true in .env
///
/// Setup Instructions:
/// 1. Add firebase_analytics to pubspec.yaml
/// 2. Configure Firebase in your project (google-services.json / GoogleService-Info.plist)
/// 3. Set USE_FIREBASE=true in .env file
/// 4. Register this service in dependency injection
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
///   }
///
///   runApp(MyApp());
/// }
/// ```
///
/// Example 2: Track user journey
/// ```dart
/// class AuthBloc extends Bloc<AuthEvent, AuthState> {
///   final AnalyticsService analytics;
///
///   Future<void> _onLoginRequested(LoginRequested event, emit) async {
///     try {
///       final user = await authRepository.login(event.email, event.password);
///
///       // Track successful login
///       await analytics.logLogin(method: 'email');
///       await analytics.setUserId(user.id);
///       await analytics.setUserProperty(
///         name: 'account_type',
///         value: user.accountType,
///       );
///
///       emit(AuthAuthenticated(user));
///     } catch (e) {
///       emit(AuthError(e.toString()));
///     }
///   }
/// }
/// ```
///
/// Example 3: Track e-commerce events
/// ```dart
/// Future<void> onPurchaseComplete(Order order) async {
///   await analytics.logPurchase(
///     value: order.totalAmount,
///     currency: 'USD',
///     items: order.items.map((item) => {
///       'item_id': item.id,
///       'item_name': item.name,
///       'price': item.price,
///       'quantity': item.quantity,
///     }).toList(),
///   );
/// }
/// ```

class FirebaseAnalyticsService implements AnalyticsService {
  final FirebaseAnalytics _analytics;

  FirebaseAnalyticsService(this._analytics);

  @override
  Future<void> logEvent({
    required String name,
    Map<String, dynamic>? parameters,
  }) async {
    await _analytics.logEvent(
      name: name,
      parameters: parameters?.cast<String, Object>(),
    );

    if (kDebugMode) {
      print('📊 Analytics Event: $name ${parameters ?? ""}');
    }
  }

  @override
  Future<void> logScreenView({
    required String screenName,
    String? screenClass,
  }) async {
    await _analytics.logScreenView(
      screenName: screenName,
      screenClass: screenClass ?? screenName,
    );
  }

  @override
  Future<void> logLogin({String? method}) async {
    await _analytics.logLogin(loginMethod: method);
  }

  @override
  Future<void> logSignUp({String? method}) async {
    await _analytics.logSignUp(signUpMethod: method ?? 'unknown');
  }

  @override
  Future<void> logPurchase({
    required double value,
    required String currency,
    List<Map<String, dynamic>>? items,
  }) async {
    await _analytics.logPurchase(
      value: value,
      currency: currency,
      items: items
          ?.map(
            (item) => AnalyticsEventItem(
              itemId: item['item_id'],
              itemName: item['item_name'],
              price: item['price'],
              quantity: item['quantity'],
            ),
          )
          .toList(),
    );
  }

  @override
  Future<void> logSearch({required String searchTerm}) async {
    await _analytics.logSearch(searchTerm: searchTerm);
  }

  @override
  Future<void> setUserId(String? userId) async {
    await _analytics.setUserId(id: userId);
  }

  @override
  Future<void> setUserProperty({
    required String name,
    required String value,
  }) async {
    await _analytics.setUserProperty(name: name, value: value);
  }

  @override
  Future<void> resetAnalyticsData() async {
    await _analytics.resetAnalyticsData();
  }
}
