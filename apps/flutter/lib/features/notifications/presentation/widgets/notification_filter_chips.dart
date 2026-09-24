import 'package:material_ui/material_ui.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/features/notifications/data/models/app_notification.dart';

///
/// The scrolling filter row over the inbox. A null category is the All chip,
/// the one that carries the unread count.
///
class NotificationFilterChips extends StatelessWidget {
  const NotificationFilterChips({
    required this.selected,
    required this.unreadCount,
    required this.unreadLabel,
    required this.labelFor,
    required this.onSelected,
    super.key,
  });

  final NotificationCategory? selected;
  final int unreadCount;

  /// The count read out in words, since the badge alone is a bare number.
  final String unreadLabel;

  final String Function(NotificationCategory? category) labelFor;
  final ValueChanged<NotificationCategory?> onSelected;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors.notification;
    return ChipTheme(
      // The frame draws these chips in the notifications palette, bordered
      // both ways, rather than as the app's filter chips.
      data: ChipTheme.of(context).copyWith(
        backgroundColor: colors.chipBackground,
        selectedColor: colors.chipActiveBackground,
        labelStyle: AppTextStyle.labelMedium.copyWith(color: colors.chipLabel, fontWeight: FontWeight.w400),
        secondaryLabelStyle: AppTextStyle.labelMedium.copyWith(color: colors.chipActiveLabel),
        padding: AppNotificationLayout.chipPadding,
        labelPadding: EdgeInsets.zero,
        shape: const StadiumBorder(),
        side: WidgetStateBorderSide.resolveWith(
          (states) => BorderSide(
            color: states.contains(WidgetState.selected) ? colors.chipActiveBorder : colors.chipBorder,
          ),
        ),
      ),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: AppNotificationLayout.chipRowInset),
        child: Row(
          spacing: AppSpacing.chipGap,
          children: [
            for (final category in <NotificationCategory?>[null, ...NotificationCategory.values])
              ChoiceChip(
                label: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (category == selected)
                      Padding(
                        padding: const EdgeInsetsDirectional.only(end: AppNotificationLayout.chipDotGap),
                        child: Container(
                          width: AppNotificationLayout.chipDot,
                          height: AppNotificationLayout.chipDot,
                          decoration: BoxDecoration(color: colors.chipActiveLabel, shape: BoxShape.circle),
                        ),
                      ),
                    Text(labelFor(category)),
                    if (category == null && unreadCount > 0)
                      Padding(
                        padding: const EdgeInsetsDirectional.only(start: AppNotificationLayout.countGap),
                        child: Semantics(
                          label: unreadLabel,
                          excludeSemantics: true,
                          child: DecoratedBox(
                            decoration: BoxDecoration(
                              color: colors.countBackground,
                              borderRadius: const BorderRadius.all(Radius.circular(AppRadius.full)),
                            ),
                            child: Padding(
                              padding: const EdgeInsets.symmetric(horizontal: AppNotificationLayout.countPadding),
                              child: Text(
                                '$unreadCount',
                                style: AppTextStyle.labelSmall.copyWith(color: colors.countLabel),
                              ),
                            ),
                          ),
                        ),
                      ),
                  ],
                ),
                selected: category == selected,
                onSelected: (_) => onSelected(category),
              ),
          ],
        ),
      ),
    );
  }
}
