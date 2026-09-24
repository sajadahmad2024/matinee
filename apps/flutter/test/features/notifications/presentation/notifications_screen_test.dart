import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:material_ui/material_ui.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/core/widgets/error_view.dart';
import 'package:matinee/features/notifications/data/models/app_notification.dart';
import 'package:matinee/features/notifications/presentation/cubit/notifications_cubit.dart';
import 'package:matinee/features/notifications/presentation/cubit/notifications_state.dart';
import 'package:matinee/features/notifications/presentation/notifications_screen.dart';
import 'package:matinee/features/notifications/presentation/widgets/notification_card.dart';
import 'package:mocktail/mocktail.dart';

import '../../../helpers/helpers.dart';

class _MockNotificationsCubit extends MockCubit<NotificationsState> implements NotificationsCubit {}

class _MockGoRouter extends Mock implements GoRouter {}

void main() {
  group(NotificationsView, () {
    late NotificationsCubit cubit;
    late _MockGoRouter router;

    final now = DateTime.now();
    final outbid = AppNotification(
      id: 'n-1',
      category: NotificationCategory.auctions,
      title: 'Outbid on Premiere Pass',
      body: const [
        NotificationSpan('Alex R.', tone: NotificationSpanTone.emphasis),
        NotificationSpan(' placed a bid.'),
      ],
      receivedAt: now.subtract(const Duration(minutes: 5)),
      isUrgent: true,
      footer: NotificationFooter.auctionBid(endsAt: now.add(const Duration(hours: 4))),
    );
    final streak = AppNotification(
      id: 'n-2',
      category: NotificationCategory.questsAndStreaks,
      title: 'Daily Streak at Risk',
      body: const [NotificationSpan('Check in to keep it.')],
      receivedAt: now.subtract(const Duration(minutes: 30)),
      footer: const NotificationFooter.streakCheckIn(),
    );
    final quest = AppNotification(
      id: 'n-3',
      category: NotificationCategory.questsAndStreaks,
      title: 'Weekly Quest Completed',
      body: const [NotificationSpan('Points credited.')],
      receivedAt: now.subtract(const Duration(minutes: 45)),
      footer: const NotificationFooter.pointsCredited(points: 500, balance: 2500),
    );
    final renewal = AppNotification(
      id: 'n-4',
      category: NotificationCategory.system,
      title: 'Pro Plan Renewal Notice',
      body: const [NotificationSpan('Your plan renews.')],
      receivedAt: now.subtract(const Duration(days: 3)),
      isRead: true,
    );
    final inbox = [outbid, streak, quest, renewal];

    setUp(() {
      cubit = _MockNotificationsCubit();
      router = _MockGoRouter();
      when(() => cubit.selectFilter(any())).thenAnswer((_) async {});
      when(() => cubit.markAsRead(any())).thenAnswer((_) async {});
      when(cubit.markAllAsRead).thenAnswer((_) async {});
      when(() => router.push<void>(any())).thenAnswer((_) async {});
    });

    Future<void> pumpView(WidgetTester tester, {TextScaler textScaler = TextScaler.noScaling}) {
      usePhoneSurface(tester);
      return tester.pumpApp(
        MediaQuery(
          data: MediaQueryData(textScaler: textScaler),
          child: InheritedGoRouter(
            goRouter: router,
            child: BlocProvider<NotificationsCubit>.value(value: cubit, child: const NotificationsView()),
          ),
        ),
      );
    }

    group('renders', () {
      testWidgets('a card per notification under its day', (tester) async {
        when(() => cubit.state).thenReturn(NotificationsState.success(notifications: inbox));
        await pumpView(tester);

        expect(find.text('TODAY'), findsOneWidget);
        expect(find.text('EARLIER'), findsOneWidget);
        expect(find.text('3 unread'), findsOneWidget);
        await tester.scrollUntilVisible(
          find.text('Pro Plan Renewal Notice'),
          200,
          // The chip row scrolls too, sideways; this is the inbox.
          scrollable: find.byWidgetPredicate(
            (widget) => widget is Scrollable && widget.axisDirection == AxisDirection.down,
          ),
        );
        expect(find.byType(NotificationCard), findsNWidgets(4));
      });

      testWidgets('only the selected category', (tester) async {
        when(() => cubit.state).thenReturn(
          NotificationsState.success(notifications: inbox, filter: NotificationCategory.system),
        );
        await pumpView(tester);

        expect(find.byType(NotificationCard), findsOneWidget);
        expect(find.text('Pro Plan Renewal Notice'), findsOneWidget);
      });

      testWidgets('the empty text when the category holds nothing', (tester) async {
        when(() => cubit.state).thenReturn(
          NotificationsState.success(notifications: [renewal], filter: NotificationCategory.auctions),
        );
        await pumpView(tester);

        expect(find.byType(NotificationCard), findsNothing);
        expect(find.text("You're all caught up."), findsOneWidget);
      });

      testWidgets('an $ErrorView when the inbox could not be fetched', (tester) async {
        when(() => cubit.state).thenReturn(const NotificationsState.failure(NetworkException()));
        await pumpView(tester);

        expect(find.byType(ErrorView), findsOneWidget);
      });

      testWidgets('without overflowing at a text scale of 1.3', (tester) async {
        when(() => cubit.state).thenReturn(NotificationsState.success(notifications: inbox));
        await pumpView(tester, textScaler: const TextScaler.linear(1.3));

        expect(tester.takeException(), isNull);
      });

      testWidgets('Read All disabled once nothing is unread', (tester) async {
        when(() => cubit.state).thenReturn(NotificationsState.success(notifications: [renewal]));
        await pumpView(tester);

        expect(tester.widget<TextButton>(find.widgetWithText(TextButton, 'Read All')).onPressed, isNull);
      });
    });

    group('calls', () {
      testWidgets('selectFilter when a chip is tapped', (tester) async {
        when(() => cubit.state).thenReturn(NotificationsState.success(notifications: inbox));
        await pumpView(tester);

        await tester.tap(find.text('Auctions'));
        await tester.pump();

        verify(() => cubit.selectFilter(NotificationCategory.auctions)).called(1);
      });

      testWidgets('markAllAsRead from Read All', (tester) async {
        when(() => cubit.state).thenReturn(NotificationsState.success(notifications: inbox));
        await pumpView(tester);

        await tester.tap(find.text('Read All'));
        await tester.pump();

        verify(cubit.markAllAsRead).called(1);
      });

      testWidgets('markAsRead when a card is tapped', (tester) async {
        when(() => cubit.state).thenReturn(NotificationsState.success(notifications: inbox));
        await pumpView(tester);

        await tester.tap(find.text('Weekly Quest Completed'));
        await tester.pump();

        verify(() => cubit.markAsRead('n-3')).called(1);
      });
    });

    group('navigates', () {
      testWidgets('to the auction from Bid Now', (tester) async {
        when(() => cubit.state).thenReturn(NotificationsState.success(notifications: inbox));
        await pumpView(tester);

        await tester.tap(find.text('Bid Now'));
        await tester.pump();

        verify(() => cubit.markAsRead('n-1')).called(1);
        verify(() => router.push<void>('/rewards/auction')).called(1);
      });

      testWidgets('to the daily streak from Check In Now', (tester) async {
        when(() => cubit.state).thenReturn(NotificationsState.success(notifications: inbox));
        await pumpView(tester);

        await tester.tap(find.text('Check In Now'));
        await tester.pump();

        verify(() => cubit.markAsRead('n-2')).called(1);
        verify(() => router.push<void>('/p2p/streaks')).called(1);
      });
    });

    group('accessibility', () {
      testWidgets('meets the guidelines', (tester) async {
        final handle = tester.ensureSemantics();
        when(() => cubit.state).thenReturn(NotificationsState.success(notifications: inbox));
        await pumpView(tester);

        await expectMeetsGuidelines(tester);
        handle.dispose();
      });

      testWidgets('reads an unread card as unread, with its time in words', (tester) async {
        final handle = tester.ensureSemantics();
        when(() => cubit.state).thenReturn(NotificationsState.success(notifications: inbox));
        await pumpView(tester);

        expect(find.bySemanticsLabel(RegExp('Unread, Outbid on Premiere Pass, 5 minutes ago')), findsOneWidget);
        handle.dispose();
      });
    });
  });
}
