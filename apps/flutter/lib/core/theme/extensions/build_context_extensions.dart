import 'package:flutter/material.dart';
import 'package:template/core/theme/app_colors.dart';

extension AppThemeBuildContext on BuildContext {
  AppColors get appColors => Theme.of(this).extension<AppColors>()!;
}
