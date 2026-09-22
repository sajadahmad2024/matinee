import 'package:matinee/di/service_locator.dart';
import 'package:matinee/features/p2p/data/p2p_repository.dart';
import 'package:matinee/features/p2p/data/services/p2p_api_service.dart';

void registerP2pDependencies() {
  getIt
    ..registerLazySingleton<P2pApiService>(() => P2pApiService(getIt()))
    ..registerLazySingleton<P2pRepository>(() => P2pRepository(getIt()));
}
