# swagger_parser configuration

Verified against swagger_parser 1.44.2 on 2026-09-03. Dart output is always retrofit interfaces over dio; supports OpenAPI 2, 3.0 and 3.1 in JSON or YAML.

## `swagger_parser.yaml`

```yaml
swagger_parser:
  schema_path: openapi/example.yaml
  output_directory: lib/core/api/generated/example
  name: Example
  language: dart
  json_serializer: freezed
  use_freezed3: true
  root_client: false
  put_clients_in_folder: true
  client_postfix: Client
  path_method_name: false
  enums_to_json: true
  unknown_enum_value: true
  mark_files_as_generated: true
  export_file: true
  default_content_type: application/json
```

Key decisions:

| Key | Value | Why |
|---|---|---|
| `json_serializer` | `freezed` | Matches every other data class in the app |
| `use_freezed3` | `true` | Required for freezed 3 and 4 syntax |
| `root_client` | `false` | Repositories inject the one client they need; a root client hides which endpoints a feature touches |
| `put_clients_in_folder` | `true` | Keeps `clients/` and `models/` apart inside the output folder |
| `path_method_name` | `false` | Method names come from `operationId`; set `true` only when the spec's ids are unusable |
| `unknown_enum_value` | `true` | A new server enum value decodes to `unknown` instead of crashing the app |
| `mark_files_as_generated` | `true` | Files carry the generated header so the deny hook and reviewers recognise them |

Optional keys that come up: `fallback_union: <name>` for `oneOf` schemas, `include_tags` / `exclude_tags` to generate a subset, `replacement_rules` to rename awkward schema names, `original_http_response: true` when a call needs headers or status codes. `merge_clients: true` collapses all tags into one client; do not use it.

## Multiple services

```yaml
swagger_parser:
  json_serializer: freezed
  use_freezed3: true
  root_client: false
  put_clients_in_folder: true
  mark_files_as_generated: true
  schemes:
    - schema_path: openapi/catalog.yaml
      output_directory: lib/core/api/generated/catalog
      name: Catalog
    - schema_path: openapi/orders.yaml
      output_directory: lib/core/api/generated/orders
      name: Orders
```

## Dependencies

Added by bootstrap (its pubspec reference lists them); if `pubspec.yaml` lacks them, run `flutter pub add dio retrofit json_annotation freezed_annotation` and `flutter pub add --dev swagger_parser retrofit_generator json_serializable freezed build_runner` first. The set: `dio`, `retrofit`, `json_annotation`, `freezed_annotation` in `dependencies`; `swagger_parser`, `retrofit_generator`, `json_serializable`, `freezed`, `build_runner` in `dev_dependencies`.

Known risk: the swagger_parser README pins `freezed ^3.2.5`; the template uses freezed 4.0.1. If `build_runner` fails on the generated models with a freezed error, pin `freezed: ^3.2.5` and `freezed_annotation: ^3.1.0` in `pubspec.yaml` and record the pin and the error in `docs/decisions/platform-core.md`.

## Analyzer

`lib/core/api/generated/**` is in `analysis_options.yaml`'s `exclude` list, so generator style does not fail the strict lint set. The public surface a repository uses (client methods and models) is still type-checked at the call site.

## Regeneration

```bash
dart run swagger_parser
dart run build_runner build --delete-conflicting-outputs
flutter test
```

Run after every spec change. Diff the generated folder before committing; a removed field or renamed method is the moment to fix repositories, not after the app ships.
