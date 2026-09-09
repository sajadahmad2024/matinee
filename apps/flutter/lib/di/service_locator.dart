import 'package:dio/dio.dart';
import 'package:get_it/get_it.dart';
import 'package:matinee/core/config/env.dart';
import 'package:matinee/core/network/dio_factory.dart';
import 'package:matinee/core/storage/preferences_service.dart';
import 'package:matinee/core/storage/secure_storage_service.dart';
import 'package:matinee/features/auth/auth_di.dart';
import 'package:matinee/features/onboarding/onboarding_di.dart';
import 'package:matinee/features/profile/profile_di.dart';

///
/// The composition root. Declared once; every feature imports this instance.
///
final GetIt getIt = GetIt.instance;

///
/// Registration only, no awaits. registerLazySingleton never blocks startup.
/// registerSingletonAsync turns a service into a startup gate the splash waits
/// for, so use it only when the first screen cannot render without it.
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

  // Feature registrations follow. create-feature appends one line per feature.
}

///
/// Main-init registrations. AppStartupCubit runs this inside a fresh
/// 'startup' scope on every start() and retry(), so a service whose async
/// factory failed is created again. Only registerSingletonAsync services the
/// first screen cannot render without belong here.
///
void registerStartupDependencies(GetIt locator) {
  locator.registerSingletonAsync<DemoSplashHold>(DemoSplashHold.create);
}

///
/// TEMPORARY, FOR DEMOS. A startup gate that resolves after a fixed delay so
/// the splash stays on screen long enough to be seen. allReady() waits for it,
/// which is the whole point; delete this class and its registration above, and
/// the splash goes back to lasting exactly as long as real startup work takes.
///
class DemoSplashHold {
  const DemoSplashHold();

  static const Duration duration = Duration(seconds: 5);

  static Future<DemoSplashHold> create() async {
    await Future<void>.delayed(duration);
    return const DemoSplashHold();
  }
}
