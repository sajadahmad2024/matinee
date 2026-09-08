# matinee

Matinee — a Flutter cross-platform application.

---

## Starting a New Project from This Template

Before writing any code, complete the following one-time setup steps:

### 1. Package and app identity

Already applied for this project. `package_rename_config.yaml` holds the base
identity (`com.ttle.matinee`, `Matinee`); the Dart package is `matinee`.
Per-flavor identity is not in that file — it lives where the build systems read it:
`applicationIdSuffix` and the `app_name` resValue per productFlavor in
`android/app/build.gradle.kts`, and `PRODUCT_BUNDLE_IDENTIFIER` /
`APP_DISPLAY_NAME` per build configuration in the Xcode projects.

To change the base identity again, edit the config and re-run:

```bash
dart run package_rename --flavour=dev
dart run package_rename --flavour=staging
dart run package_rename --flavour=prod
```

### 2. Set up app icons

Replace the default Flutter launcher icons with your own. For each flavor
you can provide a different icon (e.g., a tinted dev icon to tell installs apart).

> **Tip:** Use the [`flutter_launcher_icons`](https://pub.dev/packages/flutter_launcher_icons)
> package — it supports per-flavor icon configuration out of the box, letting you
> define separate icons for `dev`, `staging`, and `prod` in a single config file.

---

## Running the App

Three environments are available: `dev`, `staging`, and `prod`. Each has a dedicated entry point in `lib/`:


| Environment | Entry point             |
| ----------- | ----------------------- |
| dev         | `lib/main_dev.dart`     |
| staging     | `lib/main_staging.dart` |
| prod        | `lib/main_prod.dart`    |


### VSCode

Use the pre-configured launch targets in `.vscode/launch.json` (`Matinee DEV`, `Matinee STAGING`, `Matinee PROD`).

### Android / iOS / macOS

Flavors are fully configured on these platforms. Pass `--flavor` together with `--target`:

```bash
flutter run --flavor dev     --target lib/main_dev.dart
flutter run --flavor staging --target lib/main_staging.dart
flutter run --flavor prod    --target lib/main_prod.dart
```

### Windows / Linux / Web

Flavors are not supported on these platforms. Use only `--target` — the entry point file itself identifies the environment:

```bash
flutter run --target lib/main_dev.dart
flutter run --target lib/main_staging.dart
flutter run --target lib/main_prod.dart
```



