import 'package:matinee/di/service_locator.dart';
import 'package:matinee/shared/points/data/points_repository.dart';
import 'package:matinee/shared/points/data/services/points_service.dart';

void registerPointsDependencies() {
  getIt
    ..registerLazySingleton<PointsService>(PointsService.new)
    ..registerLazySingleton<PointsRepository>(() => PointsRepository(getIt()));
}
