import 'dart:async';

import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:material_ui/material_ui.dart';
import 'package:matinee/app/router/app_routes.dart';
import 'package:matinee/core/l10n/app_exception_l10n.dart';
import 'package:matinee/core/l10n/l10n.dart';
import 'package:matinee/core/responsive/responsive.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/core/widgets/back_app_bar.dart';
import 'package:matinee/core/widgets/error_view.dart';
import 'package:matinee/core/widgets/loading_view.dart';
import 'package:matinee/core/widgets/section_label.dart';
import 'package:matinee/di/service_locator.dart';
import 'package:matinee/features/notifications/data/models/app_notification.dart';
import 'package:matinee/features/notifications/data/notifications_repository.dart';
import 'package:matinee/features/notifications/presentation/cubit/notifications_cubit.dart';
import 'package:matinee/features/notifications/presentation/cubit/notifications_state.dart';
import 'package:matinee/features/notifications/presentation/widgets/notification_card.dart';
import 'package:matinee/features/notifications/presentation/widgets/notification_filter_chips.dart';
import 'package:matinee/l10n/gen/app_localizations.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) {
        final cubit = NotificationsCubit(getIt<NotificationsRepository>());
        unawaited(cubit.load());
        return cubit;
      },
      child: const NotificationsView(),
    );
  }
}

@visibleForTesting
class NotificationsView extends StatelessWidget {
  const NotificationsView({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return Scaffold(
      appBar: BackAppBar(
        title: l10n.notificationsTitle,
        actions: [
          BlocBuilder<NotificationsCubit, NotificationsState>(
            buildWhen: (previous, current) => _hasUnread(previous) != _hasUnread(current),
            builder: (context, state) => TextButton(
              onPressed: _hasUnread(state) ? () => unawaited(context.read<NotificationsCubit>().markAllAsRead()) : null,
              style: TextButton.styleFrom(foregroundColor: context.appColors.notification.accent),
              child: Text(l10n.notificationsReadAll),
            ),
          ),
        ],
      ),
      body: ContentContainer(
        maxWidth: ContentContainer.reading,
        child: BlocBuilder<NotificationsCubit, NotificationsState>(
          builder: (context, state) => switch (state) {
            NotificationsInitial() => const SizedBox.shrink(),
            NotificationsLoading() => const LoadingView(),
            NotificationsFailure(:final error) => ErrorView(
              message: error.localizedMessage(l10n),
              onRetry: () => unawaited(context.read<NotificationsCubit>().load()),
            ),
            NotificationsSuccess(:final notifications, :final filter) => _Body(
              notifications: notifications,
              filter: filter,
            ),
          },
        ),
      ),
    );
  }

  static bool _hasUnread(NotificationsState state) => switch (state) {
    NotificationsSuccess(:final notifications) => notifications.any((notification) => !notification.isRead),
    _ => false,
  };
}

/// The day a notification is filed under.
enum _Day { today, yesterday, earlier }

class _Body extends StatelessWidget {
  const _Body({required this.notifications, required this.filter});

