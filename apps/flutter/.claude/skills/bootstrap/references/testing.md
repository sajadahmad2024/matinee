# Test helpers and core tests

Conventions for every test file are in `.claude/rules/testing.md` and load automatically when a file under `test/` is edited. This file holds the helpers bootstrap emits and the core tests that prove the platform code works.

## `test/helpers/pump_app.dart`

```dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/core/theme/app_color_scheme.dart';
import 'package:matinee/core/theme/app_theme.dart';
import 'package:matinee/l10n/gen/app_localizations.dart';

extension PumpApp on WidgetTester {
  Future<void> pumpApp(Widget widget, {ThemeData? theme}) {
    return pumpWidget(
      MaterialApp(
        theme: theme ?? const AppTheme(AppColorScheme.standard).light(),
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        supportedLocales: AppLocalizations.supportedLocales,
        home: widget,
      ),
    );
  }
}
```

## `test/helpers/test_tags.dart`

```dart
abstract final class TestTag {
  static const golden = 'golden';
}
```

## `test/helpers/helpers.dart`

```dart
export 'pump_app.dart';
export 'test_tags.dart';
```

Test files import helpers relatively (`import '../helpers/helpers.dart';`); `always_use_package_imports` applies to `lib/` only because test helpers are not part of the package's public library set.

## `test/core/network/error_mapper_test.dart`

```dart
import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/core/network/error_mapper.dart';

DioException _badResponse(int statusCode) {
  final options = RequestOptions(path: '/x');
  return DioException.badResponse(
    statusCode: statusCode,
    requestOptions: options,
    response: Response<void>(requestOptions: options, statusCode: statusCode),
  );
}

void main() {
  group('mapDioException', () {
    test('maps a timeout to $NetworkException', () {
      final e = DioException.connectionTimeout(timeout: Duration.zero, requestOptions: RequestOptions(path: '/x'));

      expect(mapDioException(e), isA<NetworkException>());
    });

    test('maps 401 and 403 to $AuthException with the status code', () {
      expect(mapDioException(_badResponse(401)), isA<AuthException>().having((e) => e.statusCode, 'statusCode', 401));
      expect(mapDioException(_badResponse(403)), isA<AuthException>().having((e) => e.statusCode, 'statusCode', 403));
    });

    test('maps 404 to $NotFoundException', () {
      expect(mapDioException(_badResponse(404)), isA<NotFoundException>());
    });

    test('maps other 4xx to $ValidationException', () {
      expect(mapDioException(_badResponse(422)), isA<ValidationException>());
    });

    test('maps 5xx to $ServerException', () {
      expect(mapDioException(_badResponse(503)), isA<ServerException>());
    });

    test('maps cancellation to $CancelledException', () {
      final e = DioException.requestCancelled(requestOptions: RequestOptions(path: '/x'), reason: null);

      expect(mapDioException(e), isA<CancelledException>());
    });
  });

  group('guardApi', () {
    test('returns the value when the call succeeds', () async {
      expect(await guardApi(() async => 42), 42);
    });

    test('rethrows a $DioException as an $AppException', () {
      expect(() => guardApi<void>(() async => throw _badResponse(500)), throwsA(isA<ServerException>()));
    });
  });
}
```

## `test/app/startup/app_startup_cubit_test.dart`

```dart
import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:get_it/get_it.dart';
import 'package:matinee/app/startup/app_startup_cubit.dart';
import 'package:matinee/app/startup/app_startup_state.dart';

class _Gate {}

void _nothing(GetIt locator) {}

void _broken(GetIt locator) {
  locator.registerSingletonAsync<_Gate>(() async => throw StateError('boom'));
}

void main() {
  group(AppStartupCubit, () {
    late GetIt locator;

    setUp(() {
      locator = GetIt.asNewInstance();
    });

    blocTest<AppStartupCubit, AppStartupState>(
      'emits [success] when every startup registration completes',
      build: () => AppStartupCubit(locator, _nothing),
      act: (cubit) => cubit.start(),
      expect: () => const [StartupSuccess()],
    );

    blocTest<AppStartupCubit, AppStartupState>(
      'emits [failure] when a startup registration throws',
      build: () => AppStartupCubit(locator, _broken),
      act: (cubit) => cubit.start(),
      expect: () => [isA<StartupFailure>()],
    );

    blocTest<AppStartupCubit, AppStartupState>(
      'retry recovers when the registration succeeds on the second attempt',
      build: () {
        var attempts = 0;
        return AppStartupCubit(locator, (getIt) {
          attempts++;
          if (attempts == 1) {
            _broken(getIt);
          } else {
            getIt.registerSingletonAsync<_Gate>(() async => _Gate());
          }
        });
      },
      act: (cubit) async {
        await cubit.start();
        await cubit.retry();
      },
      expect: () => [isA<StartupFailure>(), const StartupInProgress(), const StartupSuccess()],
    );
  });
}
```

