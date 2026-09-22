---
name: add-api
description: Turns an OpenAPI (Swagger) spec into a typed Dart API client with swagger_parser (retrofit over dio, freezed models) under lib/core/api/generated, and wires it into a feature's DI. Use when given a Swagger or OpenAPI URL or file to generate Dart from, or asked to "generate the API client", "add the backend API", "update the API from the spec", or "regenerate models from swagger". Runs once per spec and again whenever the spec changes.
argument-hint: "<spec-url-or-path> [service-name]"
allowed-tools: Bash(dart *) Bash(flutter *) Bash(curl *) WebFetch
---

# Add API

The spec is the source of truth for the data layer. Models and clients are generated, never hand-written, and never edited after generation. Screens consume the generated DTOs directly; a separate domain model appears only when a screen needs a different shape.

## Invariants

- Spec snapshots live in `openapi/<service>.yaml` (or `.json`) and are committed. Generation reads the snapshot, not the network, so a build is reproducible.
- Output goes to `lib/core/api/generated/<service>/`, which is excluded from strict analysis; `.claude/rules/generated.md` (never edit, regenerate) applies and the deny hook enforces it.
- One retrofit client per OpenAPI tag, freezed models, no root client. A repository injects the one client it needs; create-feature wires the repository.
- DTOs come from the spec, never from Figma. If the design shows a field the spec lacks, that is a backend conversation, not a Dart edit.
- When the spec changes: replace the snapshot, regenerate, run the tests, commit spec and output together.

## Workflow

1. **Snapshot the spec.** Fetch the URL (or copy the file) to `openapi/<service>.yaml`. Read it once: note the tags (they become clients), the base path, auth scheme (informational; auth is a per-project addition), and any polymorphic schemas (`oneOf`), which need `fallback_union` in the config.
2. **Configure.** Write `swagger_parser.yaml` at the package root from [references/swagger-parser.md](references/swagger-parser.md). For a second service, add an entry under `schemes:` instead of a second file.
3. **Generate.**

   ```bash
   dart run swagger_parser
   dart run build_runner build --delete-conflicting-outputs
   flutter analyze --fatal-infos
   ```

   `swagger_parser` writes the retrofit interfaces and freezed models; `build_runner` produces their `.g.dart` and `.freezed.dart`. If generation fails under freezed 4, apply the pin noted in the reference and record it.
4. **Review the output, do not edit it.** Open the generated client for the tag the feature needs. Check method names read well (`path_method_name: false` uses `operationId`; if the spec's ids are poor, switch to `true` and regenerate), nullable fields match the spec's `required`, and enums carry `unknown_enum_value`.
5. **Register the client.** In the feature's `<feature>_di.dart` (create it if the feature is new), register the generated client with the shared Dio:

   ```dart
   getIt.registerLazySingleton<ProductsClient>(() => ProductsClient(getIt<Dio>()));
   ```

   Hand off to create-feature, which wires the repository around the client and builds the cubit and screen.
6. **Verify.** `flutter analyze --fatal-infos` and `flutter test` clean. If the backend is reachable, run the app once against the dev flavor and check one request succeeds and one 404 maps to `NotFoundException`.
7. **Commit together.** `openapi/<service>.yaml`, `swagger_parser.yaml`, `lib/core/api/generated/**`, and the DI change in one commit, so the spec and its output never diverge in history.

## Emit checklist

- `openapi/<service>.yaml` committed, `swagger_parser.yaml` points at it
- `lib/core/api/generated/<service>/` contains `*_client.dart`, `models/`, generated `.g.dart` and `.freezed.dart`; nothing in it is hand-edited
- Feature DI registers the client with `getIt<Dio>()`
- No DTO is hand-written for a spec-backed endpoint
- `flutter analyze --fatal-infos` and `flutter test` clean
