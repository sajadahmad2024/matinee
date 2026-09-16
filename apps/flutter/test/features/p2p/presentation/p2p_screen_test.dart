import 'package:bloc_test/bloc_test.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/core/widgets/error_view.dart';
import 'package:matinee/core/widgets/loading_view.dart';
import 'package:matinee/core/widgets/redeem_card.dart';
import 'package:matinee/features/p2p/presentation/cubit/p2p_cubit.dart';
import 'package:matinee/features/p2p/presentation/cubit/p2p_state.dart';
import 'package:matinee/features/p2p/presentation/p2p_screen.dart';
import 'package:matinee/features/p2p/presentation/widgets/stat_row_card.dart';
import 'package:mocktail/mocktail.dart';

import '../../../helpers/helpers.dart';
import 'p2p_fixtures.dart';

class _MockP2pCubit extends MockCubit<P2pState> implements P2pCubit {}

void main() {
  group(P2pView, () {
    late _MockP2pCubit cubit;

    setUp(() => cubit = _MockP2pCubit());

    Future<void> pump(WidgetTester tester, P2pState state, {double textScale = 1}) {
      usePhoneSurface(tester);
      when(() => cubit.state).thenReturn(state);
      return tester.pumpApp(
        MediaQuery(
          data: MediaQueryData(textScaler: TextScaler.linear(textScale)),
          child: BlocProvider<P2pCubit>.value(value: cubit, child: const P2pView()),
        ),
      );
    }

    group('renders', () {
      testWidgets('the standing and one card per game when the state is success', (tester) async {
        await pump(tester, const P2pState.success(overview));

        expect(find.byType(StatRowCard), findsOne);
        expect(find.byType(RedeemCard), findsExactly(overview.games.length));
        expect(find.text('Weekly Quest'), findsOne);
      });

      testWidgets('the badge standing off the shared ladder, not the frame figures', (
        tester,
      ) async {
        await pump(tester, const P2pState.success(overview));

        expect(find.text('Expert'), findsOne);
        expect(find.text('2,082 / 3,000'), findsOne);
        expect(find.text('918 pts to Cinematic Loyalist'), findsOne);
      });

      testWidgets('the rank and the week it climbed', (tester) async {
        await pump(tester, const P2pState.success(overview));

        expect(find.text('#294'), findsOne);
        expect(find.text('+12 wk'), findsOne);
        expect(find.text('Best 21d'), findsOne);
      });

      testWidgets('a loading view while the overview is in flight', (tester) async {
        await pump(tester, const P2pState.loading());

        expect(find.byType(LoadingView), findsOne);
      });

      testWidgets('an error view with a retry when the overview fails', (tester) async {
        await pump(tester, const P2pState.failure(NetworkException()));

        expect(find.byType(ErrorView), findsOne);
      });

      testWidgets('nothing at all before the first load', (tester) async {
        await pump(tester, const P2pState.initial());

        expect(find.byType(StatRowCard), findsNothing);
        expect(find.byType(LoadingView), findsNothing);
      });

      testWidgets('without overflowing at a large text scale', (tester) async {
        await pump(tester, const P2pState.success(overview), textScale: 1.3);

        expect(tester.takeException(), isNull);
      });
    });

    group('calls load', () {
      testWidgets('again when the retry is pressed', (tester) async {
        when(cubit.load).thenAnswer((_) async {});
        await pump(tester, const P2pState.failure(NetworkException()));

        await tester.tap(find.byType(FilledButton));
        await tester.pump();

        verify(cubit.load).called(1);
      });
    });
  });
}