## `test/app/router/app_router_test.dart`

Covers the design-critical piece: routes stay behind the splash until startup succeeds, then the requested location is shown. The gate is a `Completer` the test releases after asserting the splash; two pumps after release let the redirect re-evaluate and the home route build.

```dart
import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:get_it/get_it.dart';
import 'package:matinee/app/router/app_router.dart';
import 'package:matinee/app/router/stream_listenable.dart';
import 'package:matinee/app/startup/app_startup_cubit.dart';
import 'package:matinee/app/startup/splash_screen.dart';
import 'package:matinee/features/home/presentation/home_screen.dart';
import 'package:matinee/l10n/gen/app_localizations.dart';

class _Gate {}

void main() {
  group('createRouter', () {
    testWidgets('shows $SplashScreen until startup succeeds, then $HomeScreen', (tester) async {
      final gate = Completer<void>();
      final startup = AppStartupCubit(GetIt.asNewInstance(), (locator) {
        locator.registerSingletonAsync<_Gate>(() async {
          await gate.future;
          return _Gate();
        });
      });
      final changes = StreamListenable(startup.stream);
      final router = createRouter(startup, refreshListenable: changes);
      addTearDown(() async {
        router.dispose();
        changes.dispose();
        await startup.close();
      });

      await tester.pumpWidget(
        BlocProvider.value(
          value: startup,
          child: MaterialApp.router(
            routerConfig: router,
            localizationsDelegates: AppLocalizations.localizationsDelegates,
            supportedLocales: AppLocalizations.supportedLocales,
          ),
        ),
      );
      unawaited(startup.start());
      await tester.pump();

      expect(find.byType(SplashScreen), findsOneWidget);

      gate.complete();
      await tester.pump();
      await tester.pump();

      expect(find.byType(HomeScreen), findsOneWidget);
    });
  });
}
```

## `test/app/router/stream_listenable_test.dart`

```dart
import 'dart:async';

import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/app/router/stream_listenable.dart';

void main() {
  group(StreamListenable, () {
    late StreamController<int> controller;

    setUp(() {
      controller = StreamController<int>();
    });

    tearDown(() async {
      await controller.close();
    });

    test('notifies listeners for every stream event', () async {
      final subject = StreamListenable(controller.stream);
      var notifications = 0;
      subject.addListener(() => notifications++);

      controller
        ..add(1)
        ..add(2);
      await Future<void>.delayed(Duration.zero);

      expect(notifications, 2);
      subject.dispose();
    });
  });
}
```

## `test/core/theme/cubit/theme_cubit_test.dart`

```dart
import 'package:bloc_test/bloc_test.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/core/theme/app_color_scheme.dart';
import 'package:matinee/core/theme/cubit/theme_cubit.dart';
import 'package:matinee/core/theme/cubit/theme_state.dart';

void main() {
  group(ThemeCubit, () {
    blocTest<ThemeCubit, ThemeState>(
      'emits the new scheme when setColorScheme is called',
      build: ThemeCubit.new,
      act: (cubit) => cubit.setColorScheme(AppColorScheme.forest),
      expect: () => const [ThemeState(colorScheme: AppColorScheme.forest)],
    );

    blocTest<ThemeCubit, ThemeState>(
      'emits the new mode when setThemeMode is called',
      build: ThemeCubit.new,
      act: (cubit) => cubit.setThemeMode(ThemeMode.dark),
      expect: () => const [ThemeState(themeMode: ThemeMode.dark)],
    );
  });
}
```

## `test/core/l10n/app_exception_l10n_test.dart`

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/core/l10n/app_exception_l10n.dart';
import 'package:matinee/l10n/gen/app_localizations_en.dart';

void main() {
  group('AppExceptionL10n', () {
    final l10n = AppLocalizationsEn();

    test('uses the server message for a $ValidationException when present', () {
      const e = ValidationException(422, message: 'Email is taken');

      expect(e.localizedMessage(l10n), 'Email is taken');
    });

    test('falls back to the generic string when the server sent none', () {
      const e = ValidationException(422);

      expect(e.localizedMessage(l10n), l10n.errorValidation);
    });

    test('maps a $NetworkException to the offline string', () {
      expect(const NetworkException().localizedMessage(l10n), l10n.errorNetwork);
    });
  });
}
```
