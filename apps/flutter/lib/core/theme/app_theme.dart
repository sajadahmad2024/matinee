import 'package:flutter/material.dart';
import 'package:matinee/core/theme/app_color_scheme.dart';
import 'package:matinee/core/theme/app_colors.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';

///
/// The app's single ThemeData: component themes defined once from tokens, so
/// widgets never style themselves. What the design omits stays ColorScheme's.
///
abstract final class AppTheme {
  static final ThemeData dark = _build(AppColorScheme.dark, AppColors.dark);

  static ThemeData _build(ColorScheme colors, AppColors appColors) {
    return ThemeData(
      colorScheme: colors,
      scaffoldBackgroundColor: colors.surface,
      textTheme: AppTextStyle.textTheme,
      extensions: [appColors],
      visualDensity: VisualDensity.adaptivePlatformDensity,
      iconTheme: IconThemeData(color: appColors.icon.primary, size: AppIconSize.lg),
      appBarTheme: AppBarTheme(
        backgroundColor: appColors.appBar.background,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        toolbarHeight: AppControlHeight.appBarContent,
        titleTextStyle: AppTextStyle.titleMedium.copyWith(color: appColors.appBar.title),
        iconTheme: IconThemeData(color: appColors.appBar.backButtonIcon, size: AppIconSize.md),
        actionsIconTheme: IconThemeData(color: appColors.icon.primary, size: AppIconSize.lg),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: appColors.button.primaryBackground,
          foregroundColor: appColors.button.primaryLabel,
          disabledBackgroundColor: appColors.button.primaryDisabledBackground,
          disabledForegroundColor: appColors.button.primaryDisabledLabel,
          minimumSize: const Size(0, AppControlHeight.cta),
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xxl),
          textStyle: AppTextStyle.labelLarge,
          shape: const RoundedRectangleBorder(borderRadius: BorderRadius.all(Radius.circular(AppRadius.md))),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: appColors.button.outlineLabel,
          side: BorderSide(color: appColors.button.outlineBorder),
          minimumSize: const Size(0, AppControlHeight.button),
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
          textStyle: AppTextStyle.labelMedium,
          shape: const RoundedRectangleBorder(borderRadius: BorderRadius.all(Radius.circular(AppRadius.sm))),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: appColors.button.textLabel,
          textStyle: AppTextStyle.labelMedium,
        ),
      ),
      iconButtonTheme: IconButtonThemeData(
        style: IconButton.styleFrom(
          foregroundColor: appColors.icon.primary,
          iconSize: AppIconSize.lg,
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: appColors.input.background,
        constraints: const BoxConstraints(minHeight: AppControlHeight.input),
        contentPadding: AppSpacing.inputContent,
        hintStyle: AppTextStyle.bodyLarge.copyWith(color: appColors.input.placeholder),
        labelStyle: AppTextStyle.labelMedium.copyWith(color: appColors.input.label),
        errorStyle: AppTextStyle.caption.copyWith(color: appColors.input.errorBorder),
        border: _inputBorder(appColors.input.border),
        enabledBorder: _inputBorder(appColors.input.border),
        focusedBorder: _inputBorder(appColors.input.focusBorder, width: AppBorderWidth.focus),
        errorBorder: _inputBorder(appColors.input.errorBorder, width: AppBorderWidth.focus),
        focusedErrorBorder: _inputBorder(appColors.input.errorBorder, width: AppBorderWidth.focus),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: appColors.chip.filterInactiveBackground,
        selectedColor: appColors.chip.filterActiveBackground,
        labelStyle: AppTextStyle.labelMedium.copyWith(color: appColors.chip.filterInactiveLabel),
        secondaryLabelStyle: AppTextStyle.labelMedium.copyWith(color: appColors.chip.filterActiveLabel),
        labelPadding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm),
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm),
        side: BorderSide.none,
        showCheckmark: false,
        shape: const RoundedRectangleBorder(borderRadius: BorderRadius.all(Radius.circular(AppRadius.lg))),
      ),
      cardTheme: CardThemeData(
        color: appColors.card.background,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        margin: EdgeInsets.zero,
        clipBehavior: Clip.antiAlias,
        shape: RoundedRectangleBorder(
          borderRadius: const BorderRadius.all(Radius.circular(AppRadius.lg)),
          side: BorderSide(color: appColors.card.border),
        ),
      ),
      dividerTheme: DividerThemeData(
        color: appColors.divider,
        thickness: AppBorderWidth.hairline,
        space: AppBorderWidth.hairline,
      ),
      bottomSheetTheme: BottomSheetThemeData(
        backgroundColor: appColors.sheet.background,
        modalBackgroundColor: appColors.sheet.background,
        modalBarrierColor: appColors.sheet.scrim,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        showDragHandle: true,
        dragHandleColor: appColors.sheet.handle,
        dragHandleSize: AppControlHeight.sheetHandle,
        shape: RoundedRectangleBorder(
          borderRadius: AppRadius.sheetTop,
          side: BorderSide(color: appColors.sheet.border),
        ),
      ),
      dialogTheme: DialogThemeData(
        backgroundColor: appColors.card.background,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        insetPadding: const EdgeInsets.symmetric(horizontal: AppScreenPadding.modal),
        titleTextStyle: AppTextStyle.headlineMedium.copyWith(color: appColors.text.primary),
        contentTextStyle: AppTextStyle.bodyMedium.copyWith(color: appColors.text.secondary),
        shape: const RoundedRectangleBorder(borderRadius: BorderRadius.all(Radius.circular(AppRadius.sheet))),
      ),
      navigationBarTheme: NavigationBarThemeData(
        height: AppControlHeight.bottomNav,
        backgroundColor: appColors.bottomNav.background,
        indicatorColor: Colors.transparent,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
        iconTheme: WidgetStateProperty.resolveWith((states) {
          final selected = states.contains(WidgetState.selected);
          return IconThemeData(
            size: AppIconSize.lg,
            color: selected ? appColors.bottomNav.active : appColors.bottomNav.inactive,
          );
        }),
        labelTextStyle: WidgetStateProperty.resolveWith((states) {
          final selected = states.contains(WidgetState.selected);
          return AppTextStyle.navLabel.copyWith(
            color: selected ? appColors.bottomNav.active : appColors.bottomNav.inactive,
            fontWeight: selected ? FontWeight.w700 : FontWeight.w600,
          );
        }),
      ),
      progressIndicatorTheme: ProgressIndicatorThemeData(
        color: colors.secondary,
        linearTrackColor: appColors.progress.track,
        linearMinHeight: AppControlHeight.progressBar,
        circularTrackColor: appColors.progress.track,
      ),
    );
  }

  static OutlineInputBorder _inputBorder(Color color, {double width = AppBorderWidth.hairline}) {
    return OutlineInputBorder(
      borderRadius: const BorderRadius.all(Radius.circular(AppRadius.md)),
      borderSide: BorderSide(color: color, width: width),
    );
  }
}
