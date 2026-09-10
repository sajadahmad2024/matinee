import 'package:dio/dio.dart';
import 'package:get_it/get_it.dart';
import 'package:matinee/core/config/env.dart';
import 'package:matinee/core/network/dio_factory.dart';
import 'package:matinee/core/storage/preferences_service.dart';
import 'package:matinee/core/storage/secure_storage_service.dart';
import 'package:matinee/features/auth/auth_di.dart';
import 'package:matinee/features/onboarding/onboarding_di.dart';
import 'package:matinee/features/profile/profile_di.dart';
import 'package:matinee/features/rewards/rewards_di.dart';

/// The composition root. Declared once; every feature imports this instance.
final GetIt getIt = GetIt.instance;

///
/// Registration only, no awaits: registerLazySingleton never blocks startup,
/// while registerSingletonAsync would make the splash wait on a startup gate.
///
void registerDependencies(Env env) {
  getIt
    ..registerSingleton<Env>(env)
    ..registerLazySingleton<Dio>(() => createDio(env))
    ..registerLazySingleton<PreferencesService>(PreferencesService.new)
    ..registerLazySingleton<SecureStorageService>(SecureStorageService.new);

  registerAuthDependencies();
  registerOnboardingDependencies();
  registerProfileDependencies();
  registerRewardsDependencies();

  // Feature registrations follow. create-feature appends one line per feature.
}

///
/// Main-init registrations, run in a fresh 'startup' scope on every start() and
/// retry(). Only what the first screen cannot render without belongs here.
///
void registerStartupDependencies(GetIt locator) {
  locator.registerSingletonAsync<DemoSplashHold>(DemoSplashHold.create);
}

///
/// TEMPORARY, FOR DEMOS. A startup gate resolving after a fixed delay so the
/// splash can be seen. Delete it and its registration above to end that.
///
class DemoSplashHold {
  const DemoSplashHold();

  static const Duration duration = Duration(seconds: 5);

  static Future<DemoSplashHold> create() async {
    await Future<void>.delayed(duration);
    return const DemoSplashHold();
  }
}
