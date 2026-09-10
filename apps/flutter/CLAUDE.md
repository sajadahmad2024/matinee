# CLAUDE.md — Flutter Template

Flutter app template for GeekyAnts client projects, built to be extended by Claude Code from a Figma file and an OpenAPI spec. Package name `template`; flavors `dev`, `staging`, `prod`.

## Commands

```bash
flutter run --flavor dev -t lib/main_dev.dart
dart run build_runner build --delete-conflicting-outputs
flutter gen-l10n
dart format .
flutter analyze --fatal-infos
flutter test
```

Lint findings are failures; hooks format and analyze every edited Dart file and block edits to generated files. Inside a session prefer the Dart MCP server's `analyze_files` and `run_tests` over shell, and pass `--print-dtd` when launching from a shell so the server can attach.

## Knowledge map

- `.claude/rules/`: conventions that load with the files they govern. `dart-style.md` (always on), `testing.md`, `presentation.md`, `generated.md`, `native.md`.
- `.claude/skills/`: procedures. `bootstrap` (one-time platform generation), `add-api` (OpenAPI to typed client), `create-feature` (one feature end to end), `implement-screen` (Figma frame to widgets with a run-and-compare loop), `commit`, `/accessibility` and `/static-security` (manual audits), `material-theming` and `responsive-adaptive` (decision guides).
- `docs/design/`: the extracted Matinee design system — tokens, typography, layout scales, component catalogue, decisions log (`README.md` there explains the files). Source of truth for every colour, text style, spacing and component; the theme in `lib/core/theme/` mirrors it. Missing there → confirm with the user before adding.
- `docs/decisions/`: why each decision below was made and what was rejected. Read before proposing to reverse one.
- `docs/plan/`: dated implementation plans; the commit skill reads the newest for the commit type.
- `README.md`: run commands per flavor and platform.

## Stack

| Concern | Decision |
|---|---|
| State | Cubit by default; Bloc only for debounce, strict sequencing, event log, pagination transformers |
| UI state shape | `@freezed` sealed union `initial / loading / success(data) / failure(AppException)` |
| Models | `@freezed` + `json_serializable`; DTOs come from the OpenAPI spec through `swagger_parser` |
| Codegen | `build_runner` for freezed, json_serializable, go_router_builder, retrofit; `flutter gen-l10n`; `swagger_parser`. Generated files committed |
| DI | `get_it`, manual, one composition root `di/service_locator.dart`; `registerLazySingleton` default; Cubits via `BlocProvider` only |
| HTTP | `dio` with one shared instance from `core/network/dio_factory.dart`; `retrofit` clients generated per OpenAPI tag |
| Errors | Sealed `AppException`; `guardApi()` maps `DioException` once; cubits catch `on AppException` only |
| Global net | Sentry owns `FlutterError.onError` and `PlatformDispatcher.onError`; `report()` for deliberately caught errors |
| Navigation | `go_router` typed routes; startup redirect keeps routes behind `/splash` until ready; IDs in paths, never `extra` |
| Environment | `Env` per flavor passed to `bootstrap(Env)`; Sentry DSN via `--dart-define` |
| Storage | `SharedPreferencesAsync` for preferences, `flutter_secure_storage` for sensitive values; no database |
| Auth | Not in the template; a `SessionRepository` and an `AuthInterceptor` extending `QueuedInterceptor` are the first per-project additions |
| Theme | Material 3, dark-only, generated from `docs/design/`: one `ColorScheme` (gold seed for roles the design never drew), `AppColors` extension for app roles and gradients, `AppTextStyle` (DM Sans / Poppins / Inter / Oswald bundled), `AppSpacing` and layout scales |
| Layout | Three window tiers (compact, medium, expanded); mobile and desktop first, web secondary |
| i18n | ARB + `gen-l10n`, `context.l10n`; the only literal string is in `BootstrapErrorApp` |
| Testing | `bloc_test` + `mocktail`; failure path mandatory; widget tests for non-trivial rendering; goldens for reusable components only |
| Observability | `sentry_flutter`, enabled when a DSN is defined |

## Invariants

Each is checkable in review. Rationale in `docs/decisions/`.

- **Dependencies flow downward.** Screen → Cubit → Repository → Service or generated client. A feature never imports another feature's cubit or screen. A repository never imports another repository; combine data in the cubit or a use-case. Session-wide state lives in a repository and is observed as a stream.
- **Feature-first layout.** `features/<feature>/{data,domain?,presentation}` plus `<feature>_di.dart`. `core/` has no business logic; `shared/` holds business logic two or more features need. Promote on the second use; never copy. A widget carries no business logic, so a cross-feature widget goes to `core/widgets`, never to `shared/`.
- **Concrete unless a second implementation exists now.** No speculative interfaces.
- **Cubits never in `get_it`.** `BlocProvider` owns the lifecycle. Cubit methods return `Future<void>`; callers use `unawaited`.
- **Cubits extend `SafeCubit`.** Emits after `close()` are dropped, not thrown; `close()` still cancels what the cubit owns. See `dart-style.md`.
- **Freezed for data classes and states.** `AppStartupState` is the one hand-written sealed class.
- **Errors have one shape.** Repositories call `guardApi`; cubits `try`, emit success, `on AppException catch` emit failure; nothing else is caught. Programming errors reach Sentry.
- **Failure path is mandatory.** Every cubit method has a `blocTest` where the repository throws.
- **Three-phase startup.** `bootstrap(Env)` is minimal and falls back to `BootstrapErrorApp`; `AppStartupCubit` gates through the router redirect, registers main-init in a fresh get_it scope per attempt and awaits `allReady(timeout:)`, so `retry()` recovers; `runPostInit()` fires tasks that are unawaited and individually guarded. Registration method decides the phase.
- **Generated code is never edited.** Change the source and regenerate.
- **Design tokens go through the theme, and come from `docs/design/`.** No `Color(`, `TextStyle(` or spacing literal in a widget; every Figma value maps to a documented theme role before any widget is written. A value or component absent from `docs/design/` is confirmed with the user and added to the docs and the theme together — never improvised in code.
- **Native folders are frozen.** Dart work never edits `ios/`, `android/`, `macos/`, `windows/`, `linux/`, `web/`.

## Working norms

**Think before coding.** State assumptions explicitly. Make routine judgment calls yourself; check in only when different readings of the request would lead to materially different work. If the request seems mistaken or a simpler approach exists, say so in a sentence and continue with the task as asked.

**Simplicity first.** Minimum code that solves the problem. No abstractions for single-use code, no speculative flexibility, no error handling for impossible scenarios. If it could be 50 lines, don't write 200.

**Surgical changes.** Touch only what the task requires. Don't refactor adjacent code or "improve" unrelated formatting. Match existing style. If you notice unrelated dead code, mention it — don't delete it. Every changed line should trace directly to the request.

## Working here

Use the Dart LSP for symbol lookup. End a feature or screen with `/code-review` and address its findings before reporting done.
