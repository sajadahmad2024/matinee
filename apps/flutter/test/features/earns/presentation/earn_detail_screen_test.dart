import 'package:bloc_test/bloc_test.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/core/widgets/back_disc_button.dart';
import 'package:matinee/core/widgets/error_view.dart';
import 'package:matinee/core/widgets/loading_view.dart';
import 'package:matinee/features/earns/data/models/earn_detail.dart';
import 'package:matinee/features/earns/data/models/earn_source.dart';
import 'package:matinee/features/earns/data/models/earns_overview.dart';
import 'package:matinee/features/earns/presentation/cubit/earn_detail_cubit.dart';
import 'package:matinee/features/earns/presentation/cubit/earn_detail_state.dart';
import 'package:matinee/features/earns/presentation/cubit/earns_cubit.dart';
import 'package:matinee/features/earns/presentation/cubit/earns_state.dart';
import 'package:matinee/features/earns/presentation/earn_detail_screen.dart';
import 'package:matinee/features/earns/presentation/earns_screen.dart';
import 'package:matinee/features/earns/presentation/widgets/activity_row.dart';
import 'package:matinee/features/earns/presentation/widgets/prediction_history_card.dart';
import 'package:matinee/features/earns/presentation/widgets/quest_history_card.dart';
import 'package:matinee/features/earns/presentation/widgets/win_card.dart';
import 'package:matinee/shared/points/data/models/points_standing.dart';
import 'package:mocktail/mocktail.dart';

import '../../../helpers/helpers.dart';
import 'earn_detail_fixtures.dart' as fixtures;

class _MockEarnDetailCubit extends MockCubit<EarnDetailState> implements EarnDetailCubit {}

class _MockEarnsCubit extends MockCubit<EarnsState> implements EarnsCubit {}

const _parentOverview = EarnsOverview(
  standing: PointsStanding(
    totalPoints: 7082,
    badgeName: 'Expert',
    pointsToNextBadge: 918,
    nextBadgeName: 'Cinematic Loyalist',
    progressToNextBadge: 0.694,
    pointsIntoBadge: 2082,
    badgeSpan: 3000,
  ),
  sources: [
    EarnSource(
      kind: EarnSourceKind.dailyStreaks,
      title: 'Daily Streaks',
      activity: '+120 today',
      points: 2691,
    ),
  ],
  badges: [],
);

