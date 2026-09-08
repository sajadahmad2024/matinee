import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:template/core/theme/app_color_scheme.dart';
import 'package:template/core/theme/cubit/theme_state.dart';

///
/// Holds the active scheme and mode. Persisting the choice is a per-project
/// addition: inject PreferencesService and load in a start() method.
///
class ThemeCubit extends Cubit<ThemeState> {
  ThemeCubit() : super(const ThemeState());

  void setColorScheme(AppColorScheme scheme) => emit(state.copyWith(colorScheme: scheme));

  void setThemeMode(ThemeMode mode) => emit(state.copyWith(themeMode: mode));
}
