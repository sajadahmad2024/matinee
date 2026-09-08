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
