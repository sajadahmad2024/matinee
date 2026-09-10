import 'package:bloc_test/bloc_test.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/app/startup/app_startup_cubit.dart';
import 'package:matinee/app/startup/app_startup_state.dart';
import 'package:matinee/app/startup/splash_screen.dart';
import 'package:matinee/core/widgets/error_view.dart';
import 'package:mocktail/mocktail.dart';

import '../../helpers/helpers.dart';

class _MockAppStartupCubit extends MockCubit<AppStartupState> implements AppStartupCubit {}

void main() {
  group(SplashScreen, () {
    late AppStartupCubit cubit;

    setUp(() {
      cubit = _MockAppStartupCubit();
    });

    Future<void> pumpSplash(WidgetTester tester) {
      return tester.pumpApp(
        BlocProvider<AppStartupCubit>.value(value: cubit, child: const SplashScreen()),
      );
    }

    group('renders', () {
      testWidgets('the logo alone while startup is in progress', (tester) async {
        when(() => cubit.state).thenReturn(const StartupInProgress());

        await pumpSplash(tester);

        expect(find.byType(Image), findsOneWidget);
        expect(find.byType(ErrorView), findsNothing);
      });

      testWidgets('an $ErrorView when startup fails', (tester) async {
        when(() => cubit.state).thenReturn(const StartupFailure('boom'));

        await pumpSplash(tester);

        expect(find.byType(ErrorView), findsOneWidget);
        expect(find.byType(Image), findsNothing);
      });
    });

    group('renders without overflow at a text scale of 1.3', () {
      Future<void> pumpScaled(WidgetTester tester) {
        return tester.pumpApp(
          MediaQuery(
            data: const MediaQueryData(textScaler: TextScaler.linear(1.3)),
            child: BlocProvider<AppStartupCubit>.value(value: cubit, child: const SplashScreen()),
          ),
        );
      }

      testWidgets('while startup is in progress', (tester) async {
        when(() => cubit.state).thenReturn(const StartupInProgress());

        await pumpScaled(tester);

        expect(tester.takeException(), isNull);
      });

      testWidgets('when startup fails', (tester) async {
        when(() => cubit.state).thenReturn(const StartupFailure('boom'));

        await pumpScaled(tester);

        expect(tester.takeException(), isNull);
      });
    });

    group('calls retry', () {
      testWidgets('when the error view retry is tapped', (tester) async {
        when(() => cubit.state).thenReturn(const StartupFailure('boom'));
        when(cubit.retry).thenAnswer((_) async {});

        await pumpSplash(tester);
        await tester.tap(find.byType(FilledButton));
        await tester.pump();

        verify(cubit.retry).called(1);
      });
    });

    ///
    /// The splash carries a status role, and a role is only checked once the
    /// semantics tree is flushed — which needs something listening.
    ///
    group('with a screen reader running', () {
      testWidgets('the progress state raises nothing', (tester) async {
        final handle = tester.ensureSemantics();
        when(() => cubit.state).thenReturn(const StartupInProgress());

        await pumpSplash(tester);
        await pumpAnnouncement(tester);

        expect(find.byType(Image), findsOneWidget);
        expect(tester.takeException(), isNull);
        handle.dispose();
      });

      testWidgets('the failure state raises nothing', (tester) async {
        final handle = tester.ensureSemantics();
        when(() => cubit.state).thenReturn(const StartupFailure('boom'));

        await pumpSplash(tester);
        await pumpAnnouncement(tester);

        expect(find.byType(ErrorView), findsOneWidget);
        expect(tester.takeException(), isNull);
        handle.dispose();
      });
    });
  });
}
