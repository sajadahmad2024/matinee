import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/features/notifications/data/models/app_notification.dart';
import 'package:matinee/features/notifications/data/notifications_repository.dart';
import 'package:matinee/features/notifications/presentation/cubit/notifications_cubit.dart';
import 'package:matinee/features/notifications/presentation/cubit/notifications_state.dart';
import 'package:mocktail/mocktail.dart';

class _MockNotificationsRepository extends Mock implements NotificationsRepository {}

void main() {
  group(NotificationsCubit, () {
    late _MockNotificationsRepository repository;

    final receivedAt = DateTime(2026, 9, 23, 12);
    final outbid = AppNotification(
      id: 'n-1',
      category: NotificationCategory.auctions,
      title: 'Outbid',
      body: const [NotificationSpan('Reclaim the lot.')],
      receivedAt: receivedAt,
    );
    final renewal = AppNotification(
      id: 'n-2',
      category: NotificationCategory.system,
      title: 'Renewal',
      body: const [NotificationSpan('Your plan renews.')],
      receivedAt: receivedAt,
    );
    final inbox = [outbid, renewal];
    final outbidRead = [outbid.copyWith(isRead: true), renewal];
    final allRead = [outbid.copyWith(isRead: true), renewal.copyWith(isRead: true)];

    setUp(() {
      repository = _MockNotificationsRepository();
    });

    group('load', () {
      blocTest<NotificationsCubit, NotificationsState>(
        'emits [loading, success] with the inbox',
        setUp: () => when(repository.fetchNotifications).thenAnswer((_) async => inbox),
        build: () => NotificationsCubit(repository),
        act: (cubit) => cubit.load(),
        expect: () => [
          const NotificationsState.loading(),
          NotificationsState.success(notifications: inbox),
        ],
      );

      blocTest<NotificationsCubit, NotificationsState>(
        'emits [loading, failure] when the repository throws an $AppException',
        setUp: () => when(repository.fetchNotifications).thenThrow(const NetworkException()),
        build: () => NotificationsCubit(repository),
        act: (cubit) => cubit.load(),
        expect: () => const [
          NotificationsState.loading(),
          NotificationsState.failure(NetworkException()),
        ],
      );
    });

    group('selectFilter', () {
      blocTest<NotificationsCubit, NotificationsState>(
        'keeps the inbox and records the filter',
        build: () => NotificationsCubit(repository),
        seed: () => NotificationsState.success(notifications: inbox),
        act: (cubit) => cubit.selectFilter(NotificationCategory.system),
        expect: () => [
          NotificationsState.success(notifications: inbox, filter: NotificationCategory.system),
        ],
      );

      blocTest<NotificationsCubit, NotificationsState>(
        'emits nothing before the inbox has loaded',
        build: () => NotificationsCubit(repository),
        act: (cubit) => cubit.selectFilter(NotificationCategory.system),
        expect: () => const <NotificationsState>[],
      );
    });

    group('markAsRead', () {
      blocTest<NotificationsCubit, NotificationsState>(
        'marks the card read at once, then takes the server inbox',
        setUp: () => when(() => repository.markAsRead('n-1')).thenAnswer((_) async => outbidRead),
        build: () => NotificationsCubit(repository),
        seed: () => NotificationsState.success(notifications: inbox, filter: NotificationCategory.auctions),
        act: (cubit) => cubit.markAsRead('n-1'),
        expect: () => [
          NotificationsState.success(notifications: outbidRead, filter: NotificationCategory.auctions),
        ],
        verify: (_) => verify(() => repository.markAsRead('n-1')).called(1),
      );

      blocTest<NotificationsCubit, NotificationsState>(
        'keeps a filter chosen while the request was in flight',
        setUp: () => when(() => repository.markAsRead('n-1')).thenAnswer((_) async => outbidRead),
        build: () => NotificationsCubit(repository),
        seed: () => NotificationsState.success(notifications: inbox),
        act: (cubit) async {
          final pending = cubit.markAsRead('n-1');
          await cubit.selectFilter(NotificationCategory.system);
          await pending;
        },
        expect: () => [
          NotificationsState.success(notifications: outbidRead),
          NotificationsState.success(notifications: outbidRead, filter: NotificationCategory.system),
        ],
      );

      blocTest<NotificationsCubit, NotificationsState>(
        'does not un-read cards when an older answer lands last',
        setUp: () {
          when(() => repository.markAsRead('n-1')).thenAnswer(
            (_) => Future<List<AppNotification>>.delayed(const Duration(milliseconds: 20), () => outbidRead),
          );
          when(repository.markAllAsRead).thenAnswer((_) async => allRead);
        },
        build: () => NotificationsCubit(repository),
        seed: () => NotificationsState.success(notifications: inbox),
        act: (cubit) => Future.wait([cubit.markAsRead('n-1'), cubit.markAllAsRead()]),
        expect: () => [
          NotificationsState.success(notifications: outbidRead),
          NotificationsState.success(notifications: allRead),
        ],
      );

      blocTest<NotificationsCubit, NotificationsState>(
        'does not call the repository for a card already read',
        build: () => NotificationsCubit(repository),
        seed: () => NotificationsState.success(notifications: outbidRead),
        act: (cubit) => cubit.markAsRead('n-1'),
        expect: () => const <NotificationsState>[],
        verify: (_) => verifyNever(() => repository.markAsRead(any())),
      );

      blocTest<NotificationsCubit, NotificationsState>(
        'emits failure when the repository throws an $AppException',
        setUp: () => when(() => repository.markAsRead('n-1')).thenThrow(const NetworkException()),
        build: () => NotificationsCubit(repository),
        seed: () => NotificationsState.success(notifications: inbox),
        act: (cubit) => cubit.markAsRead('n-1'),
        expect: () => [
          NotificationsState.success(notifications: outbidRead),
          const NotificationsState.failure(NetworkException()),
        ],
      );
    });

    group('markAllAsRead', () {
      blocTest<NotificationsCubit, NotificationsState>(
        'marks every card read at once, then takes the server inbox',
        setUp: () => when(repository.markAllAsRead).thenAnswer((_) async => allRead),
        build: () => NotificationsCubit(repository),
        seed: () => NotificationsState.success(notifications: inbox),
        act: (cubit) => cubit.markAllAsRead(),
        expect: () => [NotificationsState.success(notifications: allRead)],
      );

      blocTest<NotificationsCubit, NotificationsState>(
        'does not call the repository when nothing is unread',
        build: () => NotificationsCubit(repository),
        seed: () => NotificationsState.success(notifications: allRead),
        act: (cubit) => cubit.markAllAsRead(),
        expect: () => const <NotificationsState>[],
        verify: (_) => verifyNever(repository.markAllAsRead),
      );

      blocTest<NotificationsCubit, NotificationsState>(
        'emits failure when the repository throws an $AppException',
        setUp: () => when(repository.markAllAsRead).thenThrow(const NetworkException()),
        build: () => NotificationsCubit(repository),
        seed: () => NotificationsState.success(notifications: inbox),
        act: (cubit) => cubit.markAllAsRead(),
        expect: () => [
          NotificationsState.success(notifications: allRead),
          const NotificationsState.failure(NetworkException()),
        ],
      );
    });
  });
}
