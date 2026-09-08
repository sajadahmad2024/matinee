# Theme: Material 3, multiple schemes, light and dark

Copy these files exactly into `lib/core/theme/`. Replace `template` with the package name from `pubspec.yaml`.

```
lib/core/theme/
  app_color_scheme.dart      enum of selectable schemes, one seed each
  app_colors.dart            ThemeExtension for tokens Material lacks
  app_text_styles.dart       TextTheme roles, one place to plug a font
  app_spacing.dart           the only spacing numbers in the app
  app_theme.dart             assembles ThemeData
  cubit/theme_cubit.dart
  cubit/theme_state.dart     freezed, single variant
  extensions/build_context_extensions.dart
```

## `app_color_scheme.dart`

```dart
import 'package:flutter/material.dart';

///
/// Selectable colour schemes. Adding one is a new value plus a branch in each
/// switch; the compiler enforces exhaustiveness. Seeds come from the design's
/// primary colour; ColorScheme.fromSeed derives the other roles.
///
enum AppColorScheme {
  standard,
  forest,
  sunset;

  ColorScheme light() => ColorScheme.fromSeed(seedColor: _seed);

  ColorScheme dark() => ColorScheme.fromSeed(seedColor: _seed, brightness: Brightness.dark);

  Color get _seed => switch (this) {
        AppColorScheme.standard => const Color(0xFF0061A4),
        AppColorScheme.forest => const Color(0xFF2E7D32),
        AppColorScheme.sunset => const Color(0xFFE65100),
      };
}
```

When a scheme needs a role overridden, chain `.copyWith(error: ...)` on the generated scheme inside `light()` or `dark()`.

## `app_colors.dart`

```dart
import 'package:flutter/material.dart';

///
/// Semantic colours ColorScheme does not define. Every ThemeExtension needs
/// copyWith and lerp for theme animation to work.
///
class AppColors extends ThemeExtension<AppColors> {
  const AppColors({
    required this.success,
    required this.onSuccess,
    required this.warning,
    required this.onWarning,
    required this.info,
    required this.onInfo,
  });

  final Color success;
  final Color onSuccess;
  final Color warning;
  final Color onWarning;
  final Color info;
  final Color onInfo;

  static const light = AppColors(
    success: Color(0xFF2E7D32),
    onSuccess: Color(0xFFFFFFFF),
    warning: Color(0xFFF57C00),
    onWarning: Color(0xFFFFFFFF),
    info: Color(0xFF0288D1),
    onInfo: Color(0xFFFFFFFF),
  );

  static const dark = AppColors(
    success: Color(0xFF81C784),
    onSuccess: Color(0xFF1B5E20),
    warning: Color(0xFFFFB74D),
    onWarning: Color(0xFF4E2600),
    info: Color(0xFF4FC3F7),
    onInfo: Color(0xFF01579B),
  );

  @override
  AppColors copyWith({
    Color? success,
    Color? onSuccess,
    Color? warning,
    Color? onWarning,
    Color? info,
    Color? onInfo,
  }) {
    return AppColors(
      success: success ?? this.success,
      onSuccess: onSuccess ?? this.onSuccess,
      warning: warning ?? this.warning,
      onWarning: onWarning ?? this.onWarning,
      info: info ?? this.info,
      onInfo: onInfo ?? this.onInfo,
    );
  }

  @override
  AppColors lerp(AppColors? other, double t) {
    if (other is! AppColors) {
      return this;
    }
    return AppColors(
      success: Color.lerp(success, other.success, t)!,
      onSuccess: Color.lerp(onSuccess, other.onSuccess, t)!,
      warning: Color.lerp(warning, other.warning, t)!,
      onWarning: Color.lerp(onWarning, other.onWarning, t)!,
      info: Color.lerp(info, other.info, t)!,
      onInfo: Color.lerp(onInfo, other.onInfo, t)!,
    );
  }
}
```

## `app_text_styles.dart`

