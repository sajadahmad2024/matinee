import 'package:flutter/material.dart';
import 'package:template/core/theme/app_color_scheme.dart';
import 'package:template/core/theme/app_colors.dart';
import 'package:template/core/theme/app_spacing.dart';
import 'package:template/core/theme/app_text_styles.dart';

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
