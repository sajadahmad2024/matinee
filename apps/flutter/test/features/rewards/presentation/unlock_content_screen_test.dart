import 'package:bloc_test/bloc_test.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:matinee/features/rewards/data/models/exclusive_content.dart';
import 'package:matinee/features/rewards/presentation/cubit/unlock_content_cubit.dart';
import 'package:matinee/features/rewards/presentation/cubit/unlock_content_state.dart';
import 'package:matinee/features/rewards/presentation/unlock_content_screen.dart';
import 'package:mocktail/mocktail.dart';

import '../../../helpers/helpers.dart';

class _MockUnlockContentCubit extends MockCubit<UnlockContentState> implements UnlockContentCubit {}

class _MockGoRouter extends Mock implements GoRouter {}

void main() {
  group(UnlockContentView, () {
    late UnlockContentCubit cubit;
    late _MockGoRouter router;

    const locked = ExclusiveItem(
      id: 'ex-2',
      title: 'BTS Video',
      category: 'Horror',
      unlockCost: 500,
      preview: 'Behind the scenes: the making of the IMAX sequence.',
      castAndCrew: 'Christopher Nolan · Hoyte van Hoytema',
      imageAsset: 'assets/images/exclusive-1.jpg',
    );

    setUp(() {
      cubit = _MockUnlockContentCubit();
      router = _MockGoRouter();
      when(cubit.unlock).thenAnswer((_) async {});
    });

    Future<void> pumpView(WidgetTester tester) {
      tester.view.physicalSize = const Size(1170, 2532);
      tester.view.devicePixelRatio = 3;
      addTearDown(tester.view.reset);
      return tester.pumpApp(
        InheritedGoRouter(
          goRouter: router,
          child: BlocProvider<UnlockContentCubit>.value(
            value: cubit,
            child: const UnlockContentView(),
          ),
        ),
      );
    }

    group('renders', () {
      testWidgets('the title, the cost and the preview', (tester) async {
        when(() => cubit.state).thenReturn(const UnlockContentState.success(locked));
        await pumpView(tester);

        expect(find.text('BTS Video'), findsOneWidget);
        expect(find.text('500 POINTS'), findsOneWidget);
        expect(find.text('Christopher Nolan · Hoyte van Hoytema'), findsOneWidget);
      });
    });

    group('calls unlock', () {
      testWidgets('when the action is tapped', (tester) async {
        when(() => cubit.state).thenReturn(const UnlockContentState.success(locked));
        await pumpView(tester);

        await tester.tap(find.text('Unlock Now'));
        await tester.pump();

        verify(cubit.unlock).called(1);
      });
    });

    group('navigates', () {
      testWidgets('home once the unlock lands, and not on a plain load', (tester) async {
        whenListen(
          cubit,
          Stream<UnlockContentState>.fromIterable([
            const UnlockContentState.success(locked),
            UnlockContentState.success(locked.copyWith(isUnlocked: true), justUnlocked: true),
          ]),
          initialState: const UnlockContentState.loading(),
        );
        when(() => router.go(any())).thenReturn(null);
        await pumpView(tester);
        await tester.pump();

        verify(() => router.go('/')).called(1);
      });

      testWidgets('nowhere when an already-open item is merely loaded', (tester) async {
        // Opening on an item bought earlier must not read as a fresh unlock.
        // The state has to move for listenWhen to run, hence the transition.
        whenListen(
          cubit,
          Stream<UnlockContentState>.fromIterable([
            UnlockContentState.success(locked.copyWith(isUnlocked: true)),
          ]),
          initialState: const UnlockContentState.loading(),
        );
        when(() => router.go(any())).thenReturn(null);
        await pumpView(tester);
        await tester.pump();

        verifyNever(() => router.go(any()));
      });
    });
  });
}
