# template

A Flutter cross-platform template project.

---

## Starting a New Project from This Template

Before writing any code, complete the following one-time setup steps:

### 1. Rename the package and app name

Open `package_rename_config.yaml` and replace all placeholder values
(`My App`, `com.example.myapp`, `Your Organization`, etc.) with your
actual app name, bundle identifier, and organization details.

Then run the rename tool once per flavor:

```bash
dart run package_rename --flavour=dev
dart run package_rename --flavour=staging
dart run package_rename --flavour=prod
```

This updates the app name and package/bundle ID across all 6 platforms
(Android, iOS, macOS, Web, Linux, Windows) in one step.

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

Use the pre-configured launch targets in `.vscode/launch.json` (`Template DEV`, `Template STAGING`, `Template PROD`).

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



