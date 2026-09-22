---
paths:
  - "**/*.g.dart"
  - "**/*.freezed.dart"
  - "**/lib/l10n/gen/**"
  - "**/lib/core/api/generated/**"
---

# Generated code

The file you are looking at is generated. Never edit it; the change is lost on the next build and a hook denies the edit anyway. Change the source and regenerate:

| File | Source | Regenerate with |
|---|---|---|
| `*.freezed.dart`, `*.g.dart` next to a model or state | the annotated Dart file | `dart run build_runner build --delete-conflicting-outputs` |
| `app_routes.g.dart` | `app/router/app_routes.dart` | same |
| `lib/l10n/gen/**` | `lib/l10n/arb/*.arb` | `flutter gen-l10n` |
| `lib/core/api/generated/**` | `openapi/<service>.yaml` and `swagger_parser.yaml` | `dart run swagger_parser` then `build_runner` |

Generated files are committed so clones build without a codegen step. If a generated file is out of date, regenerate and commit it with the source change.
