import 'package:matinee/di/service_locator.dart';
import 'package:matinee/features/profile/data/profile_repository.dart';
import 'package:matinee/features/profile/data/services/profile_api_service.dart';

void registerProfileDependencies() {
  getIt
    ..registerLazySingleton<ProfileApiService>(ProfileApiService.new)
    ..registerLazySingleton<ProfileRepository>(() => ProfileRepository(getIt()));
}
