import 'package:matinee/di/service_locator.dart';
import 'package:matinee/features/rewards/data/rewards_repository.dart';
import 'package:matinee/features/rewards/data/services/rewards_api_service.dart';

void registerRewardsDependencies() {
  getIt
    ..registerLazySingleton<RewardsApiService>(RewardsApiService.new)
    ..registerLazySingleton<RewardsRepository>(() => RewardsRepository(getIt()));
}
