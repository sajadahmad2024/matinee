import 'package:material_ui/material_ui.dart';
import 'package:matinee/core/assets/app_icon_assets.dart';
import 'package:matinee/core/l10n/l10n.dart';
import 'package:matinee/core/responsive/responsive.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/core/widgets/app_bottom_sheet.dart';
import 'package:matinee/core/widgets/screen_title.dart';
import 'package:matinee/core/widgets/svg_icon.dart';

/// Opens [UnlockPremiumSheet].
Future<void> showUnlockPremiumSheet(BuildContext context) {
  return showAppBottomSheet<void>(context, builder: (_) => const UnlockPremiumSheet());
}

///
/// The premium offer shown at the end of the feed: its plans to pick from, then
/// Subscribe Now or Maybe Later. UI only: both actions close the sheet.
///
class UnlockPremiumSheet extends StatefulWidget {
  const UnlockPremiumSheet({super.key});

  @override
  State<UnlockPremiumSheet> createState() => _UnlockPremiumSheetState();
}

class _UnlockPremiumSheetState extends State<UnlockPremiumSheet> {
  bool _monthlySelected = false;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final colors = context.appColors;
    return AppBottomSheet(
      isModal: true,
      closeLabel: l10n.reelsPremiumClose,
      body: ContentContainer(
        maxWidth: ContentContainer.form,
        // Hugging, not filling: the sheet is as tall as its offer.
        shrinkWrapHeight: true,
        child: SingleChildScrollView(
          padding: EdgeInsets.only(
            left: AppScreenPadding.sheet,
            right: AppScreenPadding.sheet,
            bottom: context.bottomInset(AppSpacing.xl),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                spacing: AppSpacing.sm,
                children: [
                  SvgIcon(AppIconAssets.star, size: AppIconSize.md, color: colors.icon.accent),
                  Expanded(
                    child: ScreenTitle(
                      label: l10n.reelsPremiumTitle,
                      child: Text(
                        l10n.reelsPremiumTitle,
                        style: AppTextStyle.headlineSmall.copyWith(color: colors.text.primary),
                      ),
                    ),
                  ),
                ],
              ),
              Padding(
                padding: const EdgeInsets.only(top: AppSpacing.sm),
                child: Text(
                  l10n.reelsPremiumBody,
                  style: AppTextStyle.bodySmall.copyWith(color: colors.text.secondary),
                ),
              ),
              Padding(
                padding: const EdgeInsets.only(top: AppSpacing.xl),
                child: _PlanOption(
                  name: l10n.reelsPremiumMonthlyName,
                  terms: l10n.reelsPremiumMonthlyTerms,
                  price: l10n.reelsPremiumMonthlyPrice,
                  period: l10n.reelsPremiumPerMonth,
                  isSelected: _monthlySelected,
                  onTap: () => setState(() => _monthlySelected = true),
                ),
              ),
              Padding(
                padding: const EdgeInsets.only(top: AppSpacing.xxl),
                child: FilledButton(
                  onPressed: () => Navigator.of(context).pop(),
                  child: Text(l10n.reelsPremiumCta),
                ),
              ),
              Padding(
                padding: const EdgeInsets.only(top: AppSpacing.sm),
                child: Center(
                  child: TextButton(
                    onPressed: () => Navigator.of(context).pop(),
                    style: TextButton.styleFrom(foregroundColor: colors.text.muted),
                    child: Text(l10n.reelsPremiumLater),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

///
/// One plan on offer: a radio mark, its name and terms, and its price. Picking
/// it is single-select, so it announces as a checked item in a group.
///
class _PlanOption extends StatelessWidget {
  const _PlanOption({
    required this.name,
    required this.terms,
    required this.price,
    required this.period,
    required this.isSelected,
    required this.onTap,
  });

  final String name;
  final String terms;
  final String price;
  final String period;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    const shape = RoundedRectangleBorder(borderRadius: BorderRadius.all(Radius.circular(AppRadius.md)));
    return Semantics(
      inMutuallyExclusiveGroup: true,
      checked: isSelected,
      child: Material(
        color: colors.card.background,
        shape: shape.copyWith(
          side: BorderSide(color: isSelected ? colors.card.borderHighlight : colors.card.border),
        ),
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: onTap,
          child: Padding(
            padding: AppSpacing.cardPadding,
            child: Row(
              spacing: AppSpacing.md,
              children: [
                _RadioMark(isSelected: isSelected),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    spacing: AppSpacing.xxs,
                    children: [
                      Text(name, style: AppTextStyle.titleSmall.copyWith(color: colors.text.primary)),
                      Text(terms, style: AppTextStyle.caption.copyWith(color: colors.text.muted)),
                    ],
                  ),
                ),
                Text.rich(
                  TextSpan(
                    children: [
                      TextSpan(
                        text: price,
                        style: AppTextStyle.titleMedium.copyWith(color: colors.text.primary),
                      ),
                      TextSpan(text: period),
                    ],
                  ),
                  style: AppTextStyle.caption.copyWith(color: colors.text.muted),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _RadioMark extends StatelessWidget {
  const _RadioMark({required this.isSelected});

  final bool isSelected;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    return Container(
      width: AppIconSize.md,
      height: AppIconSize.md,
      padding: const EdgeInsets.all(AppSpacing.xs),
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: Border.all(
          color: isSelected ? colors.icon.accent : colors.icon.muted,
          width: AppBorderWidth.focus,
        ),
      ),
      child: isSelected
          ? DecoratedBox(
              decoration: BoxDecoration(color: colors.icon.accent, shape: BoxShape.circle),
            )
          : null,
    );
  }
}
