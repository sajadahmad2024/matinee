import 'package:bloc_test/bloc_test.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/core/responsive/responsive.dart';
import 'package:matinee/core/widgets/error_view.dart';
import 'package:matinee/core/widgets/loading_view.dart';
import 'package:matinee/features/earns/data/models/earn_source.dart';
import 'package:matinee/features/earns/data/models/earned_badge.dart';
import 'package:matinee/features/earns/data/models/earns_overview.dart';
import 'package:matinee/features/earns/presentation/cubit/earns_cubit.dart';
import 'package:matinee/features/earns/presentation/cubit/earns_state.dart';
import 'package:matinee/features/earns/presentation/earns_screen.dart';
import 'package:matinee/features/earns/presentation/widgets/badge_tile.dart';
import 'package:matinee/features/earns/presentation/widgets/current_badge_card.dart';
import 'package:matinee/features/earns/presentation/widgets/earn_row.dart';
import 'package:matinee/shared/points/data/models/points_standing.dart';
import 'package:mocktail/mocktail.dart';

import '../../../helpers/helpers.dart';

class _MockEarnsCubit extends MockCubit<EarnsState> implements EarnsCubit {}

const _standing = PointsStanding(
  totalPoints: 7082,
  badgeName: 'Expert',
  pointsToNextBadge: 918,
  nextBadgeName: 'Cinematic Loyalist',
  progressToNextBadge: 0.694,
);

const _overview = EarnsOverview(
  standing: _standing,
  sources: [
    EarnSource(
      kind: EarnSourceKind.dailyStreaks,
      title: 'Daily Streaks',
      activity: '+120 today',
      points: 2691,
    ),
    EarnSource(
      kind: EarnSourceKind.auctionWins,
      title: 'Live Auction Wins',
      activity: 'Last win 3d ago',
      points: 500,
    ),
  ],
  badges: [
    EarnedBadge(
      id: 'newbie',
      name: 'Cinematic Newbie',
      requirement: '30 min streak for 15 days',
      status: BadgeStatus.earned,
    ),
    EarnedBadge(
      id: 'expert',
      name: 'Expert',
      requirement: '5,000–7,999 pts',
      status: BadgeStatus.current,
    ),
    EarnedBadge(
      id: 'loyalist',
      name: 'Cinematic Loyalist',
      requirement: '8,000–11,999 pts',
      status: BadgeStatus.locked,
    ),
  ],
);