void main() {
  group(EarnDetailView, () {
    late EarnDetailCubit cubit;

    setUp(() => cubit = _MockEarnDetailCubit());

    Future<void> pumpView(
      WidgetTester tester,
      EarnSourceKind kind, {
      TextScaler? textScaler,
      double topInset = 0,
    }) {
      usePhoneSurface(tester);
      return tester.pumpApp(
        MediaQuery(
          data: MediaQueryData(
            textScaler: textScaler ?? TextScaler.noScaling,
            padding: EdgeInsets.only(top: topInset),
          ),
          child: BlocProvider<EarnDetailCubit>.value(
            value: cubit,
            child: EarnDetailView(kind: kind),
          ),
        ),
      );
    }

    group('renders', () {
      testWidgets('the streak log with its ladder and its unlocked badge', (tester) async {
        when(() => cubit.state).thenReturn(EarnDetailState.success(fixtures.streaks));
        await pumpView(tester, EarnSourceKind.dailyStreaks);

        // Once in the app bar, once as the eyebrow the design sets upper-case.
        expect(find.text('Daily Streaks'), findsOneWidget);
        expect(find.text('DAILY STREAKS'), findsOneWidget);
        expect(find.text('2,691'), findsOneWidget);
        expect(find.byType(ActivityRow), findsNWidgets(2));
        expect(find.text('Lv 3 · 60 min'), findsOneWidget);
        expect(find.text('15d'), findsOneWidget);
        expect(find.text('LV 2'), findsOneWidget);
        expect(find.text('Badge unlocked: Spark Keeper'), findsOneWidget);
        // The newest day's count, which the header reads the streak off.
        expect(find.text('15'), findsOneWidget);
      });

      testWidgets('the auction wins with their lots and their bids', (tester) async {
        when(() => cubit.state).thenReturn(EarnDetailState.success(fixtures.auction));
        await pumpView(tester, EarnSourceKind.auctionWins);

        expect(find.byType(WinCard), findsNWidgets(2));
        expect(find.text('MEMORABILIA'), findsOneWidget);
        expect(find.text('Signed Poster'), findsOneWidget);
        expect(find.text('High Roller'), findsOneWidget);
        expect(find.text('WON'), findsNWidgets(2));
        // Derived from the list, not carried beside it.
        expect(find.text('2'), findsOneWidget);
      });

      testWidgets('the predictions with the accuracy read off them', (tester) async {
        when(() => cubit.state).thenReturn(EarnDetailState.success(fixtures.predictions));
        await pumpView(tester, EarnSourceKind.predictionGames);

        expect(find.byType(PredictionHistoryCard), findsNWidgets(2));
        expect(find.text('50%'), findsOneWidget);
        expect(find.text('1/2 correct'), findsOneWidget);
        expect(find.text('CORRECT'), findsOneWidget);
        expect(find.text('INCORRECT'), findsOneWidget);
        expect(find.text('2X'), findsOneWidget);
        // The dash the design draws where a prediction paid nothing.
        expect(find.text('—'), findsOneWidget);
      });

      testWidgets('the quest weeks, claimed and partial', (tester) async {
        when(() => cubit.state).thenReturn(EarnDetailState.success(fixtures.quests));
        await pumpView(tester, EarnSourceKind.weeklyQuests);

        expect(find.byType(QuestHistoryCard), findsNWidgets(2));
        expect(find.text('CLAIMED'), findsOneWidget);
        expect(find.text('PARTIAL'), findsOneWidget);
        expect(find.text('1/2'), findsOneWidget);
        expect(find.text('3 of 4 actions completed · Done Jun 8'), findsOneWidget);
      });

      testWidgets('no eyebrow over the quest total, as the frame leaves it empty', (tester) async {
        when(() => cubit.state).thenReturn(EarnDetailState.success(fixtures.quests));
        await pumpView(tester, EarnSourceKind.weeklyQuests);

        // The title is in the app bar; nothing repeats it over the figure.
        expect(find.text('Weekly Quest'), findsOneWidget);
      });

      testWidgets('the dash, not a signed zero, on an entry that paid nothing', (tester) async {
        when(() => cubit.state).thenReturn(
          EarnDetailState.success(
            EarnDetail.quests(
              pointsEarned: 0,
              weeks: [(fixtures.quests as QuestDetail).weeks.first.copyWith(pointsAwarded: 0)],
            ),
          ),
        );
        await pumpView(tester, EarnSourceKind.weeklyQuests);

        expect(find.text('—'), findsOneWidget);
        expect(find.text('+0'), findsNothing);
      });

      testWidgets('no pill on a streak day that reached no level', (tester) async {
        when(() => cubit.state).thenReturn(
          EarnDetailState.success(
            EarnDetail.streaks(
              pointsEarned: 40,
              levels: (fixtures.streaks as StreakDetail).levels,
              days: [
                (fixtures.streaks as StreakDetail).days.first.copyWith(minutesWatched: 12, level: null),
              ],
            ),
          ),
        );
        await pumpView(tester, EarnSourceKind.dailyStreaks);

        expect(find.text('12 min watched'), findsOneWidget);
        expect(find.textContaining('LV '), findsNothing);
      });

      testWidgets('a message, not blank space, when a history has nothing in it', (tester) async {
        when(() => cubit.state).thenReturn(
          const EarnDetailState.success(EarnDetail.auction(pointsEarned: 0, wins: [])),
        );
        await pumpView(tester, EarnSourceKind.auctionWins);

        expect(find.byType(WinCard), findsNothing);
        expect(find.text('No auction wins yet.'), findsOneWidget);
      });

      testWidgets('a spinner while the history is on its way', (tester) async {
        when(() => cubit.state).thenReturn(const EarnDetailState.loading());
        await pumpView(tester, EarnSourceKind.dailyStreaks);

        expect(find.byType(LoadingView), findsOneWidget);
      });

      testWidgets('an error with a retry when the fetch fails', (tester) async {
        when(() => cubit.state).thenReturn(const EarnDetailState.failure(NetworkException()));
        when(cubit.load).thenAnswer((_) async {});
        await pumpView(tester, EarnSourceKind.dailyStreaks);

        expect(find.byType(ErrorView), findsOneWidget);
      });

      testWidgets('nothing at all before the fetch starts', (tester) async {
        when(() => cubit.state).thenReturn(const EarnDetailState.initial());
        await pumpView(tester, EarnSourceKind.dailyStreaks);

        expect(find.byType(ActivityRow), findsNothing);
        expect(find.byType(LoadingView), findsNothing);
      });
    });

    testWidgets('the back disc exactly where My Earns leaves it, so nothing jumps', (tester) async {
      usePhoneSurface(tester);
      final earns = _MockEarnsCubit();
      when(() => earns.state).thenReturn(const EarnsState.success(_parentOverview));
      await tester.pumpApp(
        MediaQuery(
          // A real phone's top inset, so both headers are measured on one device.
          data: const MediaQueryData(padding: EdgeInsets.only(top: 47)),
          child: BlocProvider<EarnsCubit>.value(value: earns, child: const EarnsView()),
        ),
      );
      final onParent = tester.getRect(find.byType(BackDiscButton));

      when(() => cubit.state).thenReturn(EarnDetailState.success(fixtures.streaks));
      await pumpView(tester, EarnSourceKind.dailyStreaks, topInset: 47);

      // The app bar's 56 centres the button's 48 target 4 below the inset. A
      // header that pads more drops the disc, which reads as a jump on push.
      expect(tester.getRect(find.byType(BackDiscButton)).top, onParent.top);
    });

    group('at a text scale of 1.3', () {
      // Every card packs a row of its own, so a scaled-up label is where one
      // would overflow rather than wrap.
      for (final (kind, detail) in <(EarnSourceKind, EarnDetail)>[
        (EarnSourceKind.dailyStreaks, fixtures.streaks),
        (EarnSourceKind.auctionWins, fixtures.auction),
        (EarnSourceKind.predictionGames, fixtures.predictions),
        (EarnSourceKind.weeklyQuests, fixtures.quests),
      ]) {
        testWidgets('$kind lays out without overflowing', (tester) async {
          when(() => cubit.state).thenReturn(EarnDetailState.success(detail));
          await pumpView(tester, kind, textScaler: const TextScaler.linear(1.3));

          expect(tester.takeException(), isNull);
        });
      }
    });
  });
}
