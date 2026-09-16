import 'package:bloc_test/bloc_test.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/core/widgets/error_view.dart';
import 'package:matinee/core/widgets/loading_view.dart';
import 'package:matinee/features/p2p/presentation/cubit/daily_streak_cubit.dart';
import 'package:matinee/features/p2p/presentation/cubit/daily_streak_state.dart';
import 'package:matinee/features/p2p/presentation/daily_streak_screen.dart';
import 'package:matinee/features/p2p/presentation/widgets/level_track.dart';
import 'package:matinee/features/p2p/presentation/widgets/session_card.dart';
import 'package:matinee/features/p2p/presentation/widgets/streak_intro_view.dart';
import 'package:matinee/features/p2p/presentation/widgets/streak_level_card.dart';
import 'package:matinee/features/p2p/presentation/widgets/streak_level_sheet.dart';
import 'package:mocktail/mocktail.dart';

import '../../../helpers/helpers.dart';
import 'p2p_fixtures.dart';

class _MockDailyStreakCubit extends MockCubit<DailyStreakState> implements DailyStreakCubit {}

void main() {
  group(DailyStreakView, () {
    late _MockDailyStreakCubit cubit;

    setUp(() => cubit = _MockDailyStreakCubit());

    final notStarted = streakTiers.copyWith(hasStarted: false);

    Future<void> pump(WidgetTester tester, DailyStreakState state, {double textScale = 1}) {
      usePhoneSurface(tester);
      when(() => cubit.state).thenReturn(state);
      return tester.pumpApp(
        MediaQuery(
          data: MediaQueryData(textScaler: TextScaler.linear(textScale)),
          child: BlocProvider<DailyStreakCubit>.value(
            value: cubit,
            child: const DailyStreakView(),
          ),
        ),
      );
    }

    group('renders', () {
      testWidgets('the intro before the streak has started', (tester) async {
        await pump(tester, DailyStreakState.success(notStarted));

        expect(find.byType(StreakIntroView), findsOne);
        expect(find.text('The Daily Ritual'), findsOne);
        expect(find.text('Start My Streak'), findsOne);
        expect(find.byType(StreakLevelCard), findsNothing);
      });

      testWidgets('the first rung as the ask, so the copy quotes the real target', (tester) async {
        await pump(tester, DailyStreakState.success(notStarted));

        expect(find.text('Spend 30 mins daily'), findsOne);
      });

      testWidgets('the ladder and the session once the streak has started', (tester) async {
        await pump(tester, const DailyStreakState.success(streakTiers));

        expect(find.byType(StreakIntroView), findsNothing);
        expect(find.byType(StreakLevelCard), findsOne);
        expect(find.byType(LevelTrack), findsOne);
        expect(find.byType(SessionCard), findsOne);
      });

      testWidgets('the level and the week off the one status', (tester) async {
        await pump(tester, const DailyStreakState.success(streakTiers));

        expect(find.text('Level 2'), findsOne);
        expect(find.text('45 min/day for 7 days'), findsOne);
        expect(find.text('2/7'), findsOne);
        expect(
          find.text('Complete 5 more days to unlock Level 3 (60 min/day)'),
          findsOne,
        );
      });

      testWidgets("today's session against the level's own target", (tester) async {
        await pump(tester, const DailyStreakState.success(streakTiers));

        expect(find.text('22'), findsOne);
        expect(find.text('/ 45 min'), findsOne);
        expect(find.text('23 MIN LEFT'), findsOne);
      });

      testWidgets('the run, the best and the active days', (tester) async {
        await pump(tester, const DailyStreakState.success(streakTiers));

        expect(find.text('🔥 14'), findsOne);
        expect(find.text('21'), findsOne);
        expect(find.text('47'), findsOne);
      });

      testWidgets('a run to keep rather than a level to unlock at the top of the ladder', (
        tester,
      ) async {
        await pump(
          tester,
          DailyStreakState.success(streakTiers.copyWith(level: 3)),
        );

        expect(find.text('You have reached the top level. Keep the run going.'), findsOne);
      });

      testWidgets('a loading view while the streak is in flight', (tester) async {
        await pump(tester, const DailyStreakState.loading());

        expect(find.byType(LoadingView), findsOne);
      });

      testWidgets('an error view when the streak fails', (tester) async {
        await pump(tester, const DailyStreakState.failure(NetworkException()));

        expect(find.byType(ErrorView), findsOne);
      });

      testWidgets('without overflowing at a large text scale', (tester) async {
        await pump(tester, const DailyStreakState.success(streakTiers), textScale: 1.3);

        expect(tester.takeException(), isNull);
      });

      testWidgets('the intro without overflowing at a large text scale', (tester) async {
        await pump(tester, DailyStreakState.success(notStarted), textScale: 1.3);

        expect(tester.takeException(), isNull);
      });
    });

    group('calls start', () {
      testWidgets('when the intro CTA is pressed', (tester) async {
        when(cubit.start).thenAnswer((_) async {});
        await pump(tester, DailyStreakState.success(notStarted));

        await tester.tap(find.text('Start My Streak'));
        await tester.pump();

        verify(cubit.start).called(1);
      });

      testWidgets('never while the CTA is already working', (tester) async {
        when(cubit.start).thenAnswer((_) async {});
        await pump(tester, DailyStreakState.success(notStarted, isBusy: true));

        await tester.tap(find.text('Start My Streak'));
        await tester.pump();

        verifyNever(cubit.start);
      });
    });

    group('calls completeToday', () {
      testWidgets('when the ladder CTA is pressed', (tester) async {
        when(cubit.completeToday).thenAnswer((_) async {});
        await pump(tester, const DailyStreakState.success(streakTiers));

        await tester.tap(find.text('Complete Today'));
        await tester.pump();

        verify(cubit.completeToday).called(1);
      });

      testWidgets('never once the top rung has no day left to count', (tester) async {
        when(cubit.completeToday).thenAnswer((_) async {});
        final finished = streakTiers.copyWith(
          level: streakTiers.tiers.last.level,
          daysDoneThisWeek: streakTiers.daysPerLevel,
        );
        await pump(tester, DailyStreakState.success(finished));

        await tester.tap(find.text('Complete Today'));
        await tester.pump();

        verifyNever(cubit.completeToday);
      });
    });
  });

  group(StreakLevelSheet, () {
    testWidgets('renders the run it completed and what it paid', (tester) async {
      usePhoneSurface(tester);
      await tester.pumpApp(const StreakLevelSheet(days: 7, pointsLabel: '315'));

      expect(find.text('7-Day Ritual Complete!'), findsOne);
      expect(find.text('+315'), findsOne);
      expect(find.text('Streak Master'), findsOne);
      expect(find.text('Claim Reward'), findsOne);
    });

    testWidgets('renders without overflowing at a large text scale', (tester) async {
      usePhoneSurface(tester);
      await tester.pumpApp(
        const MediaQuery(
          data: MediaQueryData(textScaler: TextScaler.linear(1.3)),
          child: StreakLevelSheet(days: 7, pointsLabel: '315'),
        ),
      );

      expect(tester.takeException(), isNull);
    });
  });
}
