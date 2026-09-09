import 'package:bloc_test/bloc_test.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/features/auth/presentation/cubit/auth_cubit.dart';
import 'package:matinee/features/auth/presentation/cubit/auth_state.dart';
import 'package:matinee/features/auth/presentation/subscribe_screen.dart';
import 'package:matinee/features/auth/presentation/widgets/subscribe_benefit_row.dart';
import 'package:matinee/features/auth/presentation/widgets/subscribe_feature_row.dart';
import 'package:mocktail/mocktail.dart';

import '../../../helpers/helpers.dart';

class _MockAuthCubit extends MockCubit<AuthState> implements AuthCubit {}

void main() {
  group(SubscribeView, () {
    late AuthCubit cubit;

    setUp(() {
      cubit = _MockAuthCubit();
      when(() => cubit.state).thenReturn(const AuthState.initial());
    });

    Future<void> pumpView(WidgetTester tester) {
      tester.view.physicalSize = const Size(1170, 2532);
      tester.view.devicePixelRatio = 3;
      addTearDown(tester.view.reset);
      return tester.pumpApp(
        BlocProvider<AuthCubit>.value(value: cubit, child: const SubscribeView()),
      );
    }

    group('renders', () {
      testWidgets('every locked feature and every benefit', (tester) async {
        await pumpView(tester);

        expect(find.byType(SubscribeFeatureRow), findsNWidgets(3));
        expect(find.byType(SubscribeBenefitRow), findsNWidgets(5));
      });

      testWidgets('the whole paywall without overflowing at a text scale of 1.3', (tester) async {
        tester.view.physicalSize = const Size(1170, 2532);
        tester.view.devicePixelRatio = 3;
        addTearDown(tester.view.reset);

        await tester.pumpApp(
          MediaQuery(
            data: const MediaQueryData(textScaler: TextScaler.linear(1.3)),
            child: BlocProvider<AuthCubit>.value(value: cubit, child: const SubscribeView()),
          ),
        );

        // The benefits scroll rather than overflowing, so what matters is that
        // nothing threw and the CTA still stands at its designed height.
        expect(tester.takeException(), isNull);
        expect(find.byType(SubscribeFeatureRow), findsNWidgets(3));
        expect(tester.getRect(find.byType(FilledButton)).height, greaterThanOrEqualTo(52));
      });
    });

    group('calls subscribe', () {
      testWidgets('when the CTA is tapped', (tester) async {
        when(cubit.subscribe).thenAnswer((_) async {});

        await pumpView(tester);
        await tester.tap(find.byType(FilledButton));
        await tester.pump();

        verify(cubit.subscribe).called(1);
      });
    });
  });
}