  final List<AppNotification> notifications;
  final NotificationCategory? filter;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final cubit = context.read<NotificationsCubit>();
    final now = DateTime.now();
    final visible = [
      for (final notification in notifications)
        if (filter == null || notification.category == filter) notification,
    ];
    final sections = <_Day, List<AppNotification>>{};
    for (final notification in visible) {
      sections.putIfAbsent(_dayOf(notification.receivedAt, now), () => []).add(notification);
    }
    return CustomScrollView(
      slivers: [
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.only(
              top: AppNotificationLayout.chipRowTop,
              bottom: AppNotificationLayout.chipRowBottom,
            ),
            child: NotificationFilterChips(
              selected: filter,
              unreadCount: notifications.where((notification) => !notification.isRead).length,
              unreadLabel: l10n.notificationsUnreadCount(
                notifications.where((notification) => !notification.isRead).length,
              ),
              labelFor: (category) => switch (category) {
                null => l10n.notificationsFilterAll,
                NotificationCategory.auctions => l10n.notificationsFilterAuctions,
                NotificationCategory.questsAndStreaks => l10n.notificationsFilterQuests,
                NotificationCategory.system => l10n.notificationsFilterSystem,
              },
              onSelected: (category) => unawaited(cubit.selectFilter(category)),
            ),
          ),
        ),
        if (visible.isEmpty)
          SliverFillRemaining(
            hasScrollBody: false,
            child: Center(
              child: Text(
                l10n.notificationsEmpty,
                style: AppTextStyle.bodySmall.copyWith(color: context.appColors.notification.meta),
              ),
            ),
          ),
        for (final (index, MapEntry(key: day, value: entries)) in sections.entries.indexed)
          SliverPadding(
            padding: EdgeInsets.only(
              left: AppNotificationLayout.listPadding,
              right: AppNotificationLayout.listPadding,
              top: index == 0 ? AppNotificationLayout.listTop : AppNotificationLayout.sectionGap,
            ),
            sliver: SliverList.list(
              children: [
                _SectionHeader(day: day, unread: entries.where((notification) => !notification.isRead).length),
                for (final notification in entries)
                  Padding(
                    padding: const EdgeInsets.only(top: AppNotificationLayout.cardGap),
                    child: NotificationCard(
                      notification: notification,
                      receivedLabel: _received(l10n, notification.receivedAt, now, spoken: false),
                      receivedSpoken: _received(l10n, notification.receivedAt, now, spoken: true),
                      onTap: () => unawaited(cubit.markAsRead(notification.id)),
                      onBid: () {
                        unawaited(cubit.markAsRead(notification.id));
                        unawaited(const AuctionRoute().push<void>(context));
                      },
                      onCheckIn: () {
                        unawaited(cubit.markAsRead(notification.id));
                        unawaited(const DailyStreakRoute().push<void>(context));
                      },
                    ),
                  ),
              ],
            ),
          ),
        SliverToBoxAdapter(child: SizedBox(height: context.bottomInset(AppNotificationLayout.listBottom))),
      ],
    );
  }

  ///
  /// Whole calendar days between the two, counted on UTC dates: local
  /// midnights are 23 hours apart across a daylight-saving change.
  ///
  static int _daysBetween(DateTime moment, DateTime now) => DateTime.utc(
    now.year,
    now.month,
    now.day,
  ).difference(DateTime.utc(moment.year, moment.month, moment.day)).inDays;

  static _Day _dayOf(DateTime moment, DateTime now) {
    return switch (_daysBetween(moment, now)) {
      <= 0 => _Day.today,
      1 => _Day.yesterday,
      _ => _Day.earlier,
    };
  }

  ///
  /// The card's arrival stamp. Flutter's localisations carry no relative
  /// formatter, so the coarse units are spelled out here.
  ///
  static String _received(AppLocalizations l10n, DateTime moment, DateTime now, {required bool spoken}) {
    final elapsed = now.difference(moment);
    return switch (_dayOf(moment, now)) {
      _Day.yesterday => l10n.notificationsYesterday,
      _Day.earlier =>
        spoken
            ? l10n.notificationsDaysAgoSpoken(_daysBetween(moment, now))
            : l10n.notificationsDaysAgo(_daysBetween(moment, now)),
      _Day.today => switch (elapsed) {
        Duration(inHours: final hours) when hours >= 1 =>
          spoken ? l10n.notificationsHoursAgoSpoken(hours) : l10n.notificationsHoursAgo(hours),
        Duration(inMinutes: final minutes) when minutes >= 1 =>
          spoken ? l10n.notificationsMinutesAgoSpoken(minutes) : l10n.notificationsMinutesAgo(minutes),
        _ => l10n.notificationsJustNow,
      },
    };
  }
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({required this.day, required this.unread});

  final _Day day;
  final int unread;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final label = switch (day) {
      _Day.today => l10n.notificationsSectionToday,
      _Day.yesterday => l10n.notificationsSectionYesterday,
      _Day.earlier => l10n.notificationsSectionEarlier,
    };
    final colors = context.appColors.notification;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppNotificationLayout.eyebrowInset),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Flexible(
            child: SectionLabel(label: label.toUpperCase(), color: colors.meta),
          ),
          if (unread > 0)
            Text(
              l10n.notificationsUnreadCount(unread),
              style: AppTextStyle.caption.copyWith(color: colors.sectionUnread),
            ),
        ],
      ),
    );
  }
}
