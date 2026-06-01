import 'package:flutter_boilerplate/core/di/injection_container.dart' as di;
import 'package:get_it/get_it.dart';

final GetIt getIt = di.getIt;

/// Use this in tests instead of `di.initDependencies()`.
Future<void> initTestDependencies() async {
  await getIt.reset();

  // Register NO-OP / fake services here if your app expects them.
  //
  // Example later when you add non-optional services:
  // getIt.registerLazySingleton<AnalyticsService>(() => NoopAnalyticsService());
  // getIt.registerLazySingleton<CrashService>(() => NoopCrashService());
}
