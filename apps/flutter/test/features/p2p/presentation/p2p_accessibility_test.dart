import 'dart:ui';

import 'package:bloc_test/bloc_test.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/features/p2p/data/models/prediction.dart';
import 'package:matinee/features/p2p/presentation/cubit/daily_streak_cubit.dart';
import 'package:matinee/features/p2p/presentation/cubit/daily_streak_state.dart';
import 'package:matinee/features/p2p/presentation/cubit/p2p_cubit.dart';
import 'package:matinee/features/p2p/presentation/cubit/p2p_state.dart';
import 'package:matinee/features/p2p/presentation/cubit/prediction_detail_cubit.dart';
import 'package:matinee/features/p2p/presentation/cubit/prediction_detail_state.dart';
import 'package:matinee/features/p2p/presentation/cubit/prediction_games_cubit.dart';
import 'package:matinee/features/p2p/presentation/cubit/prediction_games_state.dart';
import 'package:matinee/features/p2p/presentation/cubit/quest_progress_cubit.dart';
import 'package:matinee/features/p2p/presentation/cubit/quest_progress_state.dart';
import 'package:matinee/features/p2p/presentation/cubit/weekly_quests_cubit.dart';
import 'package:matinee/features/p2p/presentation/cubit/weekly_quests_state.dart';
import 'package:matinee/features/p2p/presentation/daily_streak_screen.dart';
import 'package:matinee/features/p2p/presentation/p2p_screen.dart';
import 'package:matinee/features/p2p/presentation/prediction_detail_screen.dart';
import 'package:matinee/features/p2p/presentation/prediction_games_screen.dart';
import 'package:matinee/features/p2p/presentation/quest_claimed_screen.dart';
import 'package:matinee/features/p2p/presentation/quest_progress_screen.dart';
import 'package:matinee/features/p2p/presentation/weekly_quests_screen.dart';
import 'package:matinee/features/p2p/presentation/widgets/quest_completion_sheet.dart';
import 'package:matinee/features/p2p/presentation/widgets/streak_level_sheet.dart';
import 'package:mocktail/mocktail.dart';

import '../../../helpers/helpers.dart';
import 'p2p_fixtures.dart';

class _MockP2pCubit extends MockCubit<P2pState> implements P2pCubit {}

class _MockWeeklyQuestsCubit extends MockCubit<WeeklyQuestsState> implements WeeklyQuestsCubit {}

class _MockQuestProgressCubit extends MockCubit<QuestProgressState> implements QuestProgressCubit {}

class _MockDailyStreakCubit extends MockCubit<DailyStreakState> implements DailyStreakCubit {}

class _MockPredictionGamesCubit extends MockCubit<PredictionGamesState> implements PredictionGamesCubit {}

class _MockPredictionDetailCubit extends MockCubit<PredictionDetailState> implements PredictionDetailCubit {}

