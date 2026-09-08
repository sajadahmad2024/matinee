import 'package:bloc_test/bloc_test.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/core/theme/app_color_scheme.dart';
import 'package:matinee/core/theme/cubit/theme_cubit.dart';
import 'package:matinee/core/theme/cubit/theme_state.dart';

void main() {
  group(ThemeCubit, () {
    blocTest<ThemeCubit, ThemeState>(
      'emits the new scheme when setColorScheme is called',
      build: ThemeCubit.new,
      act: (cubit) => cubit.setColorScheme(AppColorScheme.forest),
      expect: () => const [ThemeState(colorScheme: AppColorScheme.forest)],
    );

    blocTest<ThemeCubit, ThemeState>(
      'emits the new mode when setThemeMode is called',
      build: ThemeCubit.new,
      act: (cubit) => cubit.setThemeMode(ThemeMode.dark),
      expect: () => const [ThemeState(themeMode: ThemeMode.dark)],
    );
  });
}
