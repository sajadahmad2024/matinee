import 'package:bloc_test/bloc_test.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/di/service_locator.dart';
import 'package:matinee/features/auth/auth_di.dart';
import 'package:matinee/features/auth/data/models/auth_outcome.dart';
import 'package:matinee/features/auth/presentation/cubit/auth_cubit.dart';
import 'package:matinee/features/auth/presentation/cubit/auth_state.dart';
import 'package:matinee/features/auth/presentation/subscribe_sheet.dart';
import 'package:matinee/features/auth/presentation/widgets/subscribe_benefit_row.dart';
import 'package:matinee/features/auth/presentation/widgets/subscribe_feature_row.dart';
import 'package:mocktail/mocktail.dart';

import '../../../helpers/helpers.dart';

class _MockAuthCubit extends MockCubit<AuthState> implements AuthCubit {}

void main() {
  ///
  /// Exercises the entry point itself rather than the sheet widget: the sheet
  /// reaches the root navigator, keeps its warm surface, and hands back what
  /// the caller acts on.
  ///
  group('showSubscribeSheet', () {
    setUp(registerAuthDependencies);
    tearDown(getIt.reset);

    testWidgets('opens the paywall over the caller and resolves false on skip', (tester) async {
      tester.view.physicalSize = const Size(1170, 2532);
      tester.view.devicePixelRatio = 3;
      addTearDown(tester.view.reset);

      bool? subscribed;
      await tester.pumpApp(
        Scaffold(
          body: Builder(
            builder: (context) => TextButton(
              onPressed: () async => subscribed = await showSubscribeSheet(context),
              child: const Text('upgrade'),
            ),
          ),
        ),
      );

      await tester.tap(find.text('upgrade'));
      await tester.pumpAndSettle();
      expect(find.byType(SubscribeSheet), findsOneWidget);
      expect(find.byType(SubscribeFeatureRow), findsNWidgets(3));

      await tester.tap(find.byType(TextButton).last);
      await tester.pumpAndSettle();

      expect(find.byType(SubscribeSheet), findsNothing);
      expect(subscribed, isFalse);
    });
  });

  group(SubscribeSheet, () {
    late AuthCubit cubit;

    setUp(() {
      cubit = _MockAuthCubit();
      when(() => cubit.state).thenReturn(const AuthState.initial());
      when(cubit.subscribe).thenAnswer((_) async {});
    });

    ///
    /// The sheet is only ever reached through a route that can be popped, so
    /// the tests give it one and record what it resolves to.
    ///
    Future<List<bool?>> pumpSheet(WidgetTester tester, {TextScaler? textScaler}) async {
      tester.view.physicalSize = const Size(1170, 2532);
      tester.view.devicePixelRatio = 3;
      addTearDown(tester.view.reset);

      final results = <bool?>[];
      await tester.pumpApp(
        Builder(
          builder: (context) => TextButton(
            onPressed: () async {
              final result = await Navigator.of(context).push<bool>(
                MaterialPageRoute(
                  builder: (_) => MediaQuery(
                    data: MediaQueryData(textScaler: textScaler ?? TextScaler.noScaling),
                    child: BlocProvider<AuthCubit>.value(value: cubit, child: const SubscribeSheet()),
                  ),
                ),
              );
              results.add(result);
            },
            child: const Text('open'),
          ),
        ),
      );
      await tester.tap(find.text('open'));
      await tester.pumpAndSettle();
      return results;
    }

    group('renders', () {
      testWidgets('every locked feature and every benefit', (tester) async {
        await pumpSheet(tester);

        expect(find.byType(SubscribeFeatureRow), findsNWidgets(3));
        expect(find.byType(SubscribeBenefitRow), findsNWidgets(5));
      });

      testWidgets('both of the sheet actions, unlike the screen', (tester) async {
        await pumpSheet(tester);

        expect(find.byType(FilledButton), findsOneWidget);
        expect(find.byType(TextButton), findsOneWidget);
      });

      testWidgets('the whole paywall without overflowing at a text scale of 1.3', (tester) async {
        await pumpSheet(tester, textScaler: const TextScaler.linear(1.3));

        expect(tester.takeException(), isNull);
        expect(find.byType(SubscribeFeatureRow), findsNWidgets(3));
      });
    });

    group('calls subscribe', () {
      testWidgets('when the CTA is tapped', (tester) async {
        await pumpSheet(tester);

        await tester.tap(find.byType(FilledButton));
        await tester.pump();

        verify(cubit.subscribe).called(1);
      });
    });

    group('lays out', () {
      testWidgets('with its actions at the bottom on a window taller than the offer', (tester) async {
        // The sheet fills the height it is given, so on a tall window the
        // footer has to sit under the offer rather than floating mid-sheet.
        tester.view.physicalSize = const Size(1000, 2400);
        tester.view.devicePixelRatio = 1;
        addTearDown(tester.view.reset);

        await tester.pumpApp(
          BlocProvider<AuthCubit>.value(value: cubit, child: const SubscribeSheet()),
        );

        final sheetBottom = tester.getRect(find.byType(SubscribeSheet)).bottom;
        final skipBottom = tester.getRect(find.byType(TextButton).last).bottom;

        expect(sheetBottom - skipBottom, lessThan(AppSpacing.screenBottom + AppSpacing.md));
      });
    });

    group('closes', () {
      testWidgets('with false when the user skips', (tester) async {
        final results = await pumpSheet(tester);

        await tester.tap(find.byType(TextButton).last);
        await tester.pumpAndSettle();

        expect(results, [false]);
      });

      testWidgets('with true once the subscription goes through', (tester) async {
        whenListen(
          cubit,
          Stream.value(const AuthState.success(AuthOutcome.subscribed)),
          initialState: const AuthState.initial(),
        );

        final results = await pumpSheet(tester);
        await tester.pumpAndSettle();

        expect(results, [true]);
      });
    });
  });
}
