# Core: configuration, composition root, errors, network, storage

Copy these files exactly. Replace `template` with the package name from `pubspec.yaml`.

## `lib/core/config/env.dart`

```dart
enum AppFlavor { dev, staging, prod }

///
/// Build-time configuration for one flavor. Nothing secret lives here; secrets
/// come from the backend at runtime. Each entry point passes one Env to bootstrap.
///
final class Env {
  const Env({required this.flavor, required this.apiBaseUrl});

  final AppFlavor flavor;
  final String apiBaseUrl;

  static const dev = Env(flavor: AppFlavor.dev, apiBaseUrl: 'https://dev.api.example.com');
  static const staging = Env(flavor: AppFlavor.staging, apiBaseUrl: 'https://staging.api.example.com');
  static const prod = Env(flavor: AppFlavor.prod, apiBaseUrl: 'https://api.example.com');

  // Supplied with --dart-define=SENTRY_DSN=... so dev builds never report and
  // the value is not in source control.
  static const _sentryDsn = String.fromEnvironment('SENTRY_DSN');

  String? get sentryDsn => _sentryDsn.isEmpty ? null : _sentryDsn;
}
```

## `lib/di/service_locator.dart`

```dart
import 'package:dio/dio.dart';
import 'package:get_it/get_it.dart';
import 'package:matinee/core/config/env.dart';
import 'package:matinee/core/network/dio_factory.dart';
import 'package:matinee/core/storage/preferences_service.dart';
import 'package:matinee/core/storage/secure_storage_service.dart';

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

  // Feature registrations follow. create-feature appends one line per feature.
}

///
/// Main-init registrations. AppStartupCubit runs this inside a fresh
/// 'startup' scope on every start() and retry(), so a service whose async
/// factory failed is created again. Only registerSingletonAsync services the
/// first screen cannot render without belong here.
///
void registerStartupDependencies(GetIt locator) {}
```

## `lib/core/error/app_exception.dart`

```dart
///
/// The closed set of failures the UI can react to. Repositories throw these
/// and nothing else; cubits catch `on AppException` and emit a failure state.
/// Programming errors are never wrapped in one.
///
sealed class AppException implements Exception {
  const AppException();
}

final class NetworkException extends AppException {
  const NetworkException();
}

final class CancelledException extends AppException {
  const CancelledException();
}

final class AuthException extends AppException {
  const AuthException(this.statusCode);

  final int statusCode;
}

final class NotFoundException extends AppException {
  const NotFoundException();
}

final class ValidationException extends AppException {
  const ValidationException(this.statusCode, {this.message});

  final int statusCode;

  // Filled by a project that parses its backend's error body; the mapper leaves it
  // null and the UI falls back to a generic string.
  final String? message;
}

final class ServerException extends AppException {
  const ServerException(this.statusCode);

  final int statusCode;
}
```

## `lib/core/error/report.dart`

```dart
import 'dart:async';
import 'dart:developer' as developer;

import 'package:sentry_flutter/sentry_flutter.dart';

///
/// The single sink for errors the app catches on purpose (startup failure,
/// post-init tasks, bloc observer). Uncaught errors never come here; Sentry's
/// own integrations capture those when a DSN is configured.
///
void report(Object error, StackTrace? stack) {
  if (Sentry.isEnabled) {
    unawaited(Sentry.captureException(error, stackTrace: stack));
    return;
  }
  developer.log('Reported error', error: error, stackTrace: stack);
}
```

## `lib/core/bloc/app_bloc_observer.dart`

```dart
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:matinee/core/error/report.dart';

final class AppBlocObserver extends BlocObserver {
  const AppBlocObserver();

  @override
  void onError(BlocBase<dynamic> bloc, Object error, StackTrace stackTrace) {
    report(error, stackTrace);
    super.onError(bloc, error, stackTrace);
  }
}
```

## `lib/core/network/dio_factory.dart`

```dart
import 'package:dio/dio.dart';
import 'package:matinee/core/config/env.dart';

///
/// One Dio per app, registered in get_it. An AuthInterceptor, when a project
/// adds auth, is added here as a QueuedInterceptor so token refreshes serialise.
///
Dio createDio(Env env) {
  final dio = Dio(
    BaseOptions(
      baseUrl: env.apiBaseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 20),
    ),
  );
  if (env.flavor != AppFlavor.prod) {
    // Headers stay out of the log so a future Authorization header never leaks.
    dio.interceptors.add(LogInterceptor(requestHeader: false, responseHeader: false));
  }
  return dio;
}
```

## `lib/core/network/error_mapper.dart`

```dart
import 'package:dio/dio.dart';
import 'package:matinee/core/error/app_exception.dart';

///
/// Runs one API call and converts any DioException into the matching
/// AppException. Repositories wrap every client call in this, so the mapping
/// lives, and is tested, in exactly one place.
///
Future<T> guardApi<T>(Future<T> Function() call) async {
  try {
    return await call();
  } on DioException catch (e) {
    throw mapDioException(e);
  }
}

AppException mapDioException(DioException e) {
  return switch (e.type) {
    DioExceptionType.cancel => const CancelledException(),
    DioExceptionType.badResponse => _fromResponse(e),
    DioExceptionType.connectionTimeout ||
    DioExceptionType.sendTimeout ||
    DioExceptionType.receiveTimeout ||
    DioExceptionType.transformTimeout ||
    DioExceptionType.badCertificate ||
    DioExceptionType.connectionError ||
    DioExceptionType.unknown => const NetworkException(),
  };
}

AppException _fromResponse(DioException e) {
  final code = e.response?.statusCode ?? 0;
  return switch (code) {
    401 || 403 => AuthException(code),
    404 => const NotFoundException(),
    >= 400 && < 500 => ValidationException(code),
    _ => ServerException(code),
  };
}
```

## `lib/core/storage/preferences_service.dart`

```dart
import 'package:shared_preferences/shared_preferences.dart';

///
/// Non-sensitive preferences: theme, locale, onboarding flags. Tokens and
/// personal data never go here; use SecureStorageService.
///
class PreferencesService {
  PreferencesService([SharedPreferencesAsync? prefs]) : _prefs = prefs ?? SharedPreferencesAsync();

  final SharedPreferencesAsync _prefs;

  Future<String?> getString(String key) => _prefs.getString(key);

  Future<void> setString(String key, String value) => _prefs.setString(key, value);

  Future<bool?> getBool(String key) => _prefs.getBool(key);

  Future<void> setBool(String key, {required bool value}) => _prefs.setBool(key, value);

  Future<void> remove(String key) => _prefs.remove(key);
}
```

## `lib/core/storage/secure_storage_service.dart`

```dart
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

///
/// Keychain on Apple platforms, Keystore-backed storage on Android. The only
/// place tokens or other sensitive values may be persisted.
///
class SecureStorageService {
  const SecureStorageService([this._storage = const FlutterSecureStorage()]);

  final FlutterSecureStorage _storage;

  Future<String?> read(String key) => _storage.read(key: key);

  Future<void> write(String key, String value) => _storage.write(key: key, value: value);

  Future<void> delete(String key) => _storage.delete(key: key);
}
```
