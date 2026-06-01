/// Dependency Injection container setup using get_it.

library core.di.injection_container;

import 'package:firebase_analytics/firebase_analytics.dart';
import 'package:firebase_crashlytics/firebase_crashlytics.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:get_it/get_it.dart';

import '../../config/environment_config.dart';
import '../../modules/auth/data/datasources/auth_local_datasource.dart';
import '../../modules/auth/data/datasources/auth_remote_datasource.dart';
import '../../modules/auth/data/repositories/auth_repository_impl.dart';
import '../../modules/auth/domain/repositories/auth_repository.dart';
import '../../modules/auth/domain/usecases/get_current_user.dart';
import '../../modules/auth/domain/usecases/login.dart';
import '../../modules/auth/domain/usecases/logout.dart';
import '../../modules/auth/domain/usecases/register.dart';
import '../../modules/auth/presentation/bloc/auth_bloc.dart';
import '../../modules/home/data/datasources/home_remote_datasource.dart';
import '../../modules/home/data/repositories/home_repository_impl.dart';
import '../../modules/home/domain/repositories/home_repository.dart';
import '../../modules/home/presentation/bloc/home_bloc.dart';
import '../network/dio/dio_http_client.dart';
import '../network/http_client.dart';
import '../security/encryption_service.dart';
import '../security/request_signer.dart';
import '../security/request_signer.dart';
import '../services/analytics/analytics_observer.dart';
import '../services/analytics/analytics_service.dart';
import '../services/analytics/firebase_analytics_service.dart';
import '../services/crash_reporting/crash_service.dart';
import '../services/crash_reporting/firebase_crash_service.dart';
import '../services/storage/encrypted_storage_service.dart';
import '../services/storage/local_storage_service.dart';
import '../services/storage/secure_storage_service.dart';
import '../services/storage/storage_manager.dart';

final getIt = GetIt.instance;

Future<void> initDependencies() async {
  initCrashReporting();
  initAnalytics();
  await initNetwork();
  await initStorage();
  await initAuth(); // Auth module
  await initHome(); // Home module
  registerSigner();
}

Future<void> initStorage() async {
  // Flutter Secure Storage (platform)
  getIt.registerLazySingleton(() => const FlutterSecureStorage());

  // Encryption Service
  getIt.registerLazySingleton<EncryptionService>(
    () => EncryptionService(getIt()),
  );

  // Initialize encryption service
  await getIt<EncryptionService>().initialize();

  // Storage Services
  getIt.registerLazySingleton<LocalStorageService>(() => LocalStorageService());

  getIt.registerLazySingleton<SecureStorageService>(
    () => SecureStorageService(),
  );

  getIt.registerLazySingleton<EncryptedStorageService>(
    () => EncryptedStorageService(getIt(), getIt()),
  );

  // Storage Manager
  getIt.registerLazySingleton<StorageManager>(
    () => StorageManager(
      localStorage: getIt(),
      secureStorage: getIt(),
      encryptedStorage: getIt(),
    ),
  );
}

Future<void> initNetwork() async {
  // Register HTTP client
  getIt.registerLazySingleton<HttpClient>(
    () => DioHttpClient(
      baseUrl: EnvironmentConfig.instance.apiBaseUrl,
      enableCertificatePinning: EnvironmentConfig.instance.isProduction,
      enableCaching: true,
    ),
  );
}

void initCrashReporting() {
  final env = EnvironmentConfig.instance;

  if (env.enableCrashReporting && env.useFirebase) {
    // External
    getIt.registerLazySingleton(() => FirebaseCrashlytics.instance);

    // Service
    getIt.registerLazySingleton<CrashService>(
      () => FirebaseCrashService(getIt()),
    );
  }
}

void initAnalytics() {
  final env = EnvironmentConfig.instance;

  if (env.useFirebase && env.enableAnalytics) {
    // External
    getIt.registerLazySingleton(() => FirebaseAnalytics.instance);

    // Service
    getIt.registerLazySingleton<AnalyticsService>(
      () => FirebaseAnalyticsService(getIt()),
    );

    // Observer
    getIt.registerLazySingleton<AnalyticsObserverProvider>(
      () => FirebaseAnalyticsObserverProvider(),
    );
  }
}

/// Initialize Auth module dependencies
Future<void> initAuth() async {
  // Data sources
  getIt.registerLazySingleton<AuthRemoteDataSource>(
    () => AuthRemoteDataSourceImpl(),
  );

  getIt.registerLazySingleton<AuthLocalDataSource>(
    () => AuthLocalDataSourceImpl(getIt(), getIt()),
  );

  // Repository
  getIt.registerLazySingleton<AuthRepository>(
    () => AuthRepositoryImpl(getIt(), getIt()),
  );

  // Use cases
  getIt.registerLazySingleton<Login>(() => Login(getIt()));

  getIt.registerLazySingleton<Register>(() => Register(getIt()));

  getIt.registerLazySingleton<Logout>(() => Logout(getIt()));

  getIt.registerLazySingleton<GetCurrentUser>(() => GetCurrentUser(getIt()));

  // BLoC
  getIt.registerFactory<AuthBloc>(
    () => AuthBloc(
      getCurrentUser: getIt(),
      login: getIt(),
      register: getIt(),
      logout: getIt(),
    ),
  );
}

/// Initialize Home module dependencies.
Future<void> initHome() async {
  // Data sources
  getIt.registerLazySingleton<HomeRemoteDataSource>(
    () => HomeRemoteDataSourceImpl(),
  );

  // Repository
  getIt.registerLazySingleton<HomeRepository>(
    () => HomeRepositoryImpl(getIt()),
  );

  // BLoC
  getIt.registerFactory<HomeBloc>(
    () => HomeBloc(),
  );
}

void registerSigner() {
  getIt.registerLazySingleton<RequestSigner>(
    () => RequestSigner(apiSecret: EnvironmentConfig.instance.apiSecret),
  );
}

/// Dispose all dependencies.
///
/// This function should be called when the app is closing.
void disposeDependencies() {
  getIt.reset();
}
