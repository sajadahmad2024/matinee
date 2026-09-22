import 'package:bloc_test/bloc_test.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/core/widgets/error_view.dart';
import 'package:matinee/core/widgets/loading_view.dart';
import 'package:matinee/features/p2p/data/models/prediction.dart';
import 'package:matinee/features/p2p/presentation/cubit/prediction_detail_cubit.dart';
import 'package:matinee/features/p2p/presentation/cubit/prediction_detail_state.dart';
import 'package:matinee/features/p2p/presentation/cubit/prediction_games_cubit.dart';
import 'package:matinee/features/p2p/presentation/cubit/prediction_games_state.dart';
import 'package:matinee/features/p2p/presentation/prediction_detail_screen.dart';
import 'package:matinee/features/p2p/presentation/prediction_games_screen.dart';
import 'package:matinee/features/p2p/presentation/widgets/countdown_card.dart';
import 'package:matinee/features/p2p/presentation/widgets/prediction_analysis_sheet.dart';
import 'package:matinee/features/p2p/presentation/widgets/prediction_card.dart';
import 'package:matinee/features/p2p/presentation/widgets/vote_option_button.dart';
import 'package:mocktail/mocktail.dart';

import '../../../helpers/helpers.dart';
import 'p2p_fixtures.dart';

class _MockPredictionGamesCubit extends MockCubit<PredictionGamesState> implements PredictionGamesCubit {}

class _MockPredictionDetailCubit extends MockCubit<PredictionDetailState> implements PredictionDetailCubit {}

