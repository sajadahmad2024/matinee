import 'dart:async';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'notification_service.dart';
import '../../../config/environment_config.dart';

/// Firebase Cloud Messaging service implementation
///
/// This service is OPTIONAL. Enable it by setting:
/// - USE_FIREBASE=true
/// - ENABLE_PUSH_NOTIFICATIONS=true
///
/// Setup Instructions:
/// 1. Add firebase_messaging to pubspec.yaml
/// 2. Configure Firebase in your project
/// 3. Set USE_FIREBASE=true and ENABLE_PUSH_NOTIFICATIONS=true in .env
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
///     // Initialize FCM
///     final notificationService = FCMService();
///     await notificationService.initialize();
///
///     // Handle background messages
///     FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
///   }
///
///   runApp(MyApp());
/// }
///
/// // Top-level function for background messages
/// @pragma('vm:entry-point')
/// Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
///   await Firebase.initializeApp();
///   debugPrint('Background message: ${message.messageId}');
/// }
/// ```
///
/// Example 2: Handle notifications in app
/// ```dart
/// class MyApp extends StatefulWidget {
///   @override
///   State<MyApp> createState() => _MyAppState();
/// }
///
/// class _MyAppState extends State<MyApp> {
///   final notificationService = getIt<NotificationService>();
///
///   @override
///   void initState() {
///     super.initState();
///     _setupNotifications();
///   }
///
///   void _setupNotifications() {
///     // Listen to foreground messages
///     notificationService.onMessage.listen((notification) {
///       // Show in-app notification
///       ScaffoldMessenger.of(context).showSnackBar(
///         SnackBar(content: Text(notification.title ?? 'New notification')),
///       );
///     });
///
///     // Listen to notification taps
///     notificationService.onMessageOpenedApp.listen((notification) {
///       // Navigate based on notification data
///       final route = notification.data['route'];
///       if (route != null) {
///         Navigator.pushNamed(context, route);
///       }
///     });
///   }
/// }
/// ```
///
/// Example 3: Subscribe to topics
/// ```dart
/// // Subscribe to topics after login
/// Future<void> onUserLogin(User user) async {
///   await notificationService.subscribeToTopic('users');
///
///   if (user.isPremium) {
///     await notificationService.subscribeToTopic('premium_users');
///   }
///
///   await notificationService.subscribeToTopic('user_${user.id}');
/// }
///
/// // Unsubscribe on logout
/// Future<void> onUserLogout() async {
///   await notificationService.unsubscribeFromTopic('users');
///   await notificationService.unsubscribeFromTopic('premium_users');
/// }
/// ```
class FCMService implements NotificationService {
  final FirebaseMessaging _messaging;
  final StreamController<NotificationMessage> _messageController;
  final StreamController<NotificationMessage> _messageOpenedAppController;

  FCMService()
    : _messaging = FirebaseMessaging.instance,
      _messageController = StreamController<NotificationMessage>.broadcast(),
      _messageOpenedAppController =
          StreamController<NotificationMessage>.broadcast() {
    if (!EnvironmentConfig.instance.useFirebase) {
      if (kDebugMode) {
        debugPrint('⚠️ Firebase Messaging is disabled in environment config');
      }
    }
  }

  @override
  bool get isEnabled => EnvironmentConfig.instance.useFirebase;

  @override
  Future<void> initialize() async {
    if (!isEnabled) return;

    try {
      // Request permission (iOS)
      await requestPermission();

      // Configure foreground notification presentation (iOS)
      await _messaging.setForegroundNotificationPresentationOptions(
        alert: true,
        badge: true,
        sound: true,
      );

      // Handle foreground messages
      FirebaseMessaging.onMessage.listen((RemoteMessage message) {
        if (kDebugMode) {
          debugPrint('📩 Foreground message: ${message.notification?.title}');
        }
        _messageController.add(_convertToNotificationMessage(message));
      });

      // Handle notification taps when app is in background
      FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
        if (kDebugMode) {
          debugPrint(
            '📱 Notification opened app: ${message.notification?.title}',
          );
        }
        _messageOpenedAppController.add(_convertToNotificationMessage(message));
      });

