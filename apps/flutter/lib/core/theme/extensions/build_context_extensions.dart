import 'package:flutter/material.dart';
import 'package:matinee/core/theme/app_colors.dart';

extension AppThemeBuildContext on BuildContext {
  AppColors get appColors => Theme.of(this).extension<AppColors>()!;
}