void main() {
  group(PredictionGamesView, () {
    late _MockPredictionGamesCubit cubit;

    setUp(() => cubit = _MockPredictionGamesCubit());

    Future<void> pump(WidgetTester tester, PredictionGamesState state, {double textScale = 1}) {
      usePhoneSurface(tester);
      when(() => cubit.state).thenReturn(state);
      return tester.pumpApp(
        MediaQuery(
          data: MediaQueryData(textScaler: TextScaler.linear(textScale)),
          child: BlocProvider<PredictionGamesCubit>.value(
            value: cubit,
            child: const PredictionGamesView(),
          ),
        ),
      );
    }

    group('renders', () {
      testWidgets('one card per prediction and the count still open', (tester) async {
        await pump(
          tester,
          const PredictionGamesState.success([openPrediction, resolvedPrediction]),
        );

        expect(find.byType(PredictionCard), findsExactly(2));
        expect(find.text('1 ACTIVE'), findsOne);
      });

      testWidgets('the two shares adding to a hundred, the no side derived', (tester) async {
        await pump(tester, const PredictionGamesState.success([openPrediction]));

        expect(find.text('YES 62%'), findsOne);
        expect(find.text('NO 38%'), findsOne);
        expect(find.text('80% of players voted'), findsOne);
      });

      testWidgets('the multiplier while it is open and the state once it is settled', (
        tester,
      ) async {
        await pump(
          tester,
          const PredictionGamesState.success([openPrediction, resolvedPrediction]),
        );

        expect(find.text('3X MULTIPLIER'), findsOne);
        expect(find.text('RESULT IN'), findsOne);
        expect(find.text('Reward Claimed'), findsOne);
        expect(find.text('Cast Your Vote'), findsOne);
      });

      testWidgets('a receipt rather than the CTA on an open prediction already voted on', (
        tester,
      ) async {
        await pump(
          tester,
          PredictionGamesState.success([
            openPrediction.copyWith(vote: PredictionSide.no),
          ]),
        );

        expect(find.text('Your vote is in'), findsOne);
        expect(find.text('Cast Your Vote'), findsNothing);
      });

      testWidgets('an empty message when nothing is open', (tester) async {
        await pump(tester, const PredictionGamesState.success([]));

        expect(find.text('No predictions are open right now.'), findsOne);
      });

      testWidgets('a loading view while the predictions are in flight', (tester) async {
        await pump(tester, const PredictionGamesState.loading());

        expect(find.byType(LoadingView), findsOne);
      });

      testWidgets('an error view when the predictions fail', (tester) async {
        await pump(tester, const PredictionGamesState.failure(NetworkException()));

        expect(find.byType(ErrorView), findsOne);
      });

      testWidgets('without overflowing at a large text scale', (tester) async {
        await pump(
          tester,
          const PredictionGamesState.success([openPrediction, resolvedPrediction]),
          textScale: 1.3,
        );

        expect(tester.takeException(), isNull);
      });
    });
  });

  group(PredictionDetailView, () {
    late _MockPredictionDetailCubit cubit;

    setUp(() => cubit = _MockPredictionDetailCubit());

    Future<void> pump(WidgetTester tester, PredictionDetailState state, {double textScale = 1}) {
      usePhoneSurface(tester);
      when(() => cubit.state).thenReturn(state);
      return tester.pumpApp(
        MediaQuery(
          data: MediaQueryData(textScaler: TextScaler.linear(textScale)),
          child: BlocProvider<PredictionDetailCubit>.value(
            value: cubit,
            child: const PredictionDetailView(),
          ),
        ),
      );
    }

    group('renders', () {
      testWidgets('the title, the question, the countdown and the two sides', (tester) async {
        await pump(tester, const PredictionDetailState.success(openPrediction));

        expect(find.text('Neon Noir'), findsOne);
        expect(find.text(openPrediction.question), findsOne);
        expect(find.byType(CountdownCard), findsOne);
        expect(find.text('06:14:22'), findsOne);
        expect(find.byType(VoteOptionButton), findsExactly(2));
      });

      testWidgets('the multiplier and what a correct call pays', (tester) async {
        await pump(tester, const PredictionDetailState.success(openPrediction));

        expect(find.text('3X'), findsOne);
        // The eyebrow lifts the points into the reward tone, so it is spans
        // rather than one string.
        expect(find.text('CAST YOUR VOTE · +300 PTS', findRichText: true), findsOne);
      });

      testWidgets('submit held back until a side is picked', (tester) async {
        await pump(tester, const PredictionDetailState.success(openPrediction));

        final submit = tester.widget<FilledButton>(
          find.widgetWithText(FilledButton, 'Submit'),
        );
        expect(submit.onPressed, isNull);
      });

      testWidgets('submit live once a side is picked', (tester) async {
        await pump(
          tester,
          const PredictionDetailState.success(openPrediction, selection: PredictionSide.yes),
        );

        final submit = tester.widget<FilledButton>(
          find.widgetWithText(FilledButton, 'Submit'),
        );
        expect(submit.onPressed, isNotNull);
      });

      testWidgets('a receipt rather than the CTA once the vote is cast', (tester) async {
        await pump(
          tester,
          const PredictionDetailState.success(resolvedPrediction, selection: PredictionSide.yes),
        );

        expect(find.text('Your vote is in'), findsOne);
        expect(find.text('Submit'), findsNothing);
      });

      testWidgets('the pair locked once the vote is cast', (tester) async {
        await pump(
          tester,
          const PredictionDetailState.success(resolvedPrediction, selection: PredictionSide.yes),
        );

        for (final button in tester.widgetList<VoteOptionButton>(
          find.byType(VoteOptionButton),
        )) {
          expect(button.onPressed, isNull);
        }
      });

      testWidgets('a loading view while the prediction is in flight', (tester) async {
        await pump(tester, const PredictionDetailState.loading());

        expect(find.byType(LoadingView), findsOne);
      });

      testWidgets('an error view when the prediction fails', (tester) async {
        await pump(tester, const PredictionDetailState.failure(NotFoundException()));

        expect(find.byType(ErrorView), findsOne);
      });

      testWidgets('without overflowing at a large text scale', (tester) async {
        await pump(
          tester,
          const PredictionDetailState.success(openPrediction),
          textScale: 1.3,
        );

        expect(tester.takeException(), isNull);
      });
    });

    group('calls select', () {
      testWidgets('with the side the pressed button carries', (tester) async {
        await pump(tester, const PredictionDetailState.success(openPrediction));

        await tester.tap(find.text('NO'));
        await tester.pump();

        verify(() => cubit.select(PredictionSide.no)).called(1);
      });
    });
  });

  group(PredictionAnalysisSheet, () {
    testWidgets('renders one row per side, named rather than lettered', (tester) async {
      usePhoneSurface(tester);
      await tester.pumpApp(
        const PredictionAnalysisSheet(
          question: 'Will it cross 100 Crore?',
          shares: [
            AnalysisShare(label: 'YES', percent: 62),
            AnalysisShare(label: 'NO', percent: 38),
          ],
        ),
      );

      expect(find.text('YES'), findsOne);
      expect(find.text('NO'), findsOne);
      expect(find.text('62%'), findsOne);
      expect(find.text('38%'), findsOne);
    });

    testWidgets('renders without overflowing at a large text scale', (tester) async {
      usePhoneSurface(tester);
      await tester.pumpApp(
        const MediaQuery(
          data: MediaQueryData(textScaler: TextScaler.linear(1.3)),
          child: PredictionAnalysisSheet(
            question: 'Will it cross 100 Crore?',
            shares: [
              AnalysisShare(label: 'YES', percent: 62),
              AnalysisShare(label: 'NO', percent: 38),
            ],
          ),
        ),
      );

      expect(tester.takeException(), isNull);
    });
  });
}
