---
name: bootstrap
description: One-time generator for the Flutter template's platform code. Emits Env and flavor entry points, the get_it composition root, the three-phase startup (bootstrap function, AppStartupCubit under a splash route, post-init), Sentry-owned error net, Dio factory with the single error mapper, storage services, typed go_router with a startup redirect, Material 3 theme, three-tier responsive helpers, l10n, test helpers and core tests. Use when asked to "generate the template", "bootstrap the app", "set up app initialization", "set up the composition root", or "new project setup". Run once per app; create-feature runs per feature afterwards.
argument-hint: "[package-name]"
allowed-tools: Bash(dart *) Bash(flutter *)
---

# Bootstrap

Generates everything under `lib/` that is not a feature, plus the tests and config that go with it. The output must pass `flutter analyze --fatal-infos` and `flutter test` with zero findings before the skill reports done. Every code shape is in `references/`; copy them exactly, substituting the package name from `pubspec.yaml` for `template`.

Read `.claude/rules/dart-style.md` before writing any file. The rules there (comment delimiters, `package:` imports, typed `on` clauses, `unawaited`) are enforced by the analyzer and by hooks.

## Locked decisions

- **Three phases, three shapes.** Pre-init is the `bootstrap(Env)` function. Main-init is `AppStartupCubit`, provided by `BlocProvider`, never in `get_it`. Post-init is the `runPostInit()` function. Assign a service to a phase with the criticality question in [references/phase-policy.md](references/phase-policy.md).
- **Sentry owns the global error net.** `SentryFlutter.init` installs `FlutterError.onError` and `PlatformDispatcher.onError` itself. The template never sets either by hand and never uses `runZonedGuarded`. `report()` is only for errors the app catches deliberately.
- **`bootstrap(Env)` takes the flavor.** The three entry points `main_dev.dart`, `main_staging.dart`, `main_prod.dart` each call it with one `Env`. There is no `main.dart`. Native flavor setup is frozen; do not touch `ios/`, `android/` or `macos/`.
- **Startup gating is a router redirect.** Every route sits behind `/splash` until `AppStartupCubit` reports success; the redirect then returns to the location the user asked for, so cold-start deep links survive. No `BlocConsumer` listener navigates by string.
- **One error mapper.** `guardApi()` in `core/network/error_mapper.dart` turns `DioException` into `AppException`. Repositories call it; nothing else catches `DioException`.
- **No auth, no database.** Storage is `SharedPreferencesAsync` for preferences and `flutter_secure_storage` for anything sensitive. A `SessionRepository` and an `AuthInterceptor` extending `QueuedInterceptor` are the first things a client project adds; the redirect and Dio factory show where.
- **Hand-written `AppStartupState`**, freezed for everything else that carries data (`ThemeState`, feature states, DTOs).
- **Cubit methods return `Future<void>`.** Widgets call them with `unawaited(...)`; `BlocProvider.create` uses a closure that creates, kicks off and returns. The analyzer's `discarded_futures` makes a cascade `..start()` a failure.

## Workflow

Work through the steps in order. Each references one file; do not invent variations.

1. **Dependencies and config.** Apply [references/pubspec.md](references/pubspec.md): add the dependency set, `flutter: generate: true`, `l10n.yaml`, and `dart_test.yaml` (the analyzer excludes are already in place). Run `flutter pub get`.
2. **Configuration and composition root.** From [references/core.md](references/core.md) emit `core/config/env.dart`, `di/service_locator.dart`, `core/error/app_exception.dart`, `core/error/report.dart`, `core/bloc/app_bloc_observer.dart`, `core/bloc/safe_cubit.dart`, `core/network/dio_factory.dart`, `core/network/error_mapper.dart`, `core/storage/preferences_service.dart`, `core/storage/secure_storage_service.dart`.
3. **Startup.** From [references/startup.md](references/startup.md) emit the three entry points, `bootstrap.dart`, `app/app.dart`, `app/bootstrap_error_app.dart`, `app/startup/app_startup_state.dart`, `app_startup_cubit.dart`, `splash_screen.dart`, `post_init.dart`.
4. **Router.** From [references/router.md](references/router.md) emit `app/router/app_routes.dart`, `app_router.dart`, `stream_listenable.dart`, `not_found_screen.dart`, and the placeholder `features/home/presentation/home_screen.dart`.
5. **Theme.** From [references/theme.md](references/theme.md) emit `core/theme/` (scheme enum, `AppColors` extension, `AppTextStyle`, `AppSpacing`, `AppTheme`, `ThemeCubit` and freezed `ThemeState`, `context.appColors`).
6. **Responsive.** From [references/responsive.md](references/responsive.md) emit `core/responsive/` (three tiers, `context.responsive()`, `ContentContainer`).
7. **Localisation and shared widgets.** From [references/l10n.md](references/l10n.md) emit `lib/l10n/arb/app_en.arb`, `core/l10n/l10n.dart`, `core/l10n/app_exception_l10n.dart`, and `core/widgets/error_view.dart`.
8. **Tests.** From [references/testing.md](references/testing.md) emit `test/helpers/`, and the core tests for the error mapper, `AppStartupCubit`, `StreamListenable`, `ThemeCubit`, and `AppExceptionL10n`.
9. **Classify any services the user named.** Run each through the criticality question in [references/phase-policy.md](references/phase-policy.md) and register it with the matching method.
10. **Generate, format, analyze, test.**

    ```bash
    flutter gen-l10n
    dart run build_runner build --delete-conflicting-outputs
    dart format .
    flutter analyze --fatal-infos
    flutter test
    ```

    Fix every finding. Do not suppress with `// ignore:`.

11. **Report.** Delete the "Current state" section from `CLAUDE.md` (it describes the empty `lib/`), then list the files created, the analyzer and test summary lines, and the run commands for the three flavors from `README.md`.

## Emit checklist

- `lib/main_dev.dart`, `main_staging.dart`, `main_prod.dart` each call `bootstrap(Env.<flavor>)`; no `lib/main.dart`
- `lib/bootstrap.dart`: binding, `Bloc.observer`, `registerDependencies(env)` in `on Object catch` with `BootstrapErrorApp` fallback, `SentryFlutter.init` when a DSN exists, else `runApp`
- `lib/di/service_locator.dart` declares `getIt` once, `registerDependencies(Env)` and `registerStartupDependencies(GetIt)`
- `lib/core/error/` has the sealed `AppException` and `report()`; `lib/core/network/` has `createDio` and `guardApi`
- `lib/app/startup/` has the sealed state, the thin cubit that registers main-init in a fresh get_it scope per attempt and awaits `allReady(timeout:)`, so `retry()` can recover, the splash screen, and `runPostInit()`
- `lib/app/router/` has typed routes, `createRouter` with the startup redirect, `StreamListenable`, and a not-found screen
- `lib/core/theme/`, `lib/core/responsive/`, `lib/core/l10n/`, `lib/core/widgets/error_view.dart` exist and are used by the splash and not-found screens
- `test/helpers/pump_app.dart` wraps theme and localisations; core tests pass
- `flutter analyze --fatal-infos` and `flutter test` are clean

## Not in the template

`flutter_native_splash`, auth, a database, analytics, remote config. Each is a per-project addition; the criticality question decides its phase.
