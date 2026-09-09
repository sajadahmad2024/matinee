import 'package:matinee/di/service_locator.dart';
import 'package:matinee/features/auth/data/auth_repository.dart';
import 'package:matinee/features/auth/data/services/auth_api_service.dart';

void registerAuthDependencies() {
  getIt
    ..registerLazySingleton<AuthApiService>(AuthApiService.new)
    ..registerLazySingleton<AuthRepository>(() => AuthRepository(getIt()));
}
