/// Abstract notification service interface
///
/// This interface defines methods for handling push notifications.
/// Implementations include FCMService and MockNotificationService.
///
/// USAGE EXAMPLES:
///
/// Example 1: Initialize and get token
/// ```dart
/// final notificationService = getIt<NotificationService>();
///
/// // Initialize service
/// await notificationService.initialize();
///
/// // Get FCM token
/// final token = await notificationService.getToken();
/// print('FCM Token: $token');
///
/// // Send token to your backend
/// await apiClient.post('/users/fcm-token', data: {'token': token});
/// ```
///
/// Example 2: Listen to notifications
/// ```dart
/// notificationService.onMessage.listen((notification) {
///   print('Foreground notification: ${notification.title}');
///   // Show in-app notification or update UI
/// });
///
/// notificationService.onMessageOpenedApp.listen((notification) {
///   print('User opened notification: ${notification.title}');
///   // Navigate to specific screen
///   context.push('/notification/${notification.data['id']}');
/// });
/// ```
///
/// Example 3: Request permission (iOS)
/// ```dart
/// final granted = await notificationService.requestPermission();
/// if (granted) {
///   print('Notification permission granted');
/// } else {
///   print('Notification permission denied');
/// }
/// ```
abstract class NotificationService {
  /// Initialize notification service
  Future<void> initialize();

  /// Get FCM token
  Future<String?> getToken();

  /// Request notification permission (iOS)
  Future<bool> requestPermission();

  /// Delete FCM token
  Future<void> deleteToken();

  /// Subscribe to topic
  Future<void> subscribeToTopic(String topic);

  /// Unsubscribe from topic
  Future<void> unsubscribeFromTopic(String topic);

  /// Stream of foreground notifications
  Stream<NotificationMessage> get onMessage;

  /// Stream of notifications that opened the app
  Stream<NotificationMessage> get onMessageOpenedApp;

  /// Get initial notification (if app was opened from notification)
  Future<NotificationMessage?> getInitialMessage();

  /// Check if notifications are enabled
  bool get isEnabled;
}

/// Notification message model
class NotificationMessage {
  final String? messageId;
  final String? title;
  final String? body;
  final Map<String, dynamic> data;
  final DateTime? sentTime;

  NotificationMessage({
    this.messageId,
    this.title,
    this.body,
    required this.data,
    this.sentTime,
  });

  @override
  String toString() {
    return 'NotificationMessage{title: $title, body: $body, data: $data}';
  }
}