```dart
import 'package:flutter/material.dart';

///
/// The TextTheme roles the app overrides. fontFamily is set once here when the
/// design specifies a font; widgets only ever read Theme.of(context).textTheme.
///
abstract final class AppTextStyle {
  static const _base = TextStyle(fontWeight: FontWeight.w400);

  static final TextStyle displayLarge = _base.copyWith(fontSize: 57, height: 1.12);
  static final TextStyle headlineMedium = _base.copyWith(fontSize: 28, height: 1.29);
  static final TextStyle titleLarge = _base.copyWith(fontSize: 20, height: 1.3, fontWeight: FontWeight.w500);
  static final TextStyle bodyLarge = _base.copyWith(fontSize: 16, height: 1.5);
  static final TextStyle labelLarge = _base.copyWith(fontSize: 14, height: 1.43, fontWeight: FontWeight.w500);
}
```

## `app_spacing.dart`

```dart
///
/// Every gap, padding and margin in the app is one of these. A raw number in a
/// widget is a review finding.
///
abstract final class AppSpacing {
  static const double unit = 16;

  static const double xxs = 0.25 * unit;
  static const double xs = 0.375 * unit;
  static const double sm = 0.5 * unit;
  static const double md = 0.75 * unit;
  static const double lg = unit;
  static const double xlg = 1.5 * unit;
  static const double xxlg = 2 * unit;
}
```

## `app_theme.dart`

```dart
import 'package:flutter/material.dart';
import 'package:matinee/core/theme/app_color_scheme.dart';
import 'package:matinee/core/theme/app_colors.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';

///
/// Builds ThemeData for one scheme. Component themes are defined here once;
/// widgets never style themselves.
///
class AppTheme {
  const AppTheme(this.colorScheme);

  final AppColorScheme colorScheme;

  ThemeData light() => _build(colorScheme.light(), AppColors.light);

  ThemeData dark() => _build(colorScheme.dark(), AppColors.dark);

  ThemeData _build(ColorScheme colors, AppColors appColors) {
    return ThemeData(
      colorScheme: colors,
      visualDensity: VisualDensity.adaptivePlatformDensity,
      textTheme: TextTheme(
        displayLarge: AppTextStyle.displayLarge,
        headlineMedium: AppTextStyle.headlineMedium,
        titleLarge: AppTextStyle.titleLarge,
        bodyLarge: AppTextStyle.bodyLarge,
        labelLarge: AppTextStyle.labelLarge,
      ),
      extensions: [appColors],
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          minimumSize: const Size(72, 48),
          textStyle: AppTextStyle.labelLarge,
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(AppSpacing.sm)),
        contentPadding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.md),
      ),
      appBarTheme: AppBarTheme(
        centerTitle: true,
        titleTextStyle: AppTextStyle.titleLarge.copyWith(color: colors.onSurface),
      ),
    );
  }
}
```

## `cubit/theme_state.dart`

```dart
import 'package:flutter/material.dart';
import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:matinee/core/theme/app_color_scheme.dart';

part 'theme_state.freezed.dart';

@freezed
abstract class ThemeState with _$ThemeState {
  const factory ThemeState({
    @Default(AppColorScheme.standard) AppColorScheme colorScheme,
    @Default(ThemeMode.system) ThemeMode themeMode,
  }) = _ThemeState;
}
```

## `cubit/theme_cubit.dart`

```dart
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:matinee/core/theme/app_color_scheme.dart';
import 'package:matinee/core/theme/cubit/theme_state.dart';

///
/// Holds the active scheme and mode. Persisting the choice is a per-project
/// addition: inject PreferencesService and load in a start() method.
///
class ThemeCubit extends Cubit<ThemeState> {
  ThemeCubit() : super(const ThemeState());

  void setColorScheme(AppColorScheme scheme) => emit(state.copyWith(colorScheme: scheme));

  void setThemeMode(ThemeMode mode) => emit(state.copyWith(themeMode: mode));
}
```

## `extensions/build_context_extensions.dart`

```dart
import 'package:flutter/material.dart';
import 'package:matinee/core/theme/app_colors.dart';

extension AppThemeBuildContext on BuildContext {
  AppColors get appColors => Theme.of(this).extension<AppColors>()!;
}
```

## Wiring

`App` provides `ThemeCubit` above `MaterialApp.router` and passes `theme`, `darkTheme` and `themeMode` from `ThemeState` (see `startup.md`). Widgets read `Theme.of(context).colorScheme`, `Theme.of(context).textTheme`, `context.appColors` and `AppSpacing`; they never check brightness or hold a `Color`.