void main() {
  ///
  /// Wraps the view in whatever it needs and runs the four built-in guidelines
  /// plus the one they cannot see, at both the default scale and a large one.
  ///
  Future<void> expectAccessible(
    WidgetTester tester,
    Widget view, {
    double textScale = 1,
  }) async {
    usePhoneSurface(tester);
    await tester.pumpApp(
      MediaQuery(
        data: MediaQueryData(textScaler: TextScaler.linear(textScale)),
        child: view,
      ),
    );
    await expectMeetsGuidelines(tester);
  }

  group('P2P accessibility', () {
    group(P2pView, () {
      late _MockP2pCubit cubit;

      setUp(() {
        cubit = _MockP2pCubit();
        when(() => cubit.state).thenReturn(const P2pState.success(overview));
      });

      Widget view() => BlocProvider<P2pCubit>.value(value: cubit, child: const P2pView());

      for (final scale in [1.0, 1.3, 2.0]) {
        testWidgets('meets the guidelines at a text scale of $scale', (tester) async {
          await expectAccessible(tester, view(), textScale: scale);
        });
      }

      testWidgets('reads each stat column as one sentence rather than three stops', (
        tester,
      ) async {
        final handle = tester.ensureSemantics();
        await expectAccessible(tester, view());

        expect(find.bySemanticsLabel('Rank 294, up 12 places this week.'), findsOne);
        expect(find.bySemanticsLabel('Streak: 630 points, best run 21 days.'), findsOne);
        expect(find.bySemanticsLabel('7,082 points earned.'), findsOne);

        handle.dispose();
      });

      testWidgets('reads the badge row as one sentence, because its bar says nothing', (
        tester,
      ) async {
        final handle = tester.ensureSemantics();
        await expectAccessible(tester, view());

        expect(
          find.bySemanticsLabel(
            'Badge Expert, 2,082 of 3,000 points. 918 points to Cinematic Loyalist.',
          ),
          findsOne,
        );

        handle.dispose();
      });
    });

    group(WeeklyQuestsView, () {
      late _MockWeeklyQuestsCubit cubit;

      setUp(() {
        cubit = _MockWeeklyQuestsCubit();
        when(
          () => cubit.state,
        ).thenReturn(WeeklyQuestsState.success([runningQuest, claimedQuest]));
      });

      Widget view() => BlocProvider<WeeklyQuestsCubit>.value(
        value: cubit,
        child: const WeeklyQuestsView(),
      );

      for (final scale in [1.0, 1.3, 2.0]) {
        testWidgets('meets the guidelines at a text scale of $scale', (tester) async {
          await expectAccessible(tester, view(), textScale: scale);
        });
      }

      testWidgets('reads a quest row as one item a screen reader can activate', (tester) async {
        final handle = tester.ensureSemantics();
        await expectAccessible(tester, view());

        // The words drawn on the row are in its name, or a voice-control user
        // says 'Start Quest' and nothing answers.
        expect(
          find.bySemanticsLabel(
            'Comment Connoisseur. Watch 10 trailers in a single session. '
            'Pays 500 points. Reward claimed',
          ),
          findsOne,
        );

        handle.dispose();
      });

      testWidgets('names the active pill rather than leaving it spelled out', (tester) async {
        final handle = tester.ensureSemantics();
        await expectAccessible(tester, view());

        expect(find.bySemanticsLabel('Active'), findsOne);
        expect(find.bySemanticsLabel('ACTIVE'), findsNothing);

        handle.dispose();
      });

      testWidgets('gives the list a heading the reader can jump to', (tester) async {
        final handle = tester.ensureSemantics();
        await expectAccessible(tester, view());

        expect(find.bySemanticsLabel('ALL WEEKLY QUESTS'), findsOne);

        handle.dispose();
      });
    });

    group(QuestProgressView, () {
      late _MockQuestProgressCubit cubit;

      setUp(() {
        cubit = _MockQuestProgressCubit();
        when(() => cubit.state).thenReturn(const QuestProgressState.success(runningQuest));
        when(() => cubit.watch(any(), any())).thenAnswer((_) async {});
      });

      Widget view() => BlocProvider<QuestProgressCubit>.value(
        value: cubit,
        child: const QuestProgressView(),
      );

      for (final scale in [1.0, 1.3, 2.0]) {
        testWidgets('meets the guidelines at a text scale of $scale', (tester) async {
          await expectAccessible(tester, view(), textScale: scale);
        });
      }

      testWidgets('reads an action card as one sentence, chip and bar included', (tester) async {
        final handle = tester.ensureSemantics();
        await expectAccessible(tester, view());

        expect(
          find.bySemanticsLabel(
            'Watch 3 Trailers. Watch the curated trailers below. 2 of 3 done.',
          ),
          findsOne,
        );

        handle.dispose();
      });

      testWidgets('says which curated rows are watched and which are still to watch', (
        tester,
      ) async {
        final handle = tester.ensureSemantics();
        await expectAccessible(tester, view());

        expect(
          find.bySemanticsLabel('Neon Noir — Official Trailer, watched'),
          findsOne,
        );
        expect(find.bySemanticsLabel('Watch The Silent Storm'), findsOne);

        handle.dispose();
      });
    });

    group(QuestClaimedView, () {
      late _MockQuestProgressCubit cubit;

      setUp(() {
        cubit = _MockQuestProgressCubit();
        when(() => cubit.state).thenReturn(QuestProgressState.success(claimedQuest));
      });

      Widget view() => BlocProvider<QuestProgressCubit>.value(
        value: cubit,
        child: const QuestClaimedView(),
      );

      for (final scale in [1.0, 1.3, 2.0]) {
        testWidgets('meets the guidelines at a text scale of $scale', (tester) async {
          await expectAccessible(tester, view(), textScale: scale);
        });
      }

      testWidgets('reads each stat as one sentence rather than a label and a figure', (
        tester,
      ) async {
        final handle = tester.ensureSemantics();
        await expectAccessible(tester, view());

        expect(find.bySemanticsLabel('500 points earned.'), findsOne);
        expect(find.bySemanticsLabel('Completed in 3 days.'), findsOne);
        expect(find.bySemanticsLabel('2 of 2 actions done'), findsOne);

        handle.dispose();
      });
    });

    group(DailyStreakView, () {
      late _MockDailyStreakCubit cubit;

      setUp(() => cubit = _MockDailyStreakCubit());

      Widget view() => BlocProvider<DailyStreakCubit>.value(
        value: cubit,
        child: const DailyStreakView(),
      );

      for (final scale in [1.0, 1.3, 2.0]) {
        testWidgets('meets the guidelines on the ladder at a text scale of $scale', (
          tester,
        ) async {
          when(() => cubit.state).thenReturn(const DailyStreakState.success(streakTiers));
          await expectAccessible(tester, view(), textScale: scale);
        });

        testWidgets('meets the guidelines on the intro at a text scale of $scale', (
          tester,
        ) async {
          when(
            () => cubit.state,
          ).thenReturn(DailyStreakState.success(streakTiers.copyWith(hasStarted: false)));
          await expectAccessible(tester, view(), textScale: scale);
        });
      }

      testWidgets('says where each rung of the ladder stands', (tester) async {
        when(() => cubit.state).thenReturn(const DailyStreakState.success(streakTiers));
        final handle = tester.ensureSemantics();
        await expectAccessible(tester, view());

        expect(
          find.bySemanticsLabel('Level 1, 30 minutes a day. Reached.'),
          findsOne,
        );
        expect(
          find.bySemanticsLabel('Level 2, 45 minutes a day. Current level.'),
          findsOne,
        );
        expect(
          find.bySemanticsLabel('Level 3, 60 minutes a day. Locked.'),
          findsOne,
        );

        handle.dispose();
      });

      testWidgets('reads the week as a sentence, because its bars announce nothing', (
        tester,
      ) async {
        when(() => cubit.state).thenReturn(const DailyStreakState.success(streakTiers));
        final handle = tester.ensureSemantics();
        await expectAccessible(tester, view());

        expect(
          find.bySemanticsLabel(
            'Current level 2, 45 minutes a day for 7 days. 2 of 7 days done this week.',
          ),
          findsOne,
        );

        handle.dispose();
      });
    });

    group(PredictionGamesView, () {
      late _MockPredictionGamesCubit cubit;

      setUp(() {
        cubit = _MockPredictionGamesCubit();
        when(() => cubit.state).thenReturn(
          const PredictionGamesState.success([openPrediction, resolvedPrediction]),
        );
      });

      Widget view() => BlocProvider<PredictionGamesCubit>.value(
        value: cubit,
        child: const PredictionGamesView(),
      );

      for (final scale in [1.0, 1.3, 2.0]) {
        testWidgets('meets the guidelines at a text scale of $scale', (tester) async {
          await expectAccessible(tester, view(), textScale: scale);
        });
      }

      testWidgets('reads a card as one sentence, split bar and pills included', (tester) async {
        final handle = tester.ensureSemantics();
        await expectAccessible(tester, view());

        expect(
          find.bySemanticsLabel(
            'Neon Noir. ${openPrediction.question} Yes 62 per cent, no 38 per cent. '
            '80 per cent of players voted. Pays 300 points at 3 times.',
          ),
          findsOne,
        );

        handle.dispose();
      });
    });

    group(PredictionDetailView, () {
      late _MockPredictionDetailCubit cubit;

      setUp(() {
        cubit = _MockPredictionDetailCubit();
        when(() => cubit.state).thenReturn(const PredictionDetailState.success(openPrediction));
      });

      Widget view() => BlocProvider<PredictionDetailCubit>.value(
        value: cubit,
        child: const PredictionDetailView(),
      );

      for (final scale in [1.0, 1.3, 2.0]) {
        testWidgets('meets the guidelines at a text scale of $scale', (tester) async {
          await expectAccessible(tester, view(), textScale: scale);
        });
      }

      testWidgets('reads the countdown in words, because its digits are one number', (
        tester,
      ) async {
        final handle = tester.ensureSemantics();
        await expectAccessible(tester, view());

        expect(
          find.bySemanticsLabel('Voting closes in 6 hours 14 minutes'),
          findsOne,
        );

        handle.dispose();
      });

      testWidgets('says which side is picked rather than leaving two loose buttons', (
        tester,
      ) async {
        when(() => cubit.state).thenReturn(
          const PredictionDetailState.success(openPrediction, selection: PredictionSide.yes),
        );
        final handle = tester.ensureSemantics();
        await expectAccessible(tester, view());

        final node = tester.getSemantics(find.text('YES'));
        // Named, not spelled: 'YES' is short enough to be read letter by letter.
        expect(node.label, 'Yes');
        final data = node.getSemanticsData();
        expect(data.flagsCollection.isSelected, Tristate.isTrue);
        // And one of a pair, so picking it is heard to drop the other.
        expect(data.flagsCollection.isInMutuallyExclusiveGroup, isTrue);

        handle.dispose();
      });
    });

    group('sheets', () {
      testWidgets('the quest modal interrupts, because it arrives unasked', (tester) async {
        final handle = tester.ensureSemantics();
        await expectAccessible(
          tester,
          const QuestCompletionSheet(
            questTitle: 'Trailer Marathon',
            pointsLabel: '500',
            badgeName: 'Cinematic Visionary',
          ),
        );

        expect(
          tester
              .widgetList<Semantics>(find.byType(Semantics))
              .any((widget) => widget.properties.role == SemanticsRole.alert),
          isTrue,
        );

        handle.dispose();
      });

      for (final scale in [1.0, 1.3, 2.0]) {
        testWidgets('the level drawer meets the guidelines at a text scale of $scale', (
          tester,
        ) async {
          await expectAccessible(
            tester,
            const StreakLevelSheet(days: 7, pointsLabel: '315'),
            textScale: scale,
          );
        });
      }
    });
  });
}
