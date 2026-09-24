import 'package:matinee/di/service_locator.dart';
import 'package:matinee/features/notifications/data/notifications_repository.dart';
import 'package:matinee/features/notifications/data/services/notifications_api_service.dart';

void registerNotificationsDependencies() {
  getIt
    ..registerLazySingleton<NotificationsApiService>(NotificationsApiService.new)
    ..registerLazySingleton<NotificationsRepository>(() => NotificationsRepository(getIt()));
}
