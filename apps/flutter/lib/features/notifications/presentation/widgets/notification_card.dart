import 'package:material_ui/material_ui.dart';
import 'package:matinee/core/assets/assets.dart';
import 'package:matinee/core/l10n/l10n.dart';
import 'package:matinee/core/l10n/remaining_time_l10n.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/core/utils/clock_label.dart';
import 'package:matinee/core/widgets/countdown_builder.dart';
import 'package:matinee/core/widgets/svg_icon.dart';
import 'package:matinee/features/notifications/data/models/app_notification.dart';

///
/// One inbox entry: title and arrival time, the body with its marked runs, and
/// whatever the notification offers underneath. Unread cards carry the amber
/// border, urgent ones the gradient fill; read ones step back.
///
class NotificationCard extends StatelessWidget {
  const NotificationCard({
    required this.notification,
    required this.receivedLabel,
    required this.receivedSpoken,
    required this.onTap,
    super.key,
  });

  /// The frame dims a read card rather than greying each colour in it.
  static const double _readOpacity = 0.85;

  static const BorderRadius _radius = BorderRadius.all(Radius.circular(AppRadius.lg));

  final AppNotification notification;

  /// The arrival time as the card draws it, such as '5m ago'.
  final String receivedLabel;

  /// The same time in words, which is what a screen reader hears.
  final String receivedSpoken;

  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors.notification;
    final isRead = notification.isRead;
    final card = Semantics(
      container: true,
      child: Material(
        type: MaterialType.transparency,
        child: Ink(
          decoration: BoxDecoration(
            color: switch ((isRead, notification.isUrgent)) {
              (true, _) => colors.cardReadBackground,
              (false, true) => null,
              (false, false) => colors.cardBackground,
            },
            gradient: !isRead && notification.isUrgent ? colors.cardUrgentBackground : null,
            border: Border.all(color: isRead ? colors.cardReadBorder : colors.cardBorder),
            borderRadius: _radius,
          ),
          child: InkWell(
            onTap: onTap,
            borderRadius: _radius,
            child: Padding(
              padding: EdgeInsetsDirectional.only(
                start: AppNotificationLayout.cardPadding + (isRead ? 0 : AppNotificationLayout.unreadInset),
                end: AppNotificationLayout.cardPadding,
                top: AppNotificationLayout.cardPadding,
                bottom: AppNotificationLayout.cardPadding,
              ),
              child: Row(
                spacing: AppNotificationLayout.arrowGap,
                children: [
                  Expanded(child: _content(context)),
                  if (notification.deepLink != null)
                    Icon(Icons.chevron_right, size: AppIconSize.sm, color: colors.meta),
                ],
              ),
            ),
          ),
        ),
      ),
    );
    return isRead ? Opacity(opacity: _readOpacity, child: card) : card;
  }

  Widget _content(BuildContext context) {
    final colors = context.appColors.notification;
    final l10n = context.l10n;
    final isRead = notification.isRead;
    final title = isRead ? notification.title : '${l10n.notificationsUnread}, ${notification.title}';
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Semantics(
          label: '$title, $receivedSpoken',
          excludeSemantics: true,
          child: Row(
            spacing: AppSpacing.sm,
            children: [
              Expanded(
                child: Row(
                  spacing: AppNotificationLayout.unreadDotGap,
                  children: [
                    Flexible(
                      child: Text(
                        notification.title,
                        style: AppTextStyle.labelMedium.copyWith(
                          color: isRead ? colors.titleRead : colors.title,
                        ),
                      ),
                    ),
                    if (notification.isUrgent && !isRead)
                      Container(
                        width: AppNotificationLayout.unreadDot,
                        height: AppNotificationLayout.unreadDot,
                        decoration: BoxDecoration(color: colors.accent, shape: BoxShape.circle),
                      ),
                  ],
                ),
              ),
              Text(receivedLabel, style: AppTextStyle.caption.copyWith(color: colors.meta)),
            ],
          ),
        ),
        const SizedBox(height: AppNotificationLayout.titleGap),
        _Body(spans: notification.body, isRead: isRead),
        if (notification.footer case final footer?) _Footer(footer: footer),
      ],
    );
  }
}

class _Body extends StatelessWidget {
  const _Body({required this.spans, required this.isRead});

