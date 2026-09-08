# Startup: entry points, bootstrap, App, splash, post-init

Copy these files exactly. Replace `template` with the package name from `pubspec.yaml`.

## `lib/main_dev.dart` (and `main_staging.dart`, `main_prod.dart`)

```dart
import 'package:matinee/bootstrap.dart';
import 'package:matinee/core/config/env.dart';

Future<void> main() => bootstrap(Env.dev);
```

The other two files differ only in `Env.staging` and `Env.prod`. There is no `lib/main.dart`; the native flavors and `.vscode/launch.json` already target these three files.

## `lib/bootstrap.dart`

```dart
import 'package:flutter/widgets.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:sentry_flutter/sentry_flutter.dart';
import 'package:matinee/app/app.dart';
import 'package:matinee/app/bootstrap_error_app.dart';
import 'package:matinee/core/config/env.dart';
import 'package:matinee/core/error/report.dart';
import 'package:matinee/core/observer/app_bloc_observer.dart';
import 'package:matinee/di/service_locator.dart';

///
/// Pre-init. Runs before any widget exists, so it stays minimal: binding,
/// bloc observer, synchronous DI registration, then hand off to the UI.
/// Anything that awaits real work belongs in main-init behind the splash.
///
Future<void> bootstrap(Env env) async {
  WidgetsFlutterBinding.ensureInitialized();
  Bloc.observer = const AppBlocObserver();

  try {
    registerDependencies(env);
  } on Object catch (e, s) {
    // No UI exists yet, so the fallback app is the only way to show anything.
    report(e, s);
    runApp(const BootstrapErrorApp());
    return;
  }

  final dsn = env.sentryDsn;
  if (dsn == null) {
    runApp(const App());
    return;
  }

  // Sentry installs FlutterError.onError and PlatformDispatcher.onError itself,
  // so the app sets neither by hand. On web it falls back to a zone instead;
  // web is secondary and the DSN is production-only, so that is accepted.
  await SentryFlutter.init(
    (options) {
      options
        ..dsn = dsn
        ..environment = env.flavor.name;
    },
    appRunner: () => runApp(const App()),
  );
}
```

## `lib/app/bootstrap_error_app.dart`

```dart
import 'package:flutter/material.dart';
import 'package:matinee/core/theme/app_spacing.dart';

///
/// Shown when pre-init throws. Nothing else may have initialised, so this has
/// no DI, no router, no theme and no localisation. AppSpacing is safe: it is a
/// constants class with no dependencies.
///
class BootstrapErrorApp extends StatelessWidget {
  const BootstrapErrorApp({super.key});

  // Localisation is not available before DI, so this one string is literal.
  static const _message = 'Something went wrong while starting. Please restart the app.';

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(
      home: Scaffold(
        body: Center(
          child: Padding(
            padding: EdgeInsets.all(AppSpacing.xlg),
            child: Text(_message, textAlign: TextAlign.center),
          ),
        ),
      ),
    );
  }
}
```

## `lib/app/startup/app_startup_state.dart`

```dart
///
/// Hand-written rather than freezed: two variants carry no fields, so const
/// canonicalisation already gives value equality, and boot does not depend on
/// build_runner output.
///
sealed class AppStartupState {
  const AppStartupState();
}

final class StartupInProgress extends AppStartupState {
  const StartupInProgress();
}

final class StartupSuccess extends AppStartupState {
  const StartupSuccess();
}

final class StartupFailure extends AppStartupState {
  const StartupFailure(this.error);

  final Object error;
}
```

## `lib/app/startup/app_startup_cubit.dart`

```dart
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:get_it/get_it.dart';
import 'package:matinee/app/startup/app_startup_state.dart';
import 'package:matinee/core/error/report.dart';

///
/// Main-init orchestrator. It sequences and maps to state; the actual work
/// lives in the services registered by registerStartupDependencies. Provided
/// by BlocProvider at the root, never registered in get_it.
///
class AppStartupCubit extends Cubit<AppStartupState> {
  AppStartupCubit(this._locator, this._registerStartup) : super(const StartupInProgress());

  static const _scope = 'startup';

  final GetIt _locator;
  final void Function(GetIt locator) _registerStartup;

  Future<void> start() async {
    try {
      // get_it caches allReady() and never re-runs a failed factory, so every
      // attempt registers the main-init services in a fresh scope.
      if (_locator.hasScope(_scope)) {
        await _locator.popScopesTill(_scope);
      }
      _locator.pushNewScope(scopeName: _scope, init: _registerStartup);
      await _locator.allReady(timeout: const Duration(seconds: 15));
      emit(const StartupSuccess());
    } on Object catch (e, s) {
      // Startup is the one place every failure maps to a screen the user can retry from.
      report(e, s);
      emit(StartupFailure(e));
    }
  }

  Future<void> retry() async {
    emit(const StartupInProgress());
    await start();
  }
}
```