      // Get initial message if app was opened from notification
      final initialMessage = await _messaging.getInitialMessage();
      if (initialMessage != null) {
        if (kDebugMode) {
          debugPrint(
            '📬 Initial message: ${initialMessage.notification?.title}',
          );
        }
        _messageOpenedAppController.add(
          _convertToNotificationMessage(initialMessage),
        );
      }

      // Get and log FCM token
      final token = await getToken();
      if (kDebugMode && token != null) {
        debugPrint('🔑 FCM Token: $token');
      }

      if (kDebugMode) {
        debugPrint('✅ FCM initialized successfully');
      }
    } catch (e) {
      if (kDebugMode) {
        debugPrint('❌ FCM initialization error: $e');
      }
    }
  }

  @override
  Future<String?> getToken() async {
    if (!isEnabled) return null;

    try {
      final token = await _messaging.getToken();
      return token;
    } catch (e) {
      if (kDebugMode) {
        debugPrint('❌ Error getting FCM token: $e');
      }
      return null;
    }
  }

  @override
  Future<bool> requestPermission() async {
    if (!isEnabled) return false;

    try {
      final settings = await _messaging.requestPermission(
        alert: true,
        announcement: false,
        badge: true,
        carPlay: false,
        criticalAlert: false,
        provisional: false,
        sound: true,
      );

      final granted =
          settings.authorizationStatus == AuthorizationStatus.authorized ||
          settings.authorizationStatus == AuthorizationStatus.provisional;

      if (kDebugMode) {
        debugPrint(
          '🔔 Notification permission: ${granted ? "granted" : "denied"}',
        );
      }

      return granted;
    } catch (e) {
      if (kDebugMode) {
        debugPrint('❌ Error requesting permission: $e');
      }
      return false;
    }
  }

  @override
  Future<void> deleteToken() async {
    if (!isEnabled) return;

    try {
      await _messaging.deleteToken();
      if (kDebugMode) {
        debugPrint('🗑️ FCM token deleted');
      }
    } catch (e) {
      if (kDebugMode) {
        debugPrint('❌ Error deleting token: $e');
      }
    }
  }

  @override
  Future<void> subscribeToTopic(String topic) async {
    if (!isEnabled) return;

    try {
      await _messaging.subscribeToTopic(topic);
      if (kDebugMode) {
        debugPrint('📢 Subscribed to topic: $topic');
      }
    } catch (e) {
      if (kDebugMode) {
        debugPrint('❌ Error subscribing to topic: $e');
      }
    }
  }

  @override
  Future<void> unsubscribeFromTopic(String topic) async {
    if (!isEnabled) return;

    try {
      await _messaging.unsubscribeFromTopic(topic);
      if (kDebugMode) {
        debugPrint('🔕 Unsubscribed from topic: $topic');
      }
    } catch (e) {
      if (kDebugMode) {
        debugPrint('❌ Error unsubscribing from topic: $e');
      }
    }
  }

  @override
  Stream<NotificationMessage> get onMessage => _messageController.stream;

  @override
  Stream<NotificationMessage> get onMessageOpenedApp =>
      _messageOpenedAppController.stream;

  @override
  Future<NotificationMessage?> getInitialMessage() async {
    if (!isEnabled) return null;

    try {
      final message = await _messaging.getInitialMessage();
      if (message != null) {
        return _convertToNotificationMessage(message);
      }
      return null;
    } catch (e) {
      if (kDebugMode) {
        debugPrint('❌ Error getting initial message: $e');
      }
      return null;
    }
  }

  /// Convert RemoteMessage to NotificationMessage
  NotificationMessage _convertToNotificationMessage(RemoteMessage message) {
    return NotificationMessage(
      messageId: message.messageId,
      title: message.notification?.title,
      body: message.notification?.body,
      data: message.data,
      sentTime: message.sentTime,
    );
  }

  /// Check current notification settings
  Future<NotificationSettings> getNotificationSettings() async {
    return await _messaging.getNotificationSettings();
  }

  /// Enable/disable auto initialization
  Future<void> setAutoInitEnabled(bool enabled) async {
    if (!isEnabled) return;
    await _messaging.setAutoInitEnabled(enabled);
  }

  /// Dispose streams
  void dispose() {
    _messageController.close();
    _messageOpenedAppController.close();
  }
}
