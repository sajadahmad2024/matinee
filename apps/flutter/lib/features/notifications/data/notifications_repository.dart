import 'package:matinee/core/network/error_mapper.dart';
import 'package:matinee/features/notifications/data/models/app_notification.dart';
import 'package:matinee/features/notifications/data/services/notifications_api_service.dart';

class NotificationsRepository {
  const NotificationsRepository(this._service);

  final NotificationsApiService _service;

  Future<List<AppNotification>> fetchNotifications() => guardApi(_service.fetchNotifications);

  Future<List<AppNotification>> markAsRead(String id) => guardApi(() => _service.markAsRead(id));

  Future<List<AppNotification>> markAllAsRead() => guardApi(_service.markAllAsRead);
}