  final List<NotificationSpan> spans;
  final bool isRead;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors.notification;
    return Text.rich(
      TextSpan(
        children: [
          for (final span in spans)
            TextSpan(
              text: span.text,
              style: switch (span.tone) {
                NotificationSpanTone.plain => null,
                NotificationSpanTone.emphasis => TextStyle(color: colors.emphasis),
                NotificationSpanTone.strong => const TextStyle(fontWeight: FontWeight.w700),
                NotificationSpanTone.accent => TextStyle(color: colors.accent, fontWeight: FontWeight.w700),
                NotificationSpanTone.warning => TextStyle(color: colors.warning),
              },
            ),
        ],
      ),
      style: AppTextStyle.bodySmall.copyWith(color: isRead ? colors.bodyRead : colors.body),
    );
  }
}

class _Footer extends StatelessWidget {
  const _Footer({required this.footer});

  final NotificationFooter footer;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors.notification;
    final l10n = context.l10n;
    return switch (footer) {
      AuctionCountdownFooter(:final endsAt) => Padding(
        padding: const EdgeInsets.only(top: AppNotificationLayout.actionBarGap),
        child: DecoratedBox(
          decoration: BoxDecoration(
            border: Border(top: BorderSide(color: colors.divider)),
          ),
          child: Padding(
            padding: const EdgeInsets.only(top: AppNotificationLayout.actionBarPadding),
            child: Row(
              children: [
                Flexible(
                  child: CountdownBuilder(
                    endsAt: endsAt,
                    builder: (context, remaining) {
                      final ended = remaining == Duration.zero;
                      return Semantics(
                        label: ended
                            ? l10n.notificationsAuctionEnded
                            : l10n.notificationsTimeLeft(l10n.spokenRemaining(remaining)),
                        excludeSemantics: true,
                        child: Row(
                          spacing: AppNotificationLayout.glyphGap,
                          children: [
                            SvgIcon(AppIconAssets.clock, color: colors.accent, size: AppNotificationLayout.clockGlyph),
                            Flexible(
                              child: Text(
                                ended
                                    ? l10n.notificationsAuctionEnded
                                    : l10n.notificationsTimeLeft(clockLabel(remaining)),
                                style: AppTextStyle.numeralAction.copyWith(
                                  color: colors.meta,
                                  fontWeight: FontWeight.w400,
                                ),
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
      PointsCreditedFooter(:final points, :final balance) => Padding(
        padding: const EdgeInsets.only(top: AppNotificationLayout.pointsGap),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          spacing: AppSpacing.sm,
          children: [
            Flexible(
              child: Semantics(
                label: l10n.notificationsPointsCreditedSpoken(points),
                container: true,
                excludeSemantics: true,
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    border: Border.all(color: colors.pointsBorder),
                    borderRadius: const BorderRadius.all(Radius.circular(AppRadius.full)),
                  ),
                  child: Padding(
                    padding: AppNotificationLayout.pointsPadding,
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      spacing: AppNotificationLayout.glyphGap,
                      children: [
                        SvgIcon(AppIconAssets.alertCircle, color: colors.pointsLabel, size: AppIconSize.xs),
                        Flexible(
                          child: Text(
                            l10n.notificationsPointsCredited(points),
                            style: AppTextStyle.numeralAction.copyWith(
                              color: colors.pointsLabel,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
            Text(l10n.notificationsBalance(balance), style: AppTextStyle.caption.copyWith(color: colors.meta)),
          ],
        ),
      ),
      PointsAddedFooter(:final points) => Padding(
        padding: const EdgeInsets.only(top: AppNotificationLayout.pointsAddedGap),
        child: Align(
          alignment: AlignmentDirectional.centerStart,
          child: Semantics(
            label: l10n.notificationsPointsAddedSpoken(points),
            container: true,
            excludeSemantics: true,
            child: DecoratedBox(
              decoration: BoxDecoration(
                color: colors.successBackground,
                border: Border.all(color: colors.successBorder),
                borderRadius: const BorderRadius.all(Radius.circular(AppRadius.xs)),
              ),
              child: Padding(
                padding: AppNotificationLayout.pointsAddedPadding,
                child: Text(
                  l10n.notificationsPointsAdded(points),
                  style: AppTextStyle.labelSmall.copyWith(color: colors.successLabel),
                ),
              ),
            ),
          ),
        ),
      ),
    };
  }
}
