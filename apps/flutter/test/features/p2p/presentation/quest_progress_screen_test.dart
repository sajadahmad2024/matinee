import 'package:bloc_test/bloc_test.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/core/widgets/error_view.dart';
import 'package:matinee/core/widgets/loading_view.dart';
import 'package:matinee/features/p2p/presentation/cubit/quest_progress_cubit.dart';
import 'package:matinee/features/p2p/presentation/cubit/quest_progress_state.dart';
import 'package:matinee/features/p2p/presentation/quest_claimed_screen.dart';
import 'package:matinee/features/p2p/presentation/quest_progress_screen.dart';
import 'package:matinee/features/p2p/presentation/widgets/action_card.dart';
import 'package:matinee/features/p2p/presentation/widgets/badge_unlocked_card.dart';
import 'package:matinee/features/p2p/presentation/widgets/completed_action_row.dart';
import 'package:matinee/features/p2p/presentation/widgets/progress_summary_card.dart';
import 'package:matinee/features/p2p/presentation/widgets/quest_completion_sheet.dart';
import 'package:mocktail/mocktail.dart';

import '../../../helpers/helpers.dart';
import 'p2p_fixtures.dart';

class _MockQuestProgressCubit extends MockCubit<QuestProgressState> implements QuestProgressCubit {}

void main() {
  group(QuestProgressView, () {
    late _MockQuestProgressCubit cubit;

    setUp(() => cubit = _MockQuestProgressCubit());

    Future<void> pump(WidgetTester tester, QuestProgressState state, {double textScale = 1}) {
      usePhoneSurface(tester);
      when(() => cubit.state).thenReturn(state);
      return tester.pumpApp(
        MediaQuery(
          data: MediaQueryData(textScaler: TextScaler.linear(textScale)),
          child: BlocProvider<QuestProgressCubit>.value(
            value: cubit,
            child: const QuestProgressView(),
          ),
        ),
      );
    }

    group('renders', () {
      testWidgets('the ring, the headline and one card per action', (tester) async {
        await pump(tester, const QuestProgressState.success(runningQuest));

        expect(find.byType(ProgressSummaryCard), findsOne);
        expect(find.text('1 of 2 actions done'), findsOne);
        expect(find.text('50%'), findsOne);
        expect(find.byType(ActionCard), findsExactly(runningQuest.actions.length));
      });

      testWidgets('the curated content under the action that has some', (tester) async {
        await pump(tester, const QuestProgressState.success(runningQuest));

        expect(find.text('Neon Noir — Official Trailer'), findsOne);
        expect(find.text('DONE'), findsOne);
        expect(find.text('Watch'), findsOne);
      });

      testWidgets('no claim button while an action is still short', (tester) async {
        await pump(tester, const QuestProgressState.success(runningQuest));

        expect(find.text('Claim Reward'), findsNothing);
      });

      testWidgets('the quest title in the header', (tester) async {
        await pump(tester, const QuestProgressState.success(runningQuest));

        expect(find.text('Trailer Marathon'), findsOne);
      });

      testWidgets('a loading view while the quest is in flight', (tester) async {
        await pump(tester, const QuestProgressState.loading());

        expect(find.byType(LoadingView), findsOne);
      });

      testWidgets('an error view when the quest fails', (tester) async {
        await pump(tester, const QuestProgressState.failure(NetworkException()));

        expect(find.byType(ErrorView), findsOne);
      });

      testWidgets('without overflowing at a large text scale', (tester) async {
        await pump(tester, const QuestProgressState.success(runningQuest), textScale: 1.3);

        expect(tester.takeException(), isNull);
      });
    });

    group('calls watch', () {
      testWidgets('for the item the pressed button sits beside', (tester) async {
        when(() => cubit.watch(any(), any())).thenAnswer((_) async {});
        await pump(tester, const QuestProgressState.success(runningQuest));

        await tester.tap(find.text('Watch'));
        await tester.pump();

        verify(() => cubit.watch('watch', 'silent-storm')).called(1);
      });
    });
  });

  group(QuestClaimedView, () {
    late _MockQuestProgressCubit cubit;

    setUp(() => cubit = _MockQuestProgressCubit());

    Future<void> pump(WidgetTester tester, QuestProgressState state, {double textScale = 1}) {
      usePhoneSurface(tester);
      when(() => cubit.state).thenReturn(state);
      return tester.pumpApp(
        MediaQuery(
          data: MediaQueryData(textScaler: TextScaler.linear(textScale)),
          child: BlocProvider<QuestProgressCubit>.value(
            value: cubit,
            child: const QuestClaimedView(),
          ),
        ),
      );
    }

    group('renders', () {
      testWidgets('what the quest paid, the badge it unlocked and every action', (tester) async {
        await pump(tester, QuestProgressState.success(claimedQuest));

        expect(find.text('500'), findsOne);
        expect(find.text('Cinematic Visionary'), findsOne);
        expect(find.byType(BadgeUnlockedCard), findsOne);
        expect(
          find.byType(CompletedActionRow),
          findsExactly(claimedQuest.actions.length),
        );
      });

      testWidgets('the actions as a fraction of the total, both from the same list', (
        tester,
      ) async {
        await pump(tester, QuestProgressState.success(claimedQuest));

        expect(find.text('2'), findsOne);
        expect(find.text('/ 2'), findsOne);
      });

      testWidgets('the days it took only when the API reports them', (tester) async {
        await pump(tester, QuestProgressState.success(claimedQuest.copyWith(completedInDays: null)));

        expect(find.text('COMPLETED IN'), findsNothing);
      });

      testWidgets('a failure rather than a receipt for a quest that was never paid', (
        tester,
      ) async {
        await pump(tester, const QuestProgressState.success(runningQuest));

        expect(find.byType(ErrorView), findsOne);
        expect(find.byType(BadgeUnlockedCard), findsNothing);
        expect(find.text('Congratulations! 🎉'), findsNothing);
      });

      testWidgets('without overflowing at a large text scale', (tester) async {
        await pump(tester, QuestProgressState.success(claimedQuest), textScale: 1.3);

        expect(tester.takeException(), isNull);
      });
    });
  });

  group(QuestCompletionSheet, () {
    testWidgets('renders the award and the badge the quest unlocked', (tester) async {
      usePhoneSurface(tester);
      await tester.pumpApp(
        const QuestCompletionSheet(
          questTitle: 'Trailer Marathon',
          pointsLabel: '500',
          badgeName: 'Cinematic Visionary',
        ),
      );

      expect(find.text('Congratulations'), findsOne);
      expect(find.text('+500'), findsOne);
      expect(find.text('Cinematic Visionary'), findsOne);
      expect(find.text('Claim Reward'), findsOne);
    });

    testWidgets('renders without overflowing at a large text scale', (tester) async {
      usePhoneSurface(tester);
      await tester.pumpApp(
        const MediaQuery(
          data: MediaQueryData(textScaler: TextScaler.linear(1.3)),
          child: QuestCompletionSheet(
            questTitle: 'Trailer Marathon',
            pointsLabel: '500',
            badgeName: 'Cinematic Visionary',
          ),
        ),
      );

      expect(tester.takeException(), isNull);
    });
  });
}
