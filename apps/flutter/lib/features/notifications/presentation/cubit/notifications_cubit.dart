import 'package:matinee/core/bloc/safe_cubit.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/features/notifications/data/models/app_notification.dart';
import 'package:matinee/features/notifications/data/notifications_repository.dart';
import 'package:matinee/features/notifications/presentation/cubit/notifications_state.dart';

class NotificationsCubit extends SafeCubit<NotificationsState> {
  NotificationsCubit(this._repository) : super(const NotificationsState.initial());

  final NotificationsRepository _repository;

  Future<void> load() async {
    emit(const NotificationsState.loading());
    try {
      emit(NotificationsState.success(notifications: await _repository.fetchNotifications()));
    } on AppException catch (e) {
      emit(NotificationsState.failure(e));
    }
  }

  /// Filtering is local: the inbox is already loaded whole.
  Future<void> selectFilter(NotificationCategory? filter) async {
    if (state case NotificationsSuccess(:final notifications)) {
      emit(NotificationsState.success(notifications: notifications, filter: filter));
    }
  }

  Future<void> markAsRead(String id) async {
    if (state case NotificationsSuccess(
      :final notifications,
    ) when notifications.any((notification) => notification.id == id && !notification.isRead)) {
      await _markRead((notification) => notification.id == id, () => _repository.markAsRead(id));
    }
  }

  Future<void> markAllAsRead() async {
    if (state case NotificationsSuccess(
      :final notifications,
    ) when notifications.any((notification) => !notification.isRead)) {
      await _markRead((_) => true, _repository.markAllAsRead);
    }
  }

  ///
  /// The cards go read at once and the server's answer replaces them. Waiting
  /// on loading would take the list off screen and lose its scroll position.
  ///
  Future<void> _markRead(
    bool Function(AppNotification notification) matches,
    Future<List<AppNotification>> Function() call,
  ) async {
    if (state case NotificationsSuccess(:final notifications, :final filter)) {
      emit(
        NotificationsState.success(
          notifications: [
            for (final notification in notifications)
              if (matches(notification)) notification.copyWith(isRead: true) else notification,
          ],
          filter: filter,
        ),
      );
      try {
        final updated = await call();
        // The user may have filtered or read more while this was in flight, and
        // an older answer can land last, so read state only ever moves forward.
        if (state case NotificationsSuccess(notifications: final current, filter: final currentFilter)) {
          final readIds = {
            for (final notification in current)
              if (notification.isRead) notification.id,
          };
          emit(
            NotificationsState.success(
              notifications: [
                for (final notification in updated)
                  if (readIds.contains(notification.id)) notification.copyWith(isRead: true) else notification,
              ],
              filter: currentFilter,
            ),
          );
        }
      } on AppException catch (e) {
        emit(NotificationsState.failure(e));
      }
    }
  }
}
