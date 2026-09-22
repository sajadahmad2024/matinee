import 'package:bloc_test/bloc_test.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/core/widgets/error_view.dart';
import 'package:matinee/core/widgets/loading_view.dart';
import 'package:matinee/features/p2p/presentation/cubit/weekly_quests_cubit.dart';
import 'package:matinee/features/p2p/presentation/cubit/weekly_quests_state.dart';
import 'package:matinee/features/p2p/presentation/weekly_quests_screen.dart';
import 'package:matinee/features/p2p/presentation/widgets/hero_quest_card.dart';
import 'package:matinee/features/p2p/presentation/widgets/quest_list_card.dart';
import 'package:mocktail/mocktail.dart';

import '../../../helpers/helpers.dart';
import 'p2p_fixtures.dart';

class _MockWeeklyQuestsCubit extends MockCubit<WeeklyQuestsState> implements WeeklyQuestsCubit {}

void main() {
  group(WeeklyQuestsView, () {
    late _MockWeeklyQuestsCubit cubit;

    setUp(() => cubit = _MockWeeklyQuestsCubit());

    Future<void> pump(WidgetTester tester, WeeklyQuestsState state, {double textScale = 1}) {
      usePhoneSurface(tester);
      when(() => cubit.state).thenReturn(state);
      return tester.pumpApp(
        MediaQuery(
          data: MediaQueryData(textScaler: TextScaler.linear(textScale)),
          child: BlocProvider<WeeklyQuestsCubit>.value(
            value: cubit,
            child: const WeeklyQuestsView(),
          ),
        ),
      );
    }

    group('renders', () {
      testWidgets('the running quest as the hero and the rest as rows', (tester) async {
        await pump(tester, WeeklyQuestsState.success([runningQuest, claimedQuest]));

        expect(find.byType(HeroQuestCard), findsOne);
        expect(find.byType(QuestListCard), findsOne);
      });

      testWidgets('the hero fraction off the action count, so one number drives both', (
        tester,
      ) async {
        await pump(tester, const WeeklyQuestsState.success([runningQuest]));

        expect(find.text('1 / 2'), findsOne);
        expect(find.text('500 PTS'), findsOne);
        expect(find.text('2d 14h left'), findsOne);
      });

      testWidgets('a claimed row with its badge instead of a button', (tester) async {
        await pump(tester, WeeklyQuestsState.success([claimedQuest]));

        expect(find.text('REWARD CLAIMED'), findsOne);
        expect(find.text('Start Quest'), findsNothing);
      });

      testWidgets('an empty message when there is nothing under the hero', (tester) async {
        await pump(tester, const WeeklyQuestsState.success([runningQuest]));

        expect(find.text('No quests are running this week.'), findsOne);
      });

      testWidgets('no hero when nothing is running', (tester) async {
        await pump(tester, WeeklyQuestsState.success([claimedQuest]));

        expect(find.byType(HeroQuestCard), findsNothing);
        expect(find.byType(QuestListCard), findsOne);
      });

      testWidgets('a loading view while the quests are in flight', (tester) async {
        await pump(tester, const WeeklyQuestsState.loading());

        expect(find.byType(LoadingView), findsOne);
      });

      testWidgets('an error view when the quests fail', (tester) async {
        await pump(tester, const WeeklyQuestsState.failure(NetworkException()));

        expect(find.byType(ErrorView), findsOne);
      });

      testWidgets('without overflowing at a large text scale', (tester) async {
        await pump(
          tester,
          WeeklyQuestsState.success([runningQuest, claimedQuest]),
          textScale: 1.3,
        );

        expect(tester.takeException(), isNull);
      });
    });
  });
}
