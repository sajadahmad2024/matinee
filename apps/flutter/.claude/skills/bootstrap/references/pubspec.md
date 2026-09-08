# Dependencies and project configuration

Versions verified on pub.dev on 2026-09-03 against Flutter 3.47.2 (Dart 3.13). Bump with `flutter pub outdated`; do not downgrade below these.

## `pubspec.yaml`

```yaml
dependencies:
  dio: ^5.11.0
  flutter:
    sdk: flutter
  flutter_bloc: ^9.1.1
  flutter_localizations:
    sdk: flutter
  flutter_secure_storage: ^11.0.0
  freezed_annotation: ^3.1.0
  get_it: ^9.2.1
  go_router: ^18.0.1
  intl: ^0.20.3
  json_annotation: ^4.12.0
  retrofit: ^4.10.0
  sentry_flutter: ^9.28.0
  shared_preferences: ^2.5.5

dev_dependencies:
  bloc_test: ^10.0.0
  build_runner: ^2.16.1
  flutter_lints: ^6.0.0
  flutter_test:
    sdk: flutter
  freezed: ^4.0.1
  go_router_builder: ^4.4.1
  json_serializable: ^6.14.1
  mocktail: ^1.0.5
  package_rename: ^1.10.1
  retrofit_generator: ^10.2.10
  swagger_parser: ^1.44.2

flutter:
  uses-material-design: true
  generate: true
```

`sort_pub_dependencies` is enabled, so keep each block alphabetical. `retrofit`, `retrofit_generator` and `swagger_parser` are used by the add-api skill; they are added here so the first `add-api` run needs no pubspec edit.

Known risk: the swagger_parser README still pins `freezed ^3.2.5`. If `dart run swagger_parser` output fails to build under freezed 4, pin `freezed: ^3.2.5` and `freezed_annotation: ^3.1.0` and record the pin in `docs/decisions/platform-core.md`.

## `analysis_options.yaml`

Already configured: `lib/**/*.g.dart`, `lib/**/*.freezed.dart`, `lib/l10n/gen/**` and `lib/core/api/generated/**` are in `analyzer.exclude`, so generated code never fails the strict lint set. Do not add generated folders elsewhere.

## `l10n.yaml`

```yaml
arb-dir: lib/l10n/arb
output-dir: lib/l10n/gen
template-arb-file: app_en.arb
output-localization-file: app_localizations.dart
nullable-getter: false
preferred-supported-locales: [en]
use-escaping: true
```

## `dart_test.yaml`

```yaml
tags:
  golden: {}
timeout: 2x
```

## `.gitignore`

Generated files are committed (`*.freezed.dart`, `*.g.dart`, `lib/l10n/gen/`, `lib/core/api/generated/`) so clones build without a codegen step. Do not add them to `.gitignore`.

## Sentry DSN

The DSN is passed at build time, never committed:

```bash
flutter run --flavor prod -t lib/main_prod.dart --dart-define=SENTRY_DSN=https://...
```

Without the define, `Env.sentryDsn` is `null` and Sentry is not initialised. Record the run commands in `README.md`.
