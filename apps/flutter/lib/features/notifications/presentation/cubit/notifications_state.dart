import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/features/notifications/data/models/app_notification.dart';

part 'notifications_state.freezed.dart';

@freezed
sealed class NotificationsState with _$NotificationsState {
  const factory NotificationsState.initial() = NotificationsInitial;
  const factory NotificationsState.loading() = NotificationsLoading;

  /// A null [filter] is the All chip.
  const factory NotificationsState.success({
    required List<AppNotification> notifications,
    NotificationCategory? filter,
  }) = NotificationsSuccess;

  const factory NotificationsState.failure(AppException error) = NotificationsFailure;
}
