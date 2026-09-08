---
name: create-feature
description: Scaffolds one feature-first Flutter feature wired to the repo architecture. Emits models (or wires a generated API client), repository, service, Cubit and freezed state, screen, typed route, DI file, composition-root append, ARB strings and bloc_test tests, then runs codegen, format, analyze and test. Use when asked to "create a feature", "add a feature", "new screen with its cubit and data", "new cubit", or "new repository". Runs once per feature; bootstrap must have run first. Turning a Figma frame into the widget tree of an existing feature is implement-screen.
argument-hint: "<feature_name> [--bloc]"
allowed-tools: Bash(dart *) Bash(flutter *)
---

# Create feature

Scaffold `features/<feature>/` end to end. The shapes in [references/templates.md](references/templates.md) are the contract; copy them and substitute names. `.claude/rules/dart-style.md`, `testing.md` and `presentation.md` load as you touch the matching files; follow them.

## Invariants

- Cubit by default. Bloc only when the request needs debounce, strict sequencing, an event log or pagination transformers.
- Repositories and services are concrete classes registered with `registerLazySingleton` in `<feature>_di.dart`. Introduce an interface only when a second implementation exists now.
- Cubits are created by `BlocProvider`, never registered in `get_it`.
- Every repository method is `guardApi(() => ...)`. Nothing in a feature catches `DioException`.
- Cubit methods return `Future<void>` and follow one shape: emit loading, `try` the repository, emit success, `on AppException catch` emit failure. Nothing else is caught.
- State is a `@freezed` sealed union `initial / loading / success(data) / failure(AppException)`.
- Dependencies point down: screen → cubit → repository → service. A feature never imports another feature's cubit or screen, and a repository never imports another repository. Anything two features need moves to `shared/`.
- Strings go through `context.l10n`; spacing through `AppSpacing`; colours and text through `Theme.of(context)`; navigation through the typed route class.

## Workflow

1. **Name and shape.** `<feature>` in `snake_case`, `<Feature>` in `PascalCase`. Decide Cubit or Bloc from the invariant above.
2. **Data source.** If the API is described by an OpenAPI spec, run the add-api skill first and inject the generated client; skip the DTO and service templates. Otherwise emit the DTO and the hand-written service.
3. **Emit the tree.**

   ```
   lib/features/<feature>/
     data/
       models/<feature>_dto.dart          only without a generated client
       services/<feature>_api_service.dart only without a generated client
       <feature>_repository.dart
     presentation/
       cubit/<feature>_cubit.dart          or bloc/<feature>_bloc.dart + <feature>_event.dart
       cubit/<feature>_state.dart
       <feature>_screen.dart
       widgets/
     <feature>_di.dart
   ```

   A `domain/` folder with use-cases appears only when logic merges several repositories or is reused across cubits. A separate domain model appears only when the API shape does not fit the screen.
4. **Wire DI.** Register the service and repository in `<feature>_di.dart`; import it in `di/service_locator.dart` and append one `register<Feature>Dependencies();` line inside `registerDependencies`.
5. **Route.** Add a `@TypedGoRoute<<Feature>Route>` class to `app/router/app_routes.dart`. Identifiers go in the path, filters in query parameters, never `extra`.
6. **Strings.** Add the screen's keys to `lib/l10n/arb/app_en.arb` with `@` descriptions where the key alone is ambiguous.
7. **Tests.** Emit `test/features/<feature>/presentation/cubit/<feature>_cubit_test.dart` with a success and a failure case per method. Widget tests only for non-trivial rendering, with a mocked cubit.
8. **Cross-feature check.** Grep the new folder for `features/` imports other than its own. Any hit is a violation to fix before continuing.
9. **Generate and verify.**

   ```bash
   flutter gen-l10n
   dart run build_runner build --delete-conflicting-outputs
   dart format .
   flutter analyze --fatal-infos
   flutter test test/features/<feature>
   ```

   Fix every finding; never add `// ignore:`.
10. **Review.** Run `/code-review` on the result and address its findings before reporting done.

## Emit checklist

- `<feature>_repository.dart` uses `guardApi` on every method and throws nothing itself
- `<feature>_state.dart` is a `@freezed` sealed union with the four variants
- `<feature>_cubit.dart` methods return `Future<void>`; each has the loading, try, `on AppException` shape
- `<feature>_screen.dart` creates the cubit in `BlocProvider.create` with `unawaited(...)`, switches exhaustively on the state, uses `ErrorView` for failure
- `<feature>_di.dart` registers no cubit; `service_locator.dart` gained one import and one line
- `app_routes.dart` gained one typed route; `app_routes.g.dart` regenerated
- `app_en.arb` gained the screen's strings; `lib/l10n/gen` regenerated
- Cubit test has a failure case for every method
- `flutter analyze --fatal-infos` and `flutter test` clean; `/code-review` findings addressed

## Follow-up once `lib/features/example` exists

The reference feature replaces the templates: this skill becomes "mirror `features/example`", `tool/scaffold.dart` does the renaming, and a `Stop` hook with `once: true` running analyze and the feature's tests is added to this frontmatter so the skill cannot finish red.