## `lib/app/startup/splash_screen.dart`

```dart
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:matinee/app/startup/app_startup_cubit.dart';
import 'package:matinee/app/startup/app_startup_state.dart';
import 'package:matinee/core/l10n/l10n.dart';
import 'package:matinee/core/widgets/error_view.dart';

///
/// The only route reachable before startup succeeds. The router redirect keeps
/// the user here and returns them to the requested location afterwards.
///
class SplashScreen extends StatelessWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: BlocBuilder<AppStartupCubit, AppStartupState>(
        builder: (context, state) => switch (state) {
          StartupInProgress() || StartupSuccess() => const Center(child: CircularProgressIndicator()),
          StartupFailure() => ErrorView(
              message: context.l10n.startupFailed,
              onRetry: context.read<AppStartupCubit>().retry,
            ),
        },
      ),
    );
  }
}
```

## `lib/app/startup/post_init.dart`

```dart
import 'dart:async';

import 'package:matinee/core/error/report.dart';

///
/// Post-init. Fired once by App when startup succeeds. Nothing here may block
/// the UI, and every task is guarded so a failure degrades silently.
///
/// Add one line per task:
///
/// ```dart
/// unawaited(guardPostInit(() => getIt<FeedRepository>().prefetch()));
/// ```
///
void runPostInit() {}

Future<void> guardPostInit(Future<void> Function() task) async {
  try {
    await task();
  } on Object catch (e, s) {
    report(e, s);
  }
}
```

`guardPostInit` is public so the analyzer's `unused_element` warning does not fire while the template has no tasks. The first real task uses it.

## `lib/app/app.dart`

```dart
import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:matinee/app/router/app_router.dart';
import 'package:matinee/app/router/stream_listenable.dart';
import 'package:matinee/app/startup/app_startup_cubit.dart';
import 'package:matinee/app/startup/app_startup_state.dart';
import 'package:matinee/app/startup/post_init.dart';
import 'package:matinee/core/theme/app_theme.dart';
import 'package:matinee/core/theme/cubit/theme_cubit.dart';
import 'package:matinee/core/theme/cubit/theme_state.dart';
import 'package:matinee/di/service_locator.dart';
import 'package:matinee/l10n/gen/app_localizations.dart';

class App extends StatelessWidget {
  const App({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider(
          create: (_) {
            final startup = AppStartupCubit(getIt, registerStartupDependencies);
            unawaited(startup.start());
            return startup;
          },
        ),
        BlocProvider(create: (_) => ThemeCubit()),
      ],
      child: const _AppView(),
    );
  }
}

class _AppView extends StatefulWidget {
  const _AppView();

  @override
  State<_AppView> createState() => _AppViewState();
}

class _AppViewState extends State<_AppView> {
  late final StreamListenable _startupChanges;
  late final GoRouter _router;

  @override
  void initState() {
    super.initState();
    // The router is created once; rebuilding it on theme changes would reset navigation.
    final startup = context.read<AppStartupCubit>();
    _startupChanges = StreamListenable(startup.stream);
    _router = createRouter(startup, refreshListenable: _startupChanges);
  }

  @override
  void dispose() {
    _router.dispose();
    _startupChanges.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<AppStartupCubit, AppStartupState>(
      listenWhen: (_, current) => current is StartupSuccess,
      listener: (_, _) => runPostInit(),
      child: BlocBuilder<ThemeCubit, ThemeState>(
        builder: (context, themeState) {
          final appTheme = AppTheme(themeState.colorScheme);
          return MaterialApp.router(
            routerConfig: _router,
            theme: appTheme.light(),
            darkTheme: appTheme.dark(),
            themeMode: themeState.themeMode,
            localizationsDelegates: AppLocalizations.localizationsDelegates,
            supportedLocales: AppLocalizations.supportedLocales,
          );
        },
      ),
    );
  }
}
```

`BlocBuilder<ThemeCubit>` passes theme properties into the existing `MaterialApp.router`. It must not return a different `MaterialApp` per theme, and the router must not be created inside `build`.