void main() {
  group(EarnsView, () {
    late EarnsCubit cubit;

    setUp(() => cubit = _MockEarnsCubit());

    Future<void> pumpView(WidgetTester tester) {
      usePhoneSurface(tester);
      return tester.pumpApp(
        BlocProvider<EarnsCubit>.value(value: cubit, child: const EarnsView()),
      );
    }

    /// The badges half is behind the segmented control, so a test of it starts
    /// by switching there.
    Future<void> showBadges(WidgetTester tester) async {
      await tester.tap(find.text('Badges'));
      await tester.pump();
    }

    group('renders', () {
      testWidgets('one row per earn source, with its share of the balance', (tester) async {
        when(() => cubit.state).thenReturn(const EarnsState.success(_overview));
        await pumpView(tester);

        expect(find.byType(EarnRow), findsNWidgets(2));
        expect(find.text('Daily Streaks'), findsOneWidget);
        expect(find.text('2,691'), findsOneWidget);
        // 2691 of 7082 and 500 of 7082, which is what the design's copy says.
        expect(find.text('pts · 38%'), findsOneWidget);
        expect(find.text('pts · 7%'), findsOneWidget);
      });

      testWidgets('the earns half without the balance the badges half carries', (tester) async {
        when(() => cubit.state).thenReturn(const EarnsState.success(_overview));
        await pumpView(tester);

        expect(find.text('7,082'), findsNothing);
        expect(find.byType(CurrentBadgeCard), findsNothing);
      });

      testWidgets('the balance, badge standing and current badge on the badges half', (tester) async {
        when(() => cubit.state).thenReturn(const EarnsState.success(_overview));
        await pumpView(tester);
        await showBadges(tester);

        expect(find.text('7,082'), findsOneWidget);
        expect(find.byType(CurrentBadgeCard), findsOneWidget);
        expect(find.text('918 pts to Cinematic Loyalist'), findsNWidgets(2));
      });

      testWidgets('the earned badges first, the current one among them', (tester) async {
        when(() => cubit.state).thenReturn(const EarnsState.success(_overview));
        await pumpView(tester);
        await showBadges(tester);

        expect(find.byType(BadgeTile), findsNWidgets(2));
        expect(find.text('Cinematic Newbie'), findsOneWidget);
        expect(find.text('Cinematic Loyalist'), findsNothing);
      });

      testWidgets('a spinner while the overview is on its way', (tester) async {
        when(() => cubit.state).thenReturn(const EarnsState.loading());
        await pumpView(tester);

        expect(find.byType(LoadingView), findsOneWidget);
      });

      testWidgets('an error with a retry when the fetch fails', (tester) async {
        when(() => cubit.state).thenReturn(const EarnsState.failure(NetworkException()));
        when(cubit.load).thenAnswer((_) async {});
        await pumpView(tester);

        expect(find.byType(ErrorView), findsOneWidget);
      });

      testWidgets('nothing at all before the fetch starts', (tester) async {
        when(() => cubit.state).thenReturn(const EarnsState.initial());
        await pumpView(tester);

        expect(find.byType(EarnRow), findsNothing);
        expect(find.byType(LoadingView), findsNothing);
      });
    });

    group('updates', () {
      testWidgets('the locked badges when the locked tab is chosen', (tester) async {
        when(() => cubit.state).thenReturn(const EarnsState.success(_overview));
        await pumpView(tester);
        await showBadges(tester);

        await tester.tap(find.text('LOCKED'));
        await tester.pump();

        expect(find.text('Cinematic Loyalist'), findsOneWidget);
        expect(find.text('Cinematic Newbie'), findsNothing);
      });

      testWidgets('back to the earns half from the badges half', (tester) async {
        when(() => cubit.state).thenReturn(const EarnsState.success(_overview));
        await pumpView(tester);
        await showBadges(tester);

        await tester.tap(find.text('Earns'));
        await tester.pump();

        expect(find.byType(EarnRow), findsNWidgets(2));
        expect(find.byType(CurrentBadgeCard), findsNothing);
      });

      testWidgets('to a message when a filter has no badges in it', (tester) async {
        when(() => cubit.state).thenReturn(
          EarnsState.success(
            _overview.copyWith(
              badges: [
                for (final badge in _overview.badges)
                  if (badge.status != BadgeStatus.locked) badge,
              ],
            ),
          ),
        );
        await pumpView(tester);
        await showBadges(tester);

        await tester.tap(find.text('LOCKED'));
        await tester.pump();

        expect(find.byType(BadgeTile), findsNothing);
        expect(find.text('Every badge is earned.'), findsOneWidget);
      });
    });

    group('lays out', () {
      testWidgets('inside a reading-width container on an expanded window', (tester) async {
        tester.view.physicalSize = const Size(2560, 1600);
        tester.view.devicePixelRatio = 2;
        addTearDown(tester.view.reset);
        when(() => cubit.state).thenReturn(const EarnsState.success(_overview));
        await tester.pumpApp(
          BlocProvider<EarnsCubit>.value(value: cubit, child: const EarnsView()),
        );

        expect(tester.takeException(), isNull);
        // Capped rather than stretched across a 1280 window.
        expect(
          tester.getSize(find.byType(CustomScrollView)).width,
          ContentContainer.reading,
        );
      });
    });

    group('calls load', () {
      testWidgets('again when the error view retries', (tester) async {
        when(() => cubit.state).thenReturn(const EarnsState.failure(NetworkException()));
        when(cubit.load).thenAnswer((_) async {});
        await pumpView(tester);

        await tester.tap(find.byType(FilledButton));
        await tester.pump();

        verify(cubit.load).called(1);
      });
    });
  });
}
