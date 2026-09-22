import 'package:matinee/di/service_locator.dart';
import 'package:matinee/features/onboarding/data/onboarding_repository.dart';

void registerOnboardingDependencies() {
  getIt.registerLazySingleton<OnboardingRepository>(() => OnboardingRepository(getIt()));
}
