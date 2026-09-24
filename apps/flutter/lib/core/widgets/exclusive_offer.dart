import 'package:material_ui/material_ui.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/core/widgets/screen_title.dart';

///
/// The centre block of an unlock prompt: the lock disc, the title, and what
/// it costs to open.
///
/// [isScreenTitle] marks the title as the caller's own heading; left off, it
/// carries no heading semantics of its own.
///
class ExclusiveOffer extends StatelessWidget {
  const ExclusiveOffer({
    required this.title,
    required this.unlocksFor,
    required this.cost,
    this.isScreenTitle = false,
    super.key,
  });

  static const double _discSize = 60;

  final String title;
  final String unlocksFor;
  final String cost;
  final bool isScreenTitle;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    final titleText = Text(
      title,
      style: Theme.of(context).textTheme.headlineSmall?.copyWith(color: colors.text.primary),
    );
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: _discSize,
          height: _discSize,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: colors.card.backgroundGoldTint,
            shape: BoxShape.circle,
            border: Border.all(
              color: colors.tag.goldBorder,
              width: AppBorderWidth.focus,
            ),
          ),
          child: Icon(Icons.lock_outline, size: AppIconSize.lg, color: colors.icon.accent),
        ),
        Padding(
          padding: const EdgeInsets.only(top: AppSpacing.lg),
          child: isScreenTitle ? ScreenTitle(label: title, child: titleText) : titleText,
        ),
        Padding(
          padding: const EdgeInsets.only(top: AppSpacing.xxxl),
          child: Text(
            unlocksFor,
            style: AppTextStyle.caption.copyWith(color: colors.text.secondary),
          ),
        ),
        Padding(
          padding: const EdgeInsets.only(top: AppSpacing.xs),
          child: Text(
            cost,
            style: AppTextStyle.numeralMd.copyWith(color: colors.text.numeral),
          ),
        ),
      ],
    );
  }
}
