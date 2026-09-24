import 'package:matinee/di/service_locator.dart';
import 'package:matinee/features/reels/data/reels_repository.dart';
import 'package:matinee/features/reels/data/services/reels_feed_api_service.dart';

void registerReelsDependencies() {
  getIt
    ..registerLazySingleton<ReelsFeedApiService>(ReelsFeedApiService.new)
    ..registerLazySingleton<ReelsRepository>(() => ReelsRepository(getIt()));
}
