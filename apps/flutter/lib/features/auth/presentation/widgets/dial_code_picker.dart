import 'package:flutter/material.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/features/auth/data/models/dial_code.dart';

///
/// The dialling-code box beside the phone field, and the sheet it opens. The
/// design draws the box as a chevron affordance without saying what it opens,
/// so the menu follows the app's own bottom-sheet styling.
///
class DialCodePicker extends StatelessWidget {
  const DialCodePicker({
    required this.value,
    required this.onChanged,
    required this.tooltip,
    required this.sheetTitle,
    required this.countryName,
    super.key,
  });

  final DialCode value;
  final ValueChanged<DialCode> onChanged;
  final String tooltip;
  final String sheetTitle;

  /// Resolves a country code to its localised name, since a shared widget does
  /// not read the strings itself.
  final String Function(String countryCode) countryName;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors.auth;
    return Tooltip(
      message: tooltip,
      child: Material(
        color: colors.inputBackground,
        borderRadius: const BorderRadius.all(Radius.circular(AppRadius.md)),
        child: InkWell(
          onTap: () => _open(context),
          borderRadius: const BorderRadius.all(Radius.circular(AppRadius.md)),
          child: Ink(
            decoration: BoxDecoration(
              border: Border.all(color: colors.inputBorder),
              borderRadius: const BorderRadius.all(Radius.circular(AppRadius.md)),
            ),
            child: ConstrainedBox(
              constraints: const BoxConstraints(minHeight: AppControlHeight.input),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  spacing: AppSpacing.xs,
                  children: [
                    Text(value.code, style: AppTextStyle.numeralPill.copyWith(color: colors.onSurface)),
                    Icon(Icons.expand_more, size: AppIconSize.xs, color: colors.onSurfaceVariant),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _open(BuildContext context) async {
    // The keyboard would otherwise sit over the sheet it opens behind.
    FocusScope.of(context).unfocus();
    final surface = context.appColors.auth.surfaceContainer;
    final chosen = await showModalBottomSheet<DialCode>(
      context: context,
      // The sheet opens from an auth screen, so it takes the warm container
      // rather than the navy one the app-wide sheet theme carries.
      backgroundColor: surface,
      builder: (context) => _DialCodeSheet(
        selected: value,
        title: sheetTitle,
        countryName: countryName,
      ),
    );
    if (chosen != null) {
      onChanged(chosen);
    }
  }
}

class _DialCodeSheet extends StatelessWidget {
  const _DialCodeSheet({required this.selected, required this.title, required this.countryName});

  final DialCode selected;
  final String title;
  final String Function(String countryCode) countryName;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    final textTheme = Theme.of(context).textTheme;
    return SafeArea(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(
              horizontal: AppScreenPadding.sheet,
              vertical: AppSpacing.sm,
            ),
            child: Text(title, style: textTheme.titleMedium?.copyWith(color: colors.auth.onSurface)),
          ),
          // The list scrolls inside whatever height the sheet gets, so adding
          // a country does not push the last row past the bottom.
          Flexible(
            child: SingleChildScrollView(
              padding: const EdgeInsets.only(bottom: AppSpacing.xxl),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  for (final dialCode in DialCodes.all)
                    ListTile(
                      onTap: () => Navigator.of(context).pop(dialCode),
                      selected: dialCode == selected,
                      selectedColor: colors.text.link,
                      contentPadding: const EdgeInsets.symmetric(horizontal: AppScreenPadding.sheet),
                      title: Text(
                        countryName(dialCode.countryCode),
                        style: textTheme.bodyMedium?.copyWith(
                          color: dialCode == selected ? colors.text.link : colors.auth.onSurface,
                        ),
                      ),
                      trailing: Text(
                        dialCode.code,
                        style: AppTextStyle.numeralPill.copyWith(
                          color: dialCode == selected ? colors.text.link : colors.auth.onSurfaceVariant,
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
