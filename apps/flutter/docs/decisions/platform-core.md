# Decision record: platform core

Decisions taken on 2026-09-03 for the parts of the template that the architecture record does not cover: environment, networking, storage, observability, API generation, layout scope, and how the configuration is distributed. Code shapes live in `.claude/skills/bootstrap/references/core.md` and the add-api skill.

## Environment

`Env` is a const per flavor (`dev`, `staging`, `prod`) holding the API base URL and the flavor name, passed into `bootstrap(Env)` by one of three entry points. There is no `lib/main.dart`; the native flavor setup already targets the three files. Nothing secret lives in `Env`: secrets come from the backend at runtime, and `--dart-define` values are extractable from the binary, so they are used only for non-secret configuration such as the Sentry DSN.

## Networking

One `Dio` instance for the app, so interceptors, timeouts and a future auth layer apply to every request, and so tests replace one object. Request logging is on outside production with headers excluded, so a future bearer token never lands in a log. `dio` over `http` because interceptors, cancellation and certificate hooks are needed the moment auth or offline handling arrives; `retrofit` because `swagger_parser` targets it and a generated interface per OpenAPI tag keeps each feature's endpoint surface visible in its DI file.

`DioException` is converted to `AppException` in exactly one function, `guardApi()`, which every repository call passes through. Status codes decide the type, so a screen can react differently to a missing resource, an expired session and a server fault. `ValidationException` has a `message` slot that stays empty until a project parses its backend's error body; the HTTP reason phrase is never shown to users. Mapping once removed a per-feature repository test and stopped status codes being flattened into message strings.

## Auth is not in the template

Client projects use different identity setups (the monorepo's NestJS backend issues bearer and refresh tokens and fronts Google and GitHub OAuth; other clients use third-party providers). The template ships the seams instead: secure storage for tokens, a single Dio where an `AuthInterceptor` extending `QueuedInterceptor` slots in so concurrent refreshes serialise, and the router redirect where a guard reads a `SessionRepository` stream. The static-security skill's guidance on token storage applies when that code is added.

## Storage

`SharedPreferencesAsync` for preferences (the legacy `SharedPreferences` API is marked for deprecation in the package README) and `flutter_secure_storage` for sensitive values. No database in the template; `drift` is the choice when a feature needs relational local data, added per project.

## Observability

Sentry, behind one `report()` function and one `SentryFlutter.init` call. Chosen over Firebase Crashlytics because it needs no per-flavor native configuration files, works on all six platforms from a pubspec dependency, and is trivially disabled in development by omitting the DSN. A Firebase-centric client swaps the sink in those two places. Sentry also owns the global error net (see the initialization record).

## API generation

`swagger_parser` generates retrofit clients over dio and freezed models from an OpenAPI 2, 3.0 or 3.1 snapshot committed under `openapi/`. Output goes to `lib/core/api/generated/`, excluded from strict analysis and protected by a hook that denies edits. A separate `packages/api_client` pub workspace was considered and rejected for now: a single `lib/` keeps the template trivially copyable to a client repository, and the analyzer exclusion gives the same lint isolation. Revisit when a client has several large specs.

The spec is the DTO. A domain model is added only when a screen needs a different shape. Known risk: swagger_parser's README pins freezed 3.x while the template uses 4.x; the code pass tests generation under 4 and records a pin if needed.

## Navigation

`go_router` because it is the Flutter team's published router, still releasing monthly, and its typed-route generator removes string paths from the app entirely; `auto_route` was rejected as stale. Route classes rather than paths so a renamed route is a compile error, not a broken deep link. Identifiers travel in the path and filters in query parameters because `extra` is not serialisable: it breaks deep links, browser history and state restoration. Guards are `redirect` clauses because that is the only place go_router evaluates before building a page, which is what the startup gate and a future auth guard both need.

## Theme

Material 3 with `ColorScheme.fromSeed` per named scheme, because a seed derives the roles Material widgets already read, so most of the UI is on-brand with no per-widget styling. `AppColors` exists only for meanings Material lacks (success, warning, info) and `AppSpacing` is the one spacing scale, because the Figma-to-widget flow depends on every design variable having exactly one theme target; literals in widgets would make that mapping unverifiable and every redesign a search-and-replace.

## Localisation

ARB files with `gen-l10n` because it is the SDK-native pipeline every translation vendor accepts and it needs no extra package; `slang` and `easy_localization` are nicer to write but non-standard. Strings are keys from day one because retrofitting l10n costs more than the small overhead of doing it from the start.

## Native folders are frozen

The Gradle flavors, Xcode schemes and the CocoaPods-to-SwiftPM migration are finished and fragile; a Dart-side change never needs them. Freezing them keeps generated work from touching the part of the repo that is hardest to review and to repair.

## Layout scope

Mobile and desktop are first-class; web compiles but is secondary. The responsive helpers therefore expose three Material window tiers (compact under 600 dp, medium to 839, expanded from 840). Wider tiers, URL strategy and reflow rules are added by projects that ship wide web layouts.

## Generated files are committed

`*.freezed.dart`, `*.g.dart`, `lib/l10n/gen/`, `lib/core/api/generated/` and `app_routes.g.dart` are committed so a fresh clone builds without a codegen step and reviews see generated diffs. The cost is diff noise, accepted.

## Claude Code configuration

Rules hold conventions and load with the files they govern; skills hold procedures; `CLAUDE.md` holds commands, the stack table and the invariants, which deliberately summarise the rules so `/code-review` has one checklist; this folder holds rationale. Each convention has one owning file; the invariant list is the only sanctioned summary. Hooks format and analyze every edited Dart file with lints fatal, and deny edits to generated files. Because a nested `.claude/settings.json` is not read when a session starts at the monorepo root, hooks are registered in the root settings with filters scoped to `apps/flutter/`, and the app carries an unscoped copy for when it is the repository root. The Dart MCP server is configured at both levels for the same reason.

The `.claude/` folder is copied per client project for now. Packaging it as a plugin is deferred until the skill set has survived one real client module.

## Not in the template

Auth, database, analytics, remote config, native splash, CI. Each has a documented seam above or in the initialization record.
