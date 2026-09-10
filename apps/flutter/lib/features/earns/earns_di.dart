import 'package:matinee/di/service_locator.dart';
import 'package:matinee/features/earns/data/earns_repository.dart';
import 'package:matinee/features/earns/data/services/earns_api_service.dart';

void registerEarnsDependencies() {
  getIt
    ..registerLazySingleton<EarnsApiService>(() => EarnsApiService(getIt()))
    ..registerLazySingleton<EarnsRepository>(() => EarnsRepository(getIt()));
}
